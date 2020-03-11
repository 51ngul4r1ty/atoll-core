// externals
import React from "react";
import { addDecorator, addParameters, storiesOf, forceReRender } from "@storybook/react";

// storybook
import { action } from "@storybook/addon-actions";
import { withKnobs, text, select, number } from "@storybook/addon-knobs";
// import { linkTo } from "@storybook/addon-links";
import { withRootAttribute } from "storybook-addon-root-attribute";

// components
import {
    AddButton,
    EditButton,
    AddIcon,
    EditIcon,
    SimpleButton,
    SimpleText,
    HomeButton,
    HamburgerIcon,
    TabStrip,
    BacklogItemCard,
    BacklogItemTypeEnum,
    EditMode,
    BacklogItemDetailForm
} from "@atoll/shared";

addDecorator(withRootAttribute);
addDecorator(withKnobs);
addParameters({
    rootAttribute: {
        root: "html",
        attribute: "class",
        defaultState: {
            name: "Default",
            value: "theme-default"
        },
        states: [
            {
                name: "Dark",
                value: "theme-dark"
            }
        ]
    }
});

storiesOf("Atoms|Font Sizes", module).add("Font Sizes", () => (
    <div>
        <h1>Font Sizes</h1>
        <ul>
            <li>
                <SimpleText size="xsmall">Extra Small</SimpleText>
            </li>
            <li>
                <SimpleText size="small">Small</SimpleText>
            </li>
            <li>
                <SimpleText size="medium">Medium</SimpleText>
            </li>
            <li>
                <SimpleText size="large">Large</SimpleText>
            </li>
            <li>
                <SimpleText size="xlarge">Extra Large</SimpleText>
            </li>
        </ul>
    </div>
));

storiesOf("Molecules|Buttons/HomeButton", module)
    .add("HomeButton (default)", () => <HomeButton onClick={action("clicked")} />)
    .add("HomeButton (hover)", () => <HomeButton forceStateHover onClick={action("clicked")} />)
    .add("HomeButton (active)", () => <HomeButton forceStateActive onClick={action("clicked")} />)
    .add("HomeButton (focus)", () => <HomeButton forceStateFocus onClick={action("clicked")} />);

storiesOf("Atoms|Buttons/SimpleButton", module)
    .add("SimpleButton (Menu w/o caption)", () => <SimpleButton icon={<HamburgerIcon />} onClick={action("clicked menu")} />)
    .add("SimpleButton (Menu with caption)", () => (
        <SimpleButton icon={<HamburgerIcon />} onClick={action("clicked menu")}>
            {text("(children)", "Menu")}
        </SimpleButton>
    ))
    .add("SimpleButton (Edit w/o caption)", () => <SimpleButton iconOnLeft icon={<EditIcon />} onClick={action("clicked menu")} />)
    .add("SimpleButton (Edit)", () => (
        <SimpleButton iconOnLeft icon={<EditIcon />} onClick={action("clicked edit")}>
            {text("(children)", "Edit")}
        </SimpleButton>
    ))
    .add("SimpleButton (Add)", () => (
        <SimpleButton iconOnLeft icon={<AddIcon />} onClick={action("clicked add")}>
            {text("(children)", "Add")}
        </SimpleButton>
    ));

let activeTabId = "plan";

storiesOf("Atoms|Tabs/TabStrip", module).add("TabStrip", () => (
    <div>
        <TabStrip
            activeTab={text("activeTab", activeTabId)}
            tabs={[
                { id: text("tabs[0].id", "plan"), caption: text("tabs[0].caption", "Plan") },
                { id: text("tabs[1].id", "sprint"), caption: text("tabs[1].caption", "Sprint") },
                { id: text("tabs[2].id", "review"), caption: text("tabs[2].caption", "Review") }
            ]}
            onChange={(tabId) => {
                activeTabId = tabId;
                forceReRender();
            }}
        />
    </div>
));

storiesOf("Molecules|Cards/BacklogItemCard", module)
    .add("BacklogItemCard (story)", () => (
        <div>
            <BacklogItemCard
                itemId={text("itemId", "123")}
                itemType={select(
                    "itemType",
                    { Story: BacklogItemTypeEnum.Story, Bug: BacklogItemTypeEnum.Bug },
                    BacklogItemTypeEnum.Story
                )}
                titleText={text("titleText", "Example story")}
                estimate={number("estimate", 5)}
            />
        </div>
    ))
    .add("BacklogItemCard (bug)", () => (
        <div>
            <BacklogItemCard
                itemId={text("itemId", "456")}
                itemType={select(
                    "itemType",
                    { Story: BacklogItemTypeEnum.Story, Bug: BacklogItemTypeEnum.Bug },
                    BacklogItemTypeEnum.Bug
                )}
                titleText={text("titleText", "Example bug")}
                estimate={number("estimate", null)}
            />
        </div>
    ))
    .add("BacklogItemCard (draggable)", () => (
        <div>
            <BacklogItemCard
                itemId={text("itemId", "456")}
                itemType={select(
                    "itemType",
                    { Story: BacklogItemTypeEnum.Story, Bug: BacklogItemTypeEnum.Bug },
                    BacklogItemTypeEnum.Bug
                )}
                titleText={text("titleText", "Example bug")}
                estimate={number("estimate", null)}
                isDraggable
            />
        </div>
    ));

storiesOf("Molecules|Buttons/EditButton", module)
    .add("EditButton (view mode)", () => (
        <div>
            <EditButton
                mode={select(
                    "mode",
                    {
                        View: EditMode.View,
                        Edit: EditMode.Edit
                    },
                    EditMode.View
                )}
                onClick={() => {
                    alert("clicked");
                }}
            />
        </div>
    ))
    .add("EditButton (edit mode)", () => (
        <div>
            <EditButton
                mode={select(
                    "mode",
                    {
                        View: EditMode.View,
                        Edit: EditMode.Edit
                    },
                    EditMode.Edit
                )}
                onClick={() => {
                    alert("clicked");
                }}
            />
        </div>
    ));

storiesOf("Molecules|Buttons/AddButton", module)
    .add("AddButton (story)", () => (
        <div>
            <AddButton
                itemName="Story"
                onClick={() => {
                    // eslint-disable-next-line no-alert
                    alert("add story clicked");
                }}
            />
        </div>
    ))
    .add("AddButton (bug)", () => (
        <div>
            <AddButton
                itemName="Bug"
                onClick={() => {
                    // eslint-disable-next-line no-alert
                    alert("add bug clicked");
                }}
            />
        </div>
    ));
