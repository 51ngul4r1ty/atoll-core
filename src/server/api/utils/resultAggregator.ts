export const getRangeBegin = (status: number) => {
    if (status >= 0 && status < 100) {
        return 0;
    } else if (status >= 100 && status < 200) {
        return 100;
    } else if (status >= 200 && status < 300) {
        return 200;
    } else if (status >= 300 && status < 400) {
        return 300;
    } else if (status >= 400 && status < 500) {
        return 400;
    } else if (status >= 500 && status < 600) {
        return 500;
    } else {
        throw new Error(`unexpected status code: ${status}`);
    }
};

export const getRangeEnd = (status: number) => {
    if (status >= 0 && status < 100) {
        return 99;
    } else if (status >= 100 && status < 200) {
        return 199;
    } else if (status >= 200 && status < 300) {
        return 299;
    } else if (status >= 300 && status < 400) {
        return 399;
    } else if (status >= 400 && status < 500) {
        return 499;
    } else if (status >= 500 && status < 600) {
        return 599;
    } else {
        throw new Error(`unexpected status code: ${status}`);
    }
};

export const combineMessages = (...msgs: string[]): string => {
    let result = "";
    msgs.forEach((msg) => {
        if (result) {
            result += "\n";
        }
        result += msg;
    });
    return result;
};

export const combineStatuses = (...statuses: number[]): number => {
    let firstItem = true;
    let rangeEnd: number = undefined;
    let statusMin: number = undefined;
    let statusMax: number = undefined;
    statuses.forEach((status) => {
        const newRangeEnd = getRangeBegin(status);
        if (firstItem) {
            rangeEnd = newRangeEnd;
            statusMin = status;
            statusMax = status;
            firstItem = false;
        } else {
            if (rangeEnd < newRangeEnd) {
                rangeEnd = newRangeEnd;
            }
            if (statusMin > status) {
                statusMin = status;
            }
            if (statusMax < status) {
                statusMax = status;
            }
        }
    });
    if (statusMin === statusMax) {
        return statusMin;
    } else {
        return getRangeBegin(rangeEnd);
    }
};
