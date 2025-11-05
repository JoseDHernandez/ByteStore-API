# Servicio de Usuarios

Este servicio permite **registrar, autenticar, actualizar y eliminar usuarios**, además de manejar el sistema de autenticación mediante **JWT**.

## Tecnologías utilizadas

- Node.js + TypeScript
- Express
- JWT (`jsonwebtoken`)
- Zod (validación de esquemas)
- bcrypt (hashing de contraseñas)
- uuid (identificadores únicos)
- MySQL

---

## Índice

- [Variables de entorno](#variables-de-entorno)
- [Usuarios de prueba](#usuarios-de-prueba)
- [Peticiones de la API](#peticiones-de-la-api)
  - [Autenticación](#autenticación)
    - [Registro de usuario - Sign up](#registro-de-usuario---sign-up)
    - [Inicio de sesión - Sign in](#inicio-de-sesión---sign-in)
  - [Obtener usuario](#obtener-usuario)
  - [Obtener usuarios (solo administradores)](#obtener-usuarios-solo-administradores)
  - [Obtener todos los usuarios](#obtener-todos-los-usuarios)
  - [Obtener usuarios con paginación y búsqueda](#obtener-usuarios-con-paginación-y-búsqueda)
  - [Actualizar usuario](#actualizar-usuario)
  - [Cambiar contraseña](#cambiar-contraseña)
  - [Cambiar rol (solo administradores)](#cambiar-rol-solo-administradores)
  - [Eliminar usuario](#eliminar-usuario)
- [Códigos de error](#códigos-de-error)
- [Licencia](#licencia)

---

## Variables de entorno

| Variable     | Descripción                              | Valor por defecto                                               |
| ------------ | ---------------------------------------- | --------------------------------------------------------------- |
| `JWT_SECRET` | Clave secreta para firmar los tokens JWT | `@y*&0a%K%7P0t@uQ^38HN$y4Z^PK#0zE7dem700Bbf&pC6HF$aU^ARkE@u$nn` |

---

## Usuarios de prueba

| Email                   | Contraseña      | Rol           |
| ----------------------- | --------------- | ------------- |
| jose.hernandez@test.com | Contrasea34^5G  | Administrador |
| maria.lopez@test.com    | M4ria!Lopez2024 | Cliente       |

---

## Peticiones de la API

Todas las respuestas exitosas (`200`, `201`) tienen la siguiente estructura:

```json
{
  "id": "string (uuid)",
  "name": "string",
  "email": "string",
  "physical_address": "string",
  "role": "ADMINISTRADOR | CLIENTE",
  "token": "string (jwt, solo se retorna en sign-in)"
}
```

En caso de error retornan en el json un campo `message` y si el estado es 500 un `error`

```json
{
  "message": "Descripción del error",
  "error": "Stack interno (solo en errores 500)"
}
```

---

## Información y estado del servicio

### Información básica del servicio

**GET** `/info`
Retorna información básica del servicio, como su nombre, versión y descripción.

**Respuesta:**

```json
{
  "name": "ByteStore-API user-service",
  "description": "Microservicio encargado de la gestión de usuarios en ByteStore (registro, autenticación, actualización y eliminación).",
  "version": "1.0.0",
  "license": "CC BY-NC-SA 4.0",
  "author": "José David Hernández Hortúa",
  "repository": "https://github.com/JoseDHernandez/ByteStore-API/tree/main/user-service",
  "docs": "https://github.com/JoseDHernandez/ByteStore-API/blob/main/user-service/README.md",
  "endpoints": {
    "register": "POST /sign-up",
    "login": "POST /sign-in",
    "getUser": "GET /:id",
    "updateUser": "PATCH /:id",
    "deleteUser": "DELETE /:id",
    "listUsers": "GET /all"
  },
  "status": "running",
  "uptime": "169s",
  "timestamp": "2025-09-27T01:03:13.104Z"
}
```

### Estado del servicio

**GET** `/health`

Retorna el estado de salud del servicio.

**Respuesta:**

```json
{
  "status": "ok",
  "uptime": "169s",
  "timestamp": "2025-09-27T01:03:13.104Z"
}
```

---

## Autenticación

Las rutas protegidas requieren el header:

```
Authorization: <token>
```

El token se obtiene en `POST /users/sign-in`.

### Registro de usuario - Sign up

**POST** `/users/sign-up`

**Body:**

```json
{
  "name": "Nombre del usuario",
  "email": "correo@ejemplo.com",
  "password": "ContraseñaSegura123",
  "physical_address": "Dirección física"
}
```

**Respuesta:**

```json
{
  "id": "0199264b-d200-7885-bf3b-6e62724ee3e0",
  "name": "José Hernández",
  "email": "correo@ejemplo.com",
  "physical_address": "Casa roja #56",
  "role": "CLIENTE",
  "token": "jwt..."
}
```

---

### Inicio de sesión - Sign in

**POST** `/users/sign-in`

**Body:**

```json
{
  "email": "correo@ejemplo.com",
  "password": "ContraseñaSegura123"
}
```

**Respuesta:**

```json
{
  "id": "01991c0e-16f0-707f-9f6f-3614666caead",
  "name": "José David Hernández",
  "email": "correo@ejemplo.com",
  "physical_address": "Calle 12 #67-56",
  "role": "ADMINISTRADOR",
  "token": "jwt..."
}
```

---

## Obtener usuario

**GET** `/users/:id`

Retorna los datos del usuario por su ID.

**Respuesta**

```json
{
  "id": "01991c0e-16f0-707f-9f6f-3614666caead",
  "name": "José David Hernández",
  "email": "jose.hernandez@test.com",
  "physical_address": "Calle 12 #67-56",
  "role": "ADMINISTRADOR"
}
```

## Obtener usuarios (solo administradores)

### Obtener todos los usuarios

**GET** `/users/all`

Retorna todos los usuarios disponibles en la base de datos.

**Respuesta**

```json
{
  "total": 2,
  "data": [
    {
      "id": "01991c0e-16f0-707f-9f6f-3614666caead",
      "name": "José David Hernández",
      "email": "jose.hernandez@test.com",
      "physical_address": "Calle 12 #67-56",
      "role": "ADMINISTRADOR"
    },
    {
      "id": "01991c0e-16f0-707f-9f6f-3614666cabcd",
      "name": "María Fernanda López",
      "email": "maria.lopez@test.com",
      "physical_address": "Carrera 45 #23-12",
      "role": "CLIENTE"
    }
  ]
}
```

### Obtener usuarios con paginación y búsqueda

**GET** `/users/?page=1&limit=10&search=nombre`

Permite obtener usuarios con paginación y filtros de búsqueda.

**Parámetros:**
| Parámetro |Tipo | Requerido | Descripción |
| --------- | ----------------------------------- | ------- | ----------------- |
| `page` | number | Si (default: 1) | Número de página (debe ser positivo) |
| `limit` | number | Si (default: 20) | Cantidad de usuarios por página (máximo 100) |
| `search` | string | No | Término de búsqueda (nombre o email) |

**Respuesta**

```json
{
  "total": 5,
  "pages": 5,
  "first": 1,
  "next": 2,
  "prev": null,
  "data": [
    {
      "id": "01991c0e-16f0-707f-9f6f-3614666caead",
      "name": "José David Hernández",
      "email": "jose.hernandez@test.com",
      "physical_address": "Calle 12 #67-56",
      "role": "ADMINISTRADOR"
    }
  ]
}
```

---

### Actualizar usuario

**PUT** `/users/:id`

**Body:**

```json
{
  "name": "Nuevo nombre",
  "email": "nuevo@correo.com",
  "physical_address": "Nueva dirección"
}
```

**Respuesta:**

```json
{
  "id": "01991c0e-16f0-707f-9f6f-3614666caead",
  "name": "Nuevo nombre",
  "email": "nuevo@correo.com",
  "physical_address": "Nueva dirección",
  "role": "CLIENTE"
}
```

---

### Cambiar contraseña

Una contraseña debe tener de 8 a 20 caracteres, al menos una letra mayúscula, una minúscula, un número y un carácter especial.

**PATCH** `/users/:id/password`

**Body:**

```json
{
  "password": "Nueva contraseña"
}
```

**Respuesta:**

```json
{
  "message": "Password updated"
}
```

---

### Cambiar rol (solo administradores)

**PATCH** `/users/:id/role`

**Body:**

```json
{
  "role": "ADMINISTRADOR"
}
```

**Respuesta:**

```json
{
  "id": "01991c0e-16f0-707f-9f6f-3614666caead",
  "name": "Nuevo nombre",
  "email": "nuevo@correo.com",
  "physical_address": "Nueva dirección",
  "role": "CLIENTE"
}
```

### Eliminar usuario

**DELETE** `/users/:id`

- Como cliente:
  ```json
  {
    "password": "ContraseñaDelCliente"
  }
  ```
- Como administrador:  
  No requiere contraseña.

**Respuesta:**

```json
{
  "message": "Account deleted"
}
```

## Códigos de error

| Código | Descripción                            |
| ------ | -------------------------------------- |
| 200    | Operación exitosa                      |
| 201    | Recurso creado                         |
| 400    | Petición inválida                      |
| 401    | No autorizado (token inválido/ausente) |
| 403    | Prohibido (sin permisos)               |
| 404    | Usuario no encontrado                  |
| 500    | Error interno del servidor             |

---

## Licencia

[User-service](https://github.com/JoseDHernandez/ByteStore-API/tree/main/user-service) &copy; 2025 por [José Hernández](https://josedhernandez.com) bajo la licencia [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
