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

Stages
======

(todo)

Batch
=====

(todo)

Passthrough
===========

(todo)

