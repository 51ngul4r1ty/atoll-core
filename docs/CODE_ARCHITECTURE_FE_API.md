Overview
========

This document explains the client-side API framework that's implemented in Atoll.

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
4. HATEOAS support in responses and client API call logic.

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

NOTE: In general it should be possible to rely on `item` and `items` data models remaining consistent across endpoints.  If extra
data needs to be returned for one endpoint it should be included in the `extra` part of the response.

Stages
======

The stages of the API call are Request, Success and Failure.  Technically, there are 2 stages: "In Progress" and "Complete" where
"Request" falls into the former and "Success" and "Failure" fall into the latter stage, but the code isn't in English. :-)

| Stage   | Description
|---------|--------------------------------------------------------------------------------------------------------------|
| Request | This allows the application to respond to the start of the "busy" state- for example, it can show a spinner. |
| Success | When the API call returns successfully the spinner can be hidden and the data shown in the UI.               |
| Failure | When an API call returns an error state the UI can respond appropriately, showing the error message etc.     |

The stage is present in the meta part of the action and is called `apiActionStage`.

Batch
=====

(todo)

Passthrough
===========

There are a few patterns in use and when similar functionality is needed you should try to stick to them.

API Call Reason
---------------

Normally API actions are dispatched with very specific needs in mind.  Most times the way the app responds to these API calls
follows exactly the same path and updates the state in the same way.  However, there are times when the exact same API call triggers
different logic.  The `apiCallReason` can help determine this for simple cases.  Each subsequent action that's triggered will carry
the original `apiCallReason` (using the standard "passthrough" pattern) so it can be used in any related logic.

An example where this is used: apiBacklogItems.ts has `PutBacklogItemCallReason` that allows the logic to determine the reason for
the call.  UPDATE_BACKLOG_ITEM and SAVE_CURRENT_BACKLOG_ITEM trigger the same API action but react in different ways when the
response is received.

Action Flows
------------

`apiCallReason` may not be sufficient for more complex cases.  For example, suppose we have the same action triggered multiple times
during an "action flow" but with new inputs provided by the previous actions?  Even the "batch" API approach described higher up
will not be sufficient for this.  For this purpose you should use action flows.

The way this works, each action in the action flow has a `triggerAction` and a `stepName` field in the meta passthrough object.
The trigger action will remain the same throughout the flow but the step name will change at each step so that the repeated actions
can be differentiated even if they have the same type repated multiple times in the flow.

An example where this is used: itemDetailMenuActionFlow.ts

HATEOAS
=======

Client API Call Actions
-----------------------

Typically a client will build a URL for a resource when it makes an API call.  When an API fully supports HATEOAS that shouldn't be
necessary- all the URLs should be provided to the client so it can use them instead of building URLs.  Atoll uses a hybrid approach
so not all logic uses HATEOAS but the project's long term goal is to move as much logic over to HATEOAS as possible.  To support
this the API action creators should provide an "options" argument that has an `endpointOverride` field.  This field can be used in
lieu of URL building logic.

An example of this can be found in the `ApiGetSprintOptions` type that is used by `apiGetSprint` in `apiSprints.ts`.


