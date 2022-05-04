Overview
========

This document provides high level guidance on the application's architecture.  This is the more
typical high-level architecture information and doesn't go into the code level details that implement
the described architecture.  For code-level guidance see [CODE_ARCHITECTURE.md](CODE_ARCHITECTURE.md)

Restful API
===========

Atoll's API should follow a true RESTful API pattern, including the use of HATEOAS.

Endpoints
---------

1. The API base path is `/api`.
2. The version is also included in the path `/api/v{n}` (starting with `v1`).  
   _This was done to ensure that logging that includes a URL makes it very obvious what version
   was used by a client (for example).  A modern choice involving the use of headers may support
   other use-cases but there's no need for those in Atoll at this time._
3. Base-level collection resources fall into 3 categories:  
   i) Actions that are more RPC style (these should be the exception- there are none at time of
     writing) will be named like this `/api/v1/actions/do-something`  
   ii) Resources are named as plural nouns separated by dashes if multiple words are involved,
     for example, `/api/v1/work-items`  
   iii) BFF endpoints are named with a `bff` base path, for example, `/api/v1/bff/views/plan`
4. Item level endpoints are available for the collections, for example, `/api/v1/sprints/{id}`.  
   _These endpoints differ from the collection endpoints by returning more detail than the
   collection resource itself- logic that may be too expensive to perform when retrieving
   the full list of items._
5. Sometimes IDs have "magic values" instead of a specific unique identifier.  These magic
   values are differentiated by the used of `--` as prefix and suffix.  
   For example, `/api/v1/projects/{id}/sprints/--curr--`
   and `/api/v1/projects/{id}/sprints/--next--`

Endpoint ID Magic Values
------------------------

As mentioned in the "Endpoints" section above, the full list will be maintained here:
1. Current item is referenced by `--curr--`
2. Next item is referenced by `--next--`
3. Previous item is referenced by `--prev--`

Use of HATEOAS
--------------

The API reponses include links and there's an index resource (`/api/v1/`) that provides named
links so that a consuming app (or developer) can discover resource links dynamically.

For more information see [ARCHITECTURE_HATEOAS.md](ARCHITECTURE_HATEOAS.md).

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
