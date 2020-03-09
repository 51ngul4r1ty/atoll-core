import { v4 as uuid } from "uuid";

export const getSimpleUuid = (): string => {
    return uuid().replace(/-/g, "");
};

export const addIdToBody = (body: any): any => {
    return { ...body, id: getSimpleUuid() };
};
