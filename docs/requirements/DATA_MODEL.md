General
=======

* Handling version of all entities (preserve all old versions).
* Support undo and redo.

Versioning
----------

**Why**: to allow audit trail, tracking changes over time, etc.

**How**:
* Keep all versions of entity in each collection, have one item as the "current" entity and all others as "not current"
  ("current" field will be included on all tables and well as date & time stamp and a version number - 1, 2, 3, etc.)
* Each entity will have an "original id" along with "id" so that it is easy to retrieve the history of changes for a
  specific "original id"

Undo/Redo
---------

**Why**: so UI can support undo and redo, also support revert for entities (which is a type of undo that's more specific)

**How**:
* Using the "Versioning" approach above all we need to do in addition to this provide an "audit trail" collection that tracks
  all the changes - which entity, which version (ID), which previous version (ID), what operation type (add/remove/update), whether
  it was "done"/"undone" (undo/redo use).
* Undo will work as expected, redo will "replay" anything that was undone (i.e. it will need to use the "done"/"undone" flag in the
  "audit trail") and will only work if no other changes were "done" in the meantime.

Backlog Items
=============

All Types
---------

1. issue - in-sprint bug or production defect
2. story
3. tech - something that isn't a business requirement, could be tech debt but doesn't have to be
4. spike - special requirement is a time-box, outcome of spike may be a new story (link them?)
5. epic - big story that can/should be split
6. feature (rally)
7. initiative (rally)

Issues
------

1. In-sprint bug related to stories worked in that same sprint (or before a story has been approved for release).
2. Production defect found after release.

Planned vs Unplanned
--------------------

* Planned are added at start of sprint.
* Unplanned are added during sprint (tasks or stories can both be unplanned). 

Splitting vs Continuing a Story
-------------------------------

A story may not be completed in a sprint so it can be continued.  Also, if the team recognizes that a story can be done in multiple
parts then it can be split.  These are not the same thing and should be treated differently:
- any part of a story (i.e. a task) can be allocated to a sprint individually (2+ sprints containing same story)
- multiple stories can relate to an originating story (there's an inherent hierachy)

Tags
====

This is mainly intended for backlog items, but follow the a similar approach as github... except that atoll's tags will be "smarter"
and you will be able to limit tags to specific "targets" when they extend to other types besides beyond backlog items.

Ranking
=======

In order to support a very flexible ranking of items and the best possible SQL performance for queries, a ranking column,
named "displayIndex" is used (for example, the backlog is ranked this way).  This is different from the database's native
ranking for SQL queries because the number will always be unique (no ties).

The "displayIndex" column is a defined as `DECIMAL(18, 8)` because this is essentially an integer value with the ability
to insert values in between.  For example, if we insert displayIndex "1000" and then displayIndex "1001" we can insert an item
in between these two by assigning "1000.5".  To insert between "1000" and "1000.5" just use "1000.25" etc.  With 8 decimal
places it becomes easy to continue to insert items between other items without having to "renumber" other items.

The algorithm to re-order items is as follows:
1. If two items are swapped (for example, 932 and 1423) just update each item to use each others displayIndex.
2. If an item is inserted between item 1 and item 2 then assign a new displayIndex using
   `(item 1's displayIndex 1 + item 2's displayIndex) / 2.0`.
3. If an item is deleted don't re-assign displayIndex values, just leave the gap
   (for example, given a sequence like 104, 105, 106, 107, 108 and deleting displayIndex 106 will
    result in 104, 105, 107, 108)
4. If an item is inserted above the top item, displayIndex should be `first item's displayIndex - 1` even if the
   number is negative.
5. If an item is inserted below the bottom item, displayIndex should be `last item's displayIndex + 1`.
