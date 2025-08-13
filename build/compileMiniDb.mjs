// -*- coding: utf-8, tab-width: 2 -*-

import sortedJson from 'sortedjson';
import lPad from 'lodash.padstart';
import rPad from 'lodash.padend';

function oneLineJson(x) { return sortedJson(x).replace(/\n\s*/g, ' '); }

function padJson(x, w) {
  const j = oneLineJson(x);
  return (w > 0 ? rPad(j, w) : lPad(j, -w || 0));
}

const fieldDefs = [
  { name: 'verNumYear',       width: -2 },
  { name: 'verNumMonth',      width: -2 },
  { name: 'verNumMaxPatch',   width: -2,  or: 0 },
  { name: 'extraSupport',     width:  5 },
  { name: 'codenameAdj',      width: 10 },
  { name: 'codenameNoun' },
];


function renderField(fDef) {
  let val = this[fDef.name];
  if (fDef.or !== undefined) { val = (val || fDef.or); }
  return padJson(val, fDef.width);
}


function compileMiniDb(verDb) {
  const entries = [
    JSON.stringify(verDb.meta.facts, null, 2).replace(/\n\s*/g, ' '),
    oneLineJson(fieldDefs.map(f => f.name)),
  ];

  function foundVersion(ubuVer) {
    const fields = fieldDefs.map(renderField.bind(ubuVer));
    const entry = ('[' + fields.join(', ') + ']');
    entries.push(entry);
  }
  function foundSection(sect) {
    entries.push(oneLineJson({ phase: sect.name }));
    sect.items.forEach(foundVersion);
  }
  verDb.entriesBySections().forEach(foundSection);

  const dbText = ('[' + entries.join('\n,') + '\n]\n');
  // console.log(dbText);
  return dbText;
}


export default compileMiniDb;
