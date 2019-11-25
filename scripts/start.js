const rimraf = require("rimraf");
const paths = require("../config/paths");
const { clientOnly } = require("./utils");

rimraf.sync(paths.clientBuild);

if (clientOnly()) {
    require("./start-client");
} else {
    rimraf.sync(paths.serverBuild);
    require("./start-ssr");
}
