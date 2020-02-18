// externals
import * as React from "react";
import * as express from "express";
import { renderToString } from "react-dom/server";
import { StaticRouter, Switch, Route } from "react-router-dom";
import { Store } from "redux";
import { Provider } from "react-redux";

// libraries
import { IntlProvider, SprintViewContainer } from "@atoll/shared";
import { App } from "@atoll/shared";
import { layouts } from "@atoll/shared";

// components
import Html from "../components/HTML";

const { MainLayout } = layouts;

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
    if (req.path.startsWith("/api/")) {
        next();
    } else {
        const content = renderToString(
            <Provider store={res.locals.store}>
                <StaticRouter location={req.url} context={{}}>
                    <IntlProvider>
                        <MainLayout>
                            <Switch>
                                <Route path="/" exact component={App} />
                                <Route path="/plan" exact component={App} />
                                <Route path="/sprint" exact component={SprintViewContainer} />
                            </Switch>
                        </MainLayout>
                    </IntlProvider>
                </StaticRouter>
            </Provider>
        );

        const oldState = res.locals.store.getState();
        const locale = mapAcceptLanguageToLocale(req.headers["accept-language"]); // res.locals.language;
        console.log("locale: " + locale);
        const newApp = { ...oldState.app, locale };
        const newState = { ...oldState, app: newApp };
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
                    >
                        {content}
                    </Html>
                )
        );
    }
};

export default serverRenderer;
