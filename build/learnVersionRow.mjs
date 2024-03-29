// -*- coding: utf-8, tab-width: 2 -*-

import mustBe from 'typechecks-pmb/must-be';

import rowBasics from './parseCommonRowBasics.mjs';


const ignoreCells = [
  'docs', // links to release notes and/or changes
  'release', // date
  'endOfStandardSupport', // date
  'endOfLife', // date
];

const codenamePartKeys = [
  'codenameAdj',
  'codenameNoun',
];


function learn(verDb, cellsByColName) {
  const {
    mustPop,
    ubuVer,
    descrFacts: descr,
  } = rowBasics(verDb, cellsByColName);
  let audience;

  const section = mustPop.nest('section');
  const oldSect = ubuVer.getFact('section');
  if ((section === 'future') && (oldSect === 'current')) {
    // The upcoming next version
    ubuVer.forceUpdateFacts({ section });
  }

  const cnFull = mustPop.nest('codeName').replace(/ \((\w+)\)$/, (m, a) => {
    audience = (m && a).toLowerCase();
    return '';
  });
  const cnNotDecidedYet = ((cnFull.length === 2)
    && (cnFull.slice(0, 1) === cnFull.slice(1)));
  const cnParts = (cnNotDecidedYet
    ? ['', '']
    : mustBe('ofLength:2', 'Code name words')(cnFull.split(/\s+/)));
  const cnFacts = {};
  codenamePartKeys.forEach((key, idx) => { cnFacts[key] = cnParts[idx]; });

  ubuVer.declareMaxNum('verNumMaxPatch', descr.verNumPatch);
  delete descr.verNumPatch;
  delete descr.verNumFull;

  function audienceIgnoreDesktop() {
    if (!audience) { return; }
    if (audience === 'desktop') {
      mustBe.oneOf([
        '',
      ], 'Desktop edition extra support')(descr.extraSupport);
      return true;
    }
    if (audience === 'server') {
      mustBe.oneOf([
        'LTS',
      ], 'Server edition extra support')(descr.extraSupport);
      return false;
    }
    throw new Error('Unsupported audience: ' + audience);
  }
  if (audienceIgnoreDesktop()) { return; }

  ubuVer.declareFacts({
    codenameFull: cnFull,
    ...descr,
    ...cnFacts,
    section,
  });
  mustPop.expectEmpty('Unsupported cells');
}

Object.assign(learn, {
  ignoreCells,
});


export default learn;
