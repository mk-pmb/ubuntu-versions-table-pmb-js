// -*- coding: utf-8, tab-width: 2 -*-

import verDbApi from './verDbApi';
import factFuncs from './verDbFactFuncs';

function makeVersionsDb(meta) {
  const db = {
    ...verDbApi,
    meta: { ...factFuncs, facts: meta },
    data: {},
  };
  return db;
}

export default makeVersionsDb;
