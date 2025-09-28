# 📝 Reviews Service - ByteStore API

Este servicio maneja las operaciones relacionadas con las reseñas de productos en la plataforma ByteStore. Permite a los usuarios crear, leer, actualizar y eliminar reseñas, así como gestionar las respuestas a estas reseñas.

Para los tokens de autenticación, se utiliza JWT (JSON Web Tokens). Asegúrate de incluir el token en el encabezado `Authorization` de tus solicitudes para los endpoints que requieren autenticación. Este token debe ser obtenido a través del [servicio de usuarios](https://github.com/JoseDHernandez/ByteStore-API/tree/main/user-service).

## API Endpoints

### Obtener todas las reseñas

Para obtener todas las reseñas de productos.

**GET** `/`

**Respuesta**

```json
{
  "total": 15,
  "pages": 1,
  "first": 1,
  "next": null,
  "prev": null,
  "data": [
    {
      "calificacion_id": 15,
      "producto_id": 13,
      "usuario_id": "01991c11-412e-7569-bb85-a4f77ba08bb7",
      "nombre_usuario": "Usuario",
      "calificacion": 3,
      "comentario": "Producto decente pero...",
      "fecha": "2024-01-30T13:45:00.000Z"
    }
  ]
}
```

---

### Obtener reseñas por ID

Para obtener una reseña específica por su ID.

**GET** `/:id`

**Respuesta**

```json
{
  "calificacion_id": 15,
  "producto_id": 13,
  "usuario_id": "01991c11-412e-7569-bb85-a4f77ba08bb7",
  "nombre_usuario": "Usuario",
  "calificacion": 3,
  "comentario": "Producto decente pero...",
  "fecha": "2024-01-30T13:45:00.000Z"
}
```

---

### Crear una nueva reseña (Requiere autenticación)

Para crear una nueva reseña de producto.

**POST** `/`

**Cuerpo de la solicitud**

```json
{
  "producto_id": 5,
  "calificacion": 4,
  "comentario": "Un buen producto, lo recomiendo."
}
```

**Respuesta**

```json
{
  "message": "Reseña creada exitosamente",
  "data": {
    "calificacion_id": 17,
    "producto_id": 5,
    "usuario_id": "01991c0e-16f0-707f-9f6f-3614666caead",
    "nombre_usuario": "Usuario",
    "calificacion": 4,
    "comentario": "Un buen producto, lo recomiendo.",
    "fecha": "2025-09-28T03:44:01.000Z"
  }
}
```

---

### Actualizar una reseña (Requiere autenticación)

Para actualizar una reseña existente.

**PUT** `/:id`

**Cuerpo de la solicitud**

```json
{
  "calificacion": 5,
  "comentario": "Actualización: Excelente producto!"
}
```

**Respuesta**

```json
{
  "message": "Reseña actualizada exitosamente",
  "data": {
    "calificacion_id": 17,
    "producto_id": 5,
    "usuario_id": "01991c0e-16f0-707f-9f6f-3614666caead",
    "nombre_usuario": "Usuario",
    "calificacion": 5,
    "comentario": "Actualización: Excelente producto!",
    "fecha": "2025-09-28T03:44:01.000Z"
  }
}
```

---

### Eliminar una reseña (Requiere autenticación)

Para eliminar una reseña existente.

**DELETE** `/:id`

**Respuesta**

```json
{
  "message": "Reseña eliminada exitosamente"
}
```
