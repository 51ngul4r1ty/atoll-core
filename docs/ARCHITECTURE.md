Overview
========

This document provides high level guidance on the application's architecture.

Restful API
===========

NOTE: If you're looking for information about using the API "framework"
  (i.e. code level details) then take a look at the
  [ARCHITECTURE_API.md](ARCHITECTURE_API.md) document.

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

CSS
===

After testing a number of different CSS approaches, "CSS Modules" was chosen for
the following reasons:
1. It worked well with the various tooling (TSDX, Webpack, Typescript, etc.)
2. It kept styling localized with the components (important for bundling and
   performance loading the app as it grows).
3. SSR support worked correctly (in particular "Styled Components" didn't work
   well when NextJS was used- the Atoll project started off by using NextJS but
   ran into other problems with it).

Potential Candidates
--------------------

The CSS styling framework/tooling candidates that were researched included:
1. Separate SASS files.
2. Styled Components.
3. CSS Modules.

Theming
=======

To support theming it was decided that a "home grown" solution would work
best.

1. The "home grown" approach worked reliably with the "atoll-shared" module
   approach.
2. It also worked well with CSS Modules.

Responsive Design
=================

To allow the app to be used on various devices the Atoll project leverages
global CSS classes that include:
1. "mobile" when a phone is detected.
2. "os-*" classes are used to customize the UI for the Electron desktop
   cient app.
