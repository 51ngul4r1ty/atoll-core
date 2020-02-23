// externals
import React from "react";
import { Switch, Route } from "react-router-dom";

// components
import { IntlProvider, AppContainer, PlanViewContainer, SprintViewContainer, ReviewViewContainer, layouts } from "@atoll/shared";

export const buildRoutes = () => (
    <IntlProvider>
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
    </IntlProvider>
);
