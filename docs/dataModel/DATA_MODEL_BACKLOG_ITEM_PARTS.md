Backlog Item Parts
==================

See [DATA_MODEL_BACKLOG_ITEMS.md](./DATA_MODEL_BACKLOG_ITEMS.md) for story/issue definition.  This document defines how backlog items
are split.

Overview
--------

A Backlog Item will always have at least one Backlog Item Part.  The only way a Backlog Item can be allocated to a sprint is by
assigning a Part to the sprint, not the Backlog Item itself.

Product Backlog
---------------

The product backlog works with full backlog items- not split items.  If you split an item into 2 parts and allocate them both to
sprints, it will work as follows:

1. Backlog contains story A that has 2 parts: A1 and A2.  
  _story A will show that 2 of 2 parts are available in product backlog._
2. When A is allocated to Sprint 1, part A1 will be moved into that sprint (but story A will remain in the product backlog).  
  _story A will show that 1 of 2 parts are available in product backlog_
3. When B is allocated to Sprint 2, part A2 will move into that sprint and story A will be removed from the product backlog.

To avoid confusion with the state of story A in steps 2 & 3 the UI will show how many parts remain in the backlog.

Sprints
-------

Sprints may only have one split item in them at a time.  It will not be possible to move another part into the sprint when a part
is already allocated to the sprint.
