'use strict';

const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const { createDictionaryServer } = require('../src/server');

let server;
let baseUrl;

before(async () => {
  const built = createDictionaryServer();
  server = built.server;
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  baseUrl = `http://127.0.0.1:${addr.port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
});

test('GET / and GET /health return service status and verified PDF metadata', async () => {
  const rootRes = await fetch(`${baseUrl}/`);
  assert.equal(rootRes.status, 200);
  const rootJson = await rootRes.json();
  assert.equal(rootJson.status, 'ready');
  assert.equal(rootJson.counts.totalEntries, 4908);

  const healthRes = await fetch(`${baseUrl}/health`);
  assert.equal(healthRes.status, 200);
  const healthJson = await healthRes.json();
  assert.equal(healthJson.status, 'ok');
  assert.equal(healthJson.sourcePdf.matchesManifest, true);
});

test('GET /api/lookup and GET /api/words/:word resolve Mandar entries cleanly', async () => {
  const res = await fetch(`${baseUrl}/api/lookup?word=maacar`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.total, 1);
  assert.equal(data.matches[0].parentHeadword, 'acar');
  assert.equal(data.matches[0].source.bookPage, 1);

  const wordRes = await fetch(`${baseUrl}/api/words/acar`);
  assert.equal(wordRes.status, 200);
  const wordJson = await wordRes.json();
  assert.ok(wordJson.matches[0].derivations.some((d) => d.headword === 'maacar'));

  const missingWord = await fetch(`${baseUrl}/api/words/kata_tidak_ada_xyz`);
  assert.equal(missingWord.status, 404);
});

test('GET /api/search supports bidirectional search and validation', async () => {
  const res = await fetch(`${baseUrl}/api/search?q=ayah&direction=indonesia&limit=5`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.ok(json.total >= 1);
  assert.ok(json.items.length <= 5);
  assert.ok(json.items.some((e) => e.headword === 'abi'));

  const badReq = await fetch(`${baseUrl}/api/search`);
  assert.equal(badReq.status, 400);

  const badLimit = await fetch(`${baseUrl}/api/search?q=abi&limit=abc`);
  assert.equal(badLimit.status, 400);
});

test('GET /api/sections, /api/pages, /api/entries, and /api/source/pdf work', async () => {
  const secList = await fetch(`${baseUrl}/api/sections`);
  assert.equal(secList.status, 200);
  const secJson = await secList.json();
  assert.equal(secJson.sections.length, 20);

  const secW = await fetch(`${baseUrl}/api/sections/w?limit=5`);
  assert.equal(secW.status, 200);
  const secWJson = await secW.json();
  assert.equal(secWJson.section, 'W');
  assert.equal(secWJson.total, 14);

  const invalidSec = await fetch(`${baseUrl}/api/sections/Z`);
  assert.equal(invalidSec.status, 404);

  const page499 = await fetch(`${baseUrl}/api/pages/499`);
  assert.equal(page499.status, 200);
  const pageJson = await page499.json();
  assert.ok(pageJson.items.some((e) => e.headword === 'witir'));

  const outOfRange = await fetch(`${baseUrl}/api/pages/500`);
  assert.equal(outOfRange.status, 404);

  const entryRes = await fetch(`${baseUrl}/api/entries/mdr-0001`);
  assert.equal(entryRes.status, 200);
  const entryJson = await entryRes.json();
  assert.equal(entryJson.headword, 'a');

  const pdfHead = await fetch(`${baseUrl}/api/source/pdf`, { method: 'HEAD' });
  assert.equal(pdfHead.status, 200);
  assert.equal(pdfHead.headers.get('content-type'), 'application/pdf');
  assert.equal(pdfHead.headers.get('content-length'), '3983041');
});

test('OPTIONS CORS preflight and unsupported HTTP methods return expected codes', async () => {
  const opt = await fetch(`${baseUrl}/api/lookup`, { method: 'OPTIONS' });
  assert.equal(opt.status, 204);
  assert.equal(opt.headers.get('access-control-allow-origin'), '*');

  const post = await fetch(`${baseUrl}/api/lookup`, { method: 'POST' });
  assert.equal(post.status, 405);
});
