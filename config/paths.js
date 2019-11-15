const fs = require("fs");
const path = require("path");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

let serverBuild;
try {
    serverBuild = resolveApp("build/server");
} catch {
    serverBuild = undefined;
}

const paths = {
    appHtml: resolveApp("config/webpack.config.js/template.html"),
    clientBuild: resolveApp("build/client"),
    serverBuild,
    dotenv: resolveApp(".env"),
    src: resolveApp("src"),
    srcClient: resolveApp("src/client"),
    srcServer: resolveApp("src/server"),
    types: resolveApp("node_modules/@types"),
    i18n: resolveApp("src/shared/i18n"),
    publicPath: "/static/"
};

paths.resolveModules = [paths.srcClient, paths.srcServer, paths.src, "node_modules"];

module.exports = paths;
