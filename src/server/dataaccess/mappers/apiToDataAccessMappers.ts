// libraries
import { ApiProject, ApiSprint, ApiBacklogItemPart, ApiBacklogItem, cloneWithoutNested } from "@atoll/shared";

// utils
import { convertBooleanToDbChar, convertApiDateToDate, convertFloatToDbNumber } from "../conversionUtils";

export enum ApiToDataAccessMapOptions {
    None = 0,
    ForPatch = 1,
    RemoveExtraApiFields = 2
}

/**
 * Map a Sprint API object to the field values that need to be persisted in a database.
 * @param sprint object passed into REST API call as-is
 * @param mapOptions optional parameter to determine whether to preserve structure or not, patching requires leaving out fields that
 *        aren't provided in the input.
 */
export const mapApiToDbSprint = (sprint: ApiSprint, mapOptions?: ApiToDataAccessMapOptions) => {
    if (mapOptions !== ApiToDataAccessMapOptions.ForPatch || sprint.hasOwnProperty("archived")) {
        return {
            ...sprint,
            archived: convertBooleanToDbChar(sprint.archived)
        };
    } else {
        return { ...sprint };
    }
};

/**
 * Map a Project API object to the field values that need to be persisted in a database.
 * @param project object passed into REST API call as-is
 * @param mapOptions optional parameter to determine whether to preserve structure or not, patching requires leaving out fields that
 *        aren't provided in the input.
 */
export const mapApiToDbProject = (project: ApiProject, mapOptions?: ApiToDataAccessMapOptions) => {
    return { ...project };
};

/**
 * Map a Backlog Item Part API object to the field values that need to be persisted in a database.
 * @param backlogItemPart object passed into REST API call as-is
 * @param mapOptions optional parameter to determine whether to preserve structure or not, patching requires leaving out fields that
 *        aren't provided in the input.
 */
export const mapApiToDbBacklogItemPart = (backlogItemPart: ApiBacklogItemPart, mapOptions?: ApiToDataAccessMapOptions) => {
    const dataValues = {
        ...backlogItemPart,
        createdAt: convertApiDateToDate(backlogItemPart.createdAt),
        finishedAt: convertApiDateToDate(backlogItemPart.finishedAt),
        startedAt: convertApiDateToDate(backlogItemPart.startedAt),
        updatedAt: convertApiDateToDate(backlogItemPart.updatedAt)
    };
    return {
        ...dataValues,
        dataValues: cloneWithoutNested(dataValues)
    };
};

/**
 * Map a Backlog Item API object to the field values that need to be persisted in a database.
 * @param backlogItem object passed into REST API call as-is
 * @param mapOptions optional parameter to determine whether to preserve structure or not, patching requires leaving out fields that
 *        aren't provided in the input.
 */
export const mapApiToDbBacklogItem = (
    backlogItem: ApiBacklogItem,
    mapOptions: ApiToDataAccessMapOptions = ApiToDataAccessMapOptions.RemoveExtraApiFields
) => {
    const storyEstimate = convertFloatToDbNumber(backlogItem.storyEstimate);
    // const unallocatedPoints = convertFloatToDbNumber(backlogItem.unallocatedPoints);
    const dataValues = {
        ...backlogItem,
        storyEstimate,
        // unallocatedPoints,
        acceptedAt: convertApiDateToDate(backlogItem.acceptedAt),
        createdAt: convertApiDateToDate(backlogItem.createdAt),
        finishedAt: convertApiDateToDate(backlogItem.finishedAt),
        releasedAt: convertApiDateToDate(backlogItem.releasedAt),
        startedAt: convertApiDateToDate(backlogItem.startedAt),
        updatedAt: convertApiDateToDate(backlogItem.updatedAt)
    };
    if (mapOptions === ApiToDataAccessMapOptions.RemoveExtraApiFields) {
        delete dataValues.storyEstimate;
        delete dataValues.unallocatedParts;
        delete dataValues.unallocatedPoints;
        delete dataValues.partIndex;
    }
    return {
        ...dataValues,
        dataValues: cloneWithoutNested(dataValues)
    };
};
