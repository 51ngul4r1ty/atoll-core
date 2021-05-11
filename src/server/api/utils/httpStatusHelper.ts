export enum StatusRange {
    Info = 1,
    Success = 2,
    Redirection = 3,
    ClientError = 4,
    ServerError = 5
}

export const getStatusRange = (status: number): StatusRange => {
    if (status < 200) {
        return StatusRange.Info;
    } else if (status < 300) {
        return StatusRange.Success;
    } else if (status < 400) {
        return StatusRange.Redirection;
    } else if (status < 500) {
        return StatusRange.ClientError;
    } else if (status < 600) {
        return StatusRange.ServerError;
    } else {
        throw new Error(`Unexpected status - outside normal range (0 to 599): ${status}`);
    }
};

export const isStatusSuccess = (status: number): boolean => {
    const statusRange = getStatusRange(status);
    return statusRange === StatusRange.Success;
};

export const isStatusServerError = (status: number): boolean => {
    const statusRange = getStatusRange(status);
    return statusRange === StatusRange.ServerError;
};
