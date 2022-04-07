Overview
========

This document explains the server-side API patterns used to implement the RESTful API.

Fetchers/Deleters/Inserters/Updaters
------------------------------------

These perform pretty typical CRUD operations and are provided so that it
is easy for the API endpoint handlers to get or update data as needed.

Aggregators
-----------

Fetchers are intended to perform pretty simple general-purpose data
retrieval.  Aggregators take data from one or more sources
(i.e. Fetchers) and combine it and transform it for specific needs.
The aggregators may often be used for BFF "APIs".
