Code Standards
==============

Folder Naming
-------------

**General**  

1. Folder names should use lowercase letters.
2. Folder names should use dashes to separate words.
3. Folder names should not use underscores to separate words.

**Component Folders**

The components are organized using Atomic Design principles, so the following base folders should be used:
- "atoms" = basic building block components
- "molecules" = when smaller building blocks are combined they form molecules, e.g. "backlog item card"
- "organisms" = defining sections of the applicaton, e.g. "top menu panel", "backlog item planning panel"
- "templates"
- "pages"

NOTE: Do not assume that components belong in a upper level folder if they contain items at a lower level.  In a similar vein,
  do not assume something belongs at the lower level because it doesn't contain anything from that level.  Use the guidelines
  provided by Atomic Design itself.  It is best to think of this from the UI/UX designer's point of view instead of thinking
  technically how the components are composed.  A good example of this is used above: "backlog item card" is a "molecule" but, when
  this was written, it didn't use any "atoms" - but from a UI/UX perspective it does appear to have many smaller building blocks
  that could potentially be atoms.

**Interface Types**

1. Don't precede interface types with any prefix
   (for example, "I" for interface or "T" for type, as used in other code standards).
2. Use the prefix "Base" for an interface that is at the root of the type hierarchy but typically isn't used directly by objects.
3. Use the prefix "Standard" for an interface that is a lowest common denominator for objects that will extend it. 
4. Avoid deeply nested hierarchies and instead try to combine other interfaces
   (for example, StandardInvertibleComponentProps)
5. Don't use the "Standard" interfaces as replacements for component property types
   (for example, AppIconProps is an alias for StandardInvertibleComponentProps so that AppIcon has its own props type)  
   _NOTE: This is done so that consumers of AppIcon aren't aware of StandardInvertibleComponentProps so that they can_
     _evolve separately._

Components
----------

Use `React.FC<ComponentNameProps>` as the default component definition where
`ComponentName` will be your actual component name, e.g. `MyButton`.

`ComponentNameProps` should be split into 2 interfaces:
- `ComponentNameStateProps` and `ComponentNameDispatchProps`

`ComponentNameStateProps` will contain the typical properties.
`ComponentNameDispatchProps` will contain event handler related properties.

To combine the these two interfaces use:
`type ComponentNameProps = ComponentNameStateProps & ComponentNameDispatchProps`

`ComponentNameStateProps` can be used for `mapStateToProps`
`ComponentNameDispatchProps` can be used for `mapDispatchToProps`


Switch Statements
-----------------

Case statements should always be enclosed in curly braces so that block scope is applied
and variables within these blocks are scoped to the block.  This allows a variable name to
be reused without errors being reported.

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
-----------------

Import statments should be grouped into the following commented sections (try
to stick to this order as well):

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

This helps to identify inconsistencies in naming because it becomes obvious
when you group by category.  This also helps to make it obvious when a module
could be going beyond its single responsibility (and thereby violating SOLID
principles).

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
