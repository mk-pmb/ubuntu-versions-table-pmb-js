// -*- coding: utf-8, tab-width: 2 -*-

import prFs from 'node:fs/promises';

import absdir from 'absdir';
import eq from 'equal-pmb';

const inPkgDir = absdir(import.meta, '..');

function sortedArray(x) { return Array.from(x).sort(); }

async function verifyNpmIgnore() {
  const files = {};
  await Promise.all([
    '.gitignore',
    '.npmignore',
  ].map(async function readOneFile(fileName) {
    const fullPath = inPkgDir(fileName);
    const text = await prFs.readFile(fullPath, { encoding: 'utf-8' });
    const rec = { text };
    files[fileName] = rec;
    rec.uniquePatterns = new Set(text.split('\n').filter(
      ln => /^[^#]/.test(ln)));
  }));

  function pattDiff(fromName, omitName) {
    const fromPatt = files[fromName].uniquePatterns;
    const omitPatt = files[omitName].uniquePatterns;
    return sortedArray(fromPatt.difference(omitPatt));
  }

  eq(pattDiff('.npmignore', '.gitignore'), [
    '/build',
  ]);
  eq(pattDiff('.gitignore', '.npmignore'), []);
}



(async function toolChainTest() {
  await Promise.all([
    verifyNpmIgnore(),
  ]);
  console.info('+OK toolchain test passed.');
}());
