Overview
========

The goal of this project is to create a good agile project management tool that adheres as
closely to scrum best practices as possible.

Getting Started
===============

If you're interested in getting a detailed explanation of the various parts of this project you may
want to start with the "Other Docs" section below.  If not, and you just want to get going as quickly
as possible then you're in the right section.

Tools Used
----------

1. At time of writing, Node v10.15.3 was used with NPM v6.10.1.
2. VS Code is the editor of choice for this project (v1.37.0 or newer).
  - Make sure you install the recommended workspace extensions.

Steps after Cloning Repo
------------------------

1. `npm ci`
2. `npm run build` (if this succeeds you have all dependencies correct)
3. Use VS Code's debugger to launch "App" and/or "Storybook"
  - If you prefer to use npm scripts you can use `npm start` and/or `npm run storybook`
    but you won't be able to set breakpoints in the app if you use `npm start` so we
    recommend the former approach.
4. Use `npm test` while editing code to ensure that the tests keep passing while you
   perform TDD coding iterations.  This will cause the tests to run every time code
   changes are saved and coverage gutters will be updated automatically (use "Watch"
   in the VS Code tray area).


Other Docs
==========

README.md                                   - this document is intended as the index document to find
                                              out where to go next.  
[IMPORTANT.md](docs/IMPORTANT.md)           - important things to remember - must read!
[CODE_STANDARDS.md](docs/CODE_STANDARDS.md) - read this!  
[CONVENTIONS.md](docs/CONVENTIONS.md)       - important naming conventions information.  
[HOWTO.md](docs/HOWTO.md)                   - contains details for how to implement things.  
[DEPENDENCIES.md](docs/DEPENDENCIES.md)     - detailed information about the npm packages used.  
[SCRIPTS.md](docs/SCRIPTS.md)               - detailed information about the build & npm scripts.  
[HISTORY.md](docs/HISTORY.md)               - the past history of this project.  
