export const getMessageFromError = (err: Error | string): string => {
    if (typeof err === "string") {
        return err;
    }
    return (err as Error).message;
};
