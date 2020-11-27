import { APPLICATION_JSON } from "@atoll/shared";

import * as fs from "fs";
import * as path from "path";

export const getPackageJsonPath = (): string | null => {
    let count = 0;
    let found = false;
    let foundPath: string = null;
    while (count < 5 && !found) {
        let currentRelativePath: string;
        if (count === 0) {
            currentRelativePath = `.${path.sep}`;
        } else {
            currentRelativePath = "";
            for (let i = 0; i < count; i++) {
                currentRelativePath += `..${path.sep}`;
            }
        }
        const currentPath = path.resolve(__NAME__, currentRelativePath);
        const filePath = currentPath.endsWith(`${path.sep}`)
            ? currentPath + "package.json"
            : currentPath + `${path.sep}package.json`;
        console.log(`checking for package.json using this path: ${filePath}`);
        if (fs.existsSync(filePath)) {
            foundPath = filePath;
            found = true;
        }
        currentRelativePath + "";
        count++;
    }
    if (found) {
        console.log("  Found!");
    } else {
        console.log("  NOT FOUND!");
    }
    return foundPath;
};

export const rootHandler = function(req, res) {
    try {
        const packageJsonPath = getPackageJsonPath();
        const data = fs.readFileSync(packageJsonPath, { encoding: "utf8", flag: "r" });
        const packageJson = JSON.parse(data);
        res.set(
            "X-Atoll-Info",
            JSON.stringify({
                versions: {
                    app: packageJson.version,
                    sharedLib: packageJson.dependencies["@atoll/shared"]
                }
            })
        );
    } catch (err) {
        console.log(`ERROR REPORTING VERSION INFO: "${err}"`);
    }
    res.json({
        status: 200,
        data: {
            items: [
                {
                    name: "Current User's Preferences",
                    description: "Collection of current user's preferences",
                    displayIndex: 0,
                    links: [
                        {
                            type: APPLICATION_JSON,
                            rel: "collection",
                            uri: "/api/v1/users/{self}/preferences"
                        }
                    ]
                },
                {
                    name: "Current User's Feature Toggles",
                    description: "Feature toggle state specific to the current user",
                    displayIndex: 1,
                    links: [
                        {
                            type: APPLICATION_JSON,
                            rel: "collection",
                            uri: "/api/v1/users/{self}/feature-toggles"
                        }
                    ]
                },
                {
                    name: "Sprints",
                    description: "Collection of sprints",
                    displayIndex: 2,
                    links: [
                        {
                            type: APPLICATION_JSON,
                            rel: "collection",
                            uri: "/api/v1/sprints"
                        }
                    ]
                },
                {
                    name: "Backlog Items",
                    description: "Collection of backlog items",
                    displayIndex: 3,
                    links: [
                        {
                            type: APPLICATION_JSON,
                            rel: "collection",
                            uri: "/api/v1/backlog-items"
                        }
                    ]
                },
                {
                    name: "Backlog Item Ranks",
                    description: "Linked lists used to display backlog items in prioritized order",
                    displayIndex: 4,
                    links: [
                        {
                            type: APPLICATION_JSON,
                            rel: "collection",
                            uri: "/api/v1/backlog-item-ranks"
                        }
                    ]
                }
            ]
        }
    });
};
