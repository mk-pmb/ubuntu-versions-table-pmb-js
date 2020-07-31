// -*- coding: utf-8, tab-width: 2 -*-

import eq from 'equal-pmb';

import ubuntus from '..';

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

eq(ubuntus.byVersion('6.06'),       { ...dapper, verNumPatch: 0 });
eq(ubuntus.byVersion('6.06 LTS'),   { ...dapper, verNumPatch: 0 });
eq(ubuntus.byVersion('6.6'),        false);
eq(ubuntus.byVersion('6.006'),      false);
eq(ubuntus.byVersion('6.06 ESM'),   false);
eq(ubuntus.byVersion('6.06.2 LTS'), { ...dapper, verNumPatch: 2 });
eq(ubuntus.byVersion('6.06.2'),     { ...dapper, verNumPatch: 2 });
eq(ubuntus.byVersion('6.06.3'),     false);

eq(ubuntus.byCodename('focal').phase,   'current');
eq(ubuntus.byCodename('groovy').phase,  'future');

eq(ubuntus.apt2rls('warty'), '4.10');
eq(ubuntus.apt2rls('Warty'), false);












console.info('+OK usage test passed.');
