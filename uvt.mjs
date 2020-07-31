// -*- coding: utf-8, tab-width: 2 -*-

import miniData from './miniDb.json';

const [miniMeta, miniColNames, ...miniRecords] = miniData;

const rowSectColName = 'phase';
const rowSectProp = 's';

const dataBy = {
  codenameApt: new Map(),
  section: new Map(),
  release: new Map(),
};


function rowToDict(r) {
  const s = r[rowSectProp];
  const d = { [rowSectColName]: s, ...dataBy.section.get(s).details };
  miniColNames.forEach((k, i) => { d[k] = r[i]; });
  return d;
}

function minDigits2(n) { return (n > 9 ? '' : '0') + n; }
function findWords(s) { return (String(s || '').match(/\S+/g) || []); }
function lc(s) { return s && s.toLowerCase(); }
function truthyLowerUnequal(ac, ex) { return ac && (ac !== lc(ex)); }

(function parseMiniData() {
  function dictMapAdd(m, k, v) {
    if (m.has(k)) { throw new Error('Dupe ' + k + ': ' + v); }
    m.set(k, v);
  }

  let curSect = null;
  function parseRecord(rec) {
    if (!Array.isArray(rec)) {
      const { [rowSectColName]: section, ...details } = rec;
      curSect = section;
      dictMapAdd(dataBy.section, curSect, Object.assign([], { details }));
      return;
    }
    rec[rowSectProp] = curSect; // eslint-disable-line no-param-reassign
    const { verNumYear, verNumMonth, codenameAdj: cna } = rowToDict(rec);
    const rls = verNumYear + '.' + minDigits2(verNumMonth);
    dataBy.section.get(curSect).push(rls);
    dictMapAdd(dataBy.release, rls, rec);
    if (cna) { dictMapAdd(dataBy.codenameApt, lc(cna), rls); }
  }
  miniRecords.forEach(parseRecord);
}());

const verDb = {
  meta: miniMeta,
  dataBy,

  apt2rls(cn) { return (dataBy.codenameApt.get(cn) || false); },

  byRelease(rls) {
    if (!rls) { return false; }
    const miniRow = dataBy.release.get(rls);
    if (!miniRow) {
      const bad = (/[\sA-Za-z]+/.exec(rls) || false)[0];
      if (!bad) { return false; }
      throw new Error('Invalid fragment in release name: "' + bad + '"');
    }
    const entry = { release: rls, ...rowToDict(miniRow) };
    const cna = entry.codenameAdj;
    return {
      ...entry,
      codenameFull: [cna, entry.codenameNoun].join(' '),
      codenameApt: lc(cna),
    };
  },

  byVersion(year, month, patch) {
    if (typeof year === 'string') {
      const words = findWords(lc(year));
      if (words.length > 2) { return false; }
      const [version, support] = words;
      const verNums = version.split(/\./);
      if ((verNums[1] || false).length !== 2) { return false; }
      const entry = verDb.byVersion(...verNums.map(Number));
      if (truthyLowerUnequal(support, entry.extraSupport)) { return false; }
      return entry;
    }
    const verNumPatch = (+patch || 0);
    if (verNumPatch < 0) { return false; }
    const entry = verDb.byRelease(year + '.' + minDigits2(month));
    if (verNumPatch > entry.verNumMaxPatch) { return false; }
    return entry && { ...entry, verNumPatch };
  },

  byCodename(name) {
    if (!name) { return false; }
    const words = findWords(lc(name));
    if (words.length > 3) { return false; }
    const [cnAdj, cnNoun, support] = words;
    if (!cnAdj) { return false; }
    const rls = verDb.apt2rls(cnAdj);
    const entry = verDb.byRelease(rls);
    if (truthyLowerUnequal(cnNoun, entry.codenameNoun)) { return false; }
    if (truthyLowerUnequal(support, entry.extraSupport)) { return false; }
    return entry;
  },

  mustFind: (function compile() {
    function nope(mtd, args) {
      let by = String(mtd).replace(/^by\w/, r => r.slice(2).toLowerCase());
      if (by === 'version') { by += ' number'; }
      const e = new Error(`Cannot find Ubuntu version by ${by} ${
        args.map(JSON.stringify).join(', ')}.`);
      throw e;
    }
    return function makeMustFind(mtd) {
      const f = verDb[mtd];
      if (typeof f !== 'function') {
        throw new Error('Unsupported lookup method: ' + mtd);
      }
      function mustFind(...args) { return (f(...args) || nope(mtd, args)); }
      return mustFind;
    };
  }()),

};


export default verDb;
