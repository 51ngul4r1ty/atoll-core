Code Standards
==============

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
