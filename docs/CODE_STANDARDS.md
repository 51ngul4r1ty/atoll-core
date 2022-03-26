Overview
========

This document contains everything except:
1) naming conventions, please refer to [CODE_STANDARDS_NAMING.md](CODE_STANDARDS_NAMING.md) for these details.
2) test code standards, please refer to [CODE_STANDARDS_TESTS.md](CODE_STANDARDS_TESTS.md) for these details.
3) specialized patterns, please refer to [CODE_STANDARDS_PATTERNS.md](CODE_STANDARDS_PATTERNS.md) for these details.

File Purpose Comments
=====================

Unless it is very obvious what the file's responsibility it is, this should be very clearly defined at the top using this comment block:

```
/**
 * Purpose: {defined purpose that makes it obvious what this file's
     singular responsibility is (think of the "S" in "SOLID"
     principles)}
 * Reason to change: {this should help make it clear whether the
     Single Responsibility Principle is being followed or not}
 */
```

For example, at the top of apiOrchestrationMiddleware.ts:
```
/**
 * Purpose: To determine when to make RESTful API calls based on actions that occur.
 * Reason to change: When new RESTful API calls are needed.
 */
```

Reducers
========

Types related to the data structure that the reducer stores in the state tree should be exported from the reducer itself.

Middleware
==========

Middleware should have `next(action);` as the first line to ensure that state is updated frist.

Components
==========

Prefer React.FC components over the legacy style components.  Atoll started before functional components were widely used, so there
may still be some code that does not use FC, but don't be tempted to use these as templates for new components- rewrite using FC
instead.

Use `React.FC<ComponentNameProps>` as the default component definition where `ComponentName` will be your actual component name,
e.g. `MyButton`.

`ComponentNameProps` should be split into 2 interfaces:
- `ComponentNameStateProps` and `ComponentNameDispatchProps`

`ComponentNameStateProps` will contain the typical properties.
`ComponentNameDispatchProps` will contain event handler related properties.

To combine the these two interfaces use:
`type ComponentNameProps = ComponentNameStateProps & ComponentNameDispatchProps`

`ComponentNameStateProps` can be used for `mapStateToProps`
`ComponentNameDispatchProps` can be used for `mapDispatchToProps`

Button Components
-----------------

A base component called SimpleButton should be used when deriving specialized buttons.  There's a `cleanPassthroughProps` function
that should be used for passing properties from the specialized button to the contained SimpleButton instance.

Switch Statements
=================

Case statements should always be enclosed in curly braces so that block scope is applied and variables within these blocks are
scoped to the block.  This has a couple of benefits: firstly, it allows a variable name to be reused without errors being reported;
secondly, it improves alignment of case statements - try copying and pasting a case section below along case section without curly
braces and see what it does with indentation!

For example:
```
    switch (props.size) {
        case "xsmall": {
            className = css.xsmall;
            break;
        }
        case "small": {
            className = css.small;
            break;
        }
        default: {
            className = css.medium;
            break;
        }
    }
```

Import Statements
=================

Overview
--------

1. Imports should contain most specific import path
  - Don't import directly from an "index.ts" file, those are intended only for exporting from @atoll/shared - see how they're used
    in "index.ts" in the "src" folder.
  - If, for the purpose described above, an index file is used in an import don't rely on the optional "index" file behavior, make
    it clear that you are using an index file.  This makes it obvious that you intended to use the index file and that it will need
    to be maintained as the way to export the subfolder's files. For example, use `export * from "./utils/index"` instead of
    `export * from "./utils"`.
2. Import statements should be grouped per "Import Sections" (see below).

Import File Paths
-----------------

VS Code may provide options such as `module ".."` and `module "../reducers/rootReducer"`.  In this case `"../reducers/rootReducer"`
should be chosen because it is the most specific path.

Import Sections
---------------

Import statments should be grouped into the following commented sections (try to stick to this order as well- see notes on this below):

