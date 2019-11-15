Overview
========

(TODO)

UI Design
=========

Primary capabilities:
- Collaboration using iPad while doing standup
  (push used to update TV set scrum view)
- Touch is first class experience (e.g. iPad, iPhone)

Task-oriented:
- Long-term Planning, Sprint Planning, Refinement, Standup, In Sprint,
  Review, Retrospective

Task Views
==========

Long-term Planning View
-----------------------

* Provide expandable tree view / timeline with high-level entities
  (themes, initiatives, epics, etc.)  

Planning View
-------------

* Show view priotized for planning (i.e. with spint forecast lines that
  take typical unplanned work into account to compute velocity - we allow
  pointing of unplanned work but that doesn't count towards business value
  related velocity forecasting)
* Show two buckets to draw from:
  - technical items (tech debt etc.)
  - business items (feature work)
* Show recommended story type mix (75% feature, 25% tech debt) defined
  by organization

Refinement View
---------------

* Focus on backlog with filtering for items with "stale estimates" or
  unestimated
* Allow easy re-ordering of backlog
* Allow easy filtering for large stories that may need to be split
* Allow easy splitting
* Allow overall view of epics and higher-level entities

Standup View
------------

* Focus on providing all the necessary data for an efficient standup:
  - show list of people who are in standup and selecting each person
    will highlight work they did in the last day (since previous standup)
