// externals
import React from "react";

/* executed on initialization only */

/* exported component */

export class MainLayout extends React.Component<{}, {}> {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        // const mql = window.matchMedia("(max-width: 600px)");
        // mql.addListener((ev) => {
        //     console.log("STATE CHANGED");
        // });
    }
    render() {
        return <div className="app-layout">{this.props.children}</div>;
    }
}
