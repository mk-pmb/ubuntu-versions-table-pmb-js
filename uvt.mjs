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


function apt2rls(cn) { return (dataBy.codenameApt.get(cn) || false); }


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


function byRelease(rls) {
  if (!rls) { return false; }
  const miniRow = dataBy.release.get(rls);
  if (!miniRow) { return false; }
  const entry = { release: rls, ...rowToDict(miniRow) };
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
  const entry = byRelease(year + '.' + minDigits2(month));
  if (verNumPatch > entry.verNumMaxPatch) { return false; }
  return entry && { ...entry, verNumPatch };
}


function byCodename(name) {
  if (!name) { return false; }
  const words = findWords(lc(name));
  if (words.length > 3) { return false; }
  const [cnAdj, cnNoun, support] = words;
  if (!cnAdj) { return false; }
  const rls = apt2rls(cnAdj);
  const entry = byRelease(rls);
  if (truthyLowerUnequal(cnNoun, entry.codenameNoun)) { return false; }
  if (truthyLowerUnequal(support, entry.extraSupport)) { return false; }
  return entry;
}


const verDb = {
  meta: miniMeta,
  dataBy,
  apt2rls,
  byCodename,
  byRelease,
  byVersion,
};

export default verDb;
