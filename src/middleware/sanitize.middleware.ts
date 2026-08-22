import { FastifyRequest, FastifyReply} from "fastify";
import { sanitizeObject, validateMessageContent} from "../utils/sanitize.util";
import * as repl from "node:repl";

export class SanitizeMiddleware {
    // ! Sanitizar body de la peticion
    static sanitizeBody (fields: string[]) {
        return async (request: FastifyRequest, reply: FastifyReply) => {
            if (request.body && typeof request.body === 'object') {
                request.body = sanitizeObject(request.body as any, fields);
            }
        };
    }

    // * Validar contenido de mensaje (especifico para mensajes)
    static validateMessage() {
        return async (request: FastifyRequest, reply: FastifyReply) => {
            const body = request.body as { content?: string };
            if (body?.content && !validateMessageContent(body.content)) {
                return reply.status(400).send({
                    success: false,
                    error: 'Contenido del mensaje inválido',
                });
            }
        };
    }
}