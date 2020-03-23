// externals
import React from "react";
import Helmet from "react-helmet";

type Props = {
    children: any;
    css: string[];
    language: string;
    scripts: string[];
    state: string;
    toggles: { [key: string]: boolean };
};

const HTML = ({ children, css = [], scripts = [], state = "{}", language = "", toggles = {} }: Props) => {
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
                {css.filter(Boolean).map((href) => (
                    <link key={href} rel="stylesheet" href={href} />
                ))}
                <script
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                        // TODO: Add jsesc/stringify here
                        // see: https://twitter.com/HenrikJoreteg/status/1143953338284703744
                        __html: `window.__PRELOADED_STATE__ = ${state}; window.__TOGGLES__ = ${JSON.stringify(toggles)};`
                    }}
                />
            </head>
            <body>
                {/* eslint-disable-next-line react/no-danger */}
                <div id="app" dangerouslySetInnerHTML={{ __html: children }} />
                {scripts.filter(Boolean).map((src) => (
                    <script key={src} src={src} />
                ))}
            </body>
        </html>
    );
};

export default HTML;
