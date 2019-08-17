Components with Translation
===========================

```
import React from "react";
import { withTranslation, WithTranslation } from "react-i18next";

const RawComponent = ({ t }: WithTranslation) => (
    <React.Fragment>
        <h2>{t("translate-string-name")}</h2>
        <ul>
            <li>Item with translated text here: {t("more-translated-text-translate-string-name")}</li>
        </ul>
    </React.Fragment>
);

export const Component = withTranslation()(RawComponent);
```
