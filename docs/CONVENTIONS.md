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

UI/UX Design
------------

The UI/UX design principles are based on the concept of Atomic Design.
See [CODE_STANDARDS.md](/docs/CODE_STANDARDS.md) for more info.

Icon Format
-----------

All icons in Atoll are SVG icons to ensure that they can scale well to handle different resolutions.  The icons
are turned into React components so that they can easily be styled.
