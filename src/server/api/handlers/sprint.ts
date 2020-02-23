// utils
import { buildSelfLink } from "../../utils/linkBuilder";

// data access
import { mapToSprint, SprintModel } from "../../dataaccess";

// interfaces/types
import { Sprint } from "../../dataaccess/types";

export const sprintsHandler = function(req, res) {
    SprintModel.findAll()
        .then((sprints) => {
            const items = sprints.map((item) => {
                const sprint = mapToSprint(item);
                const result: Sprint = {
                    ...sprint,
                    links: [buildSelfLink(sprint, "/api/v1/sprints/")]
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
