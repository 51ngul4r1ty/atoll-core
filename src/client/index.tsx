// externals
import React from "react";
import { hydrate } from "react-dom";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";

// libraries
import { configureStore, createClientHistory, storeHistoryInstance } from "@atoll/shared";

// utils
import { buildRoutes } from "../common/routeBuilder";

const history = createClientHistory();
storeHistoryInstance(history);

// Create/use the store
// history MUST be passed here if you want syncing between server on initial route
const store =
    window.store ||
    configureStore({
        initialState: window.__PRELOADED_STATE__,
        history,
        middleware: []
    });

hydrate(
    <Provider store={store}>
        <ConnectedRouter history={history}>{buildRoutes()}</ConnectedRouter>
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
