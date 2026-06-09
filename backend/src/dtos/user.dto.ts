export interface UpdateUserRequestDTO {
    username?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
}

export interface GetUserResponseDTO {
    id: string;
    username: string;
    email: string;
    isGhost: boolean;
    createdAt: Date;
    lastSeen?: Date;
}

export interface UpdateUserResponseDTO {
    id: string;
    username: string;
    email: string;
    updatedAt: Date;
    message: string;
}

export interface DeleteUserResponseDTO {
    success: boolean;
    message: string;
}