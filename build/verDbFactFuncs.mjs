// -*- coding: utf-8, tab-width: 2 -*-

import getOwn from 'getown';
import aMap from 'map-assoc-core';
import mustBe from 'typechecks-pmb/must-be';

const quot = JSON.stringify;


const verDbFactFuncs = {

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

export default verDbFactFuncs;
