const path = require("path");
const webpack = require("webpack");
const ManifestPlugin = require("webpack-manifest-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const paths = require("../paths");

const { clientOnly } = require("../../scripts/utils");

const env = require("../env")();

const shared = [
    new MiniCssExtractPlugin({
        filename: process.env.NODE_ENV === "development" ? "[name].css" : "[name].[contenthash].css",
        chunkFilename: process.env.NODE_ENV === "development" ? "[id].css" : "[id].[contenthash].css"
    })
];

const htmlWebpackPlugin = new HtmlWebpackPlugin({
    filename: path.join(paths.clientBuild, "index.html"),
    inject: true,
    template: paths.appHtml
});

const client = [
    clientOnly() && htmlWebpackPlugin,
    // new webpack.ProgressPlugin(), // make this optional e.g. via `--progress` flag
    new CaseSensitivePathsPlugin(),
    new webpack.DefinePlugin(env.stringified),
    new webpack.DefinePlugin({
        __SERVER__: "false",
        __BROWSER__: "true"
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new ManifestPlugin({ fileName: "manifest.json" }),
    new CopyWebpackPlugin([
        { from: "./node_modules/@atoll/shared/dist/index.es.css", to: "shared-bundle.css" },
        { from: "./src/assets/favicon.png", to: "favicon.png" }
    ])
].filter(Boolean);

const server = [
    new webpack.DefinePlugin({
        __SERVER__: "true",
        __BROWSER__: "false",
        __NAME__: webpack.DefinePlugin.runtimeValue((v) => {
            const res = v.module.rawRequest.substr(2);
            return JSON.stringify(res); // Strings need to be wrapped in quotes
        }, [])
    })
];

module.exports = {
    shared,
    client,
    server
};
