// externals
import * as React from "react";

// images
import { AppIcon } from "../images/AppIcon";

// consts/enums
import { APP_NAME } from "../../constants";

// style
import css from "./HomeButton.module.css";

/* exported interfaces/types */

export interface HomeButtonAttributeProps {}

export interface HomeButtonEventProps {
    forceStateActive?: boolean;
    forceStateFocus?: boolean;
    forceStateHover?: boolean;
    onClick?: { () };
}

export type HomeButtonProps = HomeButtonAttributeProps & HomeButtonEventProps;

/* exported components */

export const HomeButton: React.FC<HomeButtonProps> = (props) => {
    let className = css.button;
    if (props.forceStateActive) {
        className += ` ${css.buttonActive}`;
    }
    if (props.forceStateFocus) {
        className += ` ${css.buttonFocus}`;
    }
    if (props.forceStateHover) {
        className += ` ${css.buttonHover}`;
    }
    return (
        <div
            className={className}
            tabIndex={0}
            onClick={() => {
                if (props.onClick) {
                    props.onClick();
                }
            }}
        >
            <div className={css.buttonIcon}>
                <AppIcon invertColors={true} />
            </div>
            <div className={css.buttonCaption}>{APP_NAME}</div>
        </div>
    );
};
