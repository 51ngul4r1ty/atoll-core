// externals
import * as HttpStatus from "http-status-codes";

// libraries
import { ApiBacklogItem, LinkedList } from "@atoll/shared";

// utils
import { mapToBacklogItem, mapToBacklogItemRank } from "../../../dataaccess/mappers";
import { buildOptionsFromParams } from "../../utils/sequelizeHelper";
import { buildSelfLink } from "../../../utils/linkBuilder";

// data access
import { BacklogItemModel } from "../../../dataaccess/models/BacklogItem";
import { BacklogItemRankModel } from "../../../dataaccess/models/BacklogItemRank";

// consts/enums
import { BACKLOG_ITEM_RESOURCE_NAME } from "../../../resourceNames";

export const backlogItemFetcher = async (projectId: string | null) => {
    try {
        const options = buildOptionsFromParams({ projectId });
        const backlogItemRanks = await BacklogItemRankModel.findAll(options);
        const rankList = new LinkedList<ApiBacklogItem>();
        if (backlogItemRanks.length) {
            const backlogItemRanksMapped = backlogItemRanks.map((item) => mapToBacklogItemRank(item));
            backlogItemRanksMapped.forEach((item) => {
                rankList.addInitialLink(item.backlogitemId, item.nextbacklogitemId);
            });
        }
        const backlogItems = await BacklogItemModel.findAll(options);
        backlogItems.forEach((item) => {
            const backlogItem = mapToBacklogItem(item);
            const result: ApiBacklogItem = {
                ...backlogItem,
                links: [buildSelfLink(backlogItem, `/api/v1/${BACKLOG_ITEM_RESOURCE_NAME}/`)]
            };
            rankList.addItemData(result.id, result);
        });
        return {
            status: HttpStatus.OK,
            data: {
                items: rankList.toArray()
            }
        };
    } catch (error) {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error
        };
    }
};
