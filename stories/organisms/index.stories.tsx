// externals
import React from "react";

// storybook
import { storiesOf } from "@storybook/react";
import { number, text, select, boolean } from "@storybook/addon-knobs";

// components
import { BacklogItemDetailForm } from "@atoll/shared";

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
    ));
