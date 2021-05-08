General
=======

* Handling version of all entities (preserve all old versions).
* Support undo and redo.

Versioning
----------

NOTE: This has not yet been implemented and an alternative approach may be taken when it is.

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

See [ISSUES.md](ISSUES.md) for detailed information.


Planned vs Unplanned
--------------------

* Planned are added at start of sprint.
* Unplanned are added during sprint (tasks or stories can both be unplanned). 

Splitting vs Continuing a Story
-------------------------------

Although both of these are referred to as splitting a story a distinction needs to be made regarding the reason for the split.

It is possible that a story is not be completed in a sprint.  In that case it will need to span multiple sprints so that it can be
continued.  Also, if the team recognizes that a story can be done in multiple parts then it can be split.  These are not the same
thing and should be treated differently:
- any part of a story (i.e. a task) can be allocated to a sprint individually (2+ sprints containing same story)
- multiple stories can relate to an originating story (there's an inherent hierachy)

For example,
* We have 2 stories: "s-1" and "s-2".
* "s-1" is a story that is "continued".
  - "s-1" stays as one story, but "s-1" is linked to both "sprint 1" where it is started and "sprint 2" where it is continued.
  - "s-1" has original estimate of 20.
  - In "sprint 1" the team feels that they accomplished 60% of the work, so that means 12 points were used up in "sprint 1".
  - In "sprint 2" 8 points remain (calculated as: 20 - 12 = 8).  
    _This is just a guess on the team's part and it may be wrong, but this is merely used for planning purposes so it doesn't
     matter- we need to make sure that the team doesn't over or under plan "sprint 2"._
  - Let's say the team still got it completely wrong and the story carries over to "sprint 3",
    and they decide that the story now has 75% work remaining, meaning 15 points.  The math
    may not seem to add up, but the point is that we stick to the original estimate for the
    story and never change that (so we can account for bad estimates and they'll average out
    when forecasting future deliverables).  So, now we have:
    - "s-1" in "sprint 1" = 8 of 20 points remaining (12 completed).
    - "s-1" in "sprint 2" = 15 of 20 points remaining (backtracked 7 points).
    - "s-3" in "sprint 3" = 0 of 20 points remaining (all 15 remaining completed).
* "s-2" is a story that is divided up to work on the individual parts.
  - The stories will be allocated new numbers "s-3", "s-4", "s-5" etc.
  - The user is given 2 options when doing this:
    1. Remove the original story to avoid confusion because none of the individual
       stories represent the full work defined in the original.
    2. Convert the original story to an epic and it will then contain the stories as
       its children.  This isn't typically how it should be done: epics should be planned
       first (intentionally) and they should be broken down into stories after that.
  - The new stories should total up to the same points (but don't have to).
  - When a UI is provided for this it will assist the user in re-allocating the work into
    multiple stories.

Tags
====

This is mainly intended for backlog items, but follow the a similar approach as github... except that atoll's tags will be "smarter"
and you will be able to limit tags to specific "targets" when they extend to other types besides beyond backlog items.

Ranking
=======

In order to support a very flexible ranking of items a "pointer" approach was used.  This isn't typical for SQL databases and it is
quite challenging to work with.  Essentially, each table that supports this has a "next" entry that points to the item that follows
it in the sequence.

Main Benefits
-------------

1. When changing ranking of a single item at most 3 rows need to be updated:  
1.1. Old item before it will need to point to the old item after it.
1.2. New item before it will need to point to it.
1.3. Item itself will need to point to the new item after it.

2. Performance for massive scale is better.

Challenges
----------

1. If the logic is implemented incorrectly it is possible to end up with an endless loop in the structure.
2. Manual updates are harder.
3. Manual query to retrieve rows is hard to write.

Project Hierarchy
=================

Organization Teams
------------------

* Organizations have their own hierarchies of teams, but at the foundation is an individual team.
* Team members fall into 2 categories:
  - shared members (can be in more than one team, for example, a PO or a SM may be shared across teams)
  - dedicated members (semi-permanent because people may move around in an organization, leave, or join)

Work Items
----------

* Issues or stories are managed in backlogs.
* These items can only be in one backlog at a time.

Backlogs
--------

* Team Backlog: owned by the specific scrum team.
* Release Train Backlog: a level above a team backlog.  NOTE: Atoll must allow customization of the level names, but allow as many
  as an organization needs.

Projects & Domains
------------------

* Projects are the high level "bucket" representing an application (typically) and the "Friendly IDs" within a project are unique.
* A Domain is an area of an application owned by a team.

Users & Preferences
===================

The information for a user and the credentials records will be kept separate.

User
----

A user account is intended for logging into the system.

Preferences
-----------

There are 4 levels of preferences:
- System defaults
- Organization defaults
- User settings
- Device overrides (phone vs desktop app vs web app)
- Instance overrides (electron client, web app, etc.)

Anything can be overridden at whatever level the user desires- the system will respect the override.  At any time the setting
override can be cleared at that level without reverting other overrides at that same level.

Audit Trail
-----------

For security reasons authentication requests will be tracked for each user and active times will also be tracked (i.e. as each
network request is serviced for a user's auth tokens).

Activity
--------

Web sockets poll frequently (at least once a minute) and they can be used to track active times (although a user can leave their
browser open without being active so we will also need to add mouse movement tracking to ensure truly active time is measured).
