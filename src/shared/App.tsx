// externals
import React from "react";
import Helmet from "react-helmet";

// libraries
import { themeList } from "../shared/themes/all";

// components
import { TopMenuPanel } from "./components/panels/TopMenuPanel";

// style
import css from "./App.module.css";

// images
import favicon from "../shared/assets/favicon.png";

/* exported component */

export class App extends React.Component<{}, {}> {
    private lastThemeName: string;
    constructor(props) {
        super(props);
        this.lastThemeName = null;
    }
    componentDidMount() {
        window.addEventListener("load", () => {
            this.themeEngineSetup();
        });
    }
    getThemeAttribute() {
        const prefix = "theme-";
        let result = null;
        let html = document.querySelector("html");
        html.classList.forEach((item) => {
            if (item.indexOf(prefix) === 0) {
                const themeName = item.substr(prefix.length);
                result = themeName;
            }
        });
        if (!result) {
            result = "default";
        }
        return result;
    }
    setThemeVars(themeName) {
        switch (themeName) {
            case "default":
            case "dark": {
                this.addBodyStylesForTheme(themeName);
                break;
            }
            default: {
                break;
            }
        }
    }
    addBodyStylesForTheme(themeName) {
        const bodyStyles = document.body.style;
        const theme = this.getTheme(themeName);
        for (var propName in theme) {
            var propValue = theme[propName];
            bodyStyles.setProperty(propName, propValue);
        }
    }
    getTheme(themeName) {
        var items = themeList.filter((item) => item.name === themeName);
        if (items.length) {
            return items[0] && items[0].theme;
        } else {
            return null;
        }
    }
    themeEngineSetup() {
        const themeName = this.getThemeAttribute();
        this.setThemeVars(themeName);
        this.setupNextCheck();
    }
    setupNextCheck() {
        setTimeout(() => {
            this.checkForThemeChange();
        }, 500);
    }
    checkForThemeChange() {
        const themeName = this.getThemeAttribute();
        if (themeName !== this.lastThemeName) {
            this.setThemeVars(themeName);
            this.storeLastThemeName(themeName);
        }
        this.setupNextCheck();
    }
    storeLastThemeName(themeName: string) {
        this.lastThemeName = themeName;
    }
    render() {
        return (
            <div className={css.app}>
                <Helmet
                    defaultTitle="Atoll"
                    titleTemplate="Atoll – %s"
                    link={[{ rel: "icon", type: "image/png", href: favicon }]}
                />
                <TopMenuPanel />
            </div>
        );
    }
}
