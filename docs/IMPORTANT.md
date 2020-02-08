Important Considerations
========================

When choosing new tooling or processes that will have to be used by everyone who contributes to this project:
* Only choose tools that work well with GUI tools (see examples later in this doc).
* Always choose processes that support GUI tools (as well as command line options).

Examples of Interfering with GUI Tools 
======================================

* Git hooks (e.g. using husky) can be set up that prevent developers from pushing changes using
  Github Desktop and/or VS Code's UI.  This is not acceptable for use with this project- if it
  breaks the GUI tools the changes will be backed out.  Also, developers introducing changes
  like this should always test with a few of the "standard" GUI tools.
