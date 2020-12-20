// externals
import * as HttpStatus from "http-status-codes";

// libraries
import { ApiBacklogItem, LinkedList } from "@atoll/shared";

// utils
import { mapDbToApiBacklogItem, mapDbToApiBacklogItemRank } from "../../../dataaccess/mappers/dataAccessToApiMappers";
import { buildOptionsFromParams } from "../../utils/sequelizeHelper";
import { buildSelfLink } from "../../../utils/linkBuilder";

// data access
import { BacklogItemModel } from "../../../dataaccess/models/BacklogItem";
import { BacklogItemRankModel } from "../../../dataaccess/models/BacklogItemRank";

// consts/enums
import { BACKLOG_ITEM_RESOURCE_NAME } from "../../../resourceNames";

export interface BacklogItemsResult {
    status: number;
    data?: {
        items: any[];
    };
    message?: string;
}

export const backlogItemFetcher = async (projectId: string, backlogItemDisplayId: string): Promise<BacklogItemsResult> => {
    try {
        const options = buildOptionsFromParams({ projectId, externalId: backlogItemDisplayId });
        const backlogItems = await BacklogItemModel.findAll(options);
        const getBacklogItemsResult = (backlogItems) => {
            const items = backlogItems.map((item) => {
                const backlogItem = mapDbToApiBacklogItem(item);
                const result: ApiBacklogItem = {
                    ...backlogItem,
                    links: [buildSelfLink(backlogItem, `/api/v1/${BACKLOG_ITEM_RESOURCE_NAME}/`)]
                };
                return result;
            });
            return {
                status: HttpStatus.OK,
                data: {
                    items
                }
            };
        };
        if (backlogItems.length >= 1) {
            return getBacklogItemsResult(backlogItems);
        } else {
            const options = buildOptionsFromParams({ projectId, friendlyId: backlogItemDisplayId });
            const backlogItems = await BacklogItemModel.findAll(options);
            return getBacklogItemsResult(backlogItems);
        }
    } catch (error) {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error
        };
    }
};

export const backlogItemsFetcher = async (projectId: string | null): Promise<BacklogItemsResult> => {
    try {
        const options = buildOptionsFromParams({ projectId });
        const backlogItemRanks = await BacklogItemRankModel.findAll(options);
        const rankList = new LinkedList<ApiBacklogItem>();
        if (backlogItemRanks.length) {
            const backlogItemRanksMapped = backlogItemRanks.map((item) => mapDbToApiBacklogItemRank(item));
            backlogItemRanksMapped.forEach((item) => {
                rankList.addInitialLink(item.backlogitemId, item.nextbacklogitemId);
            });
        }
        const backlogItems = await BacklogItemModel.findAll(options);
        backlogItems.forEach((item) => {
            const backlogItem = mapDbToApiBacklogItem(item);
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
