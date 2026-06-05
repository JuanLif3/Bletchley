import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { RegisterRequestDTO, RegisterResponseDTO, LoginRequestDTO, LoginResponseDTO } from '../dtos/auth.dto';
import { env } from '../config/env.config';

export class AuthService{
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async register(registerData: RegisterRequestDTO): Promise<RegisterResponseDTO> {

        // ! Verificar si el email ya existe
        const existingEmail = await this.userRepository.findByEmail(registerData.email);
        if(existingEmail) {
            throw new Error('El email ya esta registrado');
        }

        // ! Verificar si el usuario existe
        const existingUsername = await this.userRepository.findByUsername(registerData.username);
        if(existingUsername){
            throw new Error('El nombre de usuario ya esta en uso');
        }

        // ! Hashear la contraseña
        const saltRounds = env.SALT_ROUNDS;
        const hashPassword = await bcrypt.hash(registerData.password, saltRounds);

        // ! Crear usuario
        const user = await this.userRepository.create({
            username: registerData.username,
            email: registerData.email,
            passwordHash: hashPassword,
            isGhost: false,
        });

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            message: 'Usuario registrado exitosamente'
        };
    }

    async login(loginData: LoginRequestDTO):Promise<LoginResponseDTO> {

        // ! Buscar usuario por emai
        const user = await this.userRepository.findByEmail(loginData.email);
        if(!user) {
            throw new Error('Credenciales invalidas');
        }

        // ! Verificar contraseña
        const isValidPassword = await bcrypt.compare(loginData.password, user.passwordHash);
        if(!isValidPassword) {
            throw new Error('Credenciales invalidas');
        }

        // ! Generar token JWT
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                username: user.username
            },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN as any}
        );

        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        };
    }
}