// externals
import React from "react";
import { Switch, Route } from "react-router-dom";
import { ConfigureFlopFlip } from "@flopflip/react-broadcast";
import adapter from "@flopflip/memory-adapter";

// components
import {
    AppContainer,
    ProductBacklogItemViewContainer,
    BacklogItemViewContainer,
    IntlProvider,
    LoginViewContainer,
    PlanViewContainer,
    ReviewViewContainer,
    SprintViewContainer,
    layouts,
    HOME_VIEW_ROUTE,
    PLAN_VIEW_ROUTE,
    SPRINT_VIEW_ROUTE,
    REVIEW_VIEW_ROUTE,
    DEBUG_PBI_VIEW_ROUTE,
    BACKLOGITEM_VIEW_ROUTE
} from "@atoll/shared";
import { ErrorBoundary } from "../client/errorBoundary";

const appRoutes = (
    <layouts.MainLayout>
        <AppContainer>
            <Switch>
                <Route path={HOME_VIEW_ROUTE} exact component={LoginViewContainer} />
                <Route path={PLAN_VIEW_ROUTE} exact component={PlanViewContainer} />
                <Route path={SPRINT_VIEW_ROUTE} exact component={SprintViewContainer} />
                <Route path={REVIEW_VIEW_ROUTE} exact component={ReviewViewContainer} />
                <Route path={DEBUG_PBI_VIEW_ROUTE} exact component={ProductBacklogItemViewContainer} />
                <Route path={BACKLOGITEM_VIEW_ROUTE} exact component={BacklogItemViewContainer} />
            </Switch>
        </AppContainer>
    </layouts.MainLayout>
);

const getDefaultFlags = (windowObj: any, forSsr: boolean) => {
    if (forSsr) {
        return { showEditButton: false };
    }
    return (windowObj as any).__TOGGLES__;
};

export const buildRoutes = (windowObj: any, forSsr: boolean) => (
    <ErrorBoundary>
        <IntlProvider>
            <ConfigureFlopFlip
                adapter={adapter as any}
                adapterArgs={{ clientSideId: null, user: null }}
                defaultFlags={getDefaultFlags(windowObj, forSsr)}
            >
                {({ isAdapterReady }) => (isAdapterReady ? appRoutes : <div>LOADING...</div>)}
            </ConfigureFlopFlip>
        </IntlProvider>
    </ErrorBoundary>
);

export const buildRoutesForServer = () => buildRoutes({}, true);

export const buildRoutesForClient = (windowObj: any) => buildRoutes(windowObj, false);
