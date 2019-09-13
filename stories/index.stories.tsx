import React from "react";

import { addDecorator, addParameters, storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { linkTo } from "@storybook/addon-links";
import { withRootAttribute } from "storybook-addon-root-attribute";

import { SimpleButton } from "@atoll/shared";
import { SimpleText } from "@atoll/shared";
import { HomeButton } from "@atoll/shared";
import { HamburgerIcon } from "@atoll/shared";

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

storiesOf("General", module).add("Font Sizes", () => (
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

storiesOf("Buttons/HomeButton", module)
    .add("HomeButton (default)", () => <HomeButton onClick={action("clicked")} />)
    .add("HomeButton (hover)", () => <HomeButton forceStateHover onClick={action("clicked")} />)
    .add("HomeButton (active)", () => <HomeButton forceStateActive onClick={action("clicked")} />)
    .add("HomeButton (focus)", () => <HomeButton forceStateFocus onClick={action("clicked")} />);

storiesOf("Buttons/SimpleButton", module).add("SimpleButton", () => (
    <SimpleButton icon={<HamburgerIcon />} onClick={action("clicked")}>
        Menu
    </SimpleButton>
));
