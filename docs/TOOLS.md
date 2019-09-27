Overview
========

This document is intended as a place to document tools that have been chosen
and why they were chosen.  If it seems as if there's a better tool then this
information can be used to verify that the requirements listed below have been
met.  If the requirements are not met then there need to be other compelling
reasons to displace the existing tool.

NPM Link Check
==============

`npm-link-check` is an npm module that is installed globally to make it easy
to determine whether a module has any npm linked modules.

Why It Was Chosen
-----------------

* It works on Windows, Linux and Mac OS X

Alternatives Reviewed
---------------------

* `link-status` - didn't work on Windows
