/* eslint-disable security/detect-object-injection */
// externals
import React from "react";

// storybook
import { storiesOf } from "@storybook/react";

// components
import { ItemMenuPanel, RemoveButton } from "@atoll/shared";

// common
import "../../storybook";

storiesOf("Atoms|Panels", module).add("ItemMenuPanel", () => (
    <ItemMenuPanel
        onClose={() => {
            alert("close triggered");
        }}
    >
        <RemoveButton
            onClick={() => {
                alert("remove clicked");
            }}
        />
    </ItemMenuPanel>
));
