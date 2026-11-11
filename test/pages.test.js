'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildPagesSite, DATASET_FILES } = require('../scripts/build-pages');
const { computeSha256 } = require('../scripts/build-dataset');
require('../public/assets/kamus-media');

const {
  createAudioController,
  isPicturableEntry,
  getEntryIllustration,
  renderSureParaSvg,
  SURE_PARA_VARIANTS,
} = globalThis.KamusMedia;

test('buildPagesSite assembles index.html, .nojekyll, media assets, and exact PDF/JSON copies', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kamus-pages-'));
  try {
    const res = buildPagesSite(tmpDir);
    assert.ok(res.files.includes('index.html'));
    assert.ok(res.files.includes('.nojekyll'));
    assert.ok(res.files.includes('assets/kamus-media.js'));
    assert.ok(res.files.includes('assets/illustrations/batik-sure-para-sulbar.jpg'));
    assert.ok(res.files.includes('assets/illustrations/lopi-sandeq.jpg'));
    assert.ok(res.files.includes('assets/illustrations/anjoro.jpg'));

    const html = fs.readFileSync(path.join(tmpDir, 'index.html'), 'utf8');
    assert.match(html, /\.\/dataset\/manifest\.json/);
    assert.match(html, /\.\/dataset\/vocabulary\.json/);
    assert.match(html, /\.\/dataset\/kamus-mandar-indonesia-2025\.pdf/);
    assert.match(html, /\.\/assets\/kamus-media\.js/);
    assert.match(html, /MUH\. ARMIL SYAM/);
    assert.match(html, /082291544262/);
    assert.match(html, /wa\.me\/6282291544262/);
    assert.match(html, /DANA/);

    const srcRoot = path.resolve(__dirname, '..');
    for (const name of DATASET_FILES) {
      const srcHash = computeSha256(fs.readFileSync(path.join(srcRoot, 'dataset', name)));
      const outHash = computeSha256(fs.readFileSync(path.join(tmpDir, 'dataset', name)));
      assert.equal(outHash, srcHash);
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('KamusMedia converts Mandar glottal stops and maps concrete illustrations cleanly', () => {
  const audio = createAudioController();
  const phonetic = audio.toMandarPhonetic('lipaq -- padada', { headword: 'sureq' });
  assert.equal(phonetic.expanded, 'lipaq sureq padada');
  assert.equal(phonetic.phoneticDisplay, "lipa' sure' padada");
  assert.equal(phonetic.ttsText, "lipa' sure' padada");

  // Picturable entries vs non-picturable grammatical particles
  assert.equal(isPicturableEntry({ headword: 'boyang', pos: ['n'] }), true);
  assert.equal(isPicturableEntry({ headword: 'a', pos: ['p'] }), false);
  assert.equal(getEntryIllustration({ headword: 'a', pos: ['p'], definitionText: 'o ya kata seru' }), null);

  const lopiIllus = getEntryIllustration({ headword: 'lopi', pos: ['n'], definitionText: 'n perahu' });
  assert.equal(lopiIllus.kind, 'image');
  assert.equal(lopiIllus.src, './assets/illustrations/lopi-sandeq.jpg');

  const boyangIllus = getEntryIllustration({ headword: 'boyang', pos: ['n'], definitionText: 'n rumah', source: { bookPage: 84 } });
  assert.equal(boyangIllus.kind, 'svg');
  assert.match(boyangIllus.svg, /^<svg\b/);

  const catIllus = getEntryIllustration({ headword: 'parrang', pos: ['n'], definitionText: 'n parang tajam' });
  assert.equal(catIllus.kind, 'svg');
  assert.equal(catIllus.badge, 'Alat & Wadah');

  for (const key of Object.keys(SURE_PARA_VARIANTS)) {
    const svg = renderSureParaSvg(key);
    assert.match(svg, /^<svg\b/);
    assert.match(svg, /<\/svg>$/);
  }
});
