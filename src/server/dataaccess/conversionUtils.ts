export const convertDbFloatToNumber = (value: any) => (!value ? value : parseFloat(value));

export const convertDbCharToBoolean = (value: string) => value === "Y";

export const convertBooleanToDbChar = (value: boolean) => (value ? "Y" : "N");

export const convertFloatToDbNumber = (value: any) => (!value ? value : `${value}`);

export const convertDateToApiDate = (value: Date) => (!value ? value : value.toISOString());

export const convertApiDateToDate = (value: string) => (!value ? value : new Date(value));
