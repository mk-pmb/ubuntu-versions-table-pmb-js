
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

### Result data format
see [test/usage.mjs](test/usage.mjs)




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
