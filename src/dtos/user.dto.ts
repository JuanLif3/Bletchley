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
export interface UserResponseDto {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
}

export interface AuthResponseDto {
    token: string;
    user: UserResponseDto
}

export interface UpdateUserResponseDto {
    id: string;
    username: string;
    email: string;
    updatedAt: Date;
    message: string;
}

export interface DeleteUserResponseDto {
    success: boolean;
    message: string;
}