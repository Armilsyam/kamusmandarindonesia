'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildPagesSite, DATASET_FILES } = require('../scripts/build-pages');
const { computeSha256 } = require('../scripts/build-dataset');
require('../public/assets/kamus-media');
require('../public/assets/kamus-linguistics');

const {
  createAudioController,
  isPicturableEntry,
  getEntryIllustration,
  renderSureParaSvg,
  SURE_PARA_VARIANTS,
} = globalThis.KamusMedia;

const {
  BOOK_GUIDE_DATA,
  analyzeCanonicalPattern,
  toMandarIpa,
  expandBookAbbreviations,
  analyzeWordMorphology,
  analyzeMandarSentence,
  latinToLontaraqPreview,
} = globalThis.KamusLinguistics;

test('buildPagesSite assembles index.html, belajar.html, .nojekyll, media/linguistics assets, and exact PDF/JSON copies', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kamus-pages-'));
  try {
    const res = buildPagesSite(tmpDir);
    assert.ok(res.files.includes('index.html'));
    assert.ok(res.files.includes('belajar.html'));
    assert.ok(res.files.includes('.nojekyll'));
    assert.ok(res.files.includes('assets/kamus-media.js'));
    assert.ok(res.files.includes('assets/kamus-linguistics.js'));
    assert.ok(res.files.includes('assets/illustrations/batik-sure-para-sulbar.jpg'));
    assert.ok(res.files.includes('assets/illustrations/lopi-sandeq.jpg'));
    assert.ok(res.files.includes('assets/illustrations/anjoro.jpg'));

    const html = fs.readFileSync(path.join(tmpDir, 'index.html'), 'utf8');
    assert.match(html, /\.\/dataset\/manifest\.json/);
    assert.match(html, /\.\/dataset\/vocabulary\.json/);
    assert.match(html, /\.\/dataset\/kamus-mandar-indonesia-2025\.pdf/);
    assert.match(html, /\.\/assets\/kamus-media\.js/);
    assert.match(html, /\.\/assets\/kamus-linguistics\.js/);
    assert.match(html, /\.\/belajar\.html/);
    assert.match(html, /MUH\. ARMIL SYAM/);
    assert.match(html, /082291544262/);
    assert.match(html, /wa\.me\/6282291544262/);
    assert.match(html, /DANA/);

    const belajarHtml = fs.readFileSync(path.join(tmpDir, 'belajar.html'), 'utf8');
    assert.match(belajarHtml, /\.\/assets\/kamus-linguistics\.js/);
    assert.match(belajarHtml, /\.\/dataset\/vocabulary\.json/);
    assert.match(belajarHtml, /Petunjuk Pemakaian/);

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

test('KamusLinguistics handles IPA, canonical patterns, affixes, abbreviations, and Lontaraq preview', () => {
  assert.equal(BOOK_GUIDE_DATA.phonemes.vowels.length, 5);
  assert.equal(BOOK_GUIDE_DATA.phonemes.consonants.length, 19);
  assert.equal(BOOK_GUIDE_DATA.phonemes.allophones.length, 4);
  assert.equal(BOOK_GUIDE_DATA.phonemes.nasalAssimilations.length, 16);
  assert.equal(BOOK_GUIDE_DATA.lontaraqTable.length, 23);

  assert.equal(analyzeCanonicalPattern('kaluwambang').pattern, 'KVKVKVKKVK');
  assert.equal(analyzeCanonicalPattern('boyang').pattern, 'KVKVK');

  const tedongIpa = toMandarIpa('tedong');
  assert.equal(tedongIpa.phonemic, '/tedoŋ/');
  assert.equal(tedongIpa.narrow, '[teðoŋ]');
  assert.equal(toMandarIpa('anaq').phonemic, '/anaʔ/');

  assert.equal(
    expandBookAbbreviations('kata yg dipakai dng jelas tt hal tsb'),
    'kata yang dipakai dengan jelas tentang hal tersebut',
  );

  const mockMap = new Map([
    ['coko', [{ headword: 'coko', pos: ['v'], definitionText: 'jongkok', source: { bookPage: 105, pdfPage: 152 } }]],
    ['basa', [{ headword: 'basa', pos: ['n'], definitionText: 'bahasa', source: { bookPage: 55, pdfPage: 102 } }]],
  ]);
  const morphCoko = analyzeWordMorphology('meccoko', mockMap);
  assert.equal(morphCoko.kind, 'berimbuhan');
  assert.equal(morphCoko.prefix, 'mec-');
  assert.equal(morphCoko.rootCandidate, 'coko');

  const parsed = analyzeMandarSentence('meccoko basa', (w) => mockMap.get(w) || [], mockMap);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].entry.headword, 'coko');
  assert.equal(parsed[1].matchedDirect, true);

  assert.equal(latinToLontaraqPreview('bunga'), 'ᨅᨘᨂ');
  assert.equal(latinToLontaraqPreview('boyang'), 'ᨅᨚᨐ');
});
