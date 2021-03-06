﻿
<!--#echo json="package.json" key="name" underline="=" -->
ubuntu-versions-table-pmb
=========================
<!--/#echo -->

<!--#echo json="package.json" key="description" -->
Static information about Ubuntu releases. Can find release by codename and
vice versa.
<!--/#echo -->


Limitations
-----------

* The database currently ignores:
  * Desktop-only versions.
  * Information about Extended Security Maintenance.
  * Dates



API
---

This module ESM-exports an object that holds these functions:

### .byCodename(name)
Look up details about an Ubuntu version by codename.

### .byVersion(ver)
Look up details about an Ubuntu version by version, given as a string.

### .byVersion(year, month[, patch])
Look up details about an Ubuntu version by version parts given as numbers.

### .byRelease(rls)
Look up details about an Ubuntu version by release name,
i.e. "year dot two-digit-month".

### .mustFind(mtd, ...args)
Delegate to the method whose name is given in string `mtd`,
passing arguments `...args`, throw an error if the result is false-y.

### Result data format for .by*()
see [test/usage.mjs](test/usage.mjs)

### .apt2rls(cn)
Efficient lookup the release name string by lowercase codename adjective
(`codenameApt`).




Usage
-----

see [test/usage.mjs](test/usage.mjs)


<!--#toc stop="scan" -->



Known issues
------------

* Needs more/better tests and docs.




&nbsp;


License
-------
<!--#echo json="package.json" key=".license" -->
ISC
<!--/#echo -->
