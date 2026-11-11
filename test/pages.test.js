'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildPagesSite, DATASET_FILES } = require('../scripts/build-pages');
const { computeSha256 } = require('../scripts/build-dataset');

test('buildPagesSite assembles index.html, .nojekyll, and exact PDF/JSON dataset copies', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kamus-pages-'));
  try {
    const res = buildPagesSite(tmpDir);
    assert.ok(res.files.includes('index.html'));
    assert.ok(res.files.includes('.nojekyll'));

    const html = fs.readFileSync(path.join(tmpDir, 'index.html'), 'utf8');
    assert.match(html, /\.\/dataset\/manifest\.json/);
    assert.match(html, /\.\/dataset\/vocabulary\.json/);
    assert.match(html, /\.\/dataset\/kamus-mandar-indonesia-2025\.pdf/);
    assert.match(html, /Kamus Bahasa Mandar/);

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
