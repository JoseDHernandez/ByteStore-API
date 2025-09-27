# Review Service - ByteStore API

Servicio de calificaciones y reseñas para la plataforma ByteStore. Permite a los usuarios crear, leer, actualizar y eliminar reseñas de productos.

## 🚀 Características

- ✅ Autenticación JWT con secreto personalizado
- ✅ Autorización basada en roles (usuario/admin)
- ✅ CRUD completo para reseñas
- ✅ Filtrado y ordenamiento avanzado
- ✅ Validación de datos con Zod
- ✅ Prevención de reseñas duplicadas por usuario/producto
- ✅ Estadísticas de calificaciones por producto
- ✅ Compatibilidad con fechas ISO
- ✅ Preparado para Docker

## 📋 Requisitos

- Node.js 18+
- MySQL 8.0+
- TypeScript 5+

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Configurar base de datos
mysql -u root -p < database/init.sql

# Configurar variables de entorno
cp .env.example .env

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build
npm start
```

## 🔧 Configuración

### Variables de Entorno (.env)

```env
PORT=3003
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=bytestore_reviews
JWT_SECRET=@y*&0a%K%7P0t@uQ^38HN$y4Z^PK#0zE7dem700Bbf&pC6HF$aU^ARkE@u$nn
NODE_ENV=development
```

## 📚 API Endpoints

### Autenticación

Todos los endpoints que requieren autenticación deben incluir el header:
```
Authorization: Bearer <JWT_TOKEN>
```

### 1. Crear Reseña

**POST** `/api/reviews`

**Autenticación:** Requerida

**Body:**
```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440020",
  "rating": 5,
  "comment": "Excelente producto, muy recomendado"
}
```

**Respuesta (201):**
```json
{
  "message": "Reseña creada exitosamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "userId": "550e8400-e29b-41d4-a716-446655440010",
    "productId": "550e8400-e29b-41d4-a716-446655440020",
    "rating": 5,
    "comment": "Excelente producto, muy recomendado",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Obtener Todas las Reseñas

**GET** `/api/reviews`

**Autenticación:** No requerida

**Query Parameters:**
- `productId` (opcional): Filtrar por producto
- `userId` (opcional): Filtrar por usuario
- `sortBy` (opcional): `date` | `rating` (default: `date`)
- `sortOrder` (opcional): `asc` | `desc` (default: `desc`)
- `limit` (opcional): 1-100 (default: 10)
- `offset` (opcional): ≥0 (default: 0)

**Ejemplo:**
```
GET /api/reviews?sortBy=rating&sortOrder=desc&limit=5
```

**Respuesta (200):**
```json
{
  "message": "Reseñas obtenidas exitosamente",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440010",
      "productId": "550e8400-e29b-41d4-a716-446655440020",
      "rating": 5,
      "comment": "Excelente producto",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0
  }
}
```

### 3. Obtener Reseña por ID

**GET** `/api/reviews/:id`

**Autenticación:** No requerida

**Respuesta (200):**
```json
{
  "message": "Reseña obtenida exitosamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "userId": "550e8400-e29b-41d4-a716-446655440010",
    "productId": "550e8400-e29b-41d4-a716-446655440020",
    "rating": 5,
    "comment": "Excelente producto",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Obtener Reseñas por Producto

**GET** `/api/reviews/product/:productId`

**Autenticación:** No requerida

**Respuesta (200):**
```json
{
  "message": "Reseñas del producto obtenidas exitosamente",
  "data": [...],
  "statistics": {
    "averageRating": 4.2,
    "totalReviews": 15
  },
  "pagination": {
    "limit": 10,
    "offset": 0
  }
}
```

### 5. Obtener Reseñas por Usuario

**GET** `/api/reviews/user/:userId`

**Autenticación:** Requerida (solo propietario o admin)

**Respuesta (200):**
```json
{
  "message": "Reseñas del usuario obtenidas exitosamente",
  "data": [...],
  "pagination": {
    "limit": 10,
    "offset": 0
  }
}
```

### 6. Actualizar Reseña

**PUT** `/api/reviews/:id`

**Autenticación:** Requerida (solo propietario o admin)

**Body:**
```json
{
  "rating": 4,
  "comment": "Actualización del comentario"
}
```

**Respuesta (200):**
```json
{
  "message": "Reseña actualizada exitosamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "userId": "550e8400-e29b-41d4-a716-446655440010",
    "productId": "550e8400-e29b-41d4-a716-446655440020",
    "rating": 4,
    "comment": "Actualización del comentario",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

### 7. Eliminar Reseña

**DELETE** `/api/reviews/:id`

**Autenticación:** Requerida (solo propietario o admin)

**Respuesta (200):**
```json
{
  "message": "Reseña eliminada exitosamente"
}
```

## 🔒 Autorización

### Reglas de Acceso

1. **Crear reseña:** Usuario autenticado
2. **Leer reseñas:** Público (excepto reseñas por usuario)
3. **Actualizar reseña:** Solo propietario o admin
4. **Eliminar reseña:** Solo propietario o admin
5. **Ver reseñas de usuario:** Solo propietario o admin

### Roles de Usuario

- **Usuario regular:** Puede gestionar solo sus propias reseñas
- **Administrador:** Puede gestionar cualquier reseña

## 📊 Códigos de Estado HTTP

- **200:** Operación exitosa
- **201:** Recurso creado exitosamente
- **400:** Datos inválidos o parámetros incorrectos
- **401:** Token requerido o inválido
- **403:** Acceso denegado (permisos insuficientes)
- **404:** Recurso no encontrado
- **409:** Conflicto (ej: reseña duplicada)
- **500:** Error interno del servidor

## 🗄️ Estructura de Base de Datos

### Tabla: reviews

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | VARCHAR(36) | UUID único de la reseña |
| userId | VARCHAR(36) | UUID del usuario que creó la reseña |
| productId | VARCHAR(36) | UUID del producto reseñado |
| rating | INT | Calificación de 1 a 5 estrellas |
| comment | TEXT | Comentario de la reseña |
| createdAt | DATETIME | Fecha de creación (ISO) |
| updatedAt | DATETIME | Fecha de última actualización (ISO) |

### Índices

- `idx_product_id`: Optimiza consultas por producto
- `idx_user_id`: Optimiza consultas por usuario
- `idx_created_at`: Optimiza ordenamiento por fecha
- `idx_rating`: Optimiza ordenamiento por calificación
- `idx_user_product`: Previene reseñas duplicadas (UNIQUE)

## 🐳 Docker

El servicio está preparado para ejecutarse en Docker. La configuración se incluirá en el `docker-compose.dev.yml` del proyecto principal.

## 🧪 Validaciones

### Crear/Actualizar Reseña

- **productId:** UUID válido (requerido para crear)
- **rating:** Entero entre 1 y 5 (requerido para crear)
- **comment:** String de 1-1000 caracteres (requerido para crear)

### Query Parameters

- **limit:** Entero entre 1 y 100
- **offset:** Entero ≥ 0
- **sortBy:** 'date' o 'rating'
- **sortOrder:** 'asc' o 'desc'

## 🔧 Tecnologías Utilizadas

- **Express.js:** Framework web
- **TypeScript:** Tipado estático
- **MySQL2:** Driver de base de datos
- **Zod:** Validación de esquemas
- **JWT:** Autenticación
- **Morgan:** Logging de requests
- **UUID:** Generación de identificadores únicos

## 📝 Notas de Desarrollo

- El JWT tiene una duración de 30 días
- Las fechas se almacenan en formato ISO
- Se previenen reseñas duplicadas por usuario/producto
- El servicio incluye CORS básico para desarrollo
- Logging completo de requests para debugging

## 🚀 Health Check

**GET** `/health`

Endpoint para verificar el estado del servicio:

```json
{
  "service": "review-service",
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```