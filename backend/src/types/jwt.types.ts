export interface JWTUser {
    userId: string;
    email: string;
    username: string;
    iat: number;
    exp: number;
}

export interface JWTPayload {
    userId: string;
    email: string;
    username: string;
}