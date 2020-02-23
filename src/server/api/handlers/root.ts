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
                            type: "application/json",
                            method: "GET",
                            rel: "self",
                            uri: "/api/v1/users/{self}/preferences"
                        }
                    ]
                },
                {
                    name: "Sprints",
                    displayIndex: 0,
                    links: [
                        {
                            type: "application/json",
                            method: "GET",
                            rel: "self",
                            uri: "/api/v1/sprints"
                        }
                    ]
                },
                {
                    name: "Backlog Items",
                    displayIndex: 1,
                    links: [
                        {
                            type: "application/json",
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
