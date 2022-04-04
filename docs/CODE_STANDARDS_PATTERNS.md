Overview
========

This document contains specific information related to patterns used in this codebase, please refer to
[CODE_STANDARDS.md](CODE_STANDARDS.md) for more code standards.

Client-Side Code Patterns
=========================

React Related
-------------

**State Slice Selectors**

Typically selectors can access any part of the state tree and they take the full state tree as input.
However, there are scenarios where it is useful to just provide the slice of state that's specific
to one reducer's part of the state tree.  That's where State Slice Selectors come into the picture.

Here's how this pattern looks in practice:

file: ./reducers/backlogItems/backlogItemsSliceSelectors.ts
```
// interfaces/types
import type { BacklogItemsState } from "./backlogItemsReducerTypes";

export const getSelectedBacklogItemIdsFromSlice = (backlogItems: BacklogItemsState) => backlogItems.selectedItemIds;
```

Typically these same selectors will also be exposed at the full state level but they'll re-used the existing code, like this:

file: ./selectors/backlogItemSelectors.ts
```
// selectors
import * as backlogItemsSliceSelectors from "../reducers/backlogItems/backlogItemsSliceSelectors";

export const getSelectedBacklogItemIds = (state: StateTree): string[] =>
    backlogItemsSliceSelectors.getSelectedBacklogItemIdsFromSlice(state.backlogItems);
```

FAQs Related to this Pattern:

_Question: Why are they under the "reducers" folder?_  
Answer:  
(1) This makes it easier to partition all the code related to that slice of state.  Once the codebase becomes bigger you may find
  it necessary refactor pull all of this related code out into its own package, and it makes it easier to do this if it is all
  grouped together.  
(2) It is easier to reference this code in the context of all the other code that works with that same state slice
  structure.  If a refactor becomes necessary you'll appreciate how targeted the changes are and it is much easier to navigate
  between files under the same sub-folders.
_Question: Why not just in-line the "slice selector" logic?_
Answer: It is always better to abstract the state structure from the consuming code.  You'll find that you can make more targeted
  changes this way, affecting fewer files at a time.  It also makes refactoring much easier.

Server-side Code Patterns
=========================

Express API Handler Related
---------------------------

**Building Responses**

| Response Utility Function | Scenario Where Applicable                                                              |
|---------------------------|----------------------------------------------------------------------------------------|
| respondWithObj            | Already have a correctly structured obj preferred produced by responseBuilder util fns |
| respondWithObj            | Already have a correctly structured obj that's a pretty unique custom structure        |
| respondWithMessage        | For !isRestApiItemResult or !isRestApiCollectionResult scenarios                       |

**Handler Helper Options**

If it is necessary to control transactions in the caller and suppress them in the "helper" function then use
HandlerHelperOptions (see how removeUnallocatedBacklogItemPart implements this).

**Transactions**

Code below has examples for a handler called "backlogItemPartPatchHandler".

Handlers must start with:

```
    const handlerContext = start("backlogItemPartPatchHandler", res);
```

and end with:

```
    finish(handlerContext);
```

For transaction handling it will have this:

```
    try {
        await beginSerializableTransaction(handlerContext);

...

    } catch (err) {
        await handleUnexpectedErrorResponse(handlerContext, err);
    }
```


General Code Patterns
=====================

(todo)
