const semver = require("semver");

if (semver.gte(process.version, "14.0.0")) {
    console.error("Node v14+ is not supported - please check the README.md file for a good version to use.");
} else if (semver.gte(process.version, "10.0.0")) {
    console.log("Node version is supported.");
} else {
    console.error("Node older than v10 is not supported - please check the README.md file for a good version to use.");
}
