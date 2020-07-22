// -*- coding: utf-8, tab-width: 2 -*-

function learnDateCells(ubuVer, mustPop, cellNames, origOpt) {
  const dates = {};
  const opt = { ...origOpt };
  const keyAliases = (opt.keyAliases || false);
  cellNames.forEach(function learnOneDate(cn) {
    const tx = mustPop.nest(cn);
    dates[keyAliases[cn] || cn] = tx;
  });
  ubuVer.declareFacts(dates);
}

export default learnDateCells;
