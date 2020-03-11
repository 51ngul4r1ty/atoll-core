Issues
======

Lifecycle of Bug
----------------

(TODO: describe typical workflow of bugs)

Types
-----

1. In sprint issues found during development (these would be in "known issue" category automatically).  
   _NOTE: These are possibly as an acknowledgement of a design flaw / tech debt?_
2. In sprint issues found during testing.
3. Customer/support found issues in production.
4. Employee found issues in production. 



Date/Time Specific Info
-----------------------

1. When a defect is found, which includes the following info:
   - "found in" - a build number where the issue was found.
2. When a defect is fixed, which includes:
   - "fixed in" - a build number where the issue was found.


Statuses
--------

1. Closed - As Designed
2. (TODO)


Sources
-------

Issues are discovered at different times and reported by people in different roles.

1. Customer - a production defect can be reported by a customer.
2. Support personnel - a production defect can be reported by a support personnel when looking into a customer issue.
3. Developer - sometimes issues are known at time of development and are considered low priority to address right then.


Stage
-----

This is similar to environment but not necessarily the same (each company may have different environments).

1. Development
2. QA
3. Production


Environments
------------

Why this needs to be tracked?  Some companies may care to know more information about the environment where it was found because
it could help to determine if data differences / config differences were a cause of the issue.

1. Local
2. Development (some companies have multiple of these for each developer)
3. QA
4. Staging / UAT
5. Production


Known Issue
-----------

A bug can be flagged as a known issue to indicate that it is OK for this to be released to production.  In addition, a customer
found issue can also be flagged as a known issue if the intention is to keep it open for a while (perhaps for technical reasons
such as a limited data model that will be addressed in future).

A separate field should be provided for notes about the known issue- this will be hidden until the "known issue" checkbox is
checked. 

Specialized Requirements
------------------------

* When "source" is "customer" then need to be able to report to customer when product is available with bug fix that they reported.
* API should allow querying stories & bugs in a particular "build".
* Default rules should be put in place to assign various field values automatically.
  For example, when user selects "stage" of "qa" then environment could be automatically assigned to "qa" as well.
* Auto-assign rules should be customizable (at first they can be hard-coded).
* Auto-assign rules must detect when user has overridden values and not apply rules after that.
* A person's role can have defaults for the fields.
  For example, a QA engineer may almost always find things in the "QA" environment.
* When a bug is entered, it should be possible to configure an API endpont that can be called to retrieve app version info for the
  environment involved (this could even be a local environment endpoint).

Data model:

(TODO)

    Source=customer,automation,development,qa
    Stage=development,testing,released
    Environment=development,qa,prod
