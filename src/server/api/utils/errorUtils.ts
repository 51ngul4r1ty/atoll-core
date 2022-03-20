export const getMessageFromError = (err: Error | string): string => {
    if (typeof err === "string") {
        return err;
    }
    const errMessage = (err as Error).message;
    if (errMessage) {
        return errMessage;
    }
    return `${err}`;
};

export const getStackFromError = (err: Error | string): string | null => {
    if ((err as Error).message) {
        return (err as Error).stack;
    }
    return null;
};
