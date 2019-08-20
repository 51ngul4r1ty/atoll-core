import * as React from "react";

import css from "./AppIcon.module.css";

interface AppIconProps {
    className?: string;
    invertColors?: boolean;
}

export const AppIcon: React.FC<AppIconProps> = (props) => {
    const fillClass = props.invertColors ? css.fillInverted : css.fill;
    const strokeClass = props.invertColors ? css.strokeInverted : css.stroke;
    return (
        <svg
            className={props.className}
            fill="none"
            fillRule="evenodd"
            stroke="black"
            strokeWidth="0.501"
            strokeLinejoin="bevel"
            strokeMiterlimit="10"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            overflow="visible"
            width="450pt"
            height="450pt"
            viewBox="0 -450 450 450"
        >
            <defs />
            <g id="Layer 1" className={strokeClass} transform="scale(1 -1)">
                <g id="Group" className={fillClass} strokeLinejoin="miter" strokeLinecap="round" stroke="none" strokeWidth="1.193">
                    <path
                        d="M 141.576,102.339 L 223.864,339.306 L 304.934,102.339 C 277.71,120.906 250.481,130.33 223.253,130.603 C 196.025,130.33 168.797,120.906 141.576,102.339 Z"
                        className={strokeClass}
                        markerStart="none"
                        markerEnd="none"
                    />
                    <path
                        d="M 103.35,41.793 L 28.913,270.525 L 222.006,410.814 L 417.995,269.9 L 343.523,41.49 L 103.35,41.793 Z M 335.484,170.478 C 344.959,200.187 358.784,228.948 376.72,256.819 C 345.622,268.861 317.357,284.071 292.084,302.641 C 266.938,320.702 244.011,342.548 223.167,367.978 C 202.284,342.475 179.307,320.565 154.103,302.46 C 129.099,284.083 101.163,269 70.453,257.025 C 88.376,229.166 102.189,200.42 111.666,170.724 C 121.442,141.171 127.159,109.839 129.044,76.814 C 160.943,85.182 192.422,89.403 223.47,89.237 C 254.581,89.403 286.137,85.162 318.116,76.756 C 320.009,109.709 325.724,140.979 335.484,170.478 Z"
                        className={strokeClass}
                        markerStart="none"
                        markerEnd="none"
                    />
                </g>
            </g>
        </svg>
    );
};
