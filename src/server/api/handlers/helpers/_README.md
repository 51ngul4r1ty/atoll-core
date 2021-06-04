The purpose of the "helpers" in this folder are to assist the root level handlers directly.  The intention of these files is to
ensure that steps performed in the handlers can be more easily understood.  These step functions are fined-grained operations.

Also, there are specialized helper folders that specifically target data access that's more closely related to the handlers.  These
folders are "deleters", "fetchers", "inserters" and "updaters".

The naming of these helpers relates closely to the handler they "help".  The handler for "someHandler.ts" will be called
"someHandlerHelper.ts".

Don't put general utility functions in files in this folder- that's what the "utils" folder is for.
