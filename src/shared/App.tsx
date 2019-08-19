// externals
import React from "react";
import Helmet from "react-helmet";

// components
import { TopMenuPanel } from "./components/panels/TopMenuPanel";

// style
import css from "./App.module.css";

// images
import favicon from "../shared/assets/favicon.png";

/* exported component */

export const App = () => {
    return (
        <div className={css.app}>
            <Helmet defaultTitle="Atoll" titleTemplate="Atoll – %s" link={[{ rel: "icon", type: "image/png", href: favicon }]} />
            <TopMenuPanel />
        </div>
    );
};
