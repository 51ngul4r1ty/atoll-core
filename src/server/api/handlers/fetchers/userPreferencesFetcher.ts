// externals
import * as HttpStatus from "http-status-codes";

// utils
import { mapToUserSettings } from "../../../dataaccess/mappers";

// data access
import { UserSettingsModel } from "../../../dataaccess/models/UserSettings";

// interfaces/types
import { FetcherErrorResponse } from "./types";

// consts/enums
import { ResponseItemStructure, returnWithItem, returnWithNotFound, returnWithNotImplemented } from "../../utils/returner";
import { ApiUserSettings } from "@atoll/shared";

export type UserPreferencesResponse = FetcherErrorResponse | UserPreferencesSuccessResponse;

export type UserPreferencesSuccessResponse = ResponseItemStructure<ApiUserSettings>;

export const userPreferencesFetcher = async (
    userId: string | null,
    getLoggedInAppUserId: { () }
): Promise<UserPreferencesResponse> => {
    try {
        if (userId !== "{self}") {
            return returnWithNotImplemented(
                "This endpoint is intended as an admin endpoint, so a typical user would not be able to use it."
            );
        } else {
            const appuserId = getLoggedInAppUserId();
            let userSettingsItem: any = await UserSettingsModel.findOne({
                where: { appuserId }
            });
            if (userSettingsItem) {
                const userSettingsItemTyped = mapToUserSettings(userSettingsItem);
                return returnWithItem(userSettingsItemTyped);
            } else {
                return returnWithNotFound("User settings object was not found for this user");
            }
        }
    } catch (error) {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error
        } as FetcherErrorResponse;
    }
};
