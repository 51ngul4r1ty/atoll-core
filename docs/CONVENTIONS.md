Conventions
===========

This is reserved for conventions used outside the code itself, for anything related to naming standards see
[CODE_STANDARDS.md](/docs/CODE_STANDARDS.md)

Branch Naming
-------------

**Enhancements**
`story/{number}/{task description}`

-   `{number}` should be formatted with leading zeros to 6 places (e.g. 000123)
-   `{task description}` should be formatted as lowercase letters with dashes instead of spaces

**Bugs**
`issue/{number}/{task description}`

-   same as enhancement format

**Tech**
`tech/{number}/{task description}`

-   same as enhancement format
-   these are essentially stories with a technical flavor- e.g. "bulk up unit tests", "refactor xyz module", etc.

NOTE: To start with we'll use Github's built-in issues but the long term goal would be to
use "Atoll" itself to track stories + bugs. We'll essentially build it to boostrap itself
as early as possible in the development process.

Component Folder Naming
-----------------------

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
