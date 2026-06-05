// * DTO para solicitud del regsitro
export interface RegisterRequestDTO {
    username: string;
    email: string;
    password: string;
}

// * DTO para respuesta de registro
export interface RegisterResponseDTO {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
    message: string;
}

// * DTO para solicitud de login
export interface LoginRequestDTO {
    email: string;
    password: string;
}

// * DTO para respuesta del login
export interface LoginResponseDTO {
    token: string;
    user: {
        id: string;
        username: string;
        email: string;
    };
}