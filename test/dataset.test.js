'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { KamusMandarDataset, normalizeLookupKey } = require('../src/dataset-server');

const EXPECTED_SHA256 = '3D9A671F5A5CC91523A77C308D304D36C178C5A8B2E198B1532ECFF1EC4F794C';
const EXPECTED_SECTION_PAGES = [
  ['A', 1, 48],
  ['B', 36, 83],
  ['C', 98, 145],
  ['D', 116, 163],
  ['E', 130, 177],
  ['G', 132, 179],
  ['H', 154, 201],
  ['I', 158, 205],
  ['J', 172, 219],
  ['K', 186, 233],
  ['L', 219, 266],
  ['M', 267, 314],
  ['N', 290, 337],
  ['O', 297, 344],
  ['P', 307, 354],
  ['R', 358, 405],
  ['S', 384, 431],
  ['T', 434, 481],
  ['U', 485, 532],
  ['W', 498, 545],
];

const dataset = new KamusMandarDataset().load();

test('authoritative PDF exists and matches manifest checksum', () => {
  const status = dataset.verifyPdfSource();
  assert.equal(status.ok, true);
  assert.equal(status.sizeBytes, 3983041);
  assert.equal(status.sha256, EXPECTED_SHA256);
  assert.equal(status.matchesManifest, true);
});

test('all 20 alphabetical sections match PDF table of contents pages', () => {
  const manifest = dataset.getManifest();
  assert.equal(manifest.structure.totalPdfPages, 548);
  assert.deepEqual(manifest.structure.dictionaryPdfPageRange, [48, 546]);
  assert.deepEqual(manifest.structure.bookPageRange, [1, 499]);

  const actual = manifest.sections.map((s) => [s.letter, s.firstBookPage, s.firstPdfPage]);
  assert.deepEqual(actual, EXPECTED_SECTION_PAGES);
  assert.equal(manifest.structure.counts.totalEntries, 4908);
  assert.equal(manifest.structure.counts.mainEntries, 2660);
  assert.equal(manifest.structure.counts.subEntries, 2248);
});

test('lookup resolves main lemmas, sub-entries, parent links, and comma aliases', () => {
  const abi = dataset.lookup('abi');
  assert.equal(abi.total, 1);
  assert.equal(abi.matches[0].section, 'A');
  assert.equal(abi.matches[0].source.bookPage, 1);
  assert.equal(abi.matches[0].source.pdfPage, 48);
  assert.match(abi.matches[0].definitionText, /bapak, ayah/);

  const acar = dataset.lookup('acar');
  assert.equal(acar.total, 1);
  assert.ok(acar.matches[0].derivations.some((d) => d.headword === 'maacar'));

  const maacar = dataset.lookup('maacar');
  assert.equal(maacar.total, 1);
  assert.equal(maacar.matches[0].type, 'sub');
  assert.equal(maacar.matches[0].parentHeadword, 'acar');
  assert.equal(maacar.matches[0].parents[0].headword, 'acar');
  assert.match(maacar.matches[0].definitionText, /gadis-gadis ramai/);

  const aliasOpang = dataset.lookup('meqopang');
  assert.equal(aliasOpang.total, 1);
  assert.equal(aliasOpang.matches[0].headword, 'opang, meqopang');
});

test('normalizes homonym subscripts, glottal notations, affixes, and PDF OCR glyphs', () => {
  const amo = dataset.lookup('amo');
  assert.equal(amo.total, 2);
  assert.deepEqual(
    amo.matches.map((m) => m.homonym),
    [1, 2],
  );

  assert.equal(normalizeLookupKey("ana'"), 'anaq');
  assert.equal(normalizeLookupKey('ana’'), 'anaq');

  const niaq = dataset.lookup("nia'");
  assert.equal(niaq.total, 1);
  assert.equal(niaq.matches[0].headword, 'niaq');

  const affix = dataset.lookup('bo');
  assert.ok(affix.matches.some((m) => m.headword === '-bo'));

  const nipa = dataset.lookup('nipa');
  assert.equal(nipa.matches[0].definitionText, 'n nipah');

  const pamboang = dataset.lookup('Pamboang');
  assert.equal(pamboang.total, 1);
  assert.match(pamboang.matches[0].definitionText, /pole maq mai di--/);
});

test('bidirectional search and page lookup return PDF-cited results', () => {
  const idSearch = dataset.search('ayah', { direction: 'indonesia', limit: 10 });
  assert.ok(idSearch.total > 0);
  assert.ok(idSearch.items.some((item) => item.headword === 'abi'));

  const lastPage = dataset.getByBookPage(499);
  assert.ok(lastPage.items.some((item) => item.headword === 'witir'));
  assert.ok(lastPage.items.some((item) => item.headword === 'maqwitir'));
});

test('direct-from-PDF parsing produces identical entries to cached index', () => {
  const direct = new KamusMandarDataset().load({ forceRebuild: true, writeArtifacts: false });
  assert.equal(direct.manifest.loadedFrom, 'pdf-direct');
  assert.equal(direct.entries.length, dataset.entries.length);
  assert.deepEqual(direct.entries[0], dataset.entries[0]);
  assert.deepEqual(direct.entries[direct.entries.length - 1], dataset.entries[dataset.entries.length - 1]);
});
