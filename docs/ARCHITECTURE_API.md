Overview
========

This document explains the API framework that's implemented in Atoll.

Files
-----

There are a few important files that encompass the API "framework":
1. `apiMiddleware.ts`
2. `apiOrchestrationMiddleware.ts`
3. `apiBatchMiddleware.ts`

Capabilities
------------

1. Support for stages of the API calling lifecycle:
  - `request`
  - `success`
  - `failure`
2. Queuing a batch of API calls that need to execute in sequence
3. "Passthrough" functionality to ensure that meta information
   is passed on from one action to another.

Payload Schema
==============

Responses
---------

The payload schema includes a few standard parts:
1. `status` - same value as typical HTTP Status (for example, 200, 404, 500)
2. `data` - excluded for error scenarios
3. `message` - excluded for successful scenarios

**Status**

Status is provided so that a caller can suppress error handling that interferes with the app.  Some frameworks throw errors when an
API call returns 400+ or 500+ statuses.  In those cases the code can suppress the typical HTTP Status and rely purely on the
`status` value that's returned in the payload.

**Data**

The `data` node contains everything that's considered data to the client.  This node can contain `item`, `items` and/or `extra`.

`item` is used when an endpoint always returns a single item.

`items` is used for endpoints that return collections.  If an endpoint can return a single item or multiple items then `items`
should always be used instead of `item`.

`extra` is optional and is provided when data from other entities may be useful to the caller.  
For example, a POST to the "sprint backlog items" endpoint returns the added sprint backlog item as `item`, while `sprintStats`, `backlogItemPart` and `backlogItem` are returned as part of `extra`.

Stages
======

(todo)

Batch
=====

(todo)

Passthrough
===========

(todo)

