export interface JWTUser {
    userId: string;
    email: string;
    username: string;
    iat: number;
    exp: number;
}