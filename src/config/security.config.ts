import { FastifyInstance } from 'fastify';

export function configureSecurityHeaders(app: FastifyInstance) {
    app.addHook('onRequest', (request, reply, done) => {
        // * Headers de seguridad
        reply.header('X-Content-Type-Options', 'nosniff');
        reply.header('X-Frame-Options', 'DENY');
        reply.header('X-XSS-Protection', '1; mode=block');
        reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
        reply.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

        // * Content Security Policy (CSP)
        reply.header(
            'Content-Security-Policy',
            [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline'",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data:",
                "font-src 'self' data:",
                "connect-src 'self' ws: wss:",
            ].join('; ')
        );

        done();
    });
}