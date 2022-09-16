Overview
========

This document explains how to do certain coding activities when contributing to the main project.  However, if you're instead
trying to use Atoll's REST API you should use this document for guidance: [DEV_USING_REST_API.md](DEV_USING_REST_API.md)

Extending Data Model
====================

Sequelize is the ORM used by Atoll.  In order to modify that data structures you should not directly add tables.  Here are the
"rules" for updating the data model:

1. When adding a table, modify the code data models.
2. When modifying a table, modify the code data models *AND* add new script to upgrade.sql to allow existing databases to be
   easily upgraded.
3. When removing fields from a table make sure to provide migration scripts that will take existing data and move it to the new
   structure.

NOTE: Always ensure that the scripts handle accidental re-runs so that someone doesn't accidentally corrupt their database.

Modifying Code Data Model
-------------------------

The entities can be found in the ./src/server/dataaccess/models folder.  It should be pretty easy to figure out how to add these
entities to the collection when examning these files.

Guidance on Types Used
----------------------

1. Variations on DECIMAL types should be kept to a minimum.  The current accepted types are:
  - DECIMAL(10, 2) - used for story points (to support 0.25, 0.5, 1.0 etc.) and percentages (to support finer-grained values than
    exact integer percentages but 10 places are overkill for the percentage because 100% is quite often the max value, but we do this
    for consistency to avoid introducing a new decimal type)

Components with Translation
===========================

```
import React from "react";
import { withTranslation, WithTranslation } from "react-i18next";

const InnerComponent = ({ t }: WithTranslation) => (
    <React.Fragment>
        <h2>{t("translate-string-name")}</h2>
        <ul>
            <li>Item with translated text here: {t("more-translated-text-translate-string-name")}</li>
        </ul>
    </React.Fragment>
);

export const Component = withTranslation()(InnerComponent);
```

Adding Translation to Main App
==============================

```
/* exported interfaces */

type Props = {
    setLocale: (locale: string) => void;
    t: (key: string) => string;
};

/* exported component */

const App = ({ setLocale, t }: Props) => {
    const handleLocaleChange = useCallback(
        (e: React.FormEvent<HTMLButtonElement>) => {
            setLocale(e.currentTarget.value);
        },
        [setLocale]
    );

    return (
        <div className={css.wrapper}>
            <Helmet defaultTitle="Atoll" titleTemplate="Atoll – %s" link={[{ rel: "icon", type: "image/png", href: favicon }]} />
            <TopMenuPanel />
        </div>
    );
};

const mapDispatchToProps = {
    setLocale
};

export default connect(
    null,
    mapDispatchToProps
)(withTranslation()<any>(App));
```

Generating React Components from SVG Files
==========================================

This app relies on fast rendering of images so they're all in-lined.  This should also make it easier for code-splitting,
lazy-loading, etc.

Steps to Generate SVG Files (if using Affinity Designer)
--------------------------------------------------------

1. The `atoll-shared` repo contains all the SVG assets and generated components.
   Use terminal and `cd atoll-shared` to execute all commands below in this folder.
2. The original SVG file should be stored in the `/assets` folder.
3. Make sure to name components using the convention: `{lowercase-component-name}-icon.svg`,
   for example `menu-caret-down-icon.svg`
4. Use `npm run gen:react-svg -- menu-caret-down-icon` to generate the basic React component `MenuCareDownIcon.tsx`.
5. The file will be placed in the `/components/atoms/icons` folder.
6. Affinity places additional SVG elements that aren't needed so you should remove them:
   - remove the line with `xmlnsSerif=`
   - remove the attribute `serifId="{component-title}"` (for example, `serifId="Menu Caret"`)
   - change `const classNameToUse = buildClassName(props.className);`
     to `const classNameToUse = buildClassName(strokeClass, props.className);`
   - add `fill="none"` and `className={classNameToUse}` attributes to the top of the `svg` element.
   - remove `id` attribute from the `g` element and replace it with `className={fillClass}`,
     for example, `<g id="Menu-Caret" transform=...`
       becomes `<g className={fillClass} transform...`
7. Make sure you sort the `index.ts` file (it should have the new component added to it).
8. Make sure you follow the steps to add this icon component to storybook.

Adding Icon Component to Storybook
----------------------------------

1. In all cases before, make sure to add new entries in alphabetical order.
2. Find the `allicons.stories.tsx` file (it should be in the `/stories/atoms/icons` folder).
3. Add component by name to the import list under `// components` section.
4. Add component to `invertableIcons`, `icons` object definitions.
5. Add component to `iconNames` list.
6. Make sure to build the package (`npm run build`) and then use `npm run storybook` to view
   the component to ensure that it displays correctly.
