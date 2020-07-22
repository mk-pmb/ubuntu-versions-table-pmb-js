// -*- coding: utf-8, tab-width: 2 -*-

import equal from 'equal-pmb';

import ubuntus from '..';

const dapper = ubuntus.byCodename('dapper');
equal(dapper, {
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
equal(ubuntus.byCodename('dApPeR dRaKe'),       dapper);
equal(ubuntus.byCodename('DappeR DrakE LtS'),   dapper);
equal(ubuntus.byCodename('DappeR DrakE ESM'),   false);
equal(ubuntus.byCodename('Dapper LTS'),         false);
equal(ubuntus.byCodename('drake'),              false);

equal(ubuntus.byVersion('6.06'),        { ...dapper, verNumPatch: 0 });
equal(ubuntus.byVersion('6.06 LTS'),    { ...dapper, verNumPatch: 0 });
equal(ubuntus.byVersion('6.6'),         false);
equal(ubuntus.byVersion('6.006'),       false);
equal(ubuntus.byVersion('6.06 ESM'),    false);
equal(ubuntus.byVersion('6.06.2 LTS'),  { ...dapper, verNumPatch: 2 });
equal(ubuntus.byVersion('6.06.2'),      { ...dapper, verNumPatch: 2 });
equal(ubuntus.byVersion('6.06.3'),      false);

equal(ubuntus.byCodename('focal').phase,    'current');
equal(ubuntus.byCodename('groovy').phase,   'future');

equal(ubuntus.apt2rls('warty'), '4.10');
equal(ubuntus.apt2rls('Warty'), false);












console.info('+OK usage test passed.');
