// -*- coding: utf-8, tab-width: 2 -*-

import mustBe from 'typechecks-pmb/must-be.js';
import objPop from 'objpop';


const verifySupportIndicator = mustBe.oneOf([
  undefined,
  'LTS',
  'ESM',
], 'support indicator');


function parseVersionTitle(title) {
  const [verNumFull, edition] = mustBe('maxLength:2',
    'Version title words')(title.split(/ /));
  const vnPt = mustBe('maxLength:3',
    'version number parts')(verNumFull.split(/\./));
  const verNumYear = mustBe('pos int', 'major version (year)')(+vnPt[0]);
  const verNumMonth = +mustBe.oneOf([
    (verNumYear === 6 ? '06' : '04'),
    '10',
  ], 'minor version (month)')(vnPt[1]);
  const facts = {
    verNumFull,
    verNumBase: vnPt.slice(0, 2).join('.'),
    verNumYear,
    verNumMonth,
    verNumPatch: mustBe('pos0 int', 'patch version')(+(vnPt[2] || 0)),
    extraSupport: (verifySupportIndicator(edition) || ''),
  };
  return facts;
}


function commonRowBasics(verDb, cellsByColName) {
  const mustPop = objPop.d(cellsByColName, { mustBe }).mustBe;
  mustPop.nest = mustPop.bind(null, 'nonEmpty str');
  const titleFacts = parseVersionTitle(mustPop.nest('version'));
  const ubuVer = verDb.byVnBase(titleFacts.verNumBase);
  return { mustPop, ubuVer, titleFacts };
}


export default commonRowBasics;
