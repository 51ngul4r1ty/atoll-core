General
=======

The API data model will be close to the database model, but the resource hierarchy is important- see below.

Naming
======

* Resource names should use dashes ("-") instead of underscores ("_").
* Resource names should be all lowercase.

Hierarchy
=========

* A parent-child relationship should be reflected in the URI path by nesting parent & child resources (example 1 below).
* API hierararchy should be two levels at most, if there is a parent-child and that child is a parent for another child then there
  would be 2 separate hierarchies (example 2 below).

Examples
--------

1. Parent-child example:
  - URIs for this:
    - sprints/{sprintId} = the sprint in isolation
    - backlog-items/{backlogItemId} = the backlog item in isolation
    - sprints/{sprintId}/backlog-items/{backlogItemId} = a backlog item in a sprint
  - In this model there are attributes that are specific to the parent-child resource that don't apply to the child in isolation.
    For example, the points that apply could be split between 2 sprints.
2. Parent-child + parent-child example:
  - URIs:
    - sprints/{sprintId}/backlog-items/{backlogItemId} - all of the backlog items within a sprint
    - backlog-items/{backlogItemId}/work-items/{workItemId} - all of the work items (think "tasks") for a backlog item
    - work-items/{workItemId} - there may be no need for this resource because work items only have meaning within a backlog item,
      so this may not actually existing in this case
