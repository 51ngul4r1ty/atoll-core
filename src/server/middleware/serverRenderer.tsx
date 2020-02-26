// externals
import * as React from "react";
import * as express from "express";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { Store } from "redux";
import { Provider } from "react-redux";

// libraries
import { FeatureTogglesState, StateTree } from "@atoll/shared";

// components
import Html from "../components/HTML";

// utils
import { buildRoutesForServer } from "../../common/routeBuilder";

// consts/enums
import { FEATURE_TOGGLE_LIST } from "../api/data/featureToggles";

type Locale = "en_US" | "de_DE" | "default";

const mapAcceptLanguageToLocale = (acceptLanguage: string): Locale => {
    // something like: en-US,en;q=0.9
    let language = "";
    console.log("language: " + acceptLanguage);
    if (acceptLanguage) {
        const splitLang = acceptLanguage.split(",");
        if (splitLang.length) {
            language = splitLang[0];
        } else {
            language = acceptLanguage;
        }
    }
    switch (language) {
        case "en":
        case "en-US":
            return "en_US";
        case "de":
        case "de-DE":
            return "de_DE";
        default:
            return "default";
    }
};

const buildFeatureTogglesList = (featureToggles: FeatureTogglesState) => {
    const result = {};
    Object.keys(featureToggles.toggles).forEach((key) => {
        const value = featureToggles.toggles[key];
        result[key] = value.enabled;
    });
    return result;
};

const serverRenderer: any = () => (req: express.Request & { store: Store }, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith("/api/")) {
        next();
    } else {
        const content = renderToString(
            <Provider store={res.locals.store}>
                <StaticRouter location={req.url} context={{}}>
                    {buildRoutesForServer()}
                </StaticRouter>
            </Provider>
        );

        const oldState = res.locals.store.getState();
        const locale = mapAcceptLanguageToLocale(req.headers["accept-language"]); // res.locals.language;
        console.log("locale: " + locale);
        const featureToggles: FeatureTogglesState = {
            toggles: FEATURE_TOGGLE_LIST
        };
        const newApp = { ...oldState.app, locale };
        const newState: StateTree = { ...oldState, app: newApp, featureToggles };
        const state = JSON.stringify(newState);

        return res.send(
            "<!doctype html>" +
                renderToString(
                    <Html
                        css={[
                            res.locals.assetPath("shared-bundle.css"),
                            res.locals.assetPath("bundle.css"),
                            res.locals.assetPath("vendor.css")
                        ]}
                        scripts={[res.locals.assetPath("bundle.js"), res.locals.assetPath("vendor.js")]}
                        state={state}
                        language={locale}
                        toggles={buildFeatureTogglesList(featureToggles)}
                    >
                        {content}
                    </Html>
                )
        );
    }
};

export default serverRenderer;
