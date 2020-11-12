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
    BacklogItemDetailForm,
    BacklogItemPlanningPanel,
    BacklogItemWithSource,
    EditMode,
    LoginForm,
    PushState,
    Source,
    SprintPanel,
    SprintPlanningPanel,
    SprintStatus
} from "@atoll/shared";

const mockStore = configureStore();
const store = mockStore({});

const bugStoryPhrase = "Filter seems to be taking longer & longer (investigate)";

storiesOf("Organisms|Forms/BacklogItemDetailForm", module)
    .add("BacklogItemDetailForm (issue)", () => (
        <div>
            <BacklogItemDetailForm
                id="1"
                type={select("type", ["issue", "story"], "issue")}
                estimate={number("estimate", 13)}
                friendlyId={text("friendlyId", "i-42")}
                friendlyIdDisabled={boolean("disabled", false)}
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
                id="2"
                type={select("type", ["issue", "story"], "story")}
                estimate={number("estimate", 8)}
                friendlyId={text("friendlyId", "s-19")}
                friendlyIdDisabled={boolean("disabled", false)}
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
                id="3"
                type={select("type", ["issue", "story"], "story")}
                estimate={number("estimate", 8)}
                friendlyId={text("friendlyId", "s-19")}
                friendlyIdDisabled={boolean("disabled", false)}
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
        updatedAt: undefined,
        estimate: null,
        friendlyId: "s-1",
        externalId: "id-1",
        id: "db-id-1",
        projectId: "project-1",
        reasonPhrase: null,
        rolePhrase: "As a developer",
        storyPhrase: "I can retrieve all backlog items",
        type: "story",
        saved: true,
        source: Source.Loaded
    },
    {
        createdAt: undefined,
        updatedAt: undefined,
        estimate: null,
        friendlyId: "s-2",
        externalId: "p-x",
        id: "db-pushed-id-x",
        projectId: "project-1",
        reasonPhrase: null,
        rolePhrase: null,
        storyPhrase: "Pushed item",
        type: "story",
        saved: true,
        source: Source.Pushed
    },
    {
        createdAt: undefined,
        updatedAt: undefined,
        estimate: null,
        friendlyId: "s-3",
        externalId: "id-2",
        id: "db-id-2",
        projectId: "project-1",
        reasonPhrase: null,
        rolePhrase: "As a developer",
        storyPhrase: "I can add a new backlog item",
        type: "story",
        saved: true,
        source: Source.Loaded
    },
    {
        createdAt: undefined,
        updatedAt: undefined,
        estimate: null,
        friendlyId: "s-4",
        externalId: "id-3",
        id: "db-id-3",
        projectId: "project-1",
        reasonPhrase: null,
        rolePhrase: "As a developer",
        storyPhrase: "I can delete a backlog item",
        type: "story",
        saved: true,
        source: Source.Loaded,
        pushState: PushState.Changed
    },
    {
        createdAt: undefined,
        updatedAt: undefined,
        estimate: null,
        friendlyId: "s-5",
        externalId: "id-4",
        id: "db-id-4",
        projectId: "project-1",
        reasonPhrase: null,
        rolePhrase: "As a developer",
        storyPhrase: "I can filter the list of backlog items",
        type: "story",
        saved: true,
        source: Source.Loaded,
        pushState: PushState.Removed
    }
];

for (let i = 5; i <= 50; i++) {
    allItems.push({
        createdAt: undefined,
        updatedAt: undefined,
        estimate: null,
        friendlyId: `s-${i}`,
        externalId: `id-${i}`,
        id: `db-id-${i}`,
        projectId: "project-1",
        reasonPhrase: null,
        rolePhrase: "As a developer",
        storyPhrase: `I can filter the list of backlog items (${i})`,
        type: "story",
        saved: true,
        source: Source.Loaded
    });
}

storiesOf("Organisms|Panels/SprintPanel", module).add("SprintPanel", () => (
    <div>
        <SprintPanel
            id="sprint-1"
            name="Sprint 1"
            startDate={new Date(2020, 9, 14)}
            finishDate={new Date(2020, 9, 27)}
            status={SprintStatus.InProgress}
            plannedPoints={23}
            acceptedPoints={5}
            velocityPoints={0}
            usedSplitPoints={0}
            remainingSplitPoints={0}
            backlogItemsLoaded={false}
            backlogItems={null}
            expanded={false}
            saved={true}
            editing={false}
            instanceId={null}
            editMode={EditMode.View}
            openedDetailMenuBacklogItemId={undefined}
            renderMobile={false}
            selectedProductBacklogItemCount={4}
            onExpandCollapse={(id, expand) => {}}
            onAddBacklogItem={() => {}}
            onDetailClicked={(backlogItemId: string) => {}}
            onMoveItemToBacklogClicked={(backlogItemId: string) => {}}
        />
    </div>
));

storiesOf("Organisms|Panels/SprintPlanningPanel", module).add("SprintPlanningPanel", () => (
    <div>
        <Provider store={store}>
            <SprintPlanningPanel
                editMode={EditMode.View}
                openedDetailMenuInfo={undefined}
                selectedProductBacklogItemCount={0}
                sprints={[
                    {
                        id: "sprint-1",
                        instanceId: 1,
                        name: "sprint name",
                        startDate: new Date(2020, 9, 14),
                        finishDate: new Date(2020, 9, 28),
                        status: SprintStatus.InProgress,
                        plannedPoints: 23,
                        acceptedPoints: 5,
                        velocityPoints: 20,
                        usedSplitPoints: 0,
                        remainingSplitPoints: 0,
                        backlogItemsLoaded: false,
                        backlogItems: null,
                        expanded: false,
                        saved: true,
                        editing: false
                    }
                ]}
                onExpandCollapse={undefined}
                onAddBacklogItem={undefined}
                onAddNewSprintAfter={undefined}
                onAddNewSprintBefore={undefined}
                onDetailClicked={undefined}
                onMoveItemToBacklogClicked={undefined}
            />
        </Provider>
    </div>
));

storiesOf("Organisms|Panels/BacklogItemPlanningPanel", module).add("BacklogItemPlanningPanel", () => (
    <div>
        <Provider store={store}>
            <BacklogItemPlanningPanel
                allItems={allItems}
                editMode={EditMode.Edit}
                onAddNewBacklogItemForm={() => {
                    alert("add new backlog item");
                }}
                onReorderBacklogItems={() => {
                    alert("re-order backlog items");
                }}
                openedDetailMenuBacklogItemId={null}
            />
        </Provider>
    </div>
));

storiesOf("Organisms|Forms/LoginForm", module).add("LoginForm", () => (
    <div>
        <LoginForm username="username" password="password" />
    </div>
));
