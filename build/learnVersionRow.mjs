// -*- coding: utf-8, tab-width: 2 -*-

import mustBe from 'typechecks-pmb/must-be.js';

import rowBasics from './parseCommonRowBasics.mjs';


const ignoreCells = [
  'docs', // links to release notes and/or changes
  'endOfLife', // date
  'endOfStandardSupport', // date
  'release', // date
  'schedule', // roadmap in "future" versions table
];


const sectionsWithoutInterestingNewDetails = [
  'extSec',
  'ubuntuProWithLegacySupportAddon',
];


const acceptableSectionProgression = [
  'future',
  'current',
  'extSec',
  'ubuntuProWithLegacySupportAddon',
];


const codeNameWordsRgx = Object.assign(/^(\w+) (\w+)(?: \((\w+)\)|)$/, {
  copyProps: ['codenameFull', 'codenameAdj', 'codenameNoun'],
});


function learn(verDb, cellsByColName) {
  const {
    mustPop,
    ubuVer,
    descrFacts: descr,
  } = rowBasics(verDb, cellsByColName);
  let audience;

  const section = mustPop.nest('section');
  const oldSect = ubuVer.getFact('section');
  if ((oldSect !== undefined) && (section !== oldSect)) {
    const oldStage = acceptableSectionProgression.indexOf(oldSect);
    const curStage = acceptableSectionProgression.indexOf(section);
    if ((oldStage >= 0) && (curStage > oldStage)) {
      ubuVer.forceUpdateFacts({ section });
    } else {
      const msg = ('Unexpected section progression: '
        + oldSect + '=' + oldStage + ' -> '
        + section + '=' + curStage);
      throw new Error(msg);
    }
  }


  const cnFacts = {};
  if (sectionsWithoutInterestingNewDetails.includes(section)) {
    const { extraSupport } = descr;
    if (extraSupport === 'ESM') {
      if (ubuVer.getFact('extraSupport') === 'LTS') {
        ubuVer.forceUpdateFacts({ extraSupport });
      }
    }
    return;
  }

  (function decodeCodeName() {
    const cnRaw = mustPop.nest('codeName');
    const words = codeNameWordsRgx.exec(cnRaw);
    mustBe.ary('Code name words regexp match', words);
    codeNameWordsRgx.copyProps.forEach(
      function copy(slot, idx) { cnFacts[slot] = words[idx]; });
    audience = (words[3] || '').toLowerCase();
  }());

  ubuVer.declareMaxNum('verNumMaxPatch', descr.verNumPatch);
  delete descr.verNumPatch;
  delete descr.verNumFull;
  if (descr.verNumYear <= 8) { delete cnFacts.codenameFull; }

  function audienceIgnoreDesktop() {
    // Very ancient Ubuntus had separate versions for desktop and server.
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
    ...descr,
    ...cnFacts,
    section,
  });
  mustPop.expectEmpty('Unsupported cells in table ' + section);
}


Object.assign(learn, {
  ignoreCells,
});


export default learn;
