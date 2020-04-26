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
