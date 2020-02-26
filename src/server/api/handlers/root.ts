import { APPLICATION_JSON } from "@atoll/shared";

export const rootHandler = function(req, res) {
    res.json({
        status: 200,
        data: {
            items: [
                {
                    name: "Current User's Preferences",
                    displayIndex: 0,
                    links: [
                        {
                            type: APPLICATION_JSON,
                            method: "GET",
                            rel: "self",
                            uri: "/api/v1/users/{self}/preferences"
                        }
                    ]
                },
                {
                    name: "Current User's Feature Toggles",
                    displayIndex: 1,
                    links: [
                        {
                            type: APPLICATION_JSON,
                            method: "GET",
                            rel: "self",
                            uri: "/api/v1/users/{self}/feature-toggles"
                        }
                    ]
                },
                {
                    name: "Sprints",
                    displayIndex: 2,
                    links: [
                        {
                            type: APPLICATION_JSON,
                            method: "GET",
                            rel: "self",
                            uri: "/api/v1/sprints"
                        }
                    ]
                },
                {
                    name: "Backlog Items",
                    displayIndex: 3,
                    links: [
                        {
                            type: APPLICATION_JSON,
                            method: "GET",
                            rel: "self",
                            uri: "/api/v1/backlog-items"
                        }
                    ]
                }
            ]
        }
    });
};
