The handler folders are for specific purposes:

* (root) - handlers that map directly to routes.  
  * deleters/fetchers/inserters/updaters - specialized data access "helpers" (simple logic)
  * helpers - general purpose helpers that offload the steps of more complex handlers (see _README.md in "helpers" folder for more
    info).
  * utils - general purpose utilities that don't fit into the "helpers" category (used by multiple handlers and don't perform
    specific data access operations).
  * views - handlers that use a BFF pattern (i.e. serve up specailized aggregate data for specific views)
  