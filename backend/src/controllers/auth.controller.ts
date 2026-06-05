import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { RegisterRequestDTO, LoginRequestDTO } from '../dtos/auth.dto';

export class AuthController{
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService()
    }

    async register (request: FastifyRequest, reply: FastifyReply) {
        try {
            // ! Validas datos de entrada con Zod
            const validateData = registerSchema.parse(request.body);

            const registerData: RegisterRequestDTO = {
                username: validateData.username,
                email: validateData.email,
                password: validateData.password,
            };

            const result = await this.authService.register(registerData);

            return reply.status(201).send({
                success: true,
                data: result,
            });

        } catch (error: any) {
            // ! Error de validacion de Zod
            if (error.name === 'ZodError') {
                return reply.status(400).send({
                    success: false,
                    error: 'Error de validacion',
                    details: error.errors,
                });
            }

            // ! Errores de negocio (email/usuario ya existente)
            if (error.message === 'EL email ya esta registrado' ||
                error.message == 'El nombre de usuario ya esta en uso') {
                return reply.status(409).send({
                    success: false,
                    error: 'Error interno del servidor',
                });
            }
        }
    }

    async login(request: FastifyRequest, reply: FastifyReply) {
        try {
            // ! Validar datos de entrada
            const validateData = loginSchema.parse(request.body);

            const loginData: LoginRequestDTO = {
                email: validateData.email,
                password: validateData.password,
            };

            const result = await this.authService.login(loginData);

            return reply.status(200).send({
                success: true,
                data: result,
            });

        } catch (error: any) {
            // ! Error de validacion de Zod
            if(error.name === 'ZodError') {
                return reply.status(400).send({
                    success: false,
                    error: 'Error de validacion',
                    details: error.errors,
                });
            }

            // ! Error credenciales invalidas
            if (error.message === 'Credenciales invalidas') {
                return reply.send(401).send({
                    success: false,
                    error: error.message,
                });
            }

            // ! Error generico
            console.error('Error en login', error);
            return reply.status(500).send({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    }
}