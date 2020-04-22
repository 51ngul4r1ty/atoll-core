export const ROLE_USER = "user";
export const ROLE_ADMIN = "admin";

export type Role = typeof ROLE_USER | typeof ROLE_ADMIN;
export type IsoDate = string;

export interface CommonTokenContents {
    userId: string;
    username: string;
}

export interface AuthTokenContents extends CommonTokenContents {
    expirationDate: IsoDate;
    role: Role;
}

export interface RefreshTokenContents extends CommonTokenContents {
    refreshTokenId: string;
}
