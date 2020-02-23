// externals
import React from "react";
import { hydrate } from "react-dom";
import { Provider } from "react-redux";
import { Route, Switch } from "react-router-dom";
import { ConnectedRouter } from "connected-react-router";

// utils
import { configureStore } from "@atoll/shared";
import { createClientHistory } from "@atoll/shared";
import { storeHistoryInstance } from "@atoll/shared";

// components
import { PlanViewContainer, ReviewViewContainer, SprintViewContainer } from "@atoll/shared";
import { IntlProvider } from "@atoll/shared";

// layouts
import { layouts } from "@atoll/shared";

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
                        <Route path="/" exact component={PlanViewContainer} />
                        <Route path="/plan" exact component={PlanViewContainer} />
                        <Route path="/sprint" exact component={SprintViewContainer} />
                        <Route path="/review" exact component={ReviewViewContainer} />
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
