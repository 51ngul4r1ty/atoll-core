// utils
import { logDebug, logError, logInfo } from "../handlers/utils/serverLogger";

// interfaces/types
import type { RestApiErrorResult } from "./responseBuilder";

export const logErrorInfo = (
    message: string,
    stack: string | undefined,
    contextMessage = "<Unknown Context>",
    additionalLogMessage?: string
) => {
    if (stack) {
        logError(`${contextMessage}: ${message}`);
        logDebug(`STACK: ${stack}`);
    } else {
        logError(`${contextMessage}: ${message}`);
    }
    if (additionalLogMessage) {
        logInfo(additionalLogMessage);
    }
};

export const logErrorInfoFromResponseObj = (
    responseObj: RestApiErrorResult,
    contextMessage?: string,
    additionalLogMessage?: string
) => {
    logErrorInfo(responseObj.message, responseObj.stack, contextMessage, additionalLogMessage);
};
