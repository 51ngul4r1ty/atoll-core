import { APPLICATION_JSON } from "@atoll/shared";

export const rootHandler = function(req, res) {
    try {
        const packageJson = require("../../../../package.json");
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
