// * Escapar caracteres especiales para prevenir XSS
export function sanitizeInput(input: string): string {
    if (!input) return input;
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// * Validar y sanitizar objetos completos
export function sanitizeObject<T extends Record<string, any>>(
    obj: T,
    fields: (keyof T)[]
): T {
    const sanitized = { ...obj };
    for (const field of fields) {
        if (sanitized[field] && typeof sanitized[field] === 'string') {
            sanitized[field] = sanitizeInput(sanitized[field]) as any;
        }
    }
    return sanitized;
}

// * Validar contenido de mensaje (limitar longitud, caracteres peligrosos)
export function validateMessageContent(content: string): boolean {
    if (!content || content.length> 1000) return false;
    // ! Solo caracteres permitidos (letras, numeros, espacios, puntuacion basica)
    const allowedRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,!?¿¡()\-_:;'"@#$%&+*=<>/]{1,1000}$/;
    return allowedRegex.test(content);
}