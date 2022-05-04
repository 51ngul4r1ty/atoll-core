// externals
import { StatusCodes } from "http-status-codes";

// libraries
import { ApiUserSettings } from "@atoll/shared";

// utils
import { mapDbToApiUserSettings } from "../../../dataaccess/mappers/dataAccessToApiMappers";

// data access
import { UserSettingsDataModel } from "../../../dataaccess/models/UserSettingsDataModel";

// consts/enums
import {
    buildNotFoundResponse,
    buildNotImplementedResponse,
    buildResponseFromCatchError,
    buildResponseWithItem,
    RestApiErrorResult,
    RestApiItemResult
} from "../../utils/responseBuilder";

export type UserPreferencesResult = RestApiErrorResult | UserPreferencesItemResult;

export type UserPreferencesItemResult = RestApiItemResult<ApiUserSettings, undefined, { original: ApiUserSettings }>;

export const getUserPreferences = async (userId: string | null, getLoggedInAppUserId: { () }): Promise<UserPreferencesResult> => {
    try {
        if (userId !== "--self--") {
            return buildNotImplementedResponse(
                "This endpoint is intended as an admin endpoint, so a typical user would not be able to use it."
            );
        } else {
            const appuserId = getLoggedInAppUserId();
            let userSettingsItem: any = await UserSettingsDataModel.findOne({
                where: { appuserId }
            });
            if (userSettingsItem) {
                const userSettingsItemTyped = mapDbToApiUserSettings(userSettingsItem);
                const result: UserPreferencesItemResult = buildResponseWithItem(userSettingsItemTyped);
                return result;
            } else {
                return buildNotFoundResponse("User settings object was not found for this user");
            }
        }
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};
