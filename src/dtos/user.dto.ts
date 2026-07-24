// * Request DTOs
export interface RegisterUserDto {
    username: string;
    email: string;
    password: string;
}

export interface LoginUserDto {
    email: string;
    password: string;
}

export interface UpdateUserDto {
    username?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
}

// * Response DTOs
export interface UserResponseDTO {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
}

export interface AuthResponseDTO {
    token: string;
    user: UserResponseDTO
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