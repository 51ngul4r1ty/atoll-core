Overview
========

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
==========

1. Root level API links:
  - `collection`: this link will return a collection of items
  - `item`: this link will return an individual item
2. Resource items:
  - `self`: the link to this resource, usually used within a collection when the
     item is simply providing a link to itself (collections return the full items)
3. Sibling references:
  - `next-item`: link to the next resource in a collection (based on current context)
  - `prev-item`: same as above for previous resource
4. Paging use:
  - `next-page`: link to the next page of resources in a collection (based on current
     context)
  - `prev-page`: same as above for previous page of resources
5. Action references:
  - `action:*` can be used to link to POST actions associated with this resource,
     for example, `action:join-unallocated-parts`
6. Other related resource references:
  - `related:*` can be used to link to resources associated with this resource,
     for example, `related:sprint/current`

Note: "self" should not be used when the current request URI to return this item
  returns that exact same URI.  It is only intended for the collection --> item
  navigation scenario where you request a collection and need to get the URI for
  an item within that collection.  It signifies that no further data will be
  returned by navigating using that link.  It is useful because an "OPTIONS" call
  to that URI may return other HTTP verbs that can be used on that resource,
  for example, "PUT", "DELETE" or "PATCH".
