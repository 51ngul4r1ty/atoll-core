Overview
========

This document contains only test related code standards, please refer to
[CODE_STANDARDS.md](CODE_STANDARDS.md) for more code standards.

Reasoning
=========

Code standards are unique for tests.  Too often developers apply the same
rules for tests without thinking of the benefits of using different
conventions for tests.  For example, tests need to be more verbose to be
understood in isolation.  In non-test code re-use is emphasized, but
sometimes re-use requires someone to look deeper into the code to
understand test failures.  However, this doesn't mean that all re-use
should be avoided, just that re-use should be used sparingly and in a
very targeted way.

Test Names
==========

All test names should describe what the test is doing.  This SHOULD NOT
be an exact translation of what the test code is doing.  A test named
"should return 5 when 2 and 3 is provided as input" is way less helpful
than "should add 2 integer numbers correctly."  Try to think of how the
code is being used and what business logic it is providing rather than
what it is technically doing.  In other words: the name should add
value beyond what can be read by looking at the test code itself.

Use of Constants in "Arrange" Sections
======================================

Avoid constants and instead make use of utilities that build the
objects needed (see `objectBuilders.ts`).  Those builders should return
valid objects that do not violate the types defined.  Often in tests
developers are tempted to use `as any` or cast to full types when
leaving some properties undefined, but this could mean that test code
becomes out of sync with code under test.

Use of Constants in "Assert" Sections
=====================================

Avoid constants at all costs.  Although you may find that you repeat
data over and over it is much more readable by not using a constant.
If you are using a big data structure in your comparison then your
test isn't targeted enough- rather split it up into multiple expect
statements with smaller parts of the data structure.

For example, don't be tempted to turn this:
```
    // assert
    expect(sprintsState).toStrictEqual({
        addedItems: [],
        allItems: [],
        items: [],
        openedDetailMenuSprintId: null,
        originalData: {},
        openedDatePickerInfo: {
            sprintId: null,
            showPicker: SprintDetailShowingPicker.None
        }
    });
```

into
```
    // assert
    expect(sprintsState).toStrictEqual(sprintsReducerInitialState);
```

even though `sprintsReducerInitialState` is an existing constant!

Reasoning: `sprintsReducerInitialState` may be changed and the test
will still pass.  That's a problem for two reasons:
1) Lose visibility of changes that impact tests - many times a test
  is checking for a specific end result and a change to the source
  constant may mean that the result now fails what the consuming
  code is expecting.  The tests are designed to protect against
  this but they're rendered useless by this type of re-use.
2) A constant that's imported can actually be mutated accidentally
  by the code under test.  If you compare the end result you will
  completely miss that this mutation occurred.

You may use an "object builder" just as is done for the "arrange"
section because:
1) It is independent of the code under test.
2) It creates a new object each time which allows the test to
  catch mutations.

One word of caution: when using a builder do not assign the
result to a variable and then re-use that variable in the arrange
and assert sections of your test or you will lose the ability to
detect mutations!
