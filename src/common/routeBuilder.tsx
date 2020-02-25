// externals
import React from "react";
import { Switch, Route } from "react-router-dom";
import { ConfigureFlopFlip } from "@flopflip/react-redux";

// libraries
import { flopFlipAdapter } from "@atoll/shared";

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

export const buildRoutes = () => (
    <IntlProvider>
        <ConfigureFlopFlip adapter={flopFlipAdapter} adapterArgs={{ clientSideId: null, user: null }}>
            {({ isAdapterReady }) => (isAdapterReady ? appRoutes : <div>LOADING...</div>)}
        </ConfigureFlopFlip>
    </IntlProvider>
);
