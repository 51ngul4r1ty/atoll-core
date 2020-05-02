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

const deployFolder = process.env.ATOLL_HEROKU_PATH || "";

function isDeploySetUp() {
    return !!deployFolder;
}

if (!isDeploySetUp()) {
    console.log("");
    console.log("Info: ATOLL_HEROKU_PATH environment variable is not set up, skipping deployment build.");
    console.log("");
} else {
    console.log("Performing deployment build");
    console.log("");

    console.log("1. Building deploy-package.json...");
    console.log("");
    buildDeployPackage();

    console.log("2. Building deploy-gitignore...");
    console.log("");
    buildDeployGitIgnore();

    console.log("3. Cleaning build folder...");
    console.log("");
    cleanDeployFolder(deployFolder);

    console.log("4. Copying deploy specific files...");
    console.log("");
    copyDeployPackage(deployFolder);
    copyDeployGitignore(deployFolder);

    console.log("5. Copying server files...");
    console.log("");
    copyServerFiles(deployFolder);

    console.log("6. Copying client static files...");
    console.log("");
    copyClientStaticFiles(deployFolder);

    console.log("7. Creating launch.json (for manual testing)...");
    console.log("");
    createDeployLaunchJson(deployFolder);

    console.log("");
}
