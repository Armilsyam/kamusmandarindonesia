'use strict';

const fs = require('node:fs');
const zlib = require('node:zlib');

/**
 * Character normalization table for known OCR / keyboard-layout homoglyph
 * artifacts embedded in the source PDF's Type0 Identity-H and WinAnsi spans
 * (verified on pages 94, 331, 334, 342, 345, 349, 355, 356, 358, 363).
 */
const CONFUSABLE_MAP = new Map([
  ['\u0430', 'a'], // Cyrillic а -> a
  ['\u0433', 'r'], // Cyrillic г -> r (OCR artifact e.g. горpong -> roppong)
  ['\u0435', 'e'], // Cyrillic е -> e
  ['\u043E', 'o'], // Cyrillic о -> o
  ['\u043F', 'n'], // Cyrillic п -> n (OCR artifact e.g. па -> na)
  ['\u0440', 'p'], // Cyrillic р -> p (OCR artifact e.g. раtuleq -> patuleq)
  ['\u0456', 'i'], // Cyrillic і -> i (OCR artifact e.g. nіраh -> nipah)
  ['\u0131', 'i'], // Turkish dotless ı -> i (menjalanı -> menjalani)
  ['\u0105', 'q'], // Latin ą -> q (OCR artifact e.g. maą -> maq)
  ['\u00ED', 'i'], // Latin í -> i (OCR artifact e.g. andíang -> andiang)
  ['\u2013', '--'], // En-dash used as headword placeholder where PDF substituted F5
  ['\u2014', '-'], // Em-dash in numeric range e.g. 30—50 cm
  ['\u2018', "'"], // Left single quote in e.g. ana‘u
  ['\u2019', "'"], // Right single quote
]);

const WIN_ANSI_EXTRA = {
  0x80: '\u20AC',
  0x82: '\u201A',
  0x83: '\u0192',
  0x84: '\u201E',
  0x85: '\u2026',
  0x86: '\u2020',
  0x87: '\u2021',
  0x88: '\u02C6',
  0x89: '\u2030',
  0x8A: '\u0160',
  0x8B: '\u2039',
  0x8C: '\u0152',
  0x8E: '\u017D',
  0x91: '\u2018',
  0x92: '\u2019',
  0x93: '\u201C',
  0x94: '\u201D',
  0x95: '\u2022',
  0x96: '\u2013',
  0x97: '\u2014',
  0x98: '\u02DC',
  0x99: '\u2122',
  0x9A: '\u0161',
  0x9B: '\u203A',
  0x9C: '\u0153',
  0x9E: '\u017E',
  0x9F: '\u0178',
};

const POS_TAGS = new Set([
  'n',
  'v',
  'a',
  'adv',
  'p',
  'num',
  'pron',
  'i',
  'k',
  'ki',
  'ukp',
  'pb',
  'klitik',
  'frasa',
]);

/**
 * Replace known PDF homoglyph/OCR artifacts with clean ASCII/Latin equivalents.
 * @param {string} text
 * @returns {string}
 */
function normalizePdfText(text) {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    out += CONFUSABLE_MAP.get(ch) ?? ch;
  }
  return out.replace(/[ \t]+/g, ' ').trim();
}

/**
 * Unpack top-level PDF objects and /ObjStm compressed object streams.
 * @param {Buffer} pdfBuffer
 * @returns {{ objects: Map<number, { dict: string, streamData: Buffer | null }>, pages: Array<{ id: number, dict: string }> }}
 */
