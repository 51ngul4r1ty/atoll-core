// externals
import * as HttpStatus from "http-status-codes";

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

export type UserPreferencesResponse = RestApiErrorResult | UserPreferencesSuccessResponse;

export type UserPreferencesSuccessResponse = RestApiItemResult<ApiUserSettings, undefined, { original: ApiUserSettings }>;

export const getUserPreferences = async (userId: string | null, getLoggedInAppUserId: { () }): Promise<UserPreferencesResponse> => {
    try {
        if (userId !== "{self}") {
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
                return buildResponseWithItem(userSettingsItemTyped);
            } else {
                return buildNotFoundResponse("User settings object was not found for this user");
            }
        }
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};
