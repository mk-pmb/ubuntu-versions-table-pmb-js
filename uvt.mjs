// -*- coding: utf-8, tab-width: 2 -*-

import miniData from './miniDb.json';

const [miniMeta, miniColNames, ...miniRecords] = miniData;

const rowSectColName = 'phase';
const rowSectProp = 's';

const dataBy = {
  codenameApt: new Map(),
  section: new Map(),
  verNumBase: new Map(),
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
    const vnb = verNumYear + '.' + minDigits2(verNumMonth);
    dataBy.section.get(curSect).push(vnb);
    dictMapAdd(dataBy.verNumBase, vnb, rec);
    if (cna) { dictMapAdd(dataBy.codenameApt, lc(cna), vnb); }
  }
  miniRecords.forEach(parseRecord);
}());


function byVerNumBase(verNumBase) {
  if (!verNumBase) { return false; }
  const miniRow = dataBy.verNumBase.get(verNumBase);
  if (!miniRow) { return false; }
  const entry = { verNumBase, ...rowToDict(miniRow) };
  const cna = entry.codenameAdj;
  return {
    ...entry,
    codenameFull: [cna, entry.codenameNoun].join(' '),
    codenameApt: lc(cna),
  };
}


function byVersion(year, month, patch) {
  if (typeof year === 'string') {
    const words = findWords(lc(year));
    if (words.length > 2) { return false; }
    const [version, support] = words;
    const verNums = version.split(/\./);
    if ((verNums[1] || false).length !== 2) { return false; }
    const entry = byVersion(...verNums.map(Number));
    if (truthyLowerUnequal(support, entry.extraSupport)) { return false; }
    return entry;
  }
  const verNumPatch = (+patch || 0);
  if (verNumPatch < 0) { return false; }
  const entry = byVerNumBase(year + '.' + minDigits2(month));
  if (verNumPatch > entry.verNumMaxPatch) { return false; }
  return entry && { ...entry, verNumPatch };
}


function byCodename(name) {
  if (!name) { return false; }
  const words = findWords(lc(name));
  if (words.length > 3) { return false; }
  const [cnAdj, cnNoun, support] = words;
  if (!cnAdj) { return false; }
  const vnb = dataBy.codenameApt.get(cnAdj);
  const entry = byVerNumBase(vnb);
  if (truthyLowerUnequal(cnNoun, entry.codenameNoun)) { return false; }
  if (truthyLowerUnequal(support, entry.extraSupport)) { return false; }
  return entry;
}


const verDb = {
  meta: miniMeta,
  dataBy,
  byCodename,
  byVerNumBase,
  byVersion,
};

export default verDb;
