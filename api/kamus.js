'use strict';

const { URL } = require('node:url');
const { KamusMandarDataset } = require('../src/dataset-server');
const { createRequestHandler } = require('../src/server');

const dataset = new KamusMandarDataset().load();
const requestHandler = createRequestHandler(dataset);

/**
 * Restore the original client path when Vercel rewrites all routes to /api/kamus?__path=/...
 * while preserving caller query parameters (e.g. ?word=maacar).
 * @param {string | undefined} rawUrl
 * @returns {string}
 */
function restoreRewrittenUrl(rawUrl) {
  const input = rawUrl || '/';
  const parsed = new URL(input, 'http://localhost');
  if (parsed.pathname === '/api/kamus' && parsed.searchParams.has('__path')) {
    let targetPath = parsed.searchParams.get('__path') || '/';
    if (!targetPath.startsWith('/')) {
      targetPath = `/${targetPath}`;
    }
    parsed.searchParams.delete('__path');
    const qs = parsed.searchParams.toString();
    return qs ? `${targetPath}?${qs}` : targetPath;
  }
  return input;
}

/**
 * Vercel Node.js Function entrypoint backed by Fluid Compute & PDF reference dataset.
 */
function handler(req, res) {
  req.url = restoreRewrittenUrl(req.url);
  return requestHandler(req, res);
}

module.exports = handler;
module.exports.restoreRewrittenUrl = restoreRewrittenUrl;
