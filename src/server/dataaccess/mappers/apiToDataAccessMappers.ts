// libraries
import { ApiSprint } from "@atoll/shared";

// utils
import { convertBooleanToDbChar } from "../conversionUtils";

export enum ApiToDataAccessMapOptions {
    None = 0,
    ForPatch = 1
}

/**
 * Map a Sprint API object to the field values that need to be persisted in a database.
 * @param sprint object passed into REST API call as-is
 * @param mapOptions optional parameter to determine whether to preserve structure or not, patching requires leaving out fields that
 *                 aren't provided in the input.
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