| Section          |                                              |
|------------------|----------------------------------------------|
| externals        | any third party module, e.g. React           |
| libraries        | anything imported from @atoll/* repos        |
| config           | any project related configuration consts     |
| utils            | any project related utility functions        |
| routes           | any project related routing config/functions |
| data access      | any project related data access functions    |
| actions          | any project related action creators          |
| components       | any project related JSX components used      |
| state            | any project related state                    |
| consts/enums     | any project related constants and enums      |
| interfaces/types | any project related interface or types       |
| style            | any project related css module references    |

Why the order matters- VS Code automatically adds imports to the first import statement it finds.
For example, having "utils" before "interfaces/types" prevents VS Code from turning an
"import type" statament into a plain "import" if it auto-imports a utility function.  There are
other reasons  for doing this as well, including consistency when viewing one file after another.

This helps to identify inconsistencies in naming because it becomes obvious when you group by category.  This also helps to make it
obvious when a module could be going beyond its single responsibility (and thereby violating SOLID principles).

For example:
```
// externals
import React from "react";
import { hydrate } from "react-dom";
import { Provider } from "react-redux";
import { Route, Switch } from "react-router-dom";
import { ConnectedRouter } from "connected-react-router";

// utils
import { configureStore } from "@atoll/shared";
import { createClientHistory } from "@atoll/shared";
import { storeHistoryInstance } from "@atoll/shared";

// components
import { App } from "@atoll/shared";
import { ReviewViewContainer, SprintViewContainer } from "@atoll/shared";
import { IntlProvider } from "@atoll/shared";

// layouts
import { layouts } from "@atoll/shared";
```

Classes
=======

Avoid using classes as much as possible.  Classes should be restricted to specialized use only.

Functions
=========

Preferred Style
---------------

The preferred style for functions is `const functionName = (arg1: ArgType1, arg2: ArgType2, ...): ResultType => { ... }` as opposed
to `function functionName(arg1: ArgType1, arg2: ArgType2): ResultType { ... }`.

Argument Types
--------------

1. Boolean types should be avoided to improve readability.  
   _For example, `const doSomething = (convertNullToTrue: boolean)` should be changed to
   `const doSomething = (nullConversionOption: NullConversionOption)` where `NullConversionOption` is defined as an enum with the
   value `MapNullToTrue`.  This makes calling code easier to read: `doSomething(NullConversionOption.MapNullToTrue)` means
   something, as opposed to `doSomething(true)` that you would have to explore further to understand._
2. As arguments be careful to include full objects when only a couple of properties are needed- this limits the reusability of the
   functions.  However, a specialized object can be introduced and exported from that same file that contains the function itself
   if there are a lot of arguments passed into the function.
3. Consider using an `options` argument (similar to the code style the "deno" project uses), when this applies, to contain all the
   various "configuration" type arguments if there are many.


Interfaces/Types
================

Preferred Style
---------------

Use `type` in most cases, `interface` should be reserved when applying to classes.  This standard was introduced
later in the project so you may find a lot of interface use until a wide-scale refactor has been performed.

Extending Interfaces
--------------------

As the "preferred style" section stated- `type` should be used most of the time, but when `interface` is used
the following guidance should be applied (it is also possible to do the exact same thing with `type` as well).

General guidance when extending interfaces:

1. Keep hierarchy as shallow as possible- this may mean that you need to refactor at some point when
   the hierarchy has grown and there are unnecessary intermediary types that can be removed.

2. Try to avoid inheritance- instead you should aggregate interfaces, for example a `Saveable` interface
   could have `hasBeenSaved` boolean property and `BacklogItem` could extend `Saveable` and so could
   `Sprint` (that will make the `Saveable` interface reusable).

Action Types
------------

Make sure to extend the action type from redux's `Action` so that it can be used in a switch statement in the middleware.

**Action Creator Code**

```
// externals
import type { Action } from "redux";

...

export type ApiPostSprintBacklogItemSuccessAction = Action<typeof ActionTypes.API_POST_SPRINT_BACKLOG_ITEM_SUCCESS> & {
    payload: ApiPostSprintBacklogItemSuccessActionPayload;
    meta: ApiActionMetaDataRequestMeta<{}, MetaActionParams>;
};

```
