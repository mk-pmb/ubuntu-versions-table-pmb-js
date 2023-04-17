// -*- coding: utf-8, tab-width: 2 -*-

import eq from 'equal-pmb';

import ubuntus from '../uvt.mjs';

const dapper = ubuntus.byCodename('dapper');
eq(dapper, {
  release: '6.06',
  verNumYear: 6,
  verNumMonth: 6,
  verNumMaxPatch: 2,
  codenameAdj: 'Dapper',
  codenameApt: 'dapper',
  codenameNoun: 'Drake',
  codenameFull: 'Dapper Drake',
  extraSupport: 'LTS',
  phase: 'endOfLife',
});
eq(ubuntus.byCodename('dApPeR dRaKe'),      dapper);
eq(ubuntus.byCodename('DappeR DrakE LtS'),  dapper);
eq(ubuntus.byCodename('DappeR DrakE ESM'),  false);
eq(ubuntus.byCodename('Dapper LTS'),        false);
eq(ubuntus.byCodename('drake'),             false);

const dapP0 = { ...dapper, verNumPatch: 0 };
eq(ubuntus.byVersion('6.06'),       dapP0);
eq(ubuntus.byVersion('6.06 LTS'),   dapP0);
eq(ubuntus.byVersion('6.6'),        false);
eq(ubuntus.byVersion('6.006'),      false);
eq(ubuntus.byVersion('6.06 ESM'),   false);

const dapP2 = { ...dapper, verNumPatch: 2 };
eq(ubuntus.byVersion('6.06.2 LTS'), dapP2);
eq(ubuntus.byVersion('6.06.2'),     dapP2);
eq(ubuntus.byVersion('6.06.3'),     false);

// Life cycle phase:
eq(ubuntus.byCodename('focal').phase,   'current');
eq(ubuntus.byCodename('groovy').phase,  'endOfLife');
eq(ubuntus.byCodename('lunar').phase,   'future');

// Release lookup shortcut:
eq(ubuntus.apt2rls('warty'), '4.10');
eq(ubuntus.apt2rls('Warty'), false);

// When you won't take "false" for an answer:
eq(ubuntus.mustFind('byCodename')('dapper'), dapper);
eq.err(() => ubuntus.mustFind('byCodename')('drake'),
  'Error: Cannot find Ubuntu version by codename "drake".');

eq(ubuntus.mustFind('byVersion')('6.06'), dapP0);
eq.err(() => ubuntus.mustFind('byVersion')('6.6'),
  'Error: Cannot find Ubuntu version by version number "6.6".');

eq(ubuntus.mustFind('byVersion')(6, 6), dapP0);
eq.err(() => ubuntus.mustFind('byVersion')(6, 6, 3),
  'Error: Cannot find Ubuntu version by version number 6, 6, 3.');

eq(ubuntus.mustFind('byRelease')('6.06'), dapper);
eq.err(() => ubuntus.mustFind('byRelease')('6.06 LTS'),
  'Error: Invalid fragment in release name: " LTS"');
eq.err(() => ubuntus.mustFind('byRelease')('6.04'),
  'Error: Cannot find Ubuntu version by release "6.04".');
eq.err(() => ubuntus.mustFind('byRelease')('6.04 LTS'),
  'Error: Invalid fragment in release name: " LTS"');

eq(ubuntus.mustFind('apt2rls')('warty'), '4.10');
eq.err(() => ubuntus.mustFind('apt2rls')('Warty'),
  'Error: Cannot find Ubuntu version by apt2rls "Warty".');












console.info('+OK usage test passed.');
