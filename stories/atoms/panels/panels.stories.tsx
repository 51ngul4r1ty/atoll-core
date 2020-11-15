/* eslint-disable security/detect-object-injection */
// externals
import React from "react";

// storybook
import { storiesOf } from "@storybook/react";

// components
import { CaretPosition, ItemMenuPanel, RemoveButton } from "@atoll/shared";

// common
import "../../storybook";

storiesOf("Atoms|Panels", module)
    .add("ItemMenuPanel (caret top-center)", () => (
        <ItemMenuPanel
            className="item-menu-panel caret-top-center"
            caretPosition={CaretPosition.TopCenter}
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
    ))
    .add("ItemMenuPanel (caret right-top)", () => (
        <ItemMenuPanel
            className="item-menu-panel caret-right-top"
            caretPosition={CaretPosition.RightTop}
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
