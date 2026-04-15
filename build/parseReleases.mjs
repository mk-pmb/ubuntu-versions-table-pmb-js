// -*- coding: utf-8, tab-width: 2 -*-

import 'usnam-pmb';

import getOwn from 'getown';
import mustBe from 'typechecks-pmb/must-be.js';
import prFs from 'nofs';
import sortedJson from 'sortedjson';
import toCamelCase from 'lodash.camelcase';
import vTry from 'vtry';

import compileMiniDb from './compileMiniDb.mjs';
import learnExtSecRow from './learnExtSecRow.mjs';
import learnVersionRow from './learnVersionRow.mjs';
import makeVersionsDb from './makeVersionsDb.mjs';


const sectAliases = {
  endOfLife: null,
  expandedSecurityMaintenance: 'extSec',
  extendedSecurityMaintenance: 'extSec',
  futureReleases: 'future',
  listOfCurrentReleases: 'current',
  ubuntuProWithLegacySupportAddOn: null,
};
const lookupSectAlias = mustBe.tProp('Section alias for section caption ',
  sectAliases, 'nul | nonEmpty str');


const rowParserBySect = {
  extSec: learnExtSecRow,
  ubuntuProWithLegacySupportAddOn: 'IGNORE',
};


const EX = async function cliMain() {
  const srcPath = (process.env.RELEASES_FILE || 'tmp.releases.jsonl');
  const srcLines = await EX.readFileLines(srcPath);
  EX.versionsDb = makeVersionsDb({
    updatedAtUnixtime: srcLines.lastModifiedUts,
  });
  srcLines.forEach(function learnLine(origLn) {
    const [lnType, ...lnData] = JSON.parse(origLn);
    if (!lnType) { return; }
    const lnHnd = getOwn(EX.lineParserByType, lnType);
    if (!lnHnd) { throw new Error('No lineParserByType.' + lnType); }
    lnHnd(lnData);
  });
  const meta = EX.versionsDb.meta.facts;
  meta.nVersions = Object.keys(EX.versionsDb.data).length;
  await prFs.writeFile('tmp.fullDb.json', sortedJson({
    meta,
    ...EX.versionsDb.data,
  }), 'UTF-8');
  const miniDb = compileMiniDb(EX.versionsDb);
  await prFs.writeFile('../miniDb.json', miniDb, 'UTF-8');
  console.info('+OK Done, ' + meta.nVersions + ' versions in DB.');
};


Object.assign(EX, {

  versionsDb: null,
  curSectKey: '',
  curSectLearnImpl: null,
  colNames: null,

  async readFileLines(path) {
    const lines = (await prFs.readFile(path, 'UTF-8')).split(
      '\n').filter(Boolean);
    const stat = await prFs.stat(path);
    lines.lastModifiedUts = Math.floor(stat.mtimeMs / 1e3);
    return lines;
  },

  lineParserByType: {

    sect(lnData) {
      const [title] = lnData;
      const ccTitle = toCamelCase(title);
      const sectKey = (lookupSectAlias(ccTitle) || ccTitle);
      EX.curSectKey = sectKey;
      EX.curSectLearnImpl = getOwn(rowParserBySect, sectKey, learnVersionRow);
      // console.debug('=====', sectKey, '=====');
    },

    head(lnData) {
      EX.colNames = lnData.map(toCamelCase);
    },

    vers(lnData) {
      const learnImpl = EX.curSectLearnImpl;
      if (learnImpl === 'IGNORE') { return; }
      const versRec = { section: EX.curSectKey };
      lnData.forEach(function found(origVal, colIdx) {
        const k = (EX.colNames[colIdx] || colIdx);
        if (learnImpl.ignoreCells.includes(k)) { return; }
        let v = origVal;
        v = v.trim();
        versRec[k] = v;
      });
      const rowJson = JSON.stringify(versRec, null, 2).replace(/\s+/g, ' ');
      vTry(learnImpl, 'Learn version row ' + rowJson)(EX.versionsDb, versRec);
    },

  },


});




EX();
