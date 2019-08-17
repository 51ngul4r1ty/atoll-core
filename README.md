Overview
========

README.md - this document is intended as the index document to find out where to go next.
HOWTO.md - contains details for how to implement things.
CONVENTIONS.md - important naming conventions information.
CODE_STANDARDS.md - read this!
DEPENDENCIES.md - more information about the npm packages used.


Build Scripts
=============

`scripts/*`
  - general build scripts

`scripts/build-storybook-html.js`
  - the link between theming in the app and theming inside storybook
  - if it seems like something isn't quite working in storybook or the app that's
    related to theming you may have to take a look at what this file is doing and
    make sure it is executing correctly


NPM Scripts
===========

`test` - runs tests and enters watch mode
`test:ci` - for running tests without entering watch mode


References Used to Set this Project Up
======================================

Debug Browser Code in VSCode
----------------------------

https://vcfvct.wordpress.com/2019/01/11/debug-browser-code-in-vscode/
