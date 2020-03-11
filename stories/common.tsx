// externals
import React from "react";

interface ContainerProps {
    icon: any;
    isInverted?: boolean;
}

export const SingleIconContainer = ({ icon, isInverted }: ContainerProps) => (
    <div className={`padded-container ${isInverted ? "inverted-container" : ""}`}>
        <div className="icon">
            {icon}
            <div className="caption">1x</div>
        </div>
        <div className="icon x2">
            {icon}
            <div className="caption">2x</div>
        </div>
        <div className="icon x4">
            {icon}
            <div className="caption">4x</div>
        </div>
    </div>
);

export const SideBySideIconContainers = ({ icon, invertedIcon }) => (
    <div>
        <div className="side-by-side-containers">
            <SingleIconContainer icon={icon} />
            <SingleIconContainer icon={invertedIcon} isInverted />
        </div>
    </div>
);
