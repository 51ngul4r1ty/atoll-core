export const convertDbFloatToNumber = (value: any) => (value ? parseFloat(value) : value);

export const convertDbCharToBoolean = (value: string) => value === "Y";

export const convertBooleanToDbChar = (value: boolean) => (value ? "Y" : "N");
