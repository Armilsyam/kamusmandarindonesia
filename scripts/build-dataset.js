'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { extractDictionaryFromPdfBuffer } = require('../src/pdf-parser');

const ROOT_DIR = path.resolve(__dirname, '..');
const PDF_REL_PATH = 'dataset/kamus-mandar-indonesia-2025.pdf';
const PDF_ABS_PATH = path.join(ROOT_DIR, PDF_REL_PATH);
const MANIFEST_PATH = path.join(ROOT_DIR, 'dataset', 'manifest.json');
const VOCAB_PATH = path.join(ROOT_DIR, 'dataset', 'vocabulary.json');

const ABBREVIATIONS = {
  pos: {
    n: 'nomina (kata benda)',
    v: 'verba (kata kerja)',
    a: 'adjektiva (kata sifat)',
    adv: 'adverbia (kata keterangan)',
    p: 'partikel / kata tugas',
    num: 'numeralia (kata bilangan)',
    pron: 'pronomina (kata ganti)',
    i: 'interjeksi (kata seru)',
    klitik: 'klitik',
    frasa: 'frasa',
  },
  labels: {
    ki: 'kiasan',
    ukp: 'ungkapan',
    pb: 'peribahasa',
    k: 'kasar / ragam khusus',
  },
  markers: {
    '--': 'pengganti lema utama dalam contoh pemakaian',
    '~': 'pengganti sublema/lema dalam contoh pemakaian',
    '(q)': 'pelafalan konsonan hambat glotal dalam ejaan Mandar',
  },
  prose: {
    dng: 'dengan',
    dp: 'daripada',
    dr: 'dari',
    kpd: 'kepada',
    krn: 'karena',
    msl: 'misalnya',
    pd: 'pada',
    sbg: 'sebagai',
    spt: 'seperti',
    thd: 'terhadap',
    tt: 'tentang',
    yg: 'yang',
  },
};

function computeSha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex').toUpperCase();
}

function buildDatasetData(pdfBuffer) {
  const sha256 = computeSha256(pdfBuffer);
  const extracted = extractDictionaryFromPdfBuffer(pdfBuffer);
  const emptyDefCount = extracted.entries.filter((e) => !e.definitionText).length;
  const mainCount = extracted.entries.filter((e) => e.type === 'main').length;
  const subCount = extracted.entries.filter((e) => e.type === 'sub').length;

  const manifest = {
    schemaVersion: 1,
    role: 'server-vocabulary-reference-dataset',
    sourcePdf: {
      path: PDF_REL_PATH,
      fileName: path.basename(PDF_REL_PATH),
      sizeBytes: pdfBuffer.length,
      sha256,
    },
    publication: {
      title: 'Kamus Bahasa Mandar–Indonesia (Edisi Revisi)',
      authors: 'Sandra Safitri Hanan, dkk.',
      publisher: 'Kementerian Pendidikan Dasar dan Menengah / Balai Bahasa Provinsi Sulawesi Barat',
      year: 2025,
      languages: {
        source: { code: 'mdr', name: 'Mandar' },
        target: { code: 'id', name: 'Indonesia' },
      },
    },
    structure: {
      totalPdfPages: extracted.totalPdfPages,
      dictionaryPdfPageRange: extracted.dictionaryPdfPageRange,
      bookPageRange: extracted.bookPageRange,
      columnsPerPage: 2,
      counts: {
        totalEntries: extracted.entries.length,
        mainEntries: mainCount,
        subEntries: subCount,
        sections: extracted.sections.length,
        entriesWithoutDefinitionInPdf: emptyDefCount,
      },
    },
    abbreviations: ABBREVIATIONS,
    sections: extracted.sections,
  };

  const vocabulary = {
    schemaVersion: 1,
    sourcePdfSha256: sha256,
    sourcePdfPath: PDF_REL_PATH,
    totalEntries: extracted.entries.length,
    pageIndex: extracted.pageIndex,
    entries: extracted.entries,
  };

  return { manifest, vocabulary };
}

function runCli() {
  const verifyOnly = process.argv.includes('--verify');

  if (!fs.existsSync(PDF_ABS_PATH)) {
    console.error(`Source PDF not found: ${PDF_ABS_PATH}`);
    process.exit(1);
  }

  const pdfBuffer = fs.readFileSync(PDF_ABS_PATH);
  const { manifest, vocabulary } = buildDatasetData(pdfBuffer);
  const manifestJson = `${JSON.stringify(manifest, null, 2)}\n`;
  const vocabJson = `${JSON.stringify(vocabulary)}\n`;

  if (verifyOnly) {
    if (!fs.existsSync(MANIFEST_PATH) || !fs.existsSync(VOCAB_PATH)) {
      console.error('Generated dataset artifacts are missing. Run build-dataset.js first.');
      process.exit(1);
    }
    const existingManifest = fs.readFileSync(MANIFEST_PATH, 'utf8');
    const existingVocab = fs.readFileSync(VOCAB_PATH, 'utf8');
    if (existingManifest !== manifestJson || existingVocab !== vocabJson) {
      console.error('Dataset artifacts are out of sync with the authoritative PDF!');
      process.exit(1);
    }
    console.log(
      `OK: ${manifest.sourcePdf.path} (SHA-256 ${manifest.sourcePdf.sha256}) matches generated dataset (${manifest.structure.counts.totalEntries} entries).`,
    );
    return;
  }

  fs.writeFileSync(MANIFEST_PATH, manifestJson, 'utf8');
  fs.writeFileSync(VOCAB_PATH, vocabJson, 'utf8');
  console.log(
    `Built dataset from ${PDF_REL_PATH}: ${manifest.structure.counts.totalEntries} entries (${manifest.structure.counts.mainEntries} main, ${manifest.structure.counts.subEntries} sub) across ${manifest.structure.counts.sections} sections.`,
  );
  console.log(`Wrote ${MANIFEST_PATH} (${Buffer.byteLength(manifestJson)} bytes)`);
  console.log(`Wrote ${VOCAB_PATH} (${Buffer.byteLength(vocabJson)} bytes)`);
}

if (require.main === module) {
  runCli();
}

module.exports = {
  ROOT_DIR,
  PDF_REL_PATH,
  PDF_ABS_PATH,
  MANIFEST_PATH,
  VOCAB_PATH,
  computeSha256,
  buildDatasetData,
};
