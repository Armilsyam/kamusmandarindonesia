'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const PUBLIC_INDEX = path.join(PUBLIC_DIR, 'index.html');
const DATASET_DIR = path.join(ROOT_DIR, 'dataset');
const DEFAULT_OUT_DIR = path.join(ROOT_DIR, '_site');

const DATASET_FILES = [
  'kamus-mandar-indonesia-2025.pdf',
  'manifest.json',
  'vocabulary.json',
];

function copyDirFiles(srcDir, destDir, relPrefix, list) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const item of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, item.name);
    const destPath = path.join(destDir, item.name);
    const relPath = relPrefix ? `${relPrefix}/${item.name}` : item.name;
    if (item.isDirectory()) {
      copyDirFiles(srcPath, destPath, relPath, list);
    } else if (item.isFile()) {
      fs.copyFileSync(srcPath, destPath);
      list.push(relPath);
    }
  }
}

/**
 * Assemble the static site directory ready for GitHub Pages (github.io).
 * @param {string} [outDir]
 * @returns {{ outDir: string, files: string[] }}
 */
function buildPagesSite(outDir = DEFAULT_OUT_DIR) {
  if (!fs.existsSync(PUBLIC_INDEX)) {
    throw new Error(`Missing frontend entrypoint: ${PUBLIC_INDEX}`);
  }

  fs.rmSync(outDir, { recursive: true, force: true });
  const outDatasetDir = path.join(outDir, 'dataset');
  fs.mkdirSync(outDatasetDir, { recursive: true });

  const copied = [];
  copyDirFiles(PUBLIC_DIR, outDir, '', copied);

  fs.writeFileSync(path.join(outDir, '.nojekyll'), '', 'utf8');
  copied.push('.nojekyll');

  for (const name of DATASET_FILES) {
    const src = path.join(DATASET_DIR, name);
    if (!fs.existsSync(src)) {
      throw new Error(`Missing dataset file for GitHub Pages build: ${src}`);
    }
    fs.copyFileSync(src, path.join(outDatasetDir, name));
    copied.push(`dataset/${name}`);
  }

  return { outDir, files: copied };
}

if (require.main === module) {
  const customOut = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_OUT_DIR;
  const result = buildPagesSite(customOut);
  console.log(`Built GitHub Pages site at ${result.outDir}: ${result.files.join(', ')}`);
}

module.exports = {
  buildPagesSite,
  DATASET_FILES,
};
