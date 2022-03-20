Code Review Guidance
====================

This document will contain tips and guidance for reviewing code submitted for any of the
Atoll repos.

General
-------

1. Look for anything that seems out of place.
2. Look for console.log messages (logger util can use them but elsewhere they should
   be avoided).
3. Look for debugger statements.
4. Look for a header comment that explains the purpose of the file- all new files should have this and ideally any modified
   files should have one added.

Database Code
-------------

1. Make sure that the `transcation` instance is always passed in so that sequelize
   doesn't execute anything outside the current transaction.
2. Make sure that commit and rollback code occurs in the right places.
3. Make sure aborted/rollback state is checked when transactions are used.
