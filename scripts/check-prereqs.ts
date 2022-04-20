const semver = require("semver");

if (semver.gte(process.version, "17.0.0")) {
    console.error("Node v17+ is not supported - please check the README.md file for a good version to use.");
} else if (semver.gte(process.version, "16.4.2")) {
    console.log("Node version is supported.");
} else {
    console.error("Node older than v16.4.2 is not supported - please check the README.md file for a good version to use.");
}
