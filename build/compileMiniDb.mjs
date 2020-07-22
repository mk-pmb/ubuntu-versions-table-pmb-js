// -*- coding: utf-8, tab-width: 2 -*-

import sortedJson from 'sortedjson';
import lPad from 'lodash.padstart';
import rPad from 'lodash.padend';

function oneLineJson(x) { return sortedJson(x).replace(/\n\s*/g, ' '); }

const jsonify = JSON.stringify;

function padJson(x, w) {
  const j = oneLineJson(x);
  return (w > 0 ? rPad(j, w) : lPad(j, -w));
}


function compileMiniDb(verDb) {
  const metaFacts = verDb.meta.facts;
  const entries = [
    sortedJson(metaFacts).replace(/\n/g, '\n  ').replace(/\s+\}$/, ' }'),
  ];

  function foundVersion(ubuVer) {
    const fields = [
      padJson(ubuVer.verNumMajor, -2),
      jsonify(lPad(ubuVer.verNumMinor, 2, '0')),
      padJson(ubuVer.verNumMaxPatch || 0, -2),
      padJson(ubuVer.extraSupport || '', 5),
      padJson(ubuVer.codenameAdj, 10),
      jsonify(ubuVer.codenameNoun),
    ];
    const entry = ('[' + fields.join(', ') + ']');
    entries.push(entry);
  }
  function foundSection(sect) {
    entries.push(oneLineJson({ section: sect.name }));
    sect.items.forEach(foundVersion);
  }
  verDb.entriesBySections().forEach(foundSection);

  // [ { "updatedAtUnixtime": "stat.mtime" }
  // , { "section": "current" }
  // , [20, "04", 0, "LTS", "focal", "fossa"]
  // ]
  const dbText = ('[' + entries.join('\n,') + '\n]\n');
  console.log(dbText);
  return dbText;
}


export default compileMiniDb;
