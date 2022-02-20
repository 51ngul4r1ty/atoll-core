/**
 * Purpose: server-side logging.
 */

export const logError = (message: string) => {
    console.error(message);
};

export const logWarning = (message: string) => {
    console.warn(message);
};

export const logInfo = (message: string) => {
    console.info(message);
};

export const logDebug = (message: string) => {
    console.debug(message);
};
