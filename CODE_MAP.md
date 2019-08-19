Overview
========

This document contains detailed information about the files contained in this repo.


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


