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
`connected-react-router` - A way to connect routing and redux in a clean way (the replacement for react-router-redux)
`react-dom`
`react-helmet` - A document head manager for React
`react-i18next` - Internationalization for React done right
`react-redux`
`react-router-dom`
`react`
`redux-thunk`
`redux`

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
