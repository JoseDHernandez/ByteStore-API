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
  - [📋 Endpoints de Órdenes](#-endpoints-de-órdenes)
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

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del servidor | `3004` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `DB_HOST` | Host de la base de datos MySQL | `localhost` |
| `DB_PORT` | Puerto de la base de datos MySQL | `3306` |
| `DB_USER` | Usuario de la base de datos | `root` |
| `DB_PASSWORD` | Contraseña de la base de datos | `tu_password` |
| `DB_NAME` | Nombre de la base de datos | `orders_db` |
| `JWT_SECRET` | Clave secreta para firmar los tokens JWT | `@y*&0a%K%7P0t@uQ^38HN$y4Z^PK#0zE7dem700Bbf&pC6HF$aU^ARkE@u$nn` |
| `JWT_EXPIRES_IN` | Duración del token JWT | `30d` |
| `CORS_ORIGIN` | Orígenes permitidos para CORS | `http://localhost:3000` |

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

### 4. Configurar la base de datos

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

## 📚 Documentación de la API

### Base URL
```
http://localhost:3004/api
```

### 🔐 Autenticación

Este servicio utiliza **JSON Web Tokens (JWT)** para la autenticación y autorización.

#### Obtener Token
Para obtener un token JWT, debes autenticarte a través del servicio de usuarios:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "tu_password"
}
```

#### Usar Token en Requests
Incluye el token en el header `Authorization` de todas las peticiones:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Roles y Permisos
- **Usuario**: Puede crear, ver y actualizar sus propias órdenes
- **Admin**: Acceso completo a todas las órdenes y funciones administrativas

#### Ejemplo de Request Autenticado
```javascript
fetch('http://localhost:3004/api/orders', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
})
```

### 📋 Endpoints de Órdenes

#### Crear Orden
```http
POST /api/orders
Content-Type: application/json
Authorization: Bearer <token>

{
  "user_id": "01991c0e-16f0-707f-9f6f-3614666caead",
  "correo_usuario": "maria.lopez@test.com",
  "direccion": "Calle 123 #45-67, Bogotá",
  "nombre_completo": "María López",
  "productos": [
    {
      "producto_id": 1,
      "cantidad": 2
    },
    {
      "producto_id": 3,
      "cantidad": 1
    }
  ]
}
```

#### Obtener Órdenes
```http
GET /api/orders?page=1&limit=10&estado=pendiente
Authorization: Bearer <token>
```

#### Obtener Orden por ID
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

#### Actualizar Orden
```http
PUT /api/orders/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "estado": "procesando",
  "direccion": "Nueva dirección de entrega",
  "fecha_entrega": "2024-12-25T10:00:00.000Z"
}
```

#### Eliminar Orden (Solo Admin)
```http
DELETE /api/orders/:id
Authorization: Bearer <admin_token>
```

#### Estadísticas de Órdenes
```http
GET /api/orders/stats
Authorization: Bearer <token>
```

### 🔄 Endpoints de Estados

#### Actualizar Estado (Solo Admin)
```http
PUT /api/orders/:id/status
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "estado": "procesando",
  "motivo": "Orden confirmada y en preparación"
}
```

#### Historial de Estados
```http
GET /api/orders/:id/status/history
Authorization: Bearer <token>
```

#### Cancelar Orden
```http
PUT /api/orders/:id/cancel
Content-Type: application/json
Authorization: Bearer <token>

{
  "motivo": "Cliente solicitó cancelación"
}
```

#### Estadísticas de Estados
```http
GET /api/orders/status/stats
Authorization: Bearer <token>
```

## 🔐 Estados de Órdenes

El sistema maneja los siguientes estados con transiciones controladas:

```
pendiente → procesando → enviado → entregado
    ↓           ↓
 cancelado   cancelado
```

### Estados Disponibles:
- **pendiente**: Orden creada, esperando procesamiento
- **procesando**: Orden en preparación
- **enviado**: Orden despachada
- **entregado**: Orden completada (estado final)
- **cancelado**: Orden cancelada (estado final)

## 🗄️ Estructura de la Base de Datos

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

## 📁 Estructura del Proyecto

```
orders-service/
├── src/
│   ├── controllers/
│   │   ├── orders.controller.ts
│   │   ├── orderProducts.controller.ts
│   │   └── orderStatus.controller.ts
│   ├── middleware/
│   │   └── auth.ts
│   ├── routes/
│   │   ├── orders.routes.ts
│   │   └── orderStatus.routes.ts
│   ├── utils/
│   │   └── jwt.ts
│   ├── db.ts
│   └── index.ts
├── init/
│   └── data.sql
├── package.json
├── tsconfig.json
└── README.md
```

## 🚨 Códigos de Error Comunes

- **400**: Datos inválidos o faltantes
- **401**: Token JWT inválido o faltante
- **403**: Permisos insuficientes
- **404**: Recurso no encontrado
- **409**: Conflicto (ej: transición de estado inválida)
- **500**: Error interno del servidor

## 🔒 Seguridad

- Autenticación JWT obligatoria
- Validación de entrada con Zod
- Control de acceso basado en roles
- Sanitización de consultas SQL
- Headers de seguridad configurados

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

