import React from "react";
import { hydrate } from "react-dom";
import { Provider } from "react-redux";
import { Router, Switch, Route } from "react-router-dom";
import { configureStore } from "@atoll/shared";
import { App } from "@atoll/shared";
//import { IntlProvider } from "@atoll/shared";
import { createHistory } from "@atoll/shared";
import { layouts } from "@atoll/shared";

const { MainLayout } = layouts;

const history = createHistory();

// Create/use the store
// history MUST be passed here if you want syncing between server on initial route
const store =
    window.store ||
    configureStore({
        initialState: window.__PRELOADED_STATE__
    });

hydrate(
    <Provider store={store}>
        <Router history={history}>
            {/* <IntlProvider> */}
            <MainLayout>
                <Switch>
                    <Route path="/" exact component={App} />
                </Switch>
            </MainLayout>
            {/* </IntlProvider> */}
        </Router>
    </Provider>,
    document.getElementById("app")
);

if (process.env.NODE_ENV === "development") {
    if (module.hot) {
        module.hot.accept();
    }

    if (!window.store) {
        window.store = store;
    }
}
