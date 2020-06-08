const {
    buildDeployGitIgnore,
    buildDeployPackage,
    copyClientStaticFiles,
    copyDeployGitignore,
    copyDeployPackage,
    cleanDeployFolder,
    copyServerFiles,
    createDeployLaunchJson
} = require("./deploy-helper");
const { shellNpxScript } = require("./npm-helper");

const deployFolder = process.env.ATOLL_HEROKU_PATH || "";

function isDeploySetUp() {
    return !!deployFolder;
}

if (!isDeploySetUp()) {
    console.log("");
    console.log("Info: ATOLL_HEROKU_PATH environment variable is not set up, skipping deployment open.");
    console.log("");
} else {
    console.log(`Opening deployment folder ${deployFolder}...`);
    console.log("");
    shellNpxScript("open-cli", deployFolder);
}
