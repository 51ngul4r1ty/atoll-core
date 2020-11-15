Overview
========

This project was set up using a combination of Manuel Bieh's template, Create React App
and other references mentioned in this doc.


References Used to Set this Project Up
======================================

Debug Browser Code in VSCode
----------------------------

https://vcfvct.wordpress.com/2019/01/11/debug-browser-code-in-vscode/

Data fetching in Redux apps: A 100% correct approach
----------------------------------------------------

This very opinionated article (by title) provided the basis for rolling our own redux-api-middleware.  Why didn't we just use
`redux-api-middleware`?  It didn't work with SSR!  So, back to the drawing board and, using the article below, we created something
quite similar to redux-api-middleware that was SSR compatible.  Note: there is another project out there that claims to do the same
but we weren't able to get it to work, and the effor involved to "roll our own" wasn't significant.

https://blog.logrocket.com/data-fetching-in-redux-apps-a-100-correct-approach-4d26e21750fc/

How to use Sequelize with Node and Express
------------------------------------------

https://www.codementor.io/mirko0/how-to-use-sequelize-with-node-and-express-i24l67cuz

Atomic Design
-------------

A quick overview of Atomic Design terminology:
https://www.youtube.com/watch?v=aMtnGeiWTyU
