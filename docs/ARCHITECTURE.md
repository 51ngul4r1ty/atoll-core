Architecture
============

This document provides high level guidance on the application's architecture.

Restful API
===========

Atoll's API should follow a true RESTful API pattern, including the use of HATEOAS.

Use of HATEOAS
--------------

1. There's an index resource at the API root `/api/v1/` that provides links to all
   of the resources.
2. Each resource also responds to an OPTIONS request by providing the HTTP verbs
   that can be used for that resource using `Access-Control-Allow-Methods`
   (for example, "GET, OPTIONS" is returned for the index resource).
3. Items that have links to other resources return a `links` object that includes
   the following properties:
   - `type`: the resource format, for example, "application/json"
   - `rel`: the relationship, for example, "collection", "item", or "self"
   - `uri`: the URI to the resource itself

Rel Values
----------

1. `collection`: this link will return a collection of items
2. `item`: this link will return an individual item
3. `self`: the link to this resource, usually used within a collection when the
   item is simply providing a link to itself (collections return the full items)

Note: "self" should not be used when the current request URI to return this item
  returns that exact same URI.  It is only intended for the collection --> item
  navigation scenario where you request a collection and need to get the URI for
  an item within that collection.  It signifies that no further data will be
  returned by navigating using that link.  It is useful because an "OPTIONS" call
  to that URI may return other HTTP verbs that can be used on that resource,
  for example, "PUT", "DELETE" or "PATCH".
  