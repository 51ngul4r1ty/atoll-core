import * as React from 'react';

import scss from './SimpleButton.module.scss';

export interface SimpleButtonAttributeProps {
    icon?: any; // TODO: Define type
}

export interface SimpleButtonDispatchProps {
    onClick: { () }
}

export type SimpleButtonProps = SimpleButtonAttributeProps & SimpleButtonDispatchProps;

export const SimpleButton: React.FC<SimpleButtonProps> = (props) => {
    const icon = props.icon && (
        <div className={scss.buttonIcon}>
            {props.icon}
        </div>
    );
    return (
        <div className={scss.button} tabIndex={0} onClick={props.onClick}>
            <div className={scss.buttonCaption}>
                {props.children}
            </div>
            {icon}
        </div>
    )
};
