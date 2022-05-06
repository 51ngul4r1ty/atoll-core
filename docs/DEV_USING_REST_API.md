Overview
========

This document explains how to begin using the Atoll REST API.  There is an Atoll Client SDK that is the recommended approach if it
is available for the programming language you're using.  If you need to use the raw API then this document is for you.

Getting Started
===============

Atoll leverages HATEOAS to guide developers (and apps) through the API.  The first resource you'll encounter that exposes this
underlying architecture is the API index page: `/api/v1`, for example, locally this would be: `http://localhost:8500/api/v1`.

This endpoint uses content negotiation to figure out what the consuming client is expecting.  If the client requests HTML (which a
browser does by default) then it will render an HTML version of the index content- useful for reading purposes (i.e. developer
documentation).  If the client instead requests `application/json`, by providing an `Accept` header with this value, it will serve
up the content as a JSON object that's easily parsed by a consuming app- more useful for an app to discover resources dynamically.

It is recommended that your app discover resources using this index resource.  The resource endpoints can be looked up by using
the `id` value.  This approach will remain backward compatible through more significant updates to the API- you may need to change
the index page, for example, from `/api/v1` to `/api/v2` but that may the extent of the changes.  The Atoll project will try to
preserve the API compatibility through this index resource as much as possible.

Authentication
==============

Authentication can be done using the endpoint with ID `user-auth`.  At time of writing its relative endpoint was
`/api/v1/actions/login`.  All "actions" in the API are POST operations with the parameters supplied via a JSON object.  This
particular endpoint takes `{ username, password }` as the payload.

Atoll provides 2 tokens when a user is authenticated: `authToken` and `refreshToken`.  The first is a requirement for every request
and it is included via the `Authorization` header with a value `Bearer  {authToken}` (that's `Bearer` followed by 2 spaces and the
authToken value without braces).

The auth token value is only valid for a short time period, after which the refresh token can be used to a request a new one.  The
recommended approach is to handle auth failure as if it may happen on every request and automatically make a refresh token request
when that failure occurs.  Alternatively, you could try requesting the token on the specified interval.  The expiration is currently
5 minutes, but this may change in future- so this is not recommended.

To refresh the auth token simply use the ID `refresh-token` to get the endpoint URL and provide a `{ refreshToken }` payload.
