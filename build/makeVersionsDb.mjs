// -*- coding: utf-8, tab-width: 2 -*-

import getOwn from 'getown';
import aMap from 'map-assoc-core';
import getOrAddKey from 'getoraddkey-simple';
import mustBe from 'typechecks-pmb/must-be';


const quot = JSON.stringify;


const factFuncs = {

  getFact(key, dflt) { return getOwn(this.facts, key, dflt); },

  forceUpdateFacts(upd) {
    mustBe('dictObj', 'New facts')(upd);
    return Object.assign(this.facts, upd);
  },

  declareFacts(upd) {
    mustBe('dictObj', 'New facts')(upd);
    const { facts } = this;
    mustBe('dictObj', 'Database record')(facts);
    aMap(upd, function learnOneFact(val, key) {
      if (val === undefined) { return; }
      const old = getOwn(facts, key);
      if (old === val) { return; }
      if (old !== undefined) {
        const err = ('Conflicting values for Ubuntu ' + facts.verNumBase
          + ': key=' + quot(key)
          + ', old=' + quot(old)
          + ', new=' + quot(val));
        throw new Error(err);
      }
      facts[key] = val;
    });
  },

  declareMaxNum(key, val) {
    if (!val) { return; }
    const { facts } = this;
    if (val > getOwn(facts, key, 0)) { facts[key] = val; }
  },

};


function makeVersionsDb(meta) {
  const data = {};

  function byVnBase(verNumBase) {
    const facts = getOrAddKey(data, verNumBase, [{ verNumBase }]);
    return { ...factFuncs, facts };
  }

  function versionSort(a, b) {
    const majDiff = (a.verNumMajor - b.verNumMajor);
    if (majDiff !== 0) { return majDiff; }
    return (a.verNumMinor - b.verNumMinor);
  }

  const db = {
    meta: { ...factFuncs, facts: meta },
    data,
    byVnBase,
    entriesSorted() { return Object.values(data).sort(versionSort); },
  };
  return db;
}


export default makeVersionsDb;
