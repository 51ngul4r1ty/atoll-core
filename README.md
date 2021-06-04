Overview
========

The goal of this project is to create a good agile project management tool that adheres as
closely to scrum best practices as possible.

Getting Started
===============

If you're interested in getting a detailed explanation of the various parts of this project you may
want to start with the "Other Docs" section below.  If not, and you just want to get going as quickly
as possible then you're in the right section.

Everyone contributing to this repo should read this document before doing anything: [IMPORTANT.md](docs/IMPORTANT.md)

For specialized instructions (to save you time trying to do various things): [HOWTO.md](docs/HOWTO.md)

Many code standards and conventions can be picked up from existing patterns in the code but it is advisable to use this resource as
well: [CODE_STANDARDS.md](docs/CODE_STANDARDS.md)

Tools Used
----------

1. At time of writing, Node v12.8.1 was used with NPM v6.10.2.  
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
5. Use `setup.sql` to set up "atoll" database schema.
6. Set environment variable `ATOLL_DATABASE_URL` to "postgres://atoll:l1m3atoll@localhost:5432/atoll"
   (use `~/.zprofile` file or equivalent).
7. Set environment variable `ATOLL_DATABASE_USE_SSL` to "false"
   (use `~/.zprofile` file or equivalent).
8. Set environment variable `ATOLL_AUTH_KEY` to "local-dev-test-key"
   (use `~/.zprofile` file or equivalent).
9. Restart your system to ensure that environment variables are set correctly.
10. Use `npm run setup` to set to the test account (the `data.sql` script will not run correctly if this
   step is skipped).
11. Use `data.sql` to set up some sample data.
12. Use VS Code to open `atoll-core-main.code-workspace` - this will ensure that you see `atoll-core`
   and `atoll-shared` folders in the editor.
13. Install all recommended extensions in VS Code.
14. Use VS Code's debugger to launch "App" and/or "Storybook"
   - If you prefer to use npm scripts you can use `npm start` and/or `npm run storybook`
     but you won't be able to set breakpoints in the app if you use `npm start` so we
     recommend the former approach.
15. Use `npm test` while editing code to ensure that the tests keep passing while you
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

Other Docs
==========

README.md                                     - this document is intended as the index document to find
                                                out where to go next.  
[CODE_STANDARDS.md](docs/CODE_STANDARDS.md)   - read this!  
[CONVENTIONS.md](docs/CONVENTIONS.md)         - important naming conventions information.  
[ARCHITECTURE.md](docs/ARCHITECTURE.md)       - architecture related info  
[HOWTO.md](docs/HOWTO.md)                     - contains details for how to implement things.  
[DEPENDENCIES.md](docs/DEPENDENCIES.md)       - detailed information about the npm packages used.  
[SCRIPTS.md](docs/SCRIPTS.md)                 - detailed information about the build & npm scripts.  
[HISTORY.md](docs/HISTORY.md)                 - the past history of this project.  
[POLICIES.md](docs/POLICIES.md)               - github branch policies etc.  
[GLOSSARY.md](docs/GLOSSARY.md)               - glossary specific to this project.  
[ISSUES_RESOLVED.md](docs/ISSUES_RESOLVED.md) - this may be useful if you're running into problems.  
[DATA_MODEL.md](docs/dataModel/DATA_MODEL.md) - mapping the requirements to the data model.  
[PROCESS.md](docs/PROCESS.md)                 - the index document for processes that should be followed.
