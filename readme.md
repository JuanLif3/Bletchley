# Bletchley Chat - Documentación del Proyecto

## Descripción General

Bletchley Chat es una aplicación de mensajería web con cifrado de extremo a extremo (E2EE), diseñada para proporcionar comunicaciones seguras y efímeras. El proyecto permite múltiples chats simultáneos (hasta 4 ventanas), perfiles temporales (fantasma), y enlaces de invitación de un solo uso.

## Estado Actual del Proyecto

### Completado

- Configuración del backend con Fastify y TypeScript
- Configuración del frontend con Vite, React y TypeScript
- Conexión a base de datos Neon (PostgreSQL) mediante TypeORM
- Definición de modelos de datos (entidades)
- Servidor HTTP funcionando en puerto 3000
- Health check y rutas básicas operativas
- Frontend corriendo en puerto 5173
- Tablas creadas automáticamente en Neon

### Pendiente de Implementación

- Sistema de registro y login de usuarios
- Autenticación con JWT
- Endpoints CRUD para usuarios y chats
- WebSockets para mensajería en tiempo real
- Cifrado de extremo a extremo con libsodium
- Sistema de invitaciones de un solo uso
- Perfiles fantasma
- Interfaz de múltiples chats simultáneos

## Tecnologías Utilizadas

### Backend

- Node.js con TypeScript
- Fastify (framework web)
- TypeORM (ORM para base de datos)
- PostgreSQL (Neon.tech como proveedor)
- JSON Web Tokens (JWT) para autenticación
- Bcrypt para hashing de contraseñas
- Libsodium (para cifrado, pendiente de implementación)

### Frontend

- React con TypeScript
- Vite (build tool)
- TailwindCSS (estilos)
- Zustand (gestión de estado)
- Socket.IO client (WebSockets, pendiente)

### Desarrollo

- ESLint (linting)
- Prettier (formato de código)
- Tsx (ejecución de TypeScript)
- Nodemon (recarga automática)

## Modelos de Datos (Entidades)

### User
- id: UUID (primary key)
- username: string (único)
- email: string (único)
- passwordHash: string
- publicKey: string (opcional, para E2EE)
- isGhost: boolean (perfil fantasma)
- createdAt: timestamp
- updatedAt: timestamp
- lastSeen: timestamp (opcional)

### Chat
- id: UUID (primary key)
- name: string (opcional)
- isGroup: boolean
- createdBy: UUID (relación con User)
- createdAt: timestamp
- updatedAt: timestamp

### ChatParticipant
- id: UUID (primary key)
- chatId: UUID (relación con Chat)
- userId: UUID (relación con User)
- joinedAt: timestamp
- leftAt: timestamp (opcional)

### Message
- id: UUID (primary key)
- chatId: UUID (relación con Chat)
- senderId: UUID (relación con User)
- receiverId: UUID (opcional, relación con User)
- content: text (cifrado)
- nonce: text (para descifrado)
- encrypted: boolean
- createdAt: timestamp
- expiresAt: timestamp (opcional)
- deleted: boolean

### Invite
- id: UUID (primary key)
- token: string (único)
- creatorId: UUID (relación con User)
- targetUserId: UUID (opcional)
- chatId: UUID (opcional, relación con Chat)
- used: boolean
- usedAt: timestamp (opcional)
- usedById: UUID (opcional, relación con User)
- expiresAt: timestamp
- createdAt: timestamp

### Session
- id: UUID (primary key)
- userId: UUID (relación con User)
- token: string (único)
- socketId: string (opcional)
- expiresAt: timestamp
- createdAt: timestamp

## Instalación y Configuración

### Requisitos Previos

- Node.js (versión 18 o superior)
- npm (versión 9 o superior)
- Cuenta en Neon.tech (base de datos PostgreSQL)

### Configuración del Backend

1. Navegar a la carpeta del backend:
   cd backend


2. Instalar dependencias:
   npm install


3. Configurar variables de entorno en archivo .env:
   PORT=3000

   NODE_ENV=development

   DB_HOST=ep-lively-unit-ack60rpo-pooler.sa-east-1.aws.neon.tech

   DB_PORT=5432

   DB_USER=neondb_owner

   DB_PASSWORD=tu_contraseña

   DB_NAME=neondb

   DATABASE_URL=postgresql://usuario:contraseña@host/database?sslmode=require

   JWT_SECRET=tu_secreto_jwt

   JWT_EXPIRES_IN=7d

   SALT_ROUNDS=10

   CORS_ORIGIN=http://localhost:5173


4. Iniciar el servidor en modo desarrollo:
   npm run dev


