// externals
import React from "react";
import { Provider } from "react-redux";

// mock data
import configureStore from "redux-mock-store";

// storybook
import { storiesOf } from "@storybook/react";
import { number, text, select, boolean } from "@storybook/addon-knobs";

// components
import {
    LoginForm,
    BacklogItemDetailForm,
    BacklogItemPlanningPanel,
    BacklogItemWithSource,
    BacklogItemType,
    BacklogItemSource,
    EditMode
} from "@atoll/shared";

const mockStore = configureStore();
const store = mockStore({});

const bugStoryPhrase = "Filter seems to be taking longer & longer (investigate)";

storiesOf("Organisms|Forms/BacklogItemDetailForm", module)
    .add("BacklogItemDetailForm (issue)", () => (
        <div>
            <BacklogItemDetailForm
                type={select("type", ["issue", "story"], "issue")}
                estimate={number("estimate", 13)}
                externalId={text("externalId", "B1000032")}
                rolePhrase={text("rolePhrase", null)}
                storyPhrase={text("storyPhrase", bugStoryPhrase)}
                reasonPhrase={text("reasonPhrase", null)}
                editing={boolean("editing", false)}
                instanceId={number("instanceId", 1)}
            />
        </div>
    ))
    .add("BacklogItemDetailForm (story)", () => (
        <div>
            <BacklogItemDetailForm
                type={select("type", ["issue", "story"], "story")}
                estimate={number("estimate", 8)}
                externalId={text("externalId", "527")}
                rolePhrase={text("rolePhrase", "as a developer")}
                storyPhrase={text("storyPhrase", "use the v3 api to sign up a user")}
                reasonPhrase={text("reasonPhrase", "to allow for automation or a customized experience")}
                editing={boolean("editing", false)}
                instanceId={number("instanceId", 2)}
            />
        </div>
    ))
    .add("BacklogItemDetailForm Mobile (story)", () => (
        <div>
            <BacklogItemDetailForm
                type={select("type", ["issue", "story"], "story")}
                estimate={number("estimate", 8)}
                externalId={text("externalId", "527")}
                rolePhrase={text("rolePhrase", "as a developer")}
                storyPhrase={text("storyPhrase", "use the v3 api to sign up a user")}
                reasonPhrase={text("reasonPhrase", "to allow for automation or a customized experience")}
                editing={boolean("editing", false)}
                instanceId={number("instanceId", 2)}
                renderMobile
            />
        </div>
    ));

const allItems: BacklogItemWithSource[] = [
    {
        createdAt: undefined,
        estimate: null,
        externalId: "id-1",
        id: "db-id-1",
        reasonPhrase: null,
        rolePhrase: "As a developer",
        storyPhrase: "I can retrieve all backlog items",
        type: "story",
        saved: true,
        source: BacklogItemSource.Loaded
    },
    {
        createdAt: undefined,
        estimate: null,
        externalId: "p-x",
        id: "db-pushed-id-x",
        reasonPhrase: null,
        rolePhrase: null,
        storyPhrase: "Pushed item",
        type: "story",
        saved: true,
        source: BacklogItemSource.Pushed
    },
    {
        createdAt: undefined,
        estimate: null,
        externalId: "id-2",
        id: "db-id-2",
        reasonPhrase: null,
        rolePhrase: "As a developer",
        storyPhrase: "I can add a new backlog item",
        type: "story",
        saved: true,
        source: BacklogItemSource.Loaded
    },
    {
        createdAt: undefined,
        estimate: null,
        externalId: "id-3",
        id: "db-id-3",
        reasonPhrase: null,
        rolePhrase: "As a developer",
        storyPhrase: "I can delete a backlog item",
        type: "story",
        saved: true,
        source: BacklogItemSource.Loaded
    },
    {
        createdAt: undefined,
        estimate: null,
        externalId: "id-4",
        id: "db-id-4",
        reasonPhrase: null,
        rolePhrase: "As a developer",
        storyPhrase: "I can filter the list of backlog items",
        type: "story",
        saved: true,
        source: BacklogItemSource.Loaded
    }
];

for (let i = 5; i <= 50; i++) {
    allItems.push({
        createdAt: undefined,
        estimate: null,
        externalId: `id-${i}`,
        id: `db-id-${i}`,
        reasonPhrase: null,
        rolePhrase: "As a developer",
        storyPhrase: `I can filter the list of backlog items (${i})`,
        type: "story",
        saved: true,
        source: BacklogItemSource.Loaded
    });
}

storiesOf("Organisms|Panels/BacklogItemPlanningPanel", module).add("BacklogItemPlanningPanel", () => (
    <div>
        <Provider store={store}>
            <BacklogItemPlanningPanel
                allItems={allItems}
                editMode={EditMode.Edit}
                onAddNewBacklogItem={() => {
                    alert("add new backlog item");
                }}
                onReorderBacklogItems={() => {
                    alert("re-order backlog items");
                }}
            />
        </Provider>
    </div>
));

storiesOf("Organisms|Forms/LoginForm", module).add("LoginForm", () => (
    <div>
        <LoginForm
            type={select("type", ["issue", "story"], "issue")}
            estimate={number("estimate", 13)}
            externalId={text("externalId", "B1000032")}
            rolePhrase={text("rolePhrase", null)}
            storyPhrase={text("storyPhrase", bugStoryPhrase)}
            reasonPhrase={text("reasonPhrase", null)}
            editing={boolean("editing", false)}
            instanceId={number("instanceId", 1)}
        />
    </div>
));
