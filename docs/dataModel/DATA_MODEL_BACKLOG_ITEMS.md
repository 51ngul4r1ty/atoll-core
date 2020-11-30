Backlog Items
=============

Statuses
--------

1. Not Started
2. In Progress
3. Completed

Sub-statuses
------------

Within each of the above statuses we have smaller "steps" that are defined below.  These
steps could actually be done in parallel and indepently and depend on a team's process and
maturity with CI/CD etc.  For example, someone performing manual testing could be doing it
using a branch that the developer has provided for code review before the code review is
complete.  To support this, these sub-statuses are treated as independent checks on a
checklist - once all have been completed the issue/story can "exit" its current status and
"enter" the next one.

**1. Not Started**  
1.1. Not Started - Idea  
1.2. Not Started - Defined

**2. In Progress**
2.1. In Progress - In Development
2.2. In Progress - Code Review
2.3. In Progress - Testing
2.4. In Progress - Acceptance

**3. Ready to Release**
3.1. Ready to Release

**4. Released**
4.1. Released

Feature Toggles and "Release" Status
------------------------------------

A story could be implemented behind a feature toggle.  The code itself could then be
released to production and toggled on later.  For the purpose of Atoll's data model this
toggled-on state is the true "Released" status.


Blocked "Status"
----------------

Unlike other statuses, "blocked" simply means that a work item has been paused because something is preventing it from being
worked on.  The workflow in and out of the blocked state can follow a few paths:

1. Not Started --> Blocked --> In Progress
2. Not Started --> Blocked --> Not Started
3. In Progress --> Blocked --> In Progress
