'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
  PDF_REL_PATH,
  PDF_ABS_PATH,
  MANIFEST_PATH,
  VOCAB_PATH,
  computeSha256,
  buildDatasetData,
} = require('../scripts/build-dataset');

/**
 * Normalize a Mandar or Indonesian lookup string so apostrophe glottal notations
 * (e.g. ana' / ana’ / ana`) and repeated whitespace match canonical 'q' spellings.
 * @param {string} value
 * @returns {string}
 */
function normalizeLookupKey(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/['`\u2018\u2019\u02BC]/g, 'q')
    .replace(/[ \t\r\n]+/g, ' ')
    .trim();
}

/**
 * Strip leading affix hyphen (e.g. "-bo" -> "bo") for secondary key indexing.
 * @param {string} key
 * @returns {string}
 */
function stripAffixHyphen(key) {
  return key.replace(/^-+/, '').trim();
}

/**
 * Server-side reference dataset backed canonically by
 * dataset/kamus-mandar-indonesia-2025.pdf.
 */
class KamusMandarDataset {
  /**
   * @param {object} [options]
   * @param {string} [options.pdfPath]
   * @param {string} [options.manifestPath]
   * @param {string} [options.vocabularyPath]
   */
  constructor(options = {}) {
    this.pdfPath = options.pdfPath || PDF_ABS_PATH;
    this.manifestPath = options.manifestPath || MANIFEST_PATH;
    this.vocabularyPath = options.vocabularyPath || VOCAB_PATH;

    this.loaded = false;
    this.manifest = null;
    this.entries = [];
    this.pageIndex = [];

    this._byId = new Map();
    this._byKey = new Map();
    this._byStrippedKey = new Map();
    this._byParentKey = new Map();
    this._bySection = new Map();
    this._byBookPage = new Map();
    this._byPdfPage = new Map();
    this._searchRecords = [];
  }

  /**
   * Verify that the authoritative source PDF exists on disk and compute its SHA-256 checksum.
   * @returns {{ ok: boolean, pdfPath: string, relativePath: string, sizeBytes: number, sha256: string, matchesManifest: boolean | null }}
   */
  verifyPdfSource() {
    if (!fs.existsSync(this.pdfPath)) {
      throw new Error(`Authoritative PDF dataset not found: ${this.pdfPath}`);
    }
    const buf = fs.readFileSync(this.pdfPath);
    const sha256 = computeSha256(buf);
    let matchesManifest = null;
    if (fs.existsSync(this.manifestPath)) {
      const m = JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));
      matchesManifest =
        m?.sourcePdf?.sha256 === sha256 && m?.sourcePdf?.sizeBytes === buf.length;
    }
    return {
      ok: true,
      pdfPath: this.pdfPath,
      relativePath: PDF_REL_PATH,
      sizeBytes: buf.length,
      sha256,
      matchesManifest,
    };
  }

  /**
   * Load the reference vocabulary into memory. Verifies source PDF hash against
   * prebuilt artifacts and falls back to parsing directly from the PDF if artifacts
   * are absent or stale.
   * @param {object} [options]
   * @param {boolean} [options.forceRebuild=false]
   * @param {boolean} [options.writeArtifacts=false]
   * @returns {this}
   */
  load({ forceRebuild = false, writeArtifacts = false } = {}) {
    if (!fs.existsSync(this.pdfPath)) {
      throw new Error(`Authoritative PDF dataset not found: ${this.pdfPath}`);
    }

    const pdfBuffer = fs.readFileSync(this.pdfPath);
    const pdfSha = computeSha256(pdfBuffer);

    let manifest = null;
    let vocabulary = null;
    let sourceMode = 'pdf-direct';

    if (
      !forceRebuild &&
      fs.existsSync(this.manifestPath) &&
      fs.existsSync(this.vocabularyPath)
    ) {
      try {
        const candidateManifest = JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));
        const candidateVocab = JSON.parse(fs.readFileSync(this.vocabularyPath, 'utf8'));
        if (
          candidateManifest?.sourcePdf?.sha256 === pdfSha &&
          candidateVocab?.sourcePdfSha256 === pdfSha &&
          Array.isArray(candidateVocab.entries)
        ) {
          manifest = candidateManifest;
          vocabulary = candidateVocab;
          sourceMode = 'cached-verified-index';
        }
      } catch {
        manifest = null;
        vocabulary = null;
      }
    }

    if (!manifest || !vocabulary) {
      const built = buildDatasetData(pdfBuffer);
      manifest = built.manifest;
      vocabulary = built.vocabulary;
      if (writeArtifacts) {
        fs.mkdirSync(path.dirname(this.manifestPath), { recursive: true });
        fs.writeFileSync(this.manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
        fs.writeFileSync(this.vocabularyPath, `${JSON.stringify(vocabulary)}\n`, 'utf8');
      }
    }

    this.manifest = { ...manifest, loadedFrom: sourceMode };
    this.entries = vocabulary.entries;
    this.pageIndex = vocabulary.pageIndex || [];
    this._buildIndexes();
    this.loaded = true;
    return this;
  }

  /**
   * Ensure the dataset has been loaded once before querying.
   * @returns {this}
   */
  ensureLoaded() {
    if (!this.loaded) {
      this.load();
    }
    return this;
  }

  /**
   * Build in-memory indexes for fast server lookups.
   */
  _buildIndexes() {
    this._byId.clear();
    this._byKey.clear();
    this._byStrippedKey.clear();
    this._byParentKey.clear();
    this._bySection.clear();
    this._byBookPage.clear();
    this._byPdfPage.clear();
    this._searchRecords = [];

    const pushToMap = (map, key, val) => {
      if (!key) return;
      if (!map.has(key)) map.set(key, []);
      const bucket = map.get(key);
      if (!bucket.includes(val)) bucket.push(val);
    };

    for (const entry of this.entries) {
      this._byId.set(entry.id, entry);

      const candidateHeads = [entry.headword, ...(entry.aliases || [])];
      const headKeys = [];
      for (const h of candidateHeads) {
        const k = normalizeLookupKey(h);
        if (!k) continue;
        if (!headKeys.includes(k)) headKeys.push(k);
        pushToMap(this._byKey, k, entry);
        pushToMap(this._byStrippedKey, stripAffixHyphen(k), entry);
      }

      if (entry.type === 'sub' && entry.parentHeadword) {
        pushToMap(this._byParentKey, normalizeLookupKey(entry.parentHeadword), entry);
      }

      pushToMap(this._bySection, entry.section, entry);
      if (entry.source?.bookPage != null) {
        pushToMap(this._byBookPage, entry.source.bookPage, entry);
      }
      if (entry.source?.pdfPage != null) {
        pushToMap(this._byPdfPage, entry.source.pdfPage, entry);
      }

      this._searchRecords.push({
        entry,
        headKeys,
        defLower: normalizeLookupKey(entry.definitionText || ''),
      });
    }
  }

  /**
   * Retrieve an entry by canonical entry ID (e.g. "mdr-0001").
   * @param {string} id
   */
  getById(id) {
    this.ensureLoaded();
    return this._byId.get(id) || null;
  }

  /**
   * Exact headword or alias lookup (Mandar -> Indonesia), with optional derivation
   * sub-entries and parent lemma resolution.
   * @param {string} headword
   * @param {object} [options]
   * @param {boolean} [options.includeRelated=true]
   */
  lookup(headword, { includeRelated = true } = {}) {
    this.ensureLoaded();
    const key = normalizeLookupKey(headword);
    if (!key) return { query: headword, matches: [] };

    let rawMatches = this._byKey.get(key) || [];
    if (rawMatches.length === 0) {
      const stripped = stripAffixHyphen(key);
      rawMatches = this._byStrippedKey.get(stripped) || [];
    }

    const matches = rawMatches.map((entry) => {
      if (!includeRelated) return entry;
      const derivations =
        entry.type === 'main'
          ? (this._byParentKey.get(normalizeLookupKey(entry.headword)) || []).map((sub) => ({
              id: sub.id,
              headword: sub.headword,
              pos: sub.pos,
              definitionText: sub.definitionText,
              source: sub.source,
            }))
          : [];
      const parents =
        entry.type === 'sub' && entry.parentHeadword
          ? (this._byKey.get(normalizeLookupKey(entry.parentHeadword)) || []).map((p) => ({
              id: p.id,
              headword: p.headword,
              homonym: p.homonym,
              pos: p.pos,
              source: p.source,
            }))
          : [];
      return { ...entry, derivations, parents };
    });

    return {
      query: headword,
      normalizedQuery: key,
      total: matches.length,
      matches,
    };
  }

  /**
   * Search across Mandar headwords and Indonesian glosses/examples.
   * @param {string} query
   * @param {object} [options]
   * @param {'all'|'mandar'|'indonesia'} [options.direction='all']
   * @param {string} [options.section]
   * @param {string} [options.pos]
   * @param {'main'|'sub'} [options.type]
   * @param {number} [options.limit=25]
   * @param {number} [options.offset=0]
   */
  search(
    query,
    {
      direction = 'all',
      section,
      pos,
      type,
      limit = 25,
      offset = 0,
    } = {},
  ) {
    this.ensureLoaded();
    const q = normalizeLookupKey(query);
    if (!q) {
      return { query, total: 0, limit, offset, items: [] };
    }

    const sectionUpper = section ? String(section).toUpperCase() : null;
    const posLower = pos ? String(pos).toLowerCase() : null;
    const wordBoundaryRe = new RegExp(`(^|[^a-z0-9])${escapeRegex(q)}([^a-z0-9]|$)`);

    const scored = [];
    for (const rec of this._searchRecords) {
      const { entry, headKeys, defLower } = rec;
      if (sectionUpper && entry.section !== sectionUpper) continue;
      if (posLower && !entry.pos.includes(posLower)) continue;
      if (type && entry.type !== type) continue;

      let score = 0;
      if (direction !== 'indonesia') {
        for (const hk of headKeys) {
          if (hk === q || stripAffixHyphen(hk) === q) {
            score = Math.max(score, 100);
          } else if (hk.startsWith(q)) {
            score = Math.max(score, 80);
          } else if (hk.includes(q)) {
            score = Math.max(score, 60);
          }
        }
      }

      if (direction !== 'mandar' && defLower) {
        if (wordBoundaryRe.test(defLower)) {
          score = Math.max(score, 40);
        } else if (defLower.includes(q)) {
          score = Math.max(score, 20);
        }
      }

      if (score > 0) {
        scored.push({ score, entry });
      }
    }

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.entry.type !== b.entry.type) return a.entry.type === 'main' ? -1 : 1;
      if (a.entry.headword.length !== b.entry.headword.length) {
        return a.entry.headword.length - b.entry.headword.length;
      }
      return a.entry.id.localeCompare(b.entry.id);
    });

    const sliced = scored.slice(offset, offset + limit).map((r) => ({
      score: r.score,
      ...r.entry,
    }));

    return {
      query,
      normalizedQuery: q,
      direction,
      total: scored.length,
      limit,
      offset,
      items: sliced,
    };
  }

  /**
   * List dictionary entries belonging to a specific alphabetical section ("A".."W").
   * @param {string} letter
   * @param {object} [options]
   */
  getSection(letter, { type, limit = 50, offset = 0 } = {}) {
    this.ensureLoaded();
    const key = String(letter || '').trim().toUpperCase();
    let list = this._bySection.get(key) || [];
    if (type) {
      list = list.filter((e) => e.type === type);
    }
    return {
      section: key,
      total: list.length,
      limit,
      offset,
      items: list.slice(offset, offset + limit),
    };
  }

  /**
   * Retrieve all entries originating on a given printed book page (1..499).
   * @param {number} bookPage
   */
  getByBookPage(bookPage) {
    this.ensureLoaded();
    const num = Number.parseInt(bookPage, 10);
    const meta = this.pageIndex.find((p) => p.bookPage === num) || null;
    return {
      bookPage: num,
      pageMeta: meta,
      items: this._byBookPage.get(num) || [],
    };
  }

  /**
   * Retrieve all entries originating on a given 1-based PDF page (48..546).
   * @param {number} pdfPage
   */
  getByPdfPage(pdfPage) {
    this.ensureLoaded();
    const num = Number.parseInt(pdfPage, 10);
    const meta = this.pageIndex.find((p) => p.pdfPage === num) || null;
    return {
      pdfPage: num,
      pageMeta: meta,
      items: this._byPdfPage.get(num) || [],
    };
  }

  /**
   * Return authoritative manifest metadata + counts.
   */
  getManifest() {
    this.ensureLoaded();
    return this.manifest;
  }

  /**
   * Return dataset statistics and abbreviation tables.
   */
  getStats() {
    this.ensureLoaded();
    return {
      sourcePdf: this.manifest.sourcePdf,
      publication: this.manifest.publication,
      structure: this.manifest.structure,
      loadedFrom: this.manifest.loadedFrom,
      sections: this.manifest.sections,
    };
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const defaultDataset = new KamusMandarDataset();

function runCli() {
  const [cmd = 'stats', ...rest] = process.argv.slice(2);
  const queryText = rest.join(' ').trim();
  const ds = new KamusMandarDataset();

  if (cmd === 'verify') {
    const info = ds.verifyPdfSource();
    ds.load();
    console.log(JSON.stringify({ ...info, totalEntries: ds.entries.length }, null, 2));
    return;
  }
  if (cmd === 'stats') {
    console.log(JSON.stringify(ds.getStats(), null, 2));
    return;
  }
  if (cmd === 'lookup') {
    if (!queryText) {
      console.error('Usage: node src/dataset-server.js lookup <kata_mandar>');
      process.exit(1);
    }
    console.log(JSON.stringify(ds.lookup(queryText), null, 2));
    return;
  }
  if (cmd === 'search') {
    if (!queryText) {
      console.error('Usage: node src/dataset-server.js search <kata>');
      process.exit(1);
    }
    console.log(JSON.stringify(ds.search(queryText, { limit: 10 }), null, 2));
    return;
  }
  if (cmd === 'page') {
    const num = Number.parseInt(queryText, 10);
    if (!Number.isInteger(num)) {
      console.error('Usage: node src/dataset-server.js page <nomor_halaman_kamus>');
      process.exit(1);
    }
    console.log(JSON.stringify(ds.getByBookPage(num), null, 2));
    return;
  }

  console.error(`Unknown command "${cmd}". Available: verify | stats | lookup | search | page`);
  process.exit(1);
}

if (require.main === module) {
  runCli();
}

module.exports = {
  KamusMandarDataset,
  defaultDataset,
  normalizeLookupKey,
};
