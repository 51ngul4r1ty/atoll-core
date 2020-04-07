// externals
import React from "react";
import { hydrate } from "react-dom";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";

// libraries
import { configureStore, createClientHistory, storeHistoryInstance, initConfig } from "@atoll/shared";

// utils
import { buildRoutesForClient } from "../common/routeBuilder";

const history = createClientHistory();
storeHistoryInstance(history);

initConfig({ getDocumentLocHref: () => document.location.href });

const preloadedState = window.__PRELOADED_STATE__;
const preloadedAppState = preloadedState?.app;

// Create/use the store
// history MUST be passed here if you want syncing between server on initial route
const store =
    window.store ||
    configureStore({
        initialState: { ...window.__PRELOADED_STATE__, app: { ...preloadedAppState, executingOnClient: true } },
        history,
        middleware: []
    });

hydrate(
    <Provider store={store}>
        <ConnectedRouter history={history}>{buildRoutesForClient(window)}</ConnectedRouter>
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
