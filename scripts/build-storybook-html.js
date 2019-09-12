const fs = require("fs");
const path = require("path");

const { themeList } = require("@atoll/shared");

const PLACE_HOLDER = "/* ***INSERT_THEME_LIST_HERE*** */";

const getIndexOfPlaceHolder = (line) => {
    const index = line.indexOf(PLACE_HOLDER);
    if (index >= 0) {
        return index;
    }
    return -1;
};

const hasPlaceholder = (line) => {
    return getIndexOfPlaceHolder(line) >= 0;
};

var inputPath = path.resolve(".storybook/preview-head.template.html");
var outputPath = path.resolve(".storybook/preview-head.html");
var textByLine = fs
    .readFileSync(inputPath)
    .toString()
    .replace(/\r/g, "")
    .split("\n");
var newLines = [];
textByLine.forEach((line) => {
    if (!hasPlaceholder(line)) {
        newLines.push(line);
    } else {
        const index = getIndexOfPlaceHolder(line);
        const lineStart = line.substr(0, index);
        //        const lineEnd = line.substr(index + PLACE_HOLDER.length);
        themeList.forEach((themeListItem) => {
            newLines.push(lineStart + "{");
            newLines.push(lineStart + `    name: '${themeListItem.name}',`);
            newLines.push(lineStart + `    theme: {`);
            for (const propName in themeListItem.theme) {
                const propValue = themeListItem.theme[propName];
                newLines.push(lineStart + `        '${propName}': '${propValue}',`);
                firstLine = false;
            }
            newLines.push(lineStart + `    }`);
            newLines.push(lineStart + "},");
        });
    }
});

const allText = newLines.join("\r\n");

fs.writeFile(outputPath, allText, (err) => {
    if (err) {
        console.error(`${err} occured writing preview-head.html`);
    }
});
