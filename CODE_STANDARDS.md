Code Standards
==============

Folder Naming
-------------

1. Folder names should use lowercase letters.
2. Folder names should use dashes to separate words.
3. Folder names should not use underscores to separate words.


Components
----------

Use `React.FC<ComponentNameProps>` as the default component definition where
`ComponentName` will be your actual component name, e.g. `MyButton`.

`ComponentNameProps` should be split into 2 interfaces:
- `ComponentNameAttributeProps` and `ComponentNameEventProps`

`ComponentNameAttributeProps` will contain the typical properties.
`ComponentNameEventProps` will contain event handler related properties.

To combine the these two interfaces use:
`type ComponentNameProps = ComponentNameAttributeProps & ComponentNameEventProps`

`ComponentNameAttributeProps` can be used for `mapStateToProps`
`ComponentNameEventProps` can be used for `mapDispatchToProps`


Switch Statements
-----------------

Case statements should always be enclosed in curly braces so that block scope is applied
and variables within these blocks are scoped to the block.  This allows a variable name to
be reused without errors being reported.

For example:
```
    switch (props.size) {
        case "xsmall": {
            className = css.xsmall;
            break;
        }
        case "small": {
            className = css.small;
            break;
        }
        default: {
            className = css.medium;
            break;
        }
    }
```