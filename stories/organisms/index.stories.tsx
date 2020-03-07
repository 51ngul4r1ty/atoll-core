// externals
import React from "react";

// storybook
import { storiesOf } from "@storybook/react";
import { number, text, select } from "@storybook/addon-knobs";

// components
import { UserStoryDetailForm } from "@atoll/shared";

const bugStoryPhrase = "Filter seems to be taking longer & longer (investigate)";

storiesOf("Organisms|Forms/UserStoryDetailForm", module)
    .add("UserStoryDetailForm (issue)", () => (
        <div>
            <UserStoryDetailForm
                type={select("type", ["issue", "story"], "issue")}
                estimate={number("estimate", 13)}
                externalId={text("externalId", "B1000032")}
                rolePhrase={text("rolePhrase", null)}
                storyPhrase={text("storyPhrase", bugStoryPhrase)}
                reasonPhrase={text("reasonPhrase", null)}
            />
        </div>
    ))
    .add("UserStoryDetailForm (story)", () => (
        <div>
            <UserStoryDetailForm
                estimate={number("estimate", 8)}
                externalId={text("externalId", "527")}
                rolePhrase={text("rolePhrase", "as a developer")}
                storyPhrase={text("storyPhrase", "use the v3 api to sign up a user")}
                reasonPhrase={text("reasonPhrase", "to allow for automation or a customized experience")}
            />
        </div>
    ));
