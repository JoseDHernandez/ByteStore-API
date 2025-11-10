# 📝 Reviews Service - ByteStore API

## 📑 Índice

- [🚀 Descripción](#-descripción)
- [✨ Características Principales](#-características-principales)
- [🛠️ Tecnologías Utilizadas](#️-tecnologías-utilizadas)
- [📋 Prerrequisitos](#-prerrequisitos)
- [🔧 Instalación](#-instalación)
- [Variables de Entorno](#variables-de-entorno)
- [🚀 Ejecución](#-ejecución)
- [📚 Documentación de la API](#-documentación-de-la-api)
  - [🔐 Autenticación](#-autenticación)
  - [📝 Endpoints de Reviews](#-endpoints-de-reviews)
- [🗄️ Estructura de la Base de Datos](#️-estructura-de-la-base-de-datos)
- [🚨 Códigos de Estado HTTP](#-códigos-de-estado-http)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🐳 Docker](#-docker)
- [📝 Notas Importantes](#-notas-importantes)
- [🤝 Contribución](#-contribución)
- [📄 Licencia](#-licencia)

## 🚀 Descripción

Microservicio especializado en la gestión de reseñas y calificaciones para la plataforma ByteStore. Proporciona un sistema completo de reviews con autenticación, validaciones robustas y control de permisos granular.

## ✨ Características Principales

- **Sistema de Calificaciones**: Reviews con puntuación de 1 a 5 estrellas
- **Autenticación JWT**: Seguridad basada en tokens con validación de roles
- **CRUD Completo**: Operaciones completas para reviews/calificaciones
- **Paginación Avanzada**: Sistema de paginación con estructura estándar
- **Filtros y Ordenamiento**: Búsqueda por producto, usuario, calificación y fechas
- **Validaciones Robustas**: Esquemas Zod para validación de datos
- **Control de Permisos**: Sistema de autorización propietario/admin
- **Base de Datos MySQL**: Persistencia confiable con transacciones
- **Formato ISO**: Manejo estándar de fechas

## 🛠️ Tecnologías Utilizadas

- **Node.js** (v18+) - Runtime de JavaScript
- **TypeScript** - Tipado estático
- **Express.js** - Framework web
- **MySQL2** - Driver de base de datos
- **JWT** - Autenticación y autorización
- **Zod** - Validación de esquemas
- **Morgan** - Logging de requests
- **CORS** - Manejo de políticas de origen cruzado

## 📋 Prerrequisitos

- Node.js >= 18.0.0
- npm >= 8.0.0
- MySQL >= 8.0
- Git

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd ByteStore-API/review-service
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones.

### 4. Configurar la base de datos

- Crear la base de datos MySQL
- Ejecutar el script `init/data.sql` para crear las tablas y datos de prueba

## Variables de Entorno

| Variable         | Descripción                              | Valor por defecto                                               |
| ---------------- | ---------------------------------------- | --------------------------------------------------------------- |
| `PORT`           | Puerto del servidor                      | `3005`                                                          |
| `NODE_ENV`       | Entorno de ejecución                     | `development`                                                   |
| `DB_HOST`        | Host de la base de datos MySQL           | `localhost`                                                     |
| `DB_PORT`        | Puerto de la base de datos MySQL         | `3306`                                                          |
| `DB_USER`        | Usuario de la base de datos              | `root`                                                          |
| `DB_PASSWORD`    | Contraseña de la base de datos           | `password`                                                      |
| `DB_NAME`        | Nombre de la base de datos               | `bytestore_reviews`                                             |
| `JWT_SECRET`     | Clave secreta para firmar los tokens JWT | `@y*&0a%K%7P0t@uQ^38HN$y4Z^PK#0zE7dem700Bbf&pC6HF$aU^ARkE@u$nn` |
| `JWT_EXPIRES_IN` | Duración del token JWT                   | `30d`                                                           |

### Ejemplo de archivo .env

```env
# Configuración del servidor
PORT=3005
NODE_ENV=development

# Configuración de la base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=bytestore_reviews

# Configuración JWT
JWT_SECRET=@y*&0a%K%7P0t@uQ^38HN$y4Z^PK#0zE7dem700Bbf&pC6HF$aU^ARkE@u$nn
JWT_EXPIRES_IN=30d
```

## 🚀 Ejecución

### Desarrollo

```bash
npm run dev
```

El servidor se ejecutará en `http://localhost:3005` con recarga automática.

### Producción

```bash
npm run build
npm start
```

## 📚 Documentación de la API

### Base URL

```
http://localhost:3005/api
```

### 🔐 Autenticación

Flujo sencillo para proteger las rutas de creación y modificación:

1. Inicia sesión en el user-service (`POST /users/sign-in`) para recibir tu JWT.
2. Envía el header `Authorization: <token>` en las rutas protegidas.
3. Comprueba si tu token sigue activo consultando `GET /reviews/auth/validate`.

#### Obtener token

```http
POST /users/sign-in
Content-Type: application/json

{
  "correo": "usuario@ejemplo.com",
  "password": "tu_password"
}
```

#### Validar token

```http
GET /reviews/auth/validate
Authorization: <token>
```

**Respuesta 200**

```json
{
  "message": "Token válido",
  "user": {
    "id": "01991c0e-16f0-707f-9f6f-3614666caead",
    "role": "USUARIO"
  }
}
```

#### Permisos rápidos

- Público: `GET /reviews`, `GET /reviews/:id`
- Autenticado: `POST /reviews`
- Propietario/Admin: `PUT /reviews/:id`, `DELETE /reviews/:id`

### 📝 Endpoints de Reviews

#### Obtener Reviews

```http
GET /api/reviews?page=1&limit=10&producto_id=1&calificacion=5
```

**Query Parameters:**

- `page` (number): Página actual (default: 1)
- `limit` (number): Elementos por página (default: 10, max: 100)
- `producto_id` (number): Filtrar por producto
- `user_id` (number): Filtrar por usuario (solo admin)
- `calificacion` (number): Filtrar por calificación (1-5)
- `fecha_desde` (string): Fecha desde (ISO format)
- `fecha_hasta` (string): Fecha hasta (ISO format)
- `sort` (string): Campo de ordenamiento (`fecha_creacion`, `calificacion`)
- `order` (string): Dirección (`asc`, `desc`)

**Response:**

```json
{
  "total": 51,
  "pages": 3,
  "first": 1,
  "next": 2,
  "prev": null,
  "data": [
    {
      "calificacion_id": 1,
      "user_id": 1,
      "producto_id": 1,
      "calificacion": 5,
      "comentario": "Excelente producto",
      "fecha_creacion": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### Crear Review

```http
POST /api/reviews
Content-Type: application/json
Authorization: <token>

{
  "producto_id": 1,
  "calificacion": 5,
  "comentario": "Excelente producto, muy recomendado"
}
```

#### Obtener Review por ID

```http
GET /api/reviews/:id
```

#### Actualizar Review

```http
PUT /api/reviews/:id
Content-Type: application/json
Authorization: <token>

{
  "calificacion": 4,
  "comentario": "Buen producto, actualizo mi review"
}
```

#### Eliminar Review

```http
DELETE /api/reviews/:id
Authorization: <token>
```

## 🗄️ Estructura de la Base de Datos

### Tabla: calificaciones

```sql
calificacion_id (PK, AUTO_INCREMENT) | user_id (FK) | producto_id | calificacion (1-5) | comentario (TEXT) | fecha_creacion (DATETIME)
```

## 🚨 Códigos de Estado HTTP

- **200** - OK (operación exitosa)
- **201** - Created (recurso creado)
- **400** - Bad Request (datos inválidos)
- **401** - Unauthorized (no autenticado)
- **403** - Forbidden (sin permisos)
- **404** - Not Found (recurso no encontrado)
- **500** - Internal Server Error (error del servidor)

## 📁 Estructura del Proyecto

```
review-service/
├── src/
│   ├── controllers/     # Controladores de las rutas
│   ├── middleware/      # Middleware de autenticación
│   ├── routes/         # Definición de rutas
│   ├── schemas/        # Validaciones Zod
│   ├── types/          # Tipos TypeScript
│   ├── utils/          # Utilidades (JWT)
│   ├── db.ts           # Configuración de base de datos
│   └── index.ts        # Punto de entrada
├── init/
│   └── data.sql        # Script de inicialización
├── package.json
├── tsconfig.json
└── README.md
```

## 🐳 Docker

Para ejecutar con Docker:

```bash
# Construir imagen
docker build -t review-service .

# Ejecutar contenedor
docker run -p 3005:3005 --env-file .env review-service
```

## 📝 Notas Importantes

- Las fechas se manejan en formato ISO 8601
- La paginación sigue la estructura estándar especificada
- Las calificaciones van de 1 a 5 estrellas
- Las transacciones garantizan consistencia en operaciones complejas
- El middleware de autenticación valida tanto la existencia del token como del usuario
- Solo el propietario de una review o un admin puede modificarla o eliminarla

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request
