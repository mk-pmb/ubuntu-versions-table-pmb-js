// -*- coding: utf-8, tab-width: 2 -*-

import verDbApi from './verDbApi.mjs';
import factFuncs from './verDbFactFuncs.mjs';

function makeVersionsDb(meta) {
  const db = {
    ...verDbApi,
    meta: { ...factFuncs, facts: meta },
    data: {},
  };
  return db;
}

export default makeVersionsDb;
