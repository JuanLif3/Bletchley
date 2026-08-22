import { FastifyRequest, FastifyReply} from "fastify";

// * Almacenamiento en memoria (para produccion usar redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number}>();

interface RateLimitOptions {
    windowsMs?: number;
    maxRequests?: number;
    message?: string;
}

export class RateLimitMiddleware {
    private static defaultOptions: RateLimitOptions = {
        windowsMs: 15 * 60 * 1000, // ! 15 min
        maxRequests: 100, // 100 peticiones
        message: 'Demasiadas peticiones, intenta mas tarde',
    };

    static create(options: RateLimitOptions = {}) {
        const opts = { ...this.defaultOptions, ...options};

        return async (request: FastifyRequest, reply: FastifyReply) => {
            const ip = request.ip || request.socket.remoteAddress || 'unknown';
            const key = `${ip}:${request.routerPath}`;

            const now = Date.now();
            const record = rateLimitStore.get(key);

            if (!record || now > record.resetAt) {
                rateLimitStore.set(key, {
                    count: 1,
                    resetAt: now + opts.windowsMs!,
                });
                return;
            }

            record.count++;

            if (record.count > opts.maxRequests!) {
                return reply.status(429).send({
                    success: false,
                    error: opts.message,
                    retryAfer: Math.ceil((record.resetAt - now) / 1000),
                });
            }

            rateLimitStore.set(key, record);
        };
    }

    // * Limpiar registros expirados
    static cleanExpired() {
        const now = Date.now();
        for (const [key, record] of rateLimitStore) {
            if (now > record.resetAt) {
                rateLimitStore.delete(key);
            }
        }
    }
}

// * Limpiar cada 5 minutos
setInterval(RateLimitMiddleware.cleanExpired, 5 * 60 * 1000);