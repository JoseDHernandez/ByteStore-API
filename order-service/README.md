# 📦 Orders Service - ByteStore API

## 📑 Índice

- [🚀 Descripción](#-descripción)
- [✨ Características Principales](#-características-principales)
- [🛠️ Tecnologías Utilizadas](#️-tecnologías-utilizadas)
- [📋 Prerrequisitos](#-prerrequisitos)
- [🔧 Instalación](#-instalación)
- [Variables de Entorno](#variables-de-entorno)
- [🚀 Ejecución](#-ejecución)
- [📚 Documentación de la API](#-documentación-de-la-api)
  - [� Autenticación](#-autenticación)
  - [�📋 Endpoints de Órdenes](#-endpoints-de-órdenes)
  - [🔄 Endpoints de Estados](#-endpoints-de-estados)
- [🔐 Estados de Órdenes](#-estados-de-órdenes)
- [🗄️ Estructura de la Base de Datos](#️-estructura-de-la-base-de-datos)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🚨 Códigos de Error Comunes](#-códigos-de-error-comunes)
- [🔒 Seguridad](#-seguridad)
- [🤝 Contribución](#-contribución)
- [📄 Licencia](#-licencia)
- [📞 Soporte](#-soporte)

## 🚀 Descripción

Microservicio dedicado a la gestión completa de órdenes para ByteStore. Proporciona funcionalidades avanzadas para el manejo del ciclo de vida de las órdenes, desde su creación hasta la entrega, incluyendo gestión de estados, productos y estadísticas.

## ✨ Características Principales

- **Gestión Completa de Órdenes**: CRUD completo con validaciones robustas
- **Manejo de Estados**: Flujo de trabajo con transiciones controladas
- **Gestión de Productos**: Administración de productos dentro de órdenes
- **Historial de Cambios**: Trazabilidad completa de modificaciones
- **Estadísticas Avanzadas**: Métricas y análisis de órdenes
- **Autenticación JWT**: Seguridad basada en tokens
- **Autorización por Roles**: Control de acceso granular
- **Base de Datos MySQL**: Persistencia confiable con transacciones

## 🛠️ Tecnologías Utilizadas

- **Node.js** (v18+) - Runtime de JavaScript
- **TypeScript** - Tipado estático
- **Express.js** - Framework web
- **MySQL** - Base de datos relacional
- **JWT** - Autenticación
- **Zod** - Validación de esquemas
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
cd ByteStore-API/orders-service
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

## Variables de Entorno

| Variable         | Descripción                              | Valor por defecto                                               |
| ---------------- | ---------------------------------------- | --------------------------------------------------------------- |
| `PORT`           | Puerto del servidor                      | `3004`                                                          |
| `NODE_ENV`       | Entorno de ejecución                     | `development`                                                   |
| `DB_HOST`        | Host de la base de datos MySQL           | `localhost`                                                     |
| `DB_PORT`        | Puerto de la base de datos MySQL         | `3306`                                                          |
| `DB_USER`        | Usuario de la base de datos              | `root`                                                          |
| `DB_PASSWORD`    | Contraseña de la base de datos           | `tu_password`                                                   |
| `DB_NAME`        | Nombre de la base de datos               | `orders_db`                                                     |
| `JWT_SECRET`     | Clave secreta para firmar los tokens JWT | `@y*&0a%K%7P0t@uQ^38HN$y4Z^PK#0zE7dem700Bbf&pC6HF$aU^ARkE@u$nn` |
| `JWT_EXPIRES_IN` | Duración del token JWT                   | `30d`                                                           |
| `CORS_ORIGIN`    | Orígenes permitidos para CORS            | `http://localhost:3000`                                         |

### Ejemplo de archivo .env

```env
# Configuración del servidor
PORT=3004
NODE_ENV=development

# Configuración de la base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=orders_db

# Configuración JWT
JWT_SECRET=@y*&0a%K%7P0t@uQ^38HN$y4Z^PK#0zE7dem700Bbf&pC6HF$aU^ARkE@u$nn
JWT_EXPIRES_IN=30d

# Configuración CORS
CORS_ORIGIN=http://localhost:3000
```

## Endpoints

#### Opción A: Usando el script automatizado

```bash
npm run db:init
```

#### Opción B: Manualmente

```bash
# Conectar a MySQL
mysql -u root -p

# Ejecutar el script de inicialización
source init/data.sql
```

### 5. Compilar TypeScript

```bash
npm run build
```

## 🚀 Ejecución

### Desarrollo

```bash
npm run dev
```

El servidor se ejecutará en `http://localhost:3004` con recarga automática.

### Producción

```bash
npm start
```

---

### Base URL

```
http://localhost:3004/api
```

Para obtener los detalles de un pedido específico utilizando su ID.

Este servicio confía en tokens emitidos por el **user-service**. El flujo es simple:

1. Autentícate en el user-service (`POST /users/sign-in`) y obtén el JWT.
2. Incluye el token en el header `Authorization: <token>`.
3. Verifica que el token sigue siendo válido con `GET /auth/validate` de este servicio.

#### Obtener token

```http
POST /users/sign-in
Content-Type: application/json

```json
{
  "correo": "usuario@ejemplo.com",
  "password": "tu_password"
}
```

#### Validar token

```http
GET /auth/validate
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

#### Roles disponibles

- `USUARIO`: gestiona sus propias órdenes.
- `ADMINISTRADOR`: acceso completo a las rutas protegidas.

### 📋 Endpoints de Órdenes

#### Crear Orden

```http
POST /api/orders
Content-Type: application/json
Authorization: <token>

```json
{
  "user_id": "01991c11-412e-7569-bb85-a4f77ba08bb7",
  "correo_usuario": "maria.lopez@gmail.com",
  "direccion": "Celle azul, casa roja",
  "nombre_completo": "Maria Fernanda Lopez Garcia",
  "productos": [
    {
      "producto_id": 1,
      "cantidad": 1
    }
  ]
}
```

#### Obtener Órdenes

```http
GET /api/orders?page=1&limit=10&estado=pendiente
Authorization: <token>
```

#### Obtener Orden por ID

```http
GET /api/orders/:id
Authorization: <token>
```

#### Actualizar Orden

```http
PUT /api/orders/:id
Content-Type: application/json
Authorization: <token>

```json
{
  "message": "Orden creada exitosamente",
  "data": {
    "orden_id": 12,
    "user_id": "01991c11-412e-7569-bb85-a4f77ba08bb7",
    "correo_usuario": "maria.lopez@gmail.com",
    "direccion": "Celle azul, casa roja",
    "nombre_completo": "Maria Fernanda Lopez Garcia",
    "estado": "pendiente",
    "total": "762349.68",
    "fecha_pago": "2025-09-28T04:02:37.000Z",
    "fecha_entrega": null,
    "productos": [
      {
        "orden_productos_id": 13,
        "orden_id": 12,
        "producto_id": 1,
        "nombre": "Producto Premium 1",
        "precio": "876264.00",
        "descuento": "13.00",
        "marca": "ASUS",
        "modelo": "Modelo-1-2025",
        "cantidad": 1,
        "imagen": "https://example.com/images/producto-1.jpg",
        "created_at": "2025-09-28T04:02:37.000Z",
        "updated_at": "2025-09-28T04:02:37.000Z"
      }
    ]
  }
}
```

#### Eliminar Orden (Solo Admin)

```http
DELETE /api/orders/:id
Authorization: <admin_token>
```

#### Estadísticas de Órdenes

```http
GET /api/orders/stats
Authorization: <token>
```

Para actualizar los detalles de un pedido existente.

#### Actualizar Estado (Solo Admin)

```http
PUT /api/orders/:id/status
Content-Type: application/json
Authorization: <admin_token>

**Cuerpo de la solicitud**

```json
{
  "direccion": "Casa nueva, calle verde",
  "estado": "enviado",
  "fecha_entrega": "2025-09-28T05:07:37.000Z"
}
```

#### Historial de Estados

```http
GET /api/orders/:id/status/history
Authorization: <token>
```

#### Cancelar Orden

```http
PUT /api/orders/:id/cancel
Content-Type: application/json
Authorization: <token>

```json
{
  "message": "Orden actualizada exitosamente",
  "data": {
    "orden_id": 12,
    "user_id": "01991c11-412e-7569-bb85-a4f77ba08bb7",
    "correo_usuario": "maria.lopez@gmail.com",
    "direccion": "Casa nueva, calle verde",
    "nombre_completo": "Maria Fernanda Lopez Garcia",
    "estado": "enviado",
    "total": "762349.68",
    "fecha_pago": "2025-09-28T04:02:37.000Z",
    "fecha_entrega": "2025-09-28T05:07:37.000Z",
    "productos": [
      {
        "orden_productos_id": 13,
        "orden_id": 12,
        "producto_id": 1,
        "nombre": "Producto Premium 1",
        "precio": "876264.00",
        "descuento": "13.00",
        "marca": "ASUS",
        "modelo": "Modelo-1-2025",
        "cantidad": 1,
        "imagen": "https://example.com/images/producto-1.jpg",
        "created_at": "2025-09-28T04:02:37.000Z",
        "updated_at": "2025-09-28T04:02:37.000Z"
      }
    ]
  }
}
```

#### Estadísticas de Estados

```http
GET /api/orders/status/stats
Authorization: <token>
```

### Eliminar un pedido

Para eliminar un pedido existente.

**DELETE** `/:id`

**Respuesta**

```json
{
  "message": "Orden eliminada exitosamente"
}
```

### Estados Disponibles:

- **pendiente**: Orden creada, esperando procesamiento
- **procesando**: Orden en preparación
- **enviado**: Orden despachada
- **entregado**: Orden completada (estado final)
- **cancelado**: Orden cancelada (estado final)

## Entrega y geolocalización

### Tabla: orders

```sql
orden_id (PK) | user_id | correo_usuario | nombre_completo | estado | total | fecha_pago | fecha_entrega
```

### Tabla: order_products

```sql
id (PK) | orden_id (FK) | producto_id | cantidad | precio_unitario | subtotal
```

### Tabla: order_status_history

```sql
id (PK) | orden_id (FK) | estado_anterior | estado_nuevo | motivo | changed_by | changed_at
```

- Crear orden con entrega a domicilio (dirección sin geolocalización):

```bash
curl -X POST "http://localhost:3004/" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USER_UUID",
    "correo_usuario": "usuario@example.com",
    "nombre_completo": "Nombre Apellido",
    "tipo_entrega": "domicilio",
    "direccion": "Calle 123 #45-67, Ciudad",
    "metodo_pago": "tarjeta",
    "tarjeta": { "tipo": "debito", "marca": "VISA", "numero": "4111111111111111" },
    "productos": [{ "producto_id": 1, "cantidad": 1 }]
  }'
```

- Crear orden con entrega a domicilio usando geolocalización:

```bash
curl -X POST "http://localhost:3004/" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USER_UUID",
    "correo_usuario": "usuario@example.com",
    "nombre_completo": "Nombre Apellido",
    "tipo_entrega": "domicilio",
    "geolocalizacion_habilitada": true,
    "latitud": 6.25184,
    "longitud": -75.56359,
    "metodo_pago": "pse",
    "pse_reference": "REF-123456",
    "productos": [{ "producto_id": 2, "cantidad": 2 }]
  }'
```

- Crear orden para recoger en tienda (sin costo de envío):

```bash
curl -X POST "http://localhost:3004/" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USER_UUID",
    "correo_usuario": "usuario@example.com",
    "nombre_completo": "Nombre Apellido",
    "tipo_entrega": "recoger",
    "metodo_pago": "efectivo",
    "cash_on_delivery": true,
    "productos": [{ "producto_id": 3, "cantidad": 1 }]
  }'
```

- Actualizar una orden para habilitar geolocalización y recalcular envío:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request
