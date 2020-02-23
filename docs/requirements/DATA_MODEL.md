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
