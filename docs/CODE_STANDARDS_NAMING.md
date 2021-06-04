Overview
========

This document contains only naming conventions, pleas refer to
[CODE_STANDARDS.md](CODE_STANDARDS.md) for more code standards.

General Naming
==============

Modified Case Naming
--------------------

Typically a combination of Pascal Case and Camel Case is used in
TypeScript projects.  Atoll uses modified versions of both.  In
the case where Pascal Case is normally used (for example, classes
and interface names) we allow successive capitalized letters, for
example, "HTML" instead of "Html".  An example of this is:
`HTMLInputElement` (from the browser "Web API").

Folder Naming
-------------

1. Folder names should use lowercase letters.
2. Folder names should use dashes to separate words.
3. Folder names should not use underscores to separate words.

Interface Type Naming
---------------------

1. Don't precede interface types with any prefix
   (for example, "I" for interface or "T" for type, as used in other code standards).
2. Use the prefix "Base" for an interface that is at the root of the type hierarchy but typically isn't used directly by objects.
3. Use the prefix "Standard" for an interface that is a lowest common denominator for objects that will extend it. 
4. Avoid deeply nested hierarchies and instead try to combine other interfaces
   (for example, StandardInvertibleComponentProps)
5. Don't use the "Standard" interfaces as replacements for component property types
   (for example, AppIconProps is an alias for StandardInvertibleComponentProps so that AppIcon has its own props type)  
   _NOTE: This is done so that consumers of AppIcon aren't aware of StandardInvertibleComponentProps so that they can
     evolve separately._
6. Preserve acronym case in interface names (to follow Web API standards, for example, HTMLInputElement).


Component Naming
================

Component Folder Naming
-----------------------

The components are organized using Atomic Design principles, so the following base folders should be used:
- "atoms" = basic building block components
- "molecules" = when smaller building blocks are combined they form molecules, for example, "backlog item card"
- "organisms" = defining sections of the applicaton, for example, "top menu panel", "backlog item planning panel"
- "templates"
- "pages"

NOTE: Do not assume that components belong in an upper level folder if they contain items at a lower level.  In a similar vein,
  do not assume something belongs at the lower level because it doesn't contain anything from that level.  Use the guidelines
  provided by Atomic Design itself.  It is best to think of this from the UI/UX designer's point of view instead of thinking
  technically how the components are composed.  A good example of this is used above: "backlog item card" is a "molecule" but, when
  this was written, it didn't use any "atoms" - but from a UI/UX perspective it does appear to have many smaller building blocks
  that could potentially be atoms.


Data Model Naming
=================

Entities
--------

**4 Types of Data Objects**

1. API Data Model (response) - the exact structure received from the Restful API (e.g. dates returned as ISO Date String).
2. API Data Model (request) - the exact structure sent to the Restful API (e.g. dates are automatically converted).
3. Redux State Model - the structure used for the application state.
4. Sequelize Data Model - the structure retrieved from the database.

| Model Type                | Name Format       | Example         |
|---------------------------|-------------------|-----------------|
| API Data Model (response) | Api{Entity}       | ApiSprint       |
| API Data Model (request)  | {Entity}Model     | SprintModel     |
| Reduxe State Model        | {Entity}          | Sprint          |
| Sequelize Data Model      | {Entity}DataModel | SprintDataModel |

**Why We Need All 4**

1. Most databases have something that can be a boolean, but it may not specifically be true/false.  So, in Atoll we map boolean to
   char(1) - "Y" or "N" values.
2. Redux state (i.e. application state) has specialized needs so it may contain additional fields or not need fields provided by
   either the API or the data model.
3. The API data model may return data types in a way that works best for a Restful API (for example ISO Dates) so they will need to
   be converted to their equivalent types when stored in the application state.
4. The API request gets automatically converted (e.g. date gets converted to a different type).

Technically, one could work with the API Model directly for the redux state but we favor the benefits of abstraction over a little
extra coding.

Table Naming
------------

Table names should use only lowercase letters. For example, `backlogitempart`.

Field Naming
------------

Field names are camelCased but one exception is for foreign keys.  In this case the full table name is used (all lowercase) followed
by "Id".  For example, `backlogitempartId`.


Redux Action Naming
===================

Overview
--------

The action naming falls into a number of categories detailed below:
* Constant naming
* Constant value format
* Flow-related naming

Constant Naming
---------------

* All uppercase, words separated by underscores, e.g. `INIT_APP`

Constant Value Naming
---------------------

Simple "global" actions: `app/{verb}`
Targeted actions: `app/{target}:{verb}`
API actions: `app/api:{call}:{stage}`

Flow-related Naming
-------------------

Actions fit into a number of categories:
* Simple global actions
* Targeted actions
* API actions
* Life-cycle

Life-cycle overrides all other naming, so it is defined first.

**Life-cycle**

UI action prefermed, API call is made, result is succesful, data needs to be retrieved,
UI needs to be updated.

* UI action is performed (button clicked etc.)
* API call naming is defined below and follows the specific API call life-cycle:
  1) Request
  2) Success / Failure
* Orchestration Middleware then processes the sucessful result and retrieves any other
  data that will be needed by reducers, for example if the backlog item ID was used for
  the operation it may be necessary to retrieve the full backlog item data before
  proceeding.
* UI then needs to be updated - the action will need to make it obvious that just a
  local state change results from this.

Example:
* MOVE_SPRINT_ITEM_TO_PRODUCT_BACKLOG_CLICK
* API_DELETE_SPRINT_BACKLOG_ITEM_REQUEST
* API_DELETE_SPRINT_BACKLOG_ITEM_SUCCESS
* ADD_PRODUCT_BACKLOG_ITEM
* REMOVE_SPRINT_BACKLOG_ITEM

**Simple Global Actions**

Example: `INIT_APP = "app/init"`

**Targeted Actions**

Example: `LOCAL_STORE_REFRESH_TOKEN = "app/local-store:refresh-token"`

* `local-store` is the "target" of the action
* `refresh-token` is the verb performed for the "target"

**API Actions**

Example: `API_GET_USER_PREFS_REQUEST: "app/api:get-user-prefs:request"`

* `api` is a prefixed "namespace" to differentiate these actions
* `get-user-prefs` is the API call descriptor
  - `get` is the HTTP verb and can be `get`, `post`, `put`,
    `patch`, or `delete`
  - `user-prefs` is the resource targeted
* `request` is the stage, other values for stage are:
  `success` and `failure`