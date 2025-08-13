// -*- coding: utf-8, tab-width: 2 -*-

import mustBe from 'typechecks-pmb/must-be.js';
import objPop from 'objpop';


const verifyProduct = mustBe.oneOf(['Ubuntu'], 'product name');
const verifySupportIndicator = mustBe.oneOf([
  undefined,
  'LTS',
  'ESM',
], 'support indicator');


function parseDescr(descr) {
  const [product, verNumFull, edition] = mustBe('maxLength:3',
    'description words')(descr.split(/ /));
  verifyProduct(product);
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
  const descrFacts = parseDescr(mustPop.nest('descr'));
  const ubuVer = verDb.byVnBase(descrFacts.verNumBase);
  return { mustPop, ubuVer, descrFacts };
}


export default commonRowBasics;
