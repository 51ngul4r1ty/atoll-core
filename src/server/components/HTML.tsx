// externals
import React from "react";
import Helmet from "react-helmet";

type Props = {
    children: any;
    css: string[];
    favIcon: string;
    language: string;
    scripts: string[];
    state: string;
    toggles: { [key: string]: boolean };
};

const HTML = (props: Props) => {
    const head = Helmet.renderStatic();
    return (
        <html lang="">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                {head.base.toComponent()}
                {head.title.toComponent()}
                {head.meta.toComponent()}
                {head.link.toComponent()}
                {head.script.toComponent()}
                <link rel="icon" type="image/png" href={props.favIcon}></link>
                <link
                    rel="stylesheet"
                    type="text/css"
                    href="//fonts.googleapis.com/css?family=Open+Sans:100,200,300,400,400i,500,600,700,800"
                />
                {props.css.filter(Boolean).map((href) => (
                    <link key={href} rel="stylesheet" href={href} />
                ))}
                <script
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                        // TODO: Add jsesc/stringify here
                        // see: https://twitter.com/HenrikJoreteg/status/1143953338284703744
                        __html: `window.__PRELOADED_STATE__ = ${props.state}; window.__TOGGLES__ = ${JSON.stringify(
                            props.toggles
                        )};`
                    }}
                />
            </head>
            <body>
                {/* eslint-disable-next-line react/no-danger */}
                <div id="app" dangerouslySetInnerHTML={{ __html: props.children }} />
                {props.scripts.filter(Boolean).map((src) => (
                    <script key={src} src={src} />
                ))}
            </body>
        </html>
    );
};

export default HTML;
