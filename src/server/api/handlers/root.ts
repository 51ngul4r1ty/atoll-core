// libraries
import { APPLICATION_JSON, Link } from "@atoll/shared";

// utils
import { buildResponseWithItems } from "../utils/responseBuilder";

import * as fs from "fs";
import * as path from "path";

export type RootResourceItem = {
    id: string;
    name: string;
    description: string;
    displayIndex: number;
    notes?: string;
    links: Link[];
};

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
        if (fs.existsSync(filePath)) {
            foundPath = filePath;
            found = true;
        }
        currentRelativePath + "";
        count++;
    }
    if (!found) {
        console.log("PACKAGE.JSON NOT FOUND!");
    }
    return foundPath;
};

export const ROOT_REL_ACTION = "action";
export const ROOT_REL_ITEM = "item";
export const ROOT_REL_COLLECTION = "collection";

export const rootHandler = function (req, res) {
    try {
        const packageJsonPath = getPackageJsonPath();
        const data = fs.readFileSync(packageJsonPath, { encoding: "utf8", flag: "r" });
        const packageJson = JSON.parse(data);
        // NOTE: X-App-Version is reported at api/v1/users/--self--/preferences endpoint.
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
    const items: RootResourceItem[] = [
        {
            id: "user-auth",
            name: "User Authentication",
            description: "Authenticate with user account and password",
            displayIndex: 1,
            links: [
                {
                    type: APPLICATION_JSON,
                    rel: ROOT_REL_ACTION,
                    uri: "/api/v1/actions/login"
                }
            ]
        },
        {
            id: "refresh-token",
            name: "Refresh Authentication Token",
            description: "Request a new auth token without requiring user account and password",
            displayIndex: 2,
            links: [
                {
                    type: APPLICATION_JSON,
                    rel: ROOT_REL_ACTION,
                    uri: "/api/v1/actions/refresh-token"
                }
            ]
        },
        {
            id: "user-prefs",
            name: "Current User's Preferences",
            description: "Collection of current user's preferences",
            displayIndex: 3,
            links: [
                {
                    type: APPLICATION_JSON,
                    rel: ROOT_REL_COLLECTION,
                    uri: "/api/v1/users/--self--/preferences"
                }
            ]
        },
        {
            id: "user-toggles",
            name: "Current User's Feature Toggles",
            description: "Feature toggle state specific to the current user",
            displayIndex: 4,
            links: [
                {
                    type: APPLICATION_JSON,
                    rel: ROOT_REL_COLLECTION,
                    uri: "/api/v1/users/--self--/feature-toggles"
                }
            ]
        },
        {
            id: "projects",
            name: "Projects",
            description: "Collection of projects",
            displayIndex: 5,
            links: [
                {
                    type: APPLICATION_JSON,
                    rel: ROOT_REL_COLLECTION,
                    uri: "/api/v1/projects"
                }
            ]
        },
        {
            id: "sprints",
            name: "Sprints",
            description: "Collection of sprints",
            displayIndex: 6,
            links: [
                {
                    type: APPLICATION_JSON,
                    rel: ROOT_REL_COLLECTION,
                    uri: "/api/v1/sprints"
                }
            ]
        },
        {
            id: "backlog-items",
            name: "Backlog Items",
            description: "Collection of backlog items",
            displayIndex: 7,
            links: [
                {
                    type: APPLICATION_JSON,
                    rel: ROOT_REL_COLLECTION,
                    uri: "/api/v1/backlog-items"
                }
            ]
        },
        {
            id: "sprint-backlog-items-parts",
            name: "Sprint Backlog Item Parts",
            description: "Collection of parts under a backlog item contained in a specific sprint",
            displayIndex: 8,
            links: [
                {
                    type: APPLICATION_JSON,
                    rel: ROOT_REL_COLLECTION,
                    uri: "/api/v1/sprints/{sprintId}/backlog-items/{itemId}/parts"
                }
            ]
        },
        {
            id: "product-backlog-items",
            name: "Product Backlog Items",
            description: "Linked lists used to display backlog items in prioritized order",
            displayIndex: 9,
            links: [
                {
                    type: APPLICATION_JSON,
                    rel: ROOT_REL_COLLECTION,
                    uri: "/api/v1/product-backlog-items"
                }
            ]
        }
    ];

    res.format({
        json: () => {
            res.send(buildResponseWithItems(items));
        },
        html: () => {
            const pageOpeningTags =
                `<html>` +
                `<head>` +
                `<link rel="preconnect" href="https://fonts.googleapis.com">` +
                `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` +
                `<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300,700&display=swap" rel="stylesheet">` +
                `</head>` +
                `<body>` +
                `<style>` +
                `* { font-family: 'Open Sans', sans-serif; } ` +
                `table { background-color: #e0e0e0; padding: 0.5rem; }` +
                `td { padding-left: 0.25rem; padding-right: 0.25rem; padding-top: 0.125rem; padding-bottom: 0.125rem; }` +
                `</style>` +
                `<h1>API Endpoints</h1>` +
                `<table>` +
                `<tr>` +
                ["ID", "Name", "Description", "Links"].map((item) => `<th>${item}</th>`).join("") +
                `</tr>`;
            const pageContent = items
                .sort((a, b) => a.displayIndex - b.displayIndex)
                .map((item) => {
                    const itemLinksHtml = item.links
                        .map((itemLink) => {
                            return `${itemLink.rel}: ${itemLink.uri}`;
                        })
                        .join("<br/>");
                    const fieldValues = [item.id, item.name, item.description, itemLinksHtml];
                    const rowCells = fieldValues
                        .map((fieldValue) => {
                            return `<td>${fieldValue}</td>`;
                        })
                        .join("");
                    return `<tr>${rowCells}</tr>`;
                })
                .join("");
            const pageClosingTags =
                `</table>` +
                `<br/>` +
                `<b>` +
                `NOTE: This content is available in JSON format too- just use the same endpoint with the` +
                ` "Accept" header with "application/json" value.  A browser automatically requests HTML` +
                ` so that is why you're seeing it rendered this way!` +
                `</b>` +
                `</body></html>`;
            res.send(pageOpeningTags + pageContent + pageClosingTags);
        }
    });
};
