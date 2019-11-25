const baseConfig = require("./server.base");
const webpack = require("webpack");
const WriteFileWebpackPlugin = require("write-file-webpack-plugin");
const generateSourceMap = process.env.OMIT_SOURCEMAP === "true" ? false : true;

const config = {
    ...baseConfig,
    plugins: [new WriteFileWebpackPlugin(), ...baseConfig.plugins, new webpack.HotModuleReplacementPlugin()],
    mode: "development",
    devtool: generateSourceMap ? "cheap-module-inline-source-map" : false,
    performance: {
        hints: false
    }
};

module.exports = config;
