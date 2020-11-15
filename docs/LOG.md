Overview
========

This file contains miscellaneous bits of information that are historical in nature
and don't fit in any of the other docs.  This is intended as a place to put some
things that may be useful as reference but aren't essential information.

2020-05-01
----------

After upgrading to rollup@2.7.6 (from 1.x) this warning started being shown:

(!) A plugin is directly adding properties to the bundle object in the "generateBundle" hook. This is deprecated and will be
removed in a future Rollup version, please use "this.emitFile" instead.

Not sure which plugin is doing this but hopefully it will be updated before this capability is deprecated.