function loadPdfObjects(pdfBuffer) {
  const txt = pdfBuffer.toString('latin1');
  const objects = new Map();
  const objRe = /(\d+)\s+(\d+)\s+obj\b([\s\S]*?)\bendobj\b/g;
  let match;

  while ((match = objRe.exec(txt)) !== null) {
    const num = Number.parseInt(match[1], 10);
    const body = match[3];
    const streamIdx = body.indexOf('stream');
    let dict = body;
    let streamData = null;

    if (streamIdx !== -1) {
      dict = body.slice(0, streamIdx);
      let sStart = match.index + match[0].indexOf('stream') + 6;
      if (txt[sStart] === '\r' && txt[sStart + 1] === '\n') sStart += 2;
      else if (txt[sStart] === '\n' || txt[sStart] === '\r') sStart += 1;
      const sEnd = match.index + match[0].lastIndexOf('endstream');
      streamData = pdfBuffer.subarray(sStart, sEnd);
      if (dict.includes('/FlateDecode')) {
        try {
          streamData = zlib.inflateSync(streamData);
        } catch {
          // Leave raw buffer if non-standard stream (not expected in dictionary pages)
        }
      }
    }
    objects.set(num, { dict, streamData });
  }

  for (const obj of objects.values()) {
    if (!obj.dict.includes('/ObjStm') || !obj.streamData) continue;
    const firstMatch = /\/First\s+(\d+)/.exec(obj.dict);
    const countMatch = /\/N\s+(\d+)/.exec(obj.dict);
    if (!firstMatch || !countMatch) continue;

    const first = Number.parseInt(firstMatch[1], 10);
    const count = Number.parseInt(countMatch[1], 10);
    const stmText = obj.streamData.toString('latin1');
    const header = stmText.slice(0, first).trim().split(/\s+/).map(Number);

    for (let i = 0; i < count; i++) {
      const objNum = header[i * 2];
      const offset = first + header[i * 2 + 1];
      const nextOffset = i + 1 < count ? first + header[(i + 1) * 2 + 1] : stmText.length;
      objects.set(objNum, {
        dict: stmText.slice(offset, nextOffset).trim(),
        streamData: null,
      });
    }
  }

  let rootPagesId = null;
  for (const obj of objects.values()) {
    if (/\/Type\s*\/Catalog\b/.test(obj.dict)) {
      const pagesRef = /\/Pages\s+(\d+)\s+0\s+R/.exec(obj.dict);
      if (pagesRef) {
        rootPagesId = Number.parseInt(pagesRef[1], 10);
        break;
      }
    }
  }

  if (rootPagesId === null) {
    throw new Error('Invalid PDF structure: missing /Catalog -> /Pages root.');
  }

  const pages = [];
  const collect = (nodeId) => {
    const obj = objects.get(nodeId);
    if (!obj) return;
    if (/\/Type\s*\/Pages\b/.test(obj.dict)) {
      const kidsMatch = /\/Kids\s*\[([\s\S]*?)\]/.exec(obj.dict);
      if (kidsMatch) {
        for (const ref of kidsMatch[1].matchAll(/(\d+)\s+0\s+R/g)) {
          collect(Number.parseInt(ref[1], 10));
        }
      }
    } else if (/\/Type\s*\/Page\b/.test(obj.dict)) {
      pages.push({ id: nodeId, dict: obj.dict });
    }
  };
  collect(rootPagesId);

  return { objects, pages };
}

/**
 * Parse a /ToUnicode CMap stream into a code -> UTF-16 string lookup Map.
 * @param {string} cmapStr
 * @returns {Map<number, string>}
 */
