// -*- coding: utf-8, tab-width: 2 -*-

import getOrAddKey from 'getoraddkey-simple';

import factFuncs from './verDbFactFuncs.mjs';


function versionSort(a, b) {
  const majDiff = (a.verNumYear - b.verNumYear);
  if (majDiff !== 0) { return majDiff; }
  return (a.verNumMonth - b.verNumMonth);
}


const verDbApi = {

  byVnBase(verNumBase) {
    const facts = getOrAddKey(this.data, verNumBase, [{ verNumBase }]);
    return { ...factFuncs, facts };
  },

  entriesSorted() { return Object.values(this.data).sort(versionSort); },

  entriesBySections() {
    const sects = [];
    const sectByName = {};
    this.entriesSorted().forEach(function add(ver) {
      const { section } = ver;
      const knownSect = sectByName[section];
      if (knownSect) {
        knownSect.items.push(ver);
        return;
      }
      const addSect = { name: section, items: [ver] };
      sects.push(addSect);
      sectByName[section] = addSect;
    });
    return sects;
  },

};

export default verDbApi;
