// utils
import { buildSelfLink } from "../../utils/linkBuilder";

// data access
import { mapToBacklogItem, BacklogItemModel } from "../../dataaccess";

// interfaces/types
import { BacklogItem } from "../../dataaccess/types";

export const backlogItemsHandler = function(req, res) {
    BacklogItemModel.findAll()
        .then((backlogItems) => {
            const items = backlogItems.map((item) => {
                const backlogItem = mapToBacklogItem(item);
                const result: BacklogItem = {
                    ...backlogItem,
                    links: [buildSelfLink(backlogItem, "/api/v1/backlog-items/")]
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
            console.log(`unable to fetch backlog items: ${error}`);
        });
};