function parseToUnicodeCMap(cmapStr) {
  const map = new Map();
  for (const bm of cmapStr.matchAll(/beginbfchar\s*([\s\S]*?)endbfchar/g)) {
    for (const pair of bm[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      const code = Number.parseInt(pair[1], 16);
      map.set(code, decodeUtf16Hex(pair[2]));
    }
  }
  for (const bm of cmapStr.matchAll(/beginbfrange\s*([\s\S]*?)endbfrange/g)) {
    for (const range of bm[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      const start = Number.parseInt(range[1], 16);
      const end = Number.parseInt(range[2], 16);
      let dst = Number.parseInt(range[3], 16);
      for (let c = start; c <= end; c++) {
        map.set(c, String.fromCharCode(dst++));
      }
    }
  }
  return map;
}

function decodeUtf16Hex(hex) {
  let out = '';
  for (let i = 0; i + 4 <= hex.length; i += 4) {
    out += String.fromCharCode(Number.parseInt(hex.slice(i, i + 4), 16));
  }
  return out;
}

function decodeWinAnsiLiteral(raw) {
  let out = '';
  for (let i = 0; i < raw.length; i++) {
    let ch = raw.charCodeAt(i);
    if (raw[i] === '\\') {
      i++;
      const esc = raw[i];
      if (esc === 'n') ch = 10;
      else if (esc === 'r') ch = 13;
      else if (esc === 't') ch = 9;
      else if (esc === 'b') ch = 8;
      else if (esc === 'f') ch = 12;
      else if (esc === '(' || esc === ')' || esc === '\\') ch = esc.charCodeAt(0);
      else if (esc >= '0' && esc <= '7') {
        let oct = esc;
        if (i + 1 < raw.length && raw[i + 1] >= '0' && raw[i + 1] <= '7') oct += raw[++i];
        if (i + 1 < raw.length && raw[i + 1] >= '0' && raw[i + 1] <= '7') oct += raw[++i];
        ch = Number.parseInt(oct, 8);
      } else {
        ch = esc.charCodeAt(0);
      }
    }
    out += WIN_ANSI_EXTRA[ch] || String.fromCharCode(ch);
  }
  return out;
}

function decodeHexCidString(hex, cmap) {
  if (!cmap) return '';
  let out = '';
  for (let i = 0; i + 4 <= hex.length; i += 4) {
    const code = Number.parseInt(hex.slice(i, i + 4), 16);
    out += cmap.get(code) ?? '';
  }
  return out;
}

/**
 * Classify PDF BaseFont into semantic dictionary typography role.
 * @param {string} baseFont
 * @returns {'bold' | 'italic' | 'regular' | 'header'}
 */
function classifyFontStyle(baseFont) {
  if (/LucidaSansUnicode/i.test(baseFont)) return 'header';
  if (/Bold/i.test(baseFont)) return 'bold';
  if (/Italic/i.test(baseFont)) return 'italic';
  return 'regular';
}

/**
 * Extract positioned text spans from one PDF page.
 */
function extractPageSpans(objects, pageObj) {
  const resRef = /\/Resources\s+(\d+)\s+0\s+R/.exec(pageObj.dict);
  const resDict = resRef
    ? objects.get(Number.parseInt(resRef[1], 10))?.dict || ''
    : (/\/Resources\s*<<([\s\S]*?)>>/.exec(pageObj.dict)?.[0] || '');

  const fontRef = /\/Font\s+(\d+)\s+0\s+R/.exec(resDict);
  const fontInline = /\/Font\s*<<([\s\S]*?)>>/.exec(resDict);
  const fontDictStr = fontRef
    ? objects.get(Number.parseInt(fontRef[1], 10))?.dict || ''
    : (fontInline ? fontInline[1] : '');

  const fonts = {};
  for (const fm of fontDictStr.matchAll(/\/(F\d+)\s+(\d+)\s+0\s+R/g)) {
    const fObj = objects.get(Number.parseInt(fm[2], 10));
    if (!fObj) continue;
    const baseFont = (/\/BaseFont\s*\/([^\s/>]+)/.exec(fObj.dict) || [])[1] || '';
    const tuRef = /\/ToUnicode\s+(\d+)\s+0\s+R/.exec(fObj.dict);
    const tuStream = tuRef ? objects.get(Number.parseInt(tuRef[1], 10))?.streamData : null;
    fonts[fm[1]] = {
      style: classifyFontStyle(baseFont),
      cmap: tuStream ? parseToUnicodeCMap(tuStream.toString('latin1')) : null,
    };
  }

  const contentIds = [];
  const arrMatch = /\/Contents\s*\[([\s\S]*?)\]/.exec(pageObj.dict);
  if (arrMatch) {
    for (const r of arrMatch[1].matchAll(/(\d+)\s+0\s+R/g)) {
      contentIds.push(Number.parseInt(r[1], 10));
    }
  } else {
    const single = /\/Contents\s+(\d+)\s+0\s+R/.exec(pageObj.dict);
    if (single) contentIds.push(Number.parseInt(single[1], 10));
  }

  const streamText = contentIds
    .map((id) => objects.get(id)?.streamData?.toString('latin1') || '')
    .join('\n');

  const spans = [];
  for (const bm of streamText.matchAll(/BT\b([\s\S]*?)ET\b/g)) {
    const block = bm[1];
    const tfM = /\/(F\d+)\s+([\d.]+)\s+Tf/.exec(block);
    const tmM = /([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+Tm/.exec(block);
    if (!tfM || !tmM) continue;

    const fontInfo = fonts[tfM[1]] || { style: 'regular', cmap: null };
    const size = Number.parseFloat(tfM[2]);
    const x = Number.parseFloat(tmM[5]);
    const y = Number.parseFloat(tmM[6]);

    let text = '';
    const tjArr = /\[([\s\S]*?)\]\s*TJ/.exec(block);
    if (tjArr) {
      const inner = tjArr[1];
      let idx = 0;
      while (idx < inner.length) {
        if (inner[idx] === '(') {
          let end = idx + 1;
          while (end < inner.length) {
            if (inner[end] === '\\') {
              end += 2;
              continue;
            }
            if (inner[end] === ')') break;
            end++;
          }
          text += decodeWinAnsiLiteral(inner.slice(idx + 1, end));
          idx = end + 1;
        } else if (inner[idx] === '<') {
          const end = inner.indexOf('>', idx + 1);
          text += decodeHexCidString(inner.slice(idx + 1, end), fontInfo.cmap);
          idx = end + 1;
        } else {
          idx++;
        }
      }
    } else {
      const tj1 = /\(((?:[^)\\]|\\.)*)\)\s*Tj/.exec(block);
      if (tj1) {
        text += decodeWinAnsiLiteral(tj1[1]);
      } else {
        const th1 = /<([0-9A-Fa-f]+)>\s*Tj/.exec(block);
        if (th1) text += decodeHexCidString(th1[1], fontInfo.cmap);
      }
    }

    if (text.length > 0) {
      spans.push({ x, y, size, style: fontInfo.style, text });
    }
  }

  return spans;
}

/**
 * Group baseline body spans (12pt) and attach superscript/subscript spans (8.04pt)
 * into reading-order lines for left & right columns while extracting header/footer metadata
 * and centered section dividers (e.g. "A - a").
 */
function buildPageLayout(spans) {
  const headerSpans = spans.filter((s) => s.y > 540);
  const footerSpans = spans.filter((s) => s.y < 50);
  const bodySpans = spans.filter((s) => s.y >= 50 && s.y <= 540);

  const joinSpans = (arr) =>
    [...arr]
      .sort((a, b) => a.x - b.x)
      .map((s) => s.text)
      .join('')
      .trim();

  const headerLeft = joinSpans(headerSpans.filter((s) => s.x < 210));
  const headerRight = joinSpans(headerSpans.filter((s) => s.x >= 210));
  const footerText = joinSpans(footerSpans);
  const bookPage = /^\d+$/.test(footerText) ? Number.parseInt(footerText, 10) : null;

  // Detect centered section divider rows spanning the column boundary (e.g. "A - a")
  const bannerYSet = new Set();
  const baseRowsByY = new Map();
  for (const sp of bodySpans) {
    if (sp.size < 10) continue;
    const key = Math.round(sp.y * 2) / 2;
    if (!baseRowsByY.has(key)) baseRowsByY.set(key, []);
    baseRowsByY.get(key).push(sp);
  }

  const banners = [];
  for (const [yKey, row] of baseRowsByY.entries()) {
    const rowText = joinSpans(row).replace(/\s+/g, ' ');
    const m = /^([A-Z])\s*-\s*([a-z])$/.exec(rowText);
    const minX = Math.min(...row.map((s) => s.x));
    if (m && minX >= 175 && minX <= 205 && m[1].toLowerCase() === m[2]) {
      bannerYSet.add(yKey);
      banners.push({ y: yKey, letter: m[1] });
    }
  }

  const buildColumnLines = (colSpans) => {
    const baselineRows = [];
    const primary = colSpans.filter((s) => s.size >= 10 && !bannerYSet.has(Math.round(s.y * 2) / 2));
    const small = colSpans.filter((s) => s.size < 10 && !bannerYSet.has(Math.round(s.y * 2) / 2));

    const rowMap = new Map();
    for (const sp of primary) {
      const ky = Math.round(sp.y * 2) / 2;
      if (!rowMap.has(ky)) rowMap.set(ky, []);
      rowMap.get(ky).push(sp);
    }

    for (const [y, items] of rowMap.entries()) {
      baselineRows.push({ y, items });
    }
    baselineRows.sort((a, b) => b.y - a.y);

    // Attach subscript/superscript homonym digits (8.04pt) to nearest baseline within +/- 4.5pt
    for (const sp of small) {
      let best = null;
      let bestDist = Infinity;
      for (const row of baselineRows) {
        const d = Math.abs(row.y - sp.y);
        if (d <= 4.5 && d < bestDist) {
          bestDist = d;
          best = row;
        }
      }
      if (best) {
        best.items.push(sp);
      }
    }

    return baselineRows
      .map((row) => {
        row.items.sort((a, b) => a.x - b.x);
        const minX = row.items[0].x;
        const rawText = row.items.map((i) => i.text).join('');
        return {
          y: row.y,
          minX,
          rawText,
          text: normalizePdfText(rawText),
          items: row.items,
        };
      })
      .filter((ln) => ln.rawText.trim().length > 0 || ln.items.length > 0);
  };

  const leftLines = buildColumnLines(bodySpans.filter((s) => s.x < 210));
  const rightLines = buildColumnLines(bodySpans.filter((s) => s.x >= 210));

  return {
    headerLeft,
    headerRight,
    bookPage,
    banners,
    leftLines,
    rightLines,
  };
}

/**
 * Append a wrapped continuation line onto an accumulator buffer while
 * keeping intra-word reduplication hyphens intact (e.g. "gadis-\ngadis" -> "gadis-gadis").
 * @param {string} prev
 * @param {string} next
 * @returns {string}
 */
function joinWrappedText(prev, next) {
  const a = prev.trimEnd();
  const b = next.trimStart();
  if (!a) return b;
  if (!b) return a;
  if (/[a-zA-Z]-$/.test(a) && !a.endsWith('--') && /^[a-zA-Z]/.test(b)) {
    return `${a}${b}`;
  }
  return `${a} ${b}`;
}

/**
 * Extract structured headword, homonym index, part-of-speech tags, and body definition
 * from the merged spans of a complete dictionary entry.
 * @param {Array<{ x: number, y: number, size: number, style: string, text: string }>} spans
 */
function parseEntryRuns(spans) {
  // Collapse consecutive spans of identical (style, isSmall) within lines while preserving wrapped spacing
  const runs = [];
  for (const sp of spans) {
    const isSmall = sp.size < 10;
    const last = runs[runs.length - 1];
    if (last && last.style === sp.style && last.isSmall === isSmall) {
      last.text += sp.text;
    } else {
      runs.push({ style: sp.style, isSmall, text: sp.text });
    }
  }

  // Headword consists of the leading bold run(s) + optional small subscript homonym digit
  let headwordRaw = '';
  let homonym = null;
  let bodyStartIdx = 0;

  // Skip any accidental leading whitespace run
  while (bodyStartIdx < runs.length && !runs[bodyStartIdx].text.trim()) {
    bodyStartIdx++;
  }

  while (bodyStartIdx < runs.length) {
    const r = runs[bodyStartIdx];
    const clean = normalizePdfText(r.text);
    if (r.isSmall && /^\d+$/.test(clean) && headwordRaw.trim().length > 0 && homonym === null) {
      homonym = Number.parseInt(clean, 10);
      bodyStartIdx++;
      break;
    }
    if (r.style === 'bold' && headwordRaw.length === 0) {
      headwordRaw = r.text;
      bodyStartIdx++;
      continue;
    }
    if (r.style === 'bold' && !r.text.trim()) {
      bodyStartIdx++;
      continue;
    }
    break;
  }

  // Fallback in rare cases where homonym small digit wasn't followed by whitespace
  if (homonym === null && bodyStartIdx < runs.length && runs[bodyStartIdx].isSmall) {
    const d = normalizePdfText(runs[bodyStartIdx].text);
    if (/^\d+$/.test(d)) {
      homonym = Number.parseInt(d, 10);
      bodyStartIdx++;
    }
  }

  // Rebuild remaining runs with clean spacing across line boundaries
  const bodyRuns = runs.slice(bodyStartIdx);
  const rawBody = bodyRuns.map((r) => r.text).join('');
  const cleanBody = normalizePdfText(rawBody);

  // Extract italic POS tags present anywhere in the entry (primary first POS + distinct POS list)
  const posList = [];
  for (const r of bodyRuns) {
    if (r.style === 'italic') {
      for (const token of normalizePdfText(r.text).split(/[\s,;]+/)) {
        const lower = token.toLowerCase();
        if (POS_TAGS.has(lower) && !posList.includes(lower)) {
          posList.push(lower);
        }
      }
    }
  }

  // Build ordered style runs so downstream UIs/APIs can distinguish bold examples vs regular glosses
  const formattedSegments = [];
  for (const r of runs) {
    const t = r.text.replace(/[ \t]+/g, ' ');
    if (!t) continue;
    const norm = normalizePdfText(t);
    if (!norm) continue;
    const role = r.isSmall ? 'homonym' : r.style;
    const prev = formattedSegments[formattedSegments.length - 1];
    if (prev && prev.role === role) {
      prev.text = joinWrappedText(prev.text, norm);
    } else {
      formattedSegments.push({ role, text: norm });
    }
  }

  const headwordNormalized = normalizePdfText(headwordRaw).replace(/\s+/g, ' ');
  const aliases = [...new Set(headwordNormalized.split(',').map((s) => s.trim()).filter(Boolean))];
  const rawJoined = runs.map((r) => r.text).join('').replace(/[ \t]+/g, ' ').trim();

  return {
    headword: headwordNormalized,
    aliases,
    headwordRaw: headwordRaw.trim().replace(/[ \t]+/g, ' '),
    homonym,
    pos: posList,
    primaryPos: posList[0] || null,
    definitionText: cleanBody,
    segments: formattedSegments,
    rawText: rawJoined,
  };
}

/**
 * Parse all 499 dictionary pages (PDF pages 48..546, printed pages 1..499) from
 * the authoritative Mandar–Indonesian dictionary PDF buffer.
 *
 * @param {Buffer} pdfBuffer
 * @returns {{
 *   totalPdfPages: number,
 *   dictionaryPdfPageRange: [number, number],
 *   bookPageRange: [number, number],
 *   sections: Array<{ letter: string, firstBookPage: number, firstPdfPage: number, entryCount: number }>,
 *   entries: Array<object>,
 *   pageIndex: Array<{ pdfPage: number, bookPage: number | null, headerLeft: string, headerRight: string }>
 * }}
 */
function extractDictionaryFromPdfBuffer(pdfBuffer) {
  const { objects, pages } = loadPdfObjects(pdfBuffer);
  const startPdfPage = 48;
  const endPdfPage = 546;

  if (pages.length < endPdfPage) {
    throw new Error(`Expected at least ${endPdfPage} pages, found ${pages.length}.`);
  }

  const rawEntries = [];
  const pageIndex = [];
  let activeSection = 'A';
  let currentMainEntry = null;
  let currentEntry = null;

  const flushCurrent = () => {
    if (!currentEntry) return;
    const parsed = parseEntryRuns(currentEntry.spans);
    rawEntries.push({
      type: currentEntry.type,
      section: currentEntry.section,
      parentHeadword: currentEntry.parentHeadword,
      headword: parsed.headword,
      aliases: parsed.aliases,
      headwordRaw: parsed.headwordRaw,
      homonym: parsed.homonym,
      pos: parsed.pos,
      primaryPos: parsed.primaryPos,
      definitionText: parsed.definitionText,
      segments: parsed.segments,
      rawText: parsed.rawText,
      source: {
        pdfPage: currentEntry.pdfPage,
        bookPage: currentEntry.bookPage,
        column: currentEntry.column,
        endPdfPage: currentEntry.lastPdfPage,
        endBookPage: currentEntry.lastBookPage,
      },
    });
    currentEntry = null;
  };

  for (let pdfPage = startPdfPage; pdfPage <= endPdfPage; pdfPage++) {
    const spans = extractPageSpans(objects, pages[pdfPage - 1]);
    const layout = buildPageLayout(spans);
    pageIndex.push({
      pdfPage,
      bookPage: layout.bookPage,
      headerLeft: layout.headerLeft,
      headerRight: layout.headerRight,
    });

    const columns = [
      { name: 'left', baseX: 51.024, lines: layout.leftLines },
      { name: 'right', baseX: 227.78, lines: layout.rightLines },
    ];

    // Section banner sorting by Y (descending) handles top-of-page & mid-page transitions cleanly
    const banners = [...layout.banners].sort((a, b) => b.y - a.y);

    for (const col of columns) {
      let bannerIdx = 0;
      for (const line of col.lines) {
        while (bannerIdx < banners.length && line.y < banners[bannerIdx].y) {
          activeSection = banners[bannerIdx].letter;
          bannerIdx++;
        }

        const relX = line.minX - col.baseX;
        const startsBoldOrSmall = line.items.some((it) => it.text.trim().length > 0 && it.style === 'bold' && it === line.items.find((x) => x.text.trim().length > 0));

        // Main entry starts near col.baseX (-6 <= relX < 8), Sub-entry near +14.2pt (8 <= relX < 21)
        const isMainStart = relX >= -6 && relX < 8 && startsBoldOrSmall;
        const isSubStart = relX >= 8 && relX < 21 && startsBoldOrSmall;

        if (isMainStart || isSubStart) {
          flushCurrent();
          const type = isMainStart ? 'main' : 'sub';
          const previewParsed = parseEntryRuns(line.items);
          if (type === 'main') {
            currentMainEntry = previewParsed.headword;
          }
          currentEntry = {
            type,
            section: activeSection,
            parentHeadword: type === 'sub' ? currentMainEntry : null,
            pdfPage,
            bookPage: layout.bookPage,
            lastPdfPage: pdfPage,
            lastBookPage: layout.bookPage,
            column: col.name,
            spans: [],
          };
          appendLineSpans(currentEntry.spans, line.items);
        } else if (currentEntry) {
          appendLineSpans(currentEntry.spans, line.items);
          currentEntry.lastPdfPage = pdfPage;
          currentEntry.lastBookPage = layout.bookPage;
        }
      }
      while (bannerIdx < banners.length) {
        activeSection = banners[bannerIdx].letter;
        bannerIdx++;
      }
    }
  }
  flushCurrent();

  // Assign deterministic sequential IDs and per-section summaries
  const sectionMap = new Map();
  const entries = rawEntries.map((entry, idx) => {
    const id = `mdr-${String(idx + 1).padStart(4, '0')}`;
    if (!sectionMap.has(entry.section)) {
      sectionMap.set(entry.section, {
        letter: entry.section,
        firstBookPage: entry.source.bookPage,
        firstPdfPage: entry.source.pdfPage,
        entryCount: 0,
        mainCount: 0,
        subCount: 0,
      });
    }
    const sec = sectionMap.get(entry.section);
    sec.entryCount++;
    if (entry.type === 'main') sec.mainCount++;
    else sec.subCount++;

    return { id, ...entry };
  });

  return {
    totalPdfPages: pages.length,
    dictionaryPdfPageRange: [startPdfPage, endPdfPage],
    bookPageRange: [1, 499],
    sections: [...sectionMap.values()],
    entries,
    pageIndex,
  };
}

/**
 * Push a line's spans into an entry span buffer, inserting a boundary space or
 * preserving intra-word hyphens across wrapped lines.
 */
function appendLineSpans(targetSpans, lineItems) {
  if (targetSpans.length === 0) {
    targetSpans.push(...lineItems.map((it) => ({ ...it })));
    return;
  }

  const prevSpan = targetSpans[targetSpans.length - 1];
  const prevEnd = prevSpan.text.trimEnd();
  const nextFirst = lineItems[0]?.text.trimStart() || '';

  const isHyphenWrap =
    /[a-zA-Z]-$/.test(prevEnd) &&
    !prevEnd.endsWith('--') &&
    /^[a-zA-Z]/.test(nextFirst);

  if (isHyphenWrap) {
    prevSpan.text = prevEnd;
  } else if (!/\s$/.test(prevSpan.text) && !/^\s/.test(lineItems[0]?.text || '')) {
    targetSpans.push({
      x: lineItems[0].x,
      y: lineItems[0].y,
      size: 12,
      style: lineItems[0].style,
      text: ' ',
    });
  }

  targetSpans.push(...lineItems.map((it) => ({ ...it })));
}

module.exports = {
  POS_TAGS,
  normalizePdfText,
  loadPdfObjects,
  extractPageSpans,
  extractDictionaryFromPdfBuffer,
};
