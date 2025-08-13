// -*- coding: utf-8, tab-width: 2 -*-

import 'p-fatal';
import 'usnam-pmb';
import prFs from 'nofs';
import toCamelCase from 'lodash.camelcase';
import mustBe from 'typechecks-pmb/must-be.js';
import sortedJson from 'sortedjson';

import makeVersionsDb from './makeVersionsDb.mjs';
import learnVersionRow from './learnVersionRow.mjs';
import learnExtSecRow from './learnExtSecRow.mjs';
import compileMiniDb from './compileMiniDb.mjs';

const quot = JSON.stringify;


function makeRgxMatcher(rx) { return rx.exec.bind(rx); }
function trimStr(s) { return s.trim(); }
function badVal(val, why) { throw new Error(why + ': ' + quot(val)); }

const lookupSectAlias = mustBe.tProp('Section alias for section caption ', {
  current: null,
  endOfLife: null,
  future: null,
  extendedSecurityMaintenance: 'extSec',
}, 'nul | nonEmpty str');


const rowParserBySect = {
  extSec: learnExtSecRow,
};


async function cliMain() {
  const srcPath = 'releases.txt';
  let srcText = await prFs.readFile(srcPath, 'UTF-8');
  function rp(r, t) { srcText = srcText.replace(r, t || ''); }

  const srcStat = await prFs.stat(srcPath);
  const statUts = Math.floor(srcStat.mtimeMs / 1e3);

  (function fixWhitespace() {
    rp(/\r/g);
    rp(/[ \t]*\n+[ \t]*/g, '\n');
    rp(/(\n#{2})\s+(\d)/g, '$1$2');
  }());

  (function cutBoringSections() {
    let sections = srcText.split(/(?=\n={2,4})/);
    const hasVersion = makeRgxMatcher(/(^|\n)#{2}\d/);
    sections = sections.filter(hasVersion);
    sections = sections.filter(s => !(
      s.startsWith('\n=== Extended Security Maintenance ===\n')
    ));
    srcText = sections.join('');
  }());

  (function cutMiscNoise() {
    srcText = '\n' + srcText + '\n';
    rp(/(\|{2})<\w[ -;=?-~]+>/g, '$1');
    rp(/\[{2}([ -Z_-z]*)\|?/g);
    rp(/\]{2}/g);
    rp(/'{3}/g);
    rp(/\n#{2}[A-Z]*(?=\n)/g);
    rp(/\n#{2}\d+(?:\.\d+)+(?: ESM|)(?=\n)/g);
    rp(/\n[\w ]+ are posted on the \S+ mailing list\.?(?=\n)/);
    rp(/\n[\w ]+ is a paid option [ -~]+(?=\n)/);
    rp(/\n[\w ]+ old releases can be accessed at [ -~]+(?=\n)/);
  }());

  await prFs.writeFile('tmp.wikiDenoised.txt', srcText, 'UTF-8');

  const versionsDb = makeVersionsDb({
    updatedAtUnixtime: statUts,
  });

  srcText.split(/\n+(?=={2})/).forEach(function learnSect(sectText) {
    if (!sectText) { return; }
    const [sectCaptionLine, ...sectLines] = sectText.split(/\n/);
    const sectCaption = ((/^={2,3}([\w ]+)={2,3}$/.exec(sectCaptionLine)
      || false)[1] || '').trim();
    if (!sectCaption) {
      const preview = quot(sectText.slice(0, 64));
      throw new Error('Unable to find section title in ' + preview + '…');
    }
    const sectCamel = toCamelCase(sectCaption);
    const sectAlias = (lookupSectAlias(sectCamel) || sectCamel);
    let colNames;
    sectLines.forEach(function readSectLine(ln) {
      if (!ln) { return; }
      const pipeSplat = ln.split(/\|{2}/).map(trimStr);
      const [nonRow, rowTitle, ...cells] = pipeSplat;
      const fail = badVal.bind(null, pipeSplat);
      if (nonRow) { fail('Unexpected nonRow line'); }
      if (rowTitle === 'Version') {
        if (colNames) { fail('Duplicate table header'); }
        colNames = cells.filter(Boolean).map(toCamelCase);
        return;
      }
      if (rowTitle.startsWith('Ubuntu ')) {
        const byColName = {
          descr: rowTitle,
          section: sectAlias,
        };
        const parse = (rowParserBySect[sectAlias] || learnVersionRow);
        cells.forEach(function learnCell(v, i) {
          if (!v) { return; }
          const k = colNames[i];
          if (parse.ignoreCells.includes(k)) { return; }
          if (!k) { fail('No colName for cell #' + i); }
          const old = byColName[k];
          if (old) { fail('Conflicting old ' + k + ': ' + quot(old)); }
          byColName[k] = v;
        });
        parse(versionsDb, byColName);
        return;
      }
      fail('Unexpected rowTitle');
    });
  });

  await prFs.writeFile('tmp.fullDb.json', sortedJson({
    meta: versionsDb.meta.facts,
    ...versionsDb.data,
  }), 'UTF-8');
  const miniDb = compileMiniDb(versionsDb);
  await prFs.writeFile('../miniDb.json', miniDb, 'UTF-8');
};














cliMain();
