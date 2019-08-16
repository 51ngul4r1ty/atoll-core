// externals
import * as React from "react";

// images
import { AppIcon } from "../images/AppIcon";

// consts/enums
import { APP_NAME } from "../../constants";

// style
import scss from "./HomeButton.module.css";

/* exported interfaces/types */

export interface HomeButtonAttributeProps {}

export interface HomeButtonEventProps {
    onClick: { () };
}

export type HomeButtonProps = HomeButtonAttributeProps & HomeButtonEventProps;

/* exported components */

export const HomeButton: React.FC<HomeButtonProps> = (props) => {
    return (
        <div className={scss.button} tabIndex={0} onClick={props.onClick}>
            <div className={scss.buttonIcon}>
                <AppIcon invertColors={true} />
            </div>
            <div className={scss.buttonCaption}>{APP_NAME}</div>
        </div>
    );
};
