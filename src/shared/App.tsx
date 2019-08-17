// externals
import React, { useCallback } from "react";
import Helmet from "react-helmet";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";

// components
import { TopMenuPanel } from "./components/panels/TopMenuPanel";

// actions
import { setLocale } from "./store/app/actions";

// style
import css from "./App.module.css";

// images
import favicon from "../shared/assets/favicon.png";

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
