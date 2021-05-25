// externals
import * as HttpStatus from "http-status-codes";
import { FindOptions } from "sequelize";

// libraries
import { ApiBacklogItem, LinkedList } from "@atoll/shared";

// utils
import { mapDbToApiBacklogItem, mapDbToApiBacklogItemRank } from "../../../dataaccess/mappers/dataAccessToApiMappers";
import { addIncludeAllNestedToOptions, buildOptionsFromParams } from "../../utils/sequelizeHelper";
import { buildSelfLink } from "../../../utils/linkBuilder";
import { getMessageFromError } from "../../utils/errorUtils";

// data access
import { BacklogItemDataModel } from "../../../dataaccess/models/BacklogItem";
import { BacklogItemRankDataModel } from "../../../dataaccess/models/BacklogItemRank";

// consts/enums
import { BACKLOG_ITEM_RESOURCE_NAME } from "../../../resourceNames";
import { BacklogItemPartDataModel, SprintBacklogItemDataModel } from "dataaccess";

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
        const backlogItems = await BacklogItemDataModel.findAll(options);
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
            const backlogItems = await BacklogItemDataModel.findAll(options);
            return getBacklogItemsResult(backlogItems);
        }
    } catch (error) {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: getMessageFromError(error)
        };
    }
};

export const backlogItemsFetcher = async (projectId: string | null): Promise<BacklogItemsResult> => {
    try {
        const options = buildOptionsFromParams({ projectId });
        const backlogItemRanks = await BacklogItemRankDataModel.findAll(options);
        const rankList = new LinkedList<ApiBacklogItem>();
        if (backlogItemRanks.length) {
            const backlogItemRanksMapped = backlogItemRanks.map((item) => mapDbToApiBacklogItemRank(item));
            backlogItemRanksMapped.forEach((item) => {
                rankList.addInitialLink(item.backlogitemId, item.nextbacklogitemId);
            });
        }
        const backlogItemsOptions: FindOptions = {
            ...options,
            include: [
                {
                    model: BacklogItemPartDataModel,
                    as: "backlogitemparts",
                    include: [
                        {
                            model: SprintBacklogItemDataModel,
                            as: "sprintbacklogitems"
                        }
                    ]
                }
            ]
        };
        const backlogItems = await BacklogItemDataModel.findAll(backlogItemsOptions);
        backlogItems.forEach((item) => {
            const backlogItemParts = (item as any).backlogitemparts;
            if (backlogItemParts.length > 1) {
                let allocatedPartCount = 0;
                let unallocatedPartCount = 0;
                backlogItemParts.forEach((backlogItemPart) => {
                    const sprintBacklogItems = backlogItemPart.sprintbacklogitems;
                    if (!sprintBacklogItems.length) {
                        unallocatedPartCount++;
                    } else {
                        sprintBacklogItems.forEach((sprintBacklogItems) => {
                            allocatedPartCount++;
                        });
                    }
                });
                console.log(`found one: unallocated ${unallocatedPartCount} + allocated ${allocatedPartCount}`);
            }
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
            message: getMessageFromError(error)
        };
    }
};
