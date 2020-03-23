// NOTE: This is a simple passthrough for now, but in future it may filter what gets sent to the API consumer.
export const buildErrorForApiResponse = (error) => {
    return {
        msg: error
    };
};
