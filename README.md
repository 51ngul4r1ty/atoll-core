Conventions
===========

Branch Naming
-------------

**Enhancements**
`story/{number}/{task description}`
- `{number}` should be formatted with leading zeros to 6 places (e.g. 000123)
- `{task description}` should be formatted as lowercase letters with dashes instead of spaces

**Bugs**
`bug/{number}/{task description}`
- same as enhancement format

NOTE: To start with we'll use Github's built-in issues but the long term goal would be to
use "Atoll" itself to track stories + bugs.  We'll essentially build it to boostrap itself
as early as possible in the development process.


Configuration
=============

`.browserslistrc`
  - config to let tools know what browsers we support (e.g. autoprefixer)
  - reference: https://css-tricks.com/browserlist-good-idea/

`dependency-cruiser.js`
  - config for dependency cruiser - use `npm run depgraph` to analyze project
  - reference: https://www.netlify.com/blog/2018/08/23/how-to-easily-visualize-a-projects-dependency-graph-with-dependency-cruiser/

`.editorconfig`
  - general purpose config that most editors respect

`.eslintignore`
`.eslintrc.js`
  - linting configuration

`.gitignore`
  - git ignore list

`.npmrc`
  - save-exact = true means: less changes means more stability!

`.prettierrc`
  - configure prettier to match our coding style
  - reference: https://prettier.io/docs/en/options.html

`.stylelintrc`
  - configure stylelint to match our coding style
  - reference: https://stylelint.io/user-guide/configuration

`babel.config.js`
  - configure babel

`i18next-scanner.config.js`
  - reference: https://github.com/i18next/i18next-scanner

`jest.config.js`
  - jest configuration

`postcss.config.js`
  - we plan on using this in future but it is currently disabled

`tsconfig.json`
  - typescript config for app when not using storybook

`tsconfig.storybook.json`
  - typescript config used by storybook

`.storybook/addons.ts`
  - storybook addons (most significant is root-attribute addon used for theme selection)

`.storybook/config.ts`
  - storybook config

`.storybook/webpack.config.js`
  - webpack config for storybook

`config/*`
  - general configuration of app

`config/webpack.config.js`
  - folder containing the individual webpack config components for the app itself


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


NPM Packages
============

We'll try to keep this list up-to-date but there's a good chance we'll miss at least some of the dependencies.
If you encounter a missing entry please be a good citizen and update the docs!

Dependencies
------------

*Libraries*
`body-parser` - node.js body parsing middleware
`chalk` - terminal string styling
`cors` - node.js CORS middleware
`dotenv` - Loads environment variables from .env file
`express` - fast, unopinionated, minimalist web framework
`express-manifest-helpers` - View helpers to use with an asset manifest
`history` - easily manage session history
`i18next` - I18next internationalization framework
`immer` - allows you to work with immutable state in a more convenient way


Dev Dependencies (needed for build)
-----------------------------------

*Build Scripts/Tools*
`yarn-or-npm` - our npm scripts use this tool to support whichever you prefer!
`cross-env` - to support Mac OS X and Windows users (and maybe Linux?)
`react-dev-utils` - Create React App related utilities
`nodemon` - Simple monitor script for use during development of a node.js app
`puppeteer` - High-level API to control headless Chrome over the DevTools protocol

*Webpack & Related*
`webpack` - the defacto standard!
`mini-css-extract-plugin` - extracts CSS into separate files
`babel-loader` - we use babel 7 and tsc to get the typescript code into javascript
`css-loader` - to deal with css files
`css-hot-loader` - css hot reloading
`file-loader` - webpack loader to copy files (e.g. images) to bundle folder and reference using url
`url-loader` - webpack loader to transform files into base64 URIs
`webpack-manifest-plugin` - webpack plugin for generating an asset manifest ("manifest.json")
`postcss-loader` - may not be using this - TODO: REMOVE THIS
`case-sensitive-paths-webpack-plugin` - enforces module path case sensitivity in webpack
`html-webpack-plugin` - simplifies creation of HTML files to serve your webpack bundles
`webpack-node-externals` - easily exclude node_modules in webpack bundle
`@svgr/webpack` - SVGR webpack loader (best way we found to use SVGs)

*Babel & Related*
`@babel/core` - Babel compiler core
`@babel/plugin-proposal-object-rest-spread` - Compile object rest and spread to ES5
`@babel/plugin-proposal-class-properties` - Transforms static class properties & properties declared with the property initializer syntax
`@babel/plugin-proposal-optional-chaining` - Transform optional chaining operators into a series of nil checks
`@babel/plugin-syntax-dynamic-import` - Allow parsing of dynamic import
`@babel/preset-env` - Babel preset for each environment
`@babel/preset-react` - Babel preset for all React plugins
`@babel/preset-typescript` - Babel preset for TypeScript
`babel-plugin-macros` - Allows you to build compile-time libraries
`babel-plugin-named-asset-import` - Create React App related plugin for named asset imports

*PostCSS Related*
`autoprefixer` - PostCSS plugin to parse CSS and add vendor prefixes to CSS rules
`postcss-import` - PostCSS plugin to import CSS files
`postcss-nested` - PostCSS plugin to unwrap nested rules like how Sass does it
`postcss-flexbugs-fixes` - PostCSS plugin to address all flexbug's issues
`postcss-custom-properties` - PostCSS plugin to allow use of Custom Properties Queries in CSS
`postcss-assets` - PostCSS plugin to manage assets

*Libraries*
`core-js` - standard library that includes many polyfills
`reselect` - More efficient selectors for Redux

*React Related*
`react`
`react-dom`
`react-helmet` - A document head manager for React
`react-i18next` - Internationalization for React done right
`react-redux`
`react-router-dom`
`redux`
`redux-thunk`

*Miscellaneous*
`regenerator-runtime` - runtime for Regenerator-compiled generator and async functions
`@csstools/normalize.css` - CSS library that provides consistent, cross-browser default styling of HTML elements


Dev Dependencies (needed for start)
-----------------------------------

*Webpack Related*
`webpack-dev-middleware`
`webpack-hot-middleware`
`write-file-webpack-plugin`


Dev Dependencies (needed for storybook build)
---------------------------------------------

`cpx`
`typescript`
`@storybook/addons`
`@storybook/addon-actions`
`@storybook/addon-links`
`@storybook/cli`
`@storybook/react`
`storybook-addon-root-attribute`
`storybook-dark-mode`
`awesome-typescript-loader`

Dev Dependencies (needed for analysis)
--------------------------------------

`webpack-bundle-analyzer` - used for "npm run analyzer"
`webpack-cli`
`dependency-cruiser` - used for "npm run depgraph"
`open-cli` - to open dependency-cruiser's generated svg file

Dev Dependencies (needed for i18n)
----------------------------------

`@babel/cli` - used for "npm run i18n:scan"
`i18next-scanner` - used for "npm run i18n:scan"

Dev Dependencies (needed for testing)
-------------------------------------

`jest`
`jest-cli`


References Used to Set this Project Up
======================================

Debug Browser Code in VSCode
----------------------------

https://vcfvct.wordpress.com/2019/01/11/debug-browser-code-in-vscode/
