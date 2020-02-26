// externals
import React from "react";
import { Switch, Route } from "react-router-dom";
import { ConfigureFlopFlip } from "@flopflip/react-broadcast";
import adapter from "@flopflip/memory-adapter";

// components
import { IntlProvider, AppContainer, PlanViewContainer, SprintViewContainer, ReviewViewContainer, layouts } from "@atoll/shared";

const appRoutes = (
    <layouts.MainLayout>
        <AppContainer>
            <Switch>
                <Route path="/" exact component={PlanViewContainer} />
                <Route path="/plan" exact component={PlanViewContainer} />
                <Route path="/sprint" exact component={SprintViewContainer} />
                <Route path="/review" exact component={ReviewViewContainer} />
            </Switch>
        </AppContainer>
    </layouts.MainLayout>
);

const getDefaultFlags = (windowObj: any, forSsr: boolean) => {
    if (forSsr) {
        return { showEditButton: false };
    } else {
        return (windowObj as any).__TOGGLES__;
    }
};

export const buildRoutes = (windowObj: any, forSsr: boolean) => (
    <IntlProvider>
        <ConfigureFlopFlip
            adapter={adapter}
            adapterArgs={{ clientSideId: null, user: null }}
            defaultFlags={getDefaultFlags(windowObj, forSsr)}
        >
            {({ isAdapterReady }) => (isAdapterReady ? appRoutes : <div>LOADING...</div>)}
        </ConfigureFlopFlip>
    </IntlProvider>
);

export const buildRoutesForServer = () => buildRoutes({}, true);

export const buildRoutesForClient = (windowObj: any) => buildRoutes(windowObj, false);
