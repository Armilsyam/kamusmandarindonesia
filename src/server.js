'use strict';

const fs = require('node:fs');
const http = require('node:http');
const { URL } = require('node:url');
const { KamusMandarDataset } = require('./dataset-server');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
};

/**
 * Write a JSON response with CORS headers and optional status code.
 */
function sendJson(res, statusCode, payload, method = 'GET') {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    ...CORS_HEADERS,
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body, 'utf8'),
  });
  res.end(method === 'HEAD' ? undefined : body);
}

/**
 * Write a standardized JSON error payload.
 */
function sendError(res, statusCode, code, message, method = 'GET') {
  sendJson(res, statusCode, { error: { code, message } }, method);
}

/**
 * Parse an integer query parameter within [min, max], returning null on invalid input.
 */
function parseBoundedInt(raw, { defaultValue, min, max }) {
  if (raw === null || raw === '') return defaultValue;
  if (!/^-?\d+$/.test(raw)) return null;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed < min) return null;
  return max !== undefined && parsed > max ? max : parsed;
}

/**
 * Safe URI segment decoder returning null for malformed percent-encoding.
 */
function safeDecode(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
}

/**
 * Stream the authoritative source PDF over HTTP so client apps can open exact
 * cited pages (e.g. /api/source/pdf#page=48).
 */
function streamSourcePdf(res, dataset, method) {
  const manifest = dataset.getManifest();
  const stat = fs.statSync(dataset.pdfPath);
  res.writeHead(200, {
    ...CORS_HEADERS,
    'Content-Type': 'application/pdf',
    'Content-Length': stat.size,
    'Content-Disposition': `inline; filename="${manifest.sourcePdf.fileName}"`,
    ETag: `"${manifest.sourcePdf.sha256}"`,
    'Cache-Control': 'public, max-age=3600',
  });
  if (method === 'HEAD') {
    res.end();
    return;
  }
  const stream = fs.createReadStream(dataset.pdfPath);
  stream.on('error', () => {
    if (!res.headersSent) {
      sendError(res, 500, 'PDF_READ_ERROR', 'Failed to read source PDF dataset.', method);
    } else {
      res.destroy();
    }
  });
  stream.pipe(res);
}

/**
 * Build the HTTP request listener backed by KamusMandarDataset.
 * @param {KamusMandarDataset} dataset
 * @returns {http.RequestListener}
 */
