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
require('../public/assets/kamus-kaka-ai');
require('../public/assets/kamus-vision-lontara');
require('../public/assets/kamus-komunitas');

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
  lontaraqToLatinPreview,
} = globalThis.KamusLinguistics;

const {
  createKakaAiAssistant,
  KALINDAQDAQ_COLLECTION,
  CULTURE_TOPICS,
} = globalThis.KamusKakaAi;

const {
  createLontaraScanner,
  SAMPLE_PRESETS,
} = globalThis.KamusVisionLontara;

const {
  createCommunityPlatform,
  SEED_POSTS,
  MANDAR_REELS,
} = globalThis.KamusKomunitas;

test('buildPagesSite assembles index.html, belajar.html, lontara.html, assets, and exact PDF/JSON copies', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kamus-pages-'));
  try {
    const res = buildPagesSite(tmpDir);
    assert.ok(res.files.includes('index.html'));
    assert.ok(res.files.includes('belajar.html'));
    assert.ok(res.files.includes('lontara.html'));
    assert.ok(res.files.includes('manifest.webmanifest'));
    assert.ok(res.files.includes('.nojekyll'));
    assert.ok(res.files.includes('assets/kamus-media.js'));
    assert.ok(res.files.includes('assets/kamus-linguistics.js'));
    assert.ok(res.files.includes('assets/kamus-kaka-ai.js'));
    assert.ok(res.files.includes('assets/kamus-vision-lontara.js'));
    assert.ok(res.files.includes('assets/kamus-komunitas.js'));
    assert.ok(res.files.includes('assets/illustrations/batik-sure-para-sulbar.jpg'));
    assert.ok(res.files.includes('assets/illustrations/lopi-sandeq.jpg'));
    assert.ok(res.files.includes('assets/illustrations/anjoro.jpg'));

    const html = fs.readFileSync(path.join(tmpDir, 'index.html'), 'utf8');
    assert.match(html, /\.\/dataset\/manifest\.json/);
    assert.match(html, /\.\/dataset\/vocabulary\.json/);
    assert.match(html, /\.\/dataset\/kamus-mandar-indonesia-2025\.pdf/);
    assert.match(html, /\.\/assets\/kamus-media\.js/);
    assert.match(html, /\.\/assets\/kamus-linguistics\.js/);
    assert.match(html, /\.\/assets\/kamus-kaka-ai\.js/);
    assert.match(html, /\.\/assets\/kamus-vision-lontara\.js/);
    assert.match(html, /\.\/assets\/kamus-komunitas\.js/);
    assert.match(html, /\.\/belajar\.html/);
    assert.match(html, /\.\/lontara\.html/);
    assert.match(html, /BOYANG DIGITAL/);
    assert.match(html, /Kaka AI/);
    assert.match(html, /Kamera Lontara/);
    assert.match(html, /komunitas-edukatif/);
    assert.match(html, /PKBM/);
    assert.match(html, /freemium/i);
    assert.match(html, /Play Store/i);
    assert.match(html, /Batik Sure' Parara Sulawesi Barat/);
    assert.match(html, /Sulawesi Barat/);
    assert.doesNotMatch(html, /Sulawesi Selatan/i);
    assert.match(html, /MUH\. ARMIL SYAM/);
    assert.match(html, /082291544262/);
    assert.match(html, /wa\.me\/6282291544262/);
    assert.match(html, /DANA/);

    const belajarHtml = fs.readFileSync(path.join(tmpDir, 'belajar.html'), 'utf8');
    assert.match(belajarHtml, /\.\/assets\/kamus-linguistics\.js/);
    assert.match(belajarHtml, /\.\/dataset\/vocabulary\.json/);
    assert.match(belajarHtml, /\.\/lontara\.html/);
    assert.match(belajarHtml, /Petunjuk Pemakaian/);
    assert.match(belajarHtml, /Sulawesi Barat/);
    assert.doesNotMatch(belajarHtml, /Sulawesi Selatan/i);

    const lontaraHtml = fs.readFileSync(path.join(tmpDir, 'lontara.html'), 'utf8');
    assert.match(lontaraHtml, /\.\/assets\/kamus-linguistics\.js/);
    assert.match(lontaraHtml, /lontaraCanvas/);
    assert.match(lontaraHtml, /Batik Sure' Parara Sulawesi Barat/);
    assert.match(lontaraHtml, /Sulawesi Barat/);
    assert.doesNotMatch(lontaraHtml, /Sulawesi Selatan/i);

    const manifestJson = JSON.parse(fs.readFileSync(path.join(tmpDir, 'dataset', 'manifest.json'), 'utf8'));
    assert.match(manifestJson.publication.publisher, /Sulawesi Barat/);
    assert.doesNotMatch(manifestJson.publication.publisher, /Sulawesi Selatan/i);

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
  assert.equal(BOOK_GUIDE_DATA.lontaraqVowels.length, 5);

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
  assert.equal(lontaraqToLatinPreview('ᨅᨘᨂ'), 'bunga');
  assert.equal(lontaraqToLatinPreview('ᨅᨚᨐ'), 'boya');
  assert.match(SURE_PARA_VARIANTS.klasik.name, /Batik Sure' Parara/);
});

test('Kaka AI assistant provides smart answers for vocabulary, morphology, Kalindaqdaq and culture', () => {
  const mockVocab = new Map([
    ['boyang', [{ headword: 'boyang', pos: ['n'], definitionText: 'n rumah', source: { bookPage: 84 } }]],
    ['lopi', [{ headword: 'lopi', pos: ['n'], definitionText: 'n perahu', source: { bookPage: 259 } }]],
  ]);

  const assistant = createKakaAiAssistant({
    vocabMap: mockVocab,
    linguistics: globalThis.KamusLinguistics,
    audioCtrl: createAudioController(),
  });

  const greet = assistant.ask('Halo Kaka AI!');
  assert.match(greet.reply, /Boyang Digital/);
  assert.match(greet.reply, /PKBM/);

  const boyangAns = assistant.ask('apa arti kata boyang?');
  assert.match(boyangAns.reply, /rumah/);
  assert.match(boyangAns.reply, /ᨅᨚᨐ/);

  const kaliAns = assistant.ask('Tuliskan puisi kalindaqdaq Mandar');
  assert.match(kaliAns.reply, /8 - 7 - 5 - 7/);

  const sandeqAns = assistant.ask('ceritakan tentang perahu sandeq');
  assert.match(sandeqAns.reply, /Sandeq/);
  assert.match(sandeqAns.reply, /Austronesia/);

  // Sejarah & Kerajaan Sulbar
  const balanipaAns = assistant.ask('ceritakan sejarah kerajaan Balanipa');
  assert.match(balanipaAns.reply, /Balanipa/);
  assert.match(balanipaAns.reply, /Todilaling/);

  const allamunganAns = assistant.ask('apa itu perjanjian Allamungan Batu di Luyo?');
  assert.match(allamunganAns.reply, /Sipamandar/);
  assert.match(allamunganAns.reply, /Pitu Ulunna Salu/);

  // Geografi 6 Kabupaten
  const majeneAns = assistant.ask('ceritakan kabupaten majene');
  assert.match(majeneAns.reply, /Kota Pendidikan/);
  assert.match(majeneAns.reply, /UNSULBAR/);

  const mamasaAns = assistant.ask('apa budaya kabupaten mamasa');
  assert.match(mamasaAns.reply, /Kondosapata/);
  assert.match(mamasaAns.reply, /Banua Sibarrung/);

  // Kuliner Sulbar
  const kulinerAns = assistant.ask('apa saja makanan dan kuliner khas mandar sulbar?');
  assert.match(kulinerAns.reply, /Jepa/);
  assert.match(kulinerAns.reply, /Bau Peapi/);

  // Komparasi Seluruh Indonesia (Nusantara)
  const indoAns = assistant.ask('bagaimana perbandingan bahasa bugis, makassar, toraja, jawa dan sunda dengan mandar?');
  assert.match(indoAns.reply, /Austronesia/);
  assert.match(indoAns.reply, /Bhinneka Tunggal Ika/);

  // Reverse translation Indonesia -> Mandar
  const revAns = assistant.ask('apa bahasa mandarnya rumah?');
  assert.match(revAns.reply, /boyang/);
});

test('KamusVisionLontara provides optical presets and dictionary-backed OCR resolution', () => {
  const mockVocab = new Map([
    ['boyang', [{ headword: 'boyang', pos: ['n'], definitionText: 'n rumah', source: { bookPage: 84 } }]],
  ]);

  const scanner = createLontaraScanner({
    vocabMap: mockVocab,
    linguistics: globalThis.KamusLinguistics,
  });

  const presets = scanner.getPresets();
  assert.ok(presets.length >= 6);
  assert.ok(presets.some((p) => p.headword === 'boyang'));

  const resBoyang = scanner.scanPresetOrHeuristic('boyang');
  assert.equal(resBoyang.detectedLontara, 'ᨅᨚᨐ');
  assert.equal(resBoyang.dictionaryEntry.headword, 'boyang');
  assert.match(resBoyang.confidence, /%/);
});

test('KamusKomunitas supports educational social posts, feeds, and reels for Sulbar students and PKBM', () => {
  const community = createCommunityPlatform();
  const allPosts = community.getPosts('semua');
  assert.ok(allPosts.length >= 4);

  const reels = community.getReels();
  assert.ok(reels.length >= 4);
  assert.ok(reels.some((r) => r.title.includes('Tabeq')));

  const newPost = community.addPost({
    author: 'Siswa Test Majene',
    role: 'Pelajar Sulbar',
    badge: '🎒 Pelajar Sulbar',
    category: 'pelajar',
    mandarText: 'Iyau meloaq meqguru basa Mandar',
    artiText: 'Saya ingin belajar bahasa Mandar',
  });
  assert.equal(newPost.author, 'Siswa Test Majene');

  const initialLikes = newPost.likes;
  const likedState = community.toggleLike(newPost.id);
  assert.equal(likedState.likes, initialLikes - 1); // was liked=true initially, toggling turns off
});
