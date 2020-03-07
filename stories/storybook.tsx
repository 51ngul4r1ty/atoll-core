// externals
import { addDecorator, addParameters } from "@storybook/react";

// storybook
import { withKnobs } from "@storybook/addon-knobs";
import { withRootAttribute } from "storybook-addon-root-attribute";

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
