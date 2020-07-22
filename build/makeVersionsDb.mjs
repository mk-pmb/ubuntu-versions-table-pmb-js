// -*- coding: utf-8, tab-width: 2 -*-

import getOwn from 'getown';
import aMap from 'map-assoc-core';
import getOrAddKey from 'getoraddkey-simple';
import mustBe from 'typechecks-pmb/must-be';


const quot = JSON.stringify;


const versionApi = {

  getFact(key, dflt) { return getOwn(this.entry, key, dflt); },

  forceUpdateFacts(facts) {
    mustBe('dictObj', 'New facts')(facts);
    return Object.assign(this.entry, facts);
  },

  declareFacts(facts) {
    mustBe('dictObj', 'New facts')(facts);
    const { entry } = this;
    mustBe('dictObj', 'Database record')(entry);
    aMap(facts, function learnOneFact(val, key) {
      if (val === undefined) { return; }
      const old = getOwn(entry, key);
      if (old === val) { return; }
      if (old !== undefined) {
        const err = ('Conflicting values for Ubuntu ' + entry.verNumBase
          + ': key=' + quot(key)
          + ', old=' + quot(old)
          + ', new=' + quot(val));
        throw new Error(err);
      }
      entry[key] = val;
    });
  },

};


function makeVersionsDb() {
  const data = {};

  function byVnBase(verNumBase) {
    const entry = getOrAddKey(data, verNumBase, [{ verNumBase }]);
    return { ...versionApi, entry };
  }

  const db = {
    data,
    byVnBase,
  };
  return db;
}


export default makeVersionsDb;
