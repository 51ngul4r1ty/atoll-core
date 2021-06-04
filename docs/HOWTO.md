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
