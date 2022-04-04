export type HandlerHelperOptions = {
    suppressTransactions: boolean;
};

export type HandlerHelperResponse<T> = {
    response: T;
    rollbackRequired: boolean;
    commitRequired: boolean;
};
