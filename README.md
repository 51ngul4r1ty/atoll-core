IMPORTANT
=========

This repo and the other related ones (atoll-shared etc.) are being transitioned to the `atoll-mono` monorepo.  The only thing that
will be retained (at least for now) is the issue list that's being maintained in the Github `Issues` tab for this repo.  Everything
else, including this README.md and other documentation has been duplicated in `atoll-mono` and will be maintained there going forward,
so this documentation will become out-of-date and should not be used for reference!



----------------------------










Overview
========

The goal of this project is to create a good agile project management tool that adheres as closely to scrum best practices as
possible.

Getting Started
===============

If you're interested in getting a detailed explanation of the various parts of this project you may want to also take a look at the
"Document Index" section below.  If not, and you just want to get going as quickly as possible then you may only need to read this
section.

Everyone contributing to this repo should read this document before doing anything: [IMPORTANT.md](docs/IMPORTANT.md)

For specialized instructions (to save you time trying to do various things): [DEV_HOWTO.md](docs/DEV_HOWTO.md)

Many code standards and conventions can be picked up from existing patterns in the code but it is advisable to use this resource as
well: [CODE_STANDARDS.md](docs/CODE_STANDARDS.md)

Tools Used
----------

1. At time of writing, Node v16.14.2 was used with NPM v8.15.0.  
   NOTE: you may experience silent script failures (no errors) when using `npm run setup` if you are
     using Node v14+.  Also, `npm start` may not create the database structure (see "Unsupported Version of Node" in the wiki
     pages if you'd like to see what the typical output is).
2. VS Code is the editor of choice for this project (v1.37.0 or newer).
   - Make sure you install the recommended workspace extensions.
3. Yalc (`yalc`) to locally "publish" npm modules for easier development.
4. PostgreSQL 12.2 for storing data:
   `https://www.enterprisedb.com/downloads/postgres-postgresql-downloads` (Windows 10 / Mac OS X)
   `https://computingforgeeks.com/install-postgresql-12-on-ubuntu/` (Ubuntu with links to other distros)

Steps after Cloning Repo
------------------------

1. `npm ci` (if you see errors about removing node_modules then remove package-lock.json and use
   `npm i` instead)
2. Clone `atoll-shared` repo and follow instructions in its README.md to get it building correctly.
3. `npm run sync-quick` in `atoll-core` repo to get it to use the latest version of the shared repo code.
4. `npm run build` (if this succeeds you have all dependencies correct)
5. Do not use pgAdmin UI to create the database, just use the query tool to run the `setup.sql` statements in the next step.
6. Use `setup.sql` to set up "atoll" database schema.
7. Set environment variable `ATOLL_DATABASE_URL` to "postgres://atoll:l1m3atoll@localhost:5432/atoll"
   (use `~/.zprofile` file or equivalent).
8. Set environment variable `ATOLL_DATABASE_USE_SSL` to "false"
   (use `~/.zprofile` file or equivalent).
9. Set environment variable `ATOLL_AUTH_KEY` to "local-dev-test-key"
   (use `~/.zprofile` file or equivalent).
10. Restart your system to ensure that environment variables are set correctly.
11. Use `npm run setup` to set to the test account (the `data.sql` script will not run correctly if this
   step is skipped).
12. Use `data.sql` to set up some sample data.
13. Use VS Code to open `atoll-core-main.code-workspace` - this will ensure that you see `atoll-core`
   and `atoll-shared` folders in the editor.
14. Install all recommended extensions in VS Code.
15. Use VS Code's debugger to launch "App" and/or "Storybook"
   - If you prefer to use npm scripts you can use `npm start` and/or `npm run storybook`
     but you won't be able to set breakpoints in the app if you use `npm start` so we
     recommend the former approach.
16. Use `npm test` while editing code to ensure that the tests keep passing while you
   perform TDD coding iterations.  This will cause the tests to run every time code
   changes are saved and coverage gutters will be updated automatically (use "Watch"
   in the VS Code tray area).

Active Development
------------------

- Use `npm start` to start up the local dev server (after using `npm run sync-quick` at least once to make sure it compiles and uses
  the local "atoll-shared" module).
- Use `npm run storybook` to start up storybook for developing components.

Debugging Server
----------------

1. `start:client-only` (which runs `npm run build:dev` and then `npm run start:clent`)
2. Use VS Code's debugger to launch "Server"

Strict Mode
-----------

Adding the query param `strict-mode=true` to the URL will turn on strict mode.  Strict mode will
cause the app to throw errors for inconsistencies as they occur.  Most of the time these errors
don't appear to cause problems but they are unexpected so a developer should be aware of them.
A user, on the other hand, would prefer that the app is as stable as possible... so a random
error thrown every now and then may not go down well for "production" use.  Developers can also
add more "strict mode" errors by using the `isStrictMode` selector.  In future this will probably
be turned on when running using a localhost URL, but for now it has been turned off unless
specifically requested in this way.

Document Index
==============

General Use
-----------

README.md                                         - This document is intended as the index document to find
                                                    out where to go next.  

End Users
---------

[USER_GUIDE.md](docs/USER_GUIDE.md)               - An entrypoint for end users of Atoll.

Contributor Related
-------------------

[CODE_STANDARDS.md](docs/CODE_STANDARDS.md)       - Read this!  
[CONVENTIONS.md](docs/CONVENTIONS.md)             - Important naming conventions information.  
[ARCHITECTURE.md](docs/ARCHITECTURE.md)           - Architecture related info  
[CODE_ARCHITECTURE.md](docs/CODE_ARCHITECTURE.md) - Code-level architecture related info  
[DEV_HOWTO.md](docs/DEV_HOWTO.md)                 - Contains details for how to implement things.  
[DEPENDENCIES.md](docs/DEPENDENCIES.md)           - Detailed information about the npm packages used.  
[SCRIPTS.md](docs/SCRIPTS.md)                     - Detailed information about the build & npm scripts.  
[HISTORY.md](docs/HISTORY.md)                     - The past history of this project.  
[POLICIES.md](docs/POLICIES.md)                   - Github branch policies etc.  
[GLOSSARY.md](docs/GLOSSARY.md)                   - Glossary specific to this project.  
[ISSUES_RESOLVED.md](docs/ISSUES_RESOLVED.md)     - This may be useful if you're running into problems.  
[DATA_MODEL.md](docs/dataModel/DATA_MODEL.md)     - Mapping the requirements to the data model.  
[PROCESS.md](docs/PROCESS.md)                     - The index document for processes that should be followed.

[Github Wiki](https://github.com/51ngul4r1ty/atoll-core/wiki)
