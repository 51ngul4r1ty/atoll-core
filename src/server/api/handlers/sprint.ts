// externals
import { Request } from "express";

// libraries
import { ApiSprint } from "@atoll/shared";

// utils
import { buildItemLink } from "../../utils/linkBuilder";
import { buildOptions } from "../utils/filterHelper";

// data access
import { mapToSprint, SprintModel } from "../../dataaccess";

export const sprintsHandler = function(req: Request, res) {
    SprintModel.findAll(buildOptions(req))
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
            console.log(`Unable to fetch sprints: ${error}`);
        });
};
