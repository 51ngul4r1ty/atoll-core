const fs = require("fs");
const path = require("path");
const fsExtra = require("fs-extra");

var inputPath = path.resolve("./package.json");
var outputPath = path.resolve("./build/deploy-package.json");
var textByLine = fs
    .readFileSync(inputPath)
    .toString()
    .replace(/\r/g, "")
    .split("\n");
var newLines = [];

const INDENT_SPACING = 2;

function formatLine(text, indentLevel) {
    let indentText = "";
    for (let i = 0; i < INDENT_SPACING; i++) {
        indentText += " ";
    }
    let spacerText = "";
    for (let i = 0; i < indentLevel; i++) {
        spacerText += indentText;
    }
    return spacerText + text;
}

function isEndOfSection(line) {
    return line === formatLine("},", 1) || line === formatLine("}", 1);
}

function buildDeployGitIgnore() {
    const relativePath = "./build/deploy-gitignore";
    const outputPath = path.resolve(relativePath);
    const allText = "node_modules\n.vscode\n";
    fs.writeFileSync(outputPath, allText, (err) => {
        if (err) {
            console.error(`${err} occured writing ${relativePath}`);
        }
    });
}

function buildDeployPackage() {
    const PARSE_STATE_IN_OTHER_SECTIONS = 0;
    const PARSE_STATE_IN_SCRIPTS_SECTION = 1;
    const PARSE_STATE_IN_DEVDEPENDENCIES_SECTION = 2;
    let parseState = PARSE_STATE_IN_OTHER_SECTIONS;
    textByLine.forEach((line) => {
        if (parseState !== PARSE_STATE_IN_OTHER_SECTIONS && isEndOfSection(line)) {
            parseState = PARSE_STATE_IN_OTHER_SECTIONS;
        }
        if (parseState === PARSE_STATE_IN_OTHER_SECTIONS) {
            newLines.push(line);
        }
        if (line.trim() === '"scripts": {') {
            parseState = PARSE_STATE_IN_SCRIPTS_SECTION;
            newLines.push('    "start": "node ./build/server/server.js",');
            newLines.push('    "start-local": "npx --no-install cross-env RESOURCE_PORT=8500"');
        } else if (line.trim() === '"devDependencies": {') {
            parseState = PARSE_STATE_IN_DEVDEPENDENCIES_SECTION;
        }
    });

    const allText = newLines.join("\r\n");

    fs.writeFileSync(outputPath, allText, (err) => {
        if (err) {
            console.error(`${err} occured writing ./build/deploy-package.json`);
        }
    });
}

function createDeployLaunchJson(deployFolder) {
    const allText = `{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch Program",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "env": {
                "RESOURCE_PORT": "8500",
            },
            "program": "\${workspaceFolder}\\\\build\\\\server\\\\server.js"
        }
    ]
}
`;

    const outputFolder = path.join(deployFolder, ".vscode");
    try {
        fs.mkdirSync(outputFolder);
    } catch (err) {
        // swallow error - directory probably already exists
    }
    const outputPath = path.join(outputFolder, "launch.json");
    fs.writeFileSync(outputPath, allText, (err) => {
        if (err) {
            console.error(`${err} occured writing launch.json to deploy folder`);
        }
    });
}

function copyClientStaticFiles(deployFolder) {
    if (!deployFolder) {
        console.error("ERROR: unable to execute copyClientStaticFiles- must specify a deployFolder argument");
        return;
    }
    const clientStaticFolder = "build/client/static";
    const serverStaticFolder = "build/server/static";
    const sourceFolder = `./${clientStaticFolder}`;
    const targetFolder = path.join(deployFolder, clientStaticFolder);
    fsExtra.copySync(sourceFolder, targetFolder, (src, dest) => {
        return !(src.endsWith(".js.map") || src.endsWith(".LICENSE.txt"));
    });
    const serverTargetFolder = path.join(deployFolder, serverStaticFolder);
    fsExtra.copySync(sourceFolder, serverTargetFolder, (src, dest) => {
        return !(src.endsWith(".js.map") || src.endsWith(".LICENSE.txt"));
    });
}

function copyDeployPackage(deployFolder) {
    if (!deployFolder) {
        console.error("ERROR: unable to execute copyDeployPackage- must specify a deployFolder argument");
        return;
    }
    const targetFile = path.join(deployFolder, "package.json");
    fsExtra.copySync("./build/deploy-package.json", targetFile);
}

function copyDeployGitignore(deployFolder) {
    if (!deployFolder) {
        console.error("ERROR: unable to execute copyDeployGitignore- must specify a deployFolder argument");
        return;
    }
    const targetFile = path.join(deployFolder, ".gitignore");
    fsExtra.copySync("./build/deploy-gitignore", targetFile);
}

function copyServerFiles(deployFolder) {
    if (!deployFolder) {
        console.error("ERROR: unable to execute copyServerFiles- must specify a deployFolder argument");
        return;
    }
    const serverFolder = "build/server";
    const sourceFolder = `./${serverFolder}`;
    const targetFolder = path.join(deployFolder, serverFolder);
    fsExtra.copySync(sourceFolder, targetFolder);
}

function cleanDeployFolder(deployFolder) {
    if (!deployFolder) {
        console.error("ERROR: unable to execute cleanDeployFolder- must specify a deployFolder argument");
        return;
    }
    fsExtra.removeSync(path.join(deployFolder, "build"));
}

module.exports = {
    buildDeployPackage,
    buildDeployGitIgnore,
    cleanDeployFolder,
    copyClientStaticFiles,
    copyDeployGitignore,
    copyDeployPackage,
    copyServerFiles,
    createDeployLaunchJson
};
