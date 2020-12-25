// externals
import * as React from "react";
import * as express from "express";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { Store } from "redux";
import { Provider } from "react-redux";

// libraries
import {
    FeatureTogglesState,
    StateTree,
    buildFeatureTogglesList,
    getAssetPortOverride,
    initConfig,
    remapAssetPath
} from "@atoll/shared";

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

const serverRenderer: any = () => (req: express.Request & { store: Store }, res: express.Response, next: express.NextFunction) => {
    const port = getAssetPortOverride();
    let hostAndPort = req.headers.host; // e.g. "192.168.9.1:8500"
    const lastIdx = hostAndPort.lastIndexOf(":");
    if (lastIdx >= 0 && hostAndPort.length - lastIdx > 5 && port) {
        hostAndPort += `:${port}`;
    }
    initConfig({ getDocumentLocHref: () => `http://${hostAndPort}${req.url}` });
    //    const apiBaseUrl = getApiBaseUrl();
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

        const sharedBundleCss = res.locals.assetPath("shared-bundle.css");
        const sharedBundleCssPath = remapAssetPath(sharedBundleCss);
        const bundleJsPath = remapAssetPath(res.locals.assetPath("bundle.js"));
        const idx = bundleJsPath.lastIndexOf("/");
        const basePath = idx < 0 ? bundleJsPath : bundleJsPath.substr(0, idx);
        const favIconPath = `${basePath}/favicon.png`;

        return res.send(
            "<!doctype html>" +
                renderToString(
                    <Html
                        css={[
                            sharedBundleCssPath,
                            remapAssetPath(res.locals.assetPath("bundle.css")),
                            remapAssetPath(res.locals.assetPath("vendor.css"))
                        ]}
                        scripts={[bundleJsPath, remapAssetPath(res.locals.assetPath("vendor.js"))]}
                        favIcon={favIconPath}
                        state={state}
                        language={locale}
                        toggles={buildFeatureTogglesList(featureToggles?.toggles)}
                    >
                        {content}
                    </Html>
                )
        );
    }
};

export default serverRenderer;
