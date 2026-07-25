// * Request DTOs
export interface CreateInviteDto {
    // No se necesitan datos, solo el usuario autenticado
}

export interface AcceptInviteDto {
    token: string;
}

// * Response DTOs
export interface InviteResponseDto {
    id: string;
    token: string;
    link: string;
    expiresAt: Date;
    createdAt: Date;
    message: string;
}

export interface AcceptInviteResponseDto {
    chatId: string;
    message: string;
}