5. Verificar que el servidor está corriendo:
   curl http://localhost:3000/health


### Configuración del Frontend

1. Navegar a la carpeta del frontend:
   cd bletchley-frontend


2. Instalar dependencias:
   npm install


3. Iniciar el servidor de desarrollo:
   npm run dev


4. Abrir el navegador en:
   http://localhost:5173


## Scripts Disponibles

### Backend

- `npm run dev` - Inicia el servidor en modo desarrollo con recarga automática
- `npm run build` - Compila TypeScript a JavaScript
- `npm run start` - Ejecuta la versión compilada en producción
- `npm run lint` - Ejecuta ESLint para verificar código
- `npm run format` - Formatea el código con Prettier

### Frontend

- `npm run dev` - Inicia el servidor de desarrollo de Vite
- `npm run build` - Compila la aplicación para producción
- `npm run preview` - Previsualiza la versión compilada

## Endpoints Actuales (Operativos)

### Health Check
- **GET /** - Información general de la API
- Respuesta: `{"name":"Bletchley Chat API","version":"1.0.0","status":"running"}`

- **GET /health** - Estado del servidor
- Respuesta: `{"status":"ok","timestamp":"2026-06-05T14:58:24.871Z"}`

### Endpoints Pendientes de Implementar

- POST /api/v1/auth/register - Registro de usuario
- POST /api/v1/auth/login - Inicio de sesión
- POST /api/v1/auth/logout - Cierre de sesión
- GET /api/v1/users/:id - Obtener perfil de usuario
- PUT /api/v1/users/:id - Actualizar perfil
- POST /api/v1/chats - Crear nuevo chat
- GET /api/v1/chats/:id - Obtener detalles del chat
- POST /api/v1/chats/:id/messages - Enviar mensaje
- GET /api/v1/chats/:id/messages - Obtener mensajes del chat
- POST /api/v1/invites - Crear enlace de invitación
- GET /api/v1/invites/:token - Validar y usar invitación

## Características Planificadas

### Seguridad

- Cifrado de extremo a extremo (E2EE) con libsodium
- Hashing de contraseñas con bcrypt
- Autenticación con JWT
- Doble factor de autenticación (2FA)
- Protección contra XSS y CSRF

### Funcionalidades de Chat

- Múltiples chats simultáneos (hasta 4 ventanas)
- Mensajes efímeros que se eliminan al salir
- Indicadores de escritura
- Confirmación de lectura
- Envío de archivos cifrados

### Gestión de Usuarios

- Perfiles normales y perfiles fantasma
- Enlaces de invitación de un solo uso
- Auto-eliminación de perfiles fantasma
- Historial de contactos

## Base de Datos

El proyecto utiliza Neon.tech como proveedor de PostgreSQL. Las ventajas incluyen:

- Base de datos serverless
- Escalado automático
- Copias de seguridad automáticas
- Conexión segura mediante SSL

Las tablas se crean automáticamente al iniciar el servidor gracias a la configuración `synchronize: true` de TypeORM (solo para desarrollo).

## Próximos Pasos en el Desarrollo

1. Implementar sistema de registro y login con JWT
2. Crear los repositorios para acceso a datos
3. Implementar servicios con lógica de negocio
4. Configurar WebSockets para mensajería en tiempo real
5. Desarrollar la interfaz de múltiples chats
6. Integrar cifrado E2EE
7. Implementar sistema de invitaciones de un solo uso
8. Agregar perfiles fantasma
9. Conectar frontend con backend mediante API y WebSockets
10. Realizar pruebas de seguridad y rendimiento

## Notas de Desarrollo

- El backend corre en el puerto 3000 por defecto
- El frontend corre en el puerto 5173 por defecto
- CORS está configurado para permitir peticiones desde el frontend
- TypeORM está configurado con `synchronize: true` para desarrollo; cambiar a `false` en producción
- Las contraseñas deben ser hasheadas con bcrypt antes de almacenar
- Los mensajes deben ser cifrados en el cliente antes de enviar al servidor

## Solución de Problemas Comunes

### Error de conexión a base de datos

Verificar que:
- La URL de DATABASE_URL en .env es correcta
- La conexión a internet está activa
- Las credenciales de Neon son válidas

### Error de TypeScript

Asegurar que:
- `emitDecoratorMetadata` y `experimentalDecorators` están habilitados en tsconfig.json
- `reflect-metadata` está importado al inicio de server.ts

### Puerto en uso

Cambiar el puerto en .env:
PORT=3001


### Documentación actualizada: 5 de junio de 2026

*Versión del proyecto: 1.0.0-alpha*
