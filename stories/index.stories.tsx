import React from "react";

import { addDecorator, addParameters, storiesOf, forceReRender } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { linkTo } from "@storybook/addon-links";
import { withRootAttribute } from "storybook-addon-root-attribute";

import { EditButton } from "@atoll/shared";
import { EditIcon } from "@atoll/shared";
import { SimpleButton } from "@atoll/shared";
import { SimpleText } from "@atoll/shared";
import { HomeButton } from "@atoll/shared";
import { HamburgerIcon } from "@atoll/shared";
import { TabStrip } from "@atoll/shared";
import { BacklogItemCard, BacklogItemTypeEnum } from "@atoll/shared";
import { EditMode } from "@atoll/shared";

addDecorator(withRootAttribute);
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

storiesOf("Atoms/Font Sizes", module).add("Font Sizes", () => (
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

storiesOf("Molecules/Buttons/HomeButton", module)
    .add("HomeButton (default)", () => <HomeButton onClick={action("clicked")} />)
    .add("HomeButton (hover)", () => <HomeButton forceStateHover onClick={action("clicked")} />)
    .add("HomeButton (active)", () => <HomeButton forceStateActive onClick={action("clicked")} />)
    .add("HomeButton (focus)", () => <HomeButton forceStateFocus onClick={action("clicked")} />);

storiesOf("Atoms/Buttons/SimpleButton", module)
    .add("SimpleButton (Menu w/o caption)", () => <SimpleButton icon={<HamburgerIcon />} onClick={action("clicked menu")} />)
    .add("SimpleButton (Menu with caption)", () => (
        <SimpleButton icon={<HamburgerIcon />} onClick={action("clicked menu")}>
            Menu
        </SimpleButton>
    ))
    .add("SimpleButton (Edit w/o caption)", () => <SimpleButton iconOnLeft icon={<EditIcon />} onClick={action("clicked menu")} />)
    .add("SimpleButton (Edit)", () => (
        <SimpleButton iconOnLeft icon={<EditIcon />} onClick={action("clicked edit")}>
            Edit
        </SimpleButton>
    ));

let activeTabId = "plan";

storiesOf("Atoms/Tabs/TabStrip", module).add("TabStrip", () => (
    <div>
        <TabStrip
            activeTab={activeTabId}
            tabs={[
                { id: "plan", caption: "Plan" },
                { id: "sprint", caption: "Sprint" },
                { id: "review", caption: "Review" }
            ]}
            onChange={(tabId) => {
                activeTabId = tabId;
                console.log(`TAB CHANGE TO ${tabId}`);
                forceReRender();
            }}
        />
    </div>
));

storiesOf("Molecules/Cards/BacklogItemCard", module)
    .add("BacklogItemCard (story)", () => (
        <div>
            <BacklogItemCard itemId="123" itemType={BacklogItemTypeEnum.Story} titleText="Example story" estimate={5} />
        </div>
    ))
    .add("BacklogItemCard (bug)", () => (
        <div>
            <BacklogItemCard itemId="456" itemType={BacklogItemTypeEnum.Bug} titleText="Example bug" estimate={null} />
        </div>
    ));

storiesOf("Molecules/Buttons/EditButton", module)
    .add("EditButton (view mode)", () => (
        <div>
            <EditButton
                mode={EditMode.VIEW}
                onClick={() => {
                    alert("clicked");
                }}
            />
        </div>
    ))
    .add("EditButton (edit mode)", () => (
        <div>
            <EditButton
                mode={EditMode.EDIT}
                onClick={() => {
                    alert("clicked");
                }}
            />
        </div>
    ));
