// -*- coding: utf-8, tab-width: 2 -*-

import mustBe from 'typechecks-pmb/must-be';

import rowBasics from './parseCommonRowBasics';
import learnDateCells from './learnDateCells';

const ignoreCells = [
  'ofYears',
  'supportedPackages',
];

function learn(verDb, cellsByColName) {
  const { mustPop, ubuVer, descrFacts } = rowBasics(verDb, cellsByColName);
  mustPop.nest('section');
  mustBe('eeq:"ESM"', 'Support indicator')(descrFacts.extraSupport);
  learnDateCells(ubuVer, mustPop, [
    'startOfEsm',
    'endOfLife',
  ], {
    keyAliases: {
      startOfEsm: 'esmSince',
    },
  });
  mustPop.expectEmpty('Unsupported cells');
}

Object.assign(learn, {
  ignoreCells,
});


export default learn;
