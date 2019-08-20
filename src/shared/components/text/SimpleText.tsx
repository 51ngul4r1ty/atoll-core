// externals
import * as React from "react";

// style
import css from "./SimpleText.module.css";

/* exported interfaces/types */

export type FontSize = "xsmall" | "small" | "medium" | "large" | "xlarge";

export interface SimpleTextAttributeProps {
    size: FontSize;
}

export interface SimpleTextEventProps {}

export type SimpleTextProps = SimpleTextAttributeProps & SimpleTextEventProps;

/* exported components */

export const SimpleText: React.FC<SimpleTextProps> = (props) => {
    let className: string;
    switch (props.size) {
        case "xsmall": {
            className = css.xsmall;
            break;
        }
        case "small": {
            className = css.small;
            break;
        }
        case "medium": {
            className = css.medium;
            break;
        }
        case "large": {
            className = css.large;
            break;
        }
        case "xlarge": {
            className = css.xlarge;
            break;
        }
        default: {
            className = css.medium;
            break;
        }
    }
    return <span className={className}>{props.children}</span>;
};
