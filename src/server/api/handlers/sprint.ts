// libraries
import { ApiSprint } from "@atoll/shared";

// utils
import { buildItemLink } from "../../utils/linkBuilder";

// data access
import { mapToSprint, SprintModel } from "../../dataaccess";

export const sprintsHandler = function(req, res) {
    SprintModel.findAll()
        .then((sprints) => {
            const items = sprints.map((item) => {
                const sprint = mapToSprint(item);
                const result: ApiSprint = {
                    ...sprint,
                    links: [buildItemLink(sprint, "/api/v1/sprints/")]
                };
                return result;
            });
            res.json({
                status: 200,
                data: {
                    items
                }
            });
        })
        .catch((error) => {
            res.json({
                status: 500,
                error: {
                    msg: error
                }
            });
            console.log(`unable to fetch sprints: ${error}`);
        });
};
