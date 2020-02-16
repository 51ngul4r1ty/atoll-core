import React from "react";
import { hydrate } from "react-dom";
import { Provider } from "react-redux";
import { Route, Switch } from "react-router-dom";
import { ConnectedRouter } from "connected-react-router";
import { configureStore } from "@atoll/shared";
import { App } from "@atoll/shared";
import { SprintViewContainer } from "@atoll/shared";
import { IntlProvider } from "@atoll/shared";
import { createClientHistory } from "@atoll/shared";
import { layouts } from "@atoll/shared";
import { storeHistoryInstance } from "@atoll/shared";

const { MainLayout } = layouts;

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
        <ConnectedRouter history={history}>
            <IntlProvider>
                <MainLayout>
                    <Switch>
                        <Route path="/" exact component={App} />
                        <Route path="/sprint" exact component={SprintViewContainer} />
                    </Switch>
                </MainLayout>
            </IntlProvider>
        </ConnectedRouter>
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