function createRequestHandler(dataset) {
  dataset.ensureLoaded();

  return (req, res) => {
    const method = (req.method || 'GET').toUpperCase();
    if (method === 'OPTIONS') {
      res.writeHead(204, CORS_HEADERS);
      res.end();
      return;
    }
    if (method !== 'GET' && method !== 'HEAD') {
      res.setHeader('Allow', 'GET, HEAD, OPTIONS');
      sendError(res, 405, 'METHOD_NOT_ALLOWED', `Method ${method} is not supported.`, method);
      return;
    }

    let url;
    try {
      url = new URL(req.url || '/', 'http://localhost');
    } catch {
      sendError(res, 400, 'INVALID_URL', 'Malformed request URL.', method);
      return;
    }

    const pathname = url.pathname.replace(/\/+$/, '') || '/';
    const qp = url.searchParams;

    try {
      if (pathname === '/') {
        const stats = dataset.getStats();
        sendJson(
          res,
          200,
          {
            service: 'Kamus Bahasa Mandar–Indonesia Reference Dataset API',
            status: 'ready',
            publication: stats.publication,
            sourcePdf: stats.sourcePdf,
            counts: stats.structure.counts,
            endpoints: [
              'GET /health',
              'GET /api/manifest',
              'GET /api/stats',
              'GET /api/lookup?word=<kata>&related=<true|false>',
              'GET /api/words/<kata>',
              'GET /api/search?q=<kata>&direction=<all|mandar|indonesia>&section=<A..W>&pos=<v|n|...>&type=<main|sub>&limit=25&offset=0',
              'GET /api/sections',
              'GET /api/sections/<A..W>?type=<main|sub>&limit=50&offset=0',
              'GET /api/pages/<1..499>',
              'GET /api/entries/<id>',
              'GET /api/source/pdf',
            ],
          },
          method,
        );
        return;
      }

      if (pathname === '/health') {
        const pdfStatus = dataset.verifyPdfSource();
        const statusCode = pdfStatus.matchesManifest === false ? 503 : 200;
        sendJson(
          res,
          statusCode,
          {
            status: statusCode === 200 ? 'ok' : 'degraded',
            loadedFrom: dataset.getManifest().loadedFrom,
            totalEntries: dataset.entries.length,
            sourcePdf: pdfStatus,
          },
          method,
        );
        return;
      }

      if (pathname === '/api/manifest') {
        sendJson(res, 200, dataset.getManifest(), method);
        return;
      }

      if (pathname === '/api/stats') {
        sendJson(res, 200, dataset.getStats(), method);
        return;
      }

      if (pathname === '/api/source/pdf') {
        streamSourcePdf(res, dataset, method);
        return;
      }

      if (pathname === '/api/lookup') {
        const word = (qp.get('word') || qp.get('q') || '').trim();
        if (!word) {
          sendError(res, 400, 'MISSING_WORD', 'Query parameter "word" is required.', method);
          return;
        }
        const includeRelated = qp.get('related') !== 'false';
        sendJson(res, 200, dataset.lookup(word, { includeRelated }), method);
        return;
      }

      if (pathname.startsWith('/api/words/')) {
        const rawWord = pathname.slice('/api/words/'.length);
        const word = safeDecode(rawWord);
        if (!word || !word.trim()) {
          sendError(res, 400, 'INVALID_WORD', 'Word path parameter is invalid.', method);
          return;
        }
        const includeRelated = qp.get('related') !== 'false';
        const result = dataset.lookup(word, { includeRelated });
        if (result.total === 0) {
          sendError(res, 404, 'WORD_NOT_FOUND', `No dictionary entry matches "${word}".`, method);
          return;
        }
        sendJson(res, 200, result, method);
        return;
      }

      if (pathname === '/api/search') {
        const query = (qp.get('q') || '').trim();
        if (!query) {
          sendError(res, 400, 'MISSING_QUERY', 'Query parameter "q" is required.', method);
          return;
        }
        const direction = (qp.get('direction') || 'all').toLowerCase();
        if (!['all', 'mandar', 'indonesia'].includes(direction)) {
          sendError(
            res,
            400,
            'INVALID_DIRECTION',
            'Parameter "direction" must be one of: all, mandar, indonesia.',
            method,
          );
          return;
        }
        const type = qp.get('type') ? qp.get('type').toLowerCase() : undefined;
        if (type && !['main', 'sub'].includes(type)) {
          sendError(res, 400, 'INVALID_TYPE', 'Parameter "type" must be main or sub.', method);
          return;
        }
        const limit = parseBoundedInt(qp.get('limit'), { defaultValue: 25, min: 1, max: 100 });
        const offset = parseBoundedInt(qp.get('offset'), { defaultValue: 0, min: 0 });
        if (limit === null || offset === null) {
          sendError(res, 400, 'INVALID_PAGINATION', 'Parameters "limit" and "offset" must be valid integers.', method);
          return;
        }
        const result = dataset.search(query, {
          direction,
          section: qp.get('section') || undefined,
          pos: qp.get('pos') || undefined,
          type,
          limit,
          offset,
        });
        sendJson(res, 200, result, method);
        return;
      }

      if (pathname === '/api/sections') {
        sendJson(res, 200, { sections: dataset.getManifest().sections }, method);
        return;
      }

      if (pathname.startsWith('/api/sections/')) {
        const letter = safeDecode(pathname.slice('/api/sections/'.length));
        if (!letter || !/^[A-Za-z]$/.test(letter.trim())) {
          sendError(res, 400, 'INVALID_SECTION', 'Section must be a single letter (A–W).', method);
          return;
        }
        const upper = letter.trim().toUpperCase();
        const sectionExists = dataset.getManifest().sections.some((s) => s.letter === upper);
        if (!sectionExists) {
          sendError(res, 404, 'SECTION_NOT_FOUND', `Section "${upper}" does not exist in this dictionary.`, method);
          return;
        }
        const type = qp.get('type') ? qp.get('type').toLowerCase() : undefined;
        if (type && !['main', 'sub'].includes(type)) {
          sendError(res, 400, 'INVALID_TYPE', 'Parameter "type" must be main or sub.', method);
          return;
        }
        const limit = parseBoundedInt(qp.get('limit'), { defaultValue: 50, min: 1, max: 200 });
        const offset = parseBoundedInt(qp.get('offset'), { defaultValue: 0, min: 0 });
        if (limit === null || offset === null) {
          sendError(res, 400, 'INVALID_PAGINATION', 'Parameters "limit" and "offset" must be valid integers.', method);
          return;
        }
        sendJson(res, 200, dataset.getSection(upper, { type, limit, offset }), method);
        return;
      }

      if (pathname.startsWith('/api/pages/')) {
        const rawPage = pathname.slice('/api/pages/'.length);
        if (!/^\d+$/.test(rawPage)) {
          sendError(res, 400, 'INVALID_PAGE', 'Book page number must be a positive integer (1–499).', method);
          return;
        }
        const pageNum = Number.parseInt(rawPage, 10);
        const [minPage, maxPage] = dataset.getManifest().structure.bookPageRange;
        if (pageNum < minPage || pageNum > maxPage) {
          sendError(
            res,
            404,
            'PAGE_NOT_FOUND',
            `Book page ${pageNum} is outside dictionary range (${minPage}–${maxPage}).`,
            method,
          );
          return;
        }
        sendJson(res, 200, dataset.getByBookPage(pageNum), method);
        return;
      }

      if (pathname.startsWith('/api/entries/')) {
        const id = safeDecode(pathname.slice('/api/entries/'.length));
        if (!id) {
          sendError(res, 400, 'INVALID_ID', 'Entry ID is invalid.', method);
          return;
        }
        const entry = dataset.getById(id);
        if (!entry) {
          sendError(res, 404, 'ENTRY_NOT_FOUND', `Entry "${id}" was not found.`, method);
          return;
        }
        sendJson(res, 200, entry, method);
        return;
      }

      sendError(res, 404, 'NOT_FOUND', `Route ${pathname} was not found.`, method);
    } catch (err) {
      sendError(res, 500, 'INTERNAL_ERROR', err.message || 'Internal server error.', method);
    }
  };
}

