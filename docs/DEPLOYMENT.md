How to Install Atoll
====================

Heroku
------

* Set up Heroku CLI
  - replace `{app-name}` with your heroku app name in this URL:  
    https://dashboard.heroku.com/apps/{app-name}/deploy/heroku-git
    
* In "Settings" -> "Config Vars" make sure to set the auth key with this config var: ATOLL_AUTH_KEY
  - Choose something very unique that can't easily be guessed, we recommend a phrase made up of
    two or more sequences of words that aren't in well known public documents - each individual
    phrase can come from public documents (for example, poems) but the combination should not
    appear pubicly.
* Manual deploy steps (from local system) OR just use `npm run build` which will use `build-deploy`
  (from ATOLL_CORE_PATH folder):
  - Set up the heroku deploy folder (ATOLL_HEROKU_PATH) in a different location to the git repo
    folder (ATOLL_CORE_PATH) where you have "atoll-core" checked out to.
  - Clean:
    - Remove `build` folder in ATOLL_HEROKU_PATH.
  - Build Atoll:
    - Change directory to ATOLL_CORE_PATH (`cd $ATOLL_CORE_PATH`)
    - Make sure that `@atoll/shared` reference doesn't point to a yalc file path reference,
      it should point to an npm published repo.
    - `npm ci`
    - `npm run build`
  - Copy to Heroku folder:
    - Copy `{ATOLL_CORE_PATH}/build/client/static/*` to `{ATOLL_HEROKU_PATH}/build/client/static/*`
    - Copy `{ATOLL_CORE_PATH}/build/server/*` to `{ATOLL_HEROKU_PATH}/build/server/*`
    - Copy `{ATOLL_CORE_PATH}/build/client/static/*` to `{ATOLL_HEROKU_PATH}/build/server/static/*`
    - Copy `{ATOLL_CORE_PATH}/build/deploy-package.json` to `{ATOLL_HEROKU_PATH}/package.json`
    - Copy `{ATOLL_CORE_PATH}/build/deploy-gitignore` to `{ATOLL_HEROKU_PATH}/.gitignore`
* Manually test deployment (optional):
    - Change directory to ATOLL_HEROKU_PATH
    - `npm i`
    - `npm start`
    - Use browser to view app: `http://localhost:8500/app`
    - NOTE: You may see "LOADING..." and the app doesn't load - if so, some changes may be needed
      to get this working locally (perhaps the code has deviated too much since this was initially
      implemented and it may only be possible to deploy to Heroku to see it functioning correctly)

Deplyoment Notes
----------------

The `package.json` generated in the build folder is intended purely for the deployment environment
and isn't intended for local development use.  The build process takes the development package.json
and strips out unnecessary scripts etc. so that only the most basic entries are preserved for the
deployment environment.  It also modifies the `start` script (and others).
