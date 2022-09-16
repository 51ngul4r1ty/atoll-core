// libraries
import { ApiUserSettings } from "@atoll/shared";

// data access
import { UserSettingsDataModel } from "../../../dataaccess/models/UserSettingsDataModel";

// consts/enums
import {
    buildNotImplementedResponse,
    buildResponseFromCatchError,
    RestApiErrorResult,
    RestApiItemResult
} from "../../utils/responseBuilder";

// interfaces/types
import { HandlerContext } from "../utils/handlerContext";

// utils
import { mapDbToApiUserSettings } from "../../../dataaccess/mappers/dataAccessToApiMappers";
import { getPatchedItem } from "../../utils/patcher";

export type UserPreferencesResult = RestApiErrorResult | UserPreferencesItemResult;

export type UserPreferencesItemResult = RestApiItemResult<ApiUserSettings, undefined, { original: ApiUserSettings }>;

export const patchUserPreferences = async (
    handlerContext: HandlerContext,
    reqBody: any,
    originalUserSettings: ApiUserSettings,
    dbUserSettings: UserSettingsDataModel,
    userId: string
) => {
    try {
        let newDataItem: ApiUserSettings;
        // TODO: Maybe this validation check should occur outside the "patcher"??
        if (userId !== "--self--") {
            return buildNotImplementedResponse(
                "This endpoint is intended as an admin endpoint, so a typical user would not be able to use it."
            );
        } else {
            if (reqBody.settings) {
                newDataItem = getPatchedItem(
                    originalUserSettings,
                    { settings: reqBody.settings },
                    { preserveNestedFields: true, allowExtraFields: true }
                );
                const transaction = handlerContext.transactionContext.transaction;
                await dbUserSettings.update(newDataItem, {
                    transaction
                });
                return mapDbToApiUserSettings(dbUserSettings);
            }
            return originalUserSettings;
        }
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};
