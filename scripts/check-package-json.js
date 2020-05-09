const fs = require("fs");
const path = require("path");

const fileContents = fs.readFileSync(path.resolve("./package.json"));

if (fileContents.includes("file:.yalc/")) {
    console.error("package.json has a yalc file reference - switch this to a published package instead");
    process.exit(1);
} else {
    process.exit(0);
}