/**
 * Create and optionally start the Node.js HTTP dictionary server.
 * @param {object} [options]
 * @param {KamusMandarDataset} [options.dataset]
 * @param {number} [options.port]
 * @param {string} [options.host]
 */
function createDictionaryServer(options = {}) {
  const dataset = options.dataset || new KamusMandarDataset().load();
  const server = http.createServer(createRequestHandler(dataset));
  return { server, dataset };
}

function startCliServer() {
  const rawPort = process.env.PORT !== undefined ? process.env.PORT : '3000';
  const port = Number.parseInt(rawPort, 10);
  const host = process.env.HOST || '0.0.0.0';
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    console.error(`Invalid PORT: "${rawPort}"`);
    process.exit(1);
  }

  const { server, dataset } = createDictionaryServer();
  server.listen(port, host, () => {
    const addr = server.address();
    const bound = typeof addr === 'object' && addr ? `${addr.address}:${addr.port}` : String(port);
    const stats = dataset.getStats();
    console.log(
      `Kamus Mandar–Indonesia API listening on http://${bound} (${stats.structure.counts.totalEntries} entries, source=${stats.loadedFrom})`,
    );
  });

  const shutdown = (signal) => {
    console.log(`Received ${signal}, closing HTTP server...`);
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

if (require.main === module) {
  startCliServer();
}

module.exports = {
  createRequestHandler,
  createDictionaryServer,
};
