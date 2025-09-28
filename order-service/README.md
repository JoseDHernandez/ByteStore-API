# 📦 Orders Service - ByteStore API

Este servicio maneja todas las operaciones relacionadas con los pedidos en la plataforma ByteStore. Permite a los usuarios crear, actualizar, ver y eliminar pedidos, así como gestionar el estado de los mismos.

Todas las rutas están protegidas mediante autenticación JWT para garantizar la seguridad de las operaciones. Este token debe ser obtenido a través del [servicio de usuarios](https://github.com/JoseDHernandez/ByteStore-API/tree/main/user-service).

Asegúrate de incluir el token en el encabezado `Authorization` de tus solicitudes para los endpoints que requieren autenticación.

## Endpoints

### Obtener todos los pedidos

Para obtener una lista de todos los pedidos.

**GET** `/`

**Respuesta**

```json
{
  "total": 11,
  "pages": 1,
  "first": 1,
  "next": null,
  "prev": null,
  "data": [
    {
      "orden_id": 1,
      "user_id": "01991c11-412e-7569-bb85-a4f77ba08bb7",
      "correo_usuario": "maria.lopez@gmail.com",
      "direccion": "Carrera 45 #23-12, MedellÃ­n, Colombia",
      "nombre_completo": "MarÃ­a Fernanda LÃ³pez GarcÃ­a",
      "estado": "entregado",
      "total": "3134550.00",
      "fecha_pago": "2025-09-28T03:32:22.000Z",
      "fecha_entrega": "2024-01-15T14:30:00.000Z",
      "productos": []
    }
  ]
}
```

---

### Obtener un pedido por ID

Para obtener los detalles de un pedido específico utilizando su ID.

**GET** `/:id`

**Respuesta**

```json
{
  "total": 11,
  "pages": 1,
  "first": 1,
  "next": null,
  "prev": null,
  "data": [
    {
      "orden_id": 1,
      "user_id": "01991c11-412e-7569-bb85-a4f77ba08bb7",
      "correo_usuario": "maria.lopez@gmail.com",
      "direccion": "Carrera 45 #23-12, MedellÃ­n, Colombia",
      "nombre_completo": "MarÃ­a Fernanda LÃ³pez GarcÃ­a",
      "estado": "entregado",
      "total": "3134550.00",
      "fecha_pago": "2025-09-28T03:32:22.000Z",
      "fecha_entrega": "2024-01-15T14:30:00.000Z",
      "productos": [
        {
          "orden_productos_id": 1,
          "orden_id": 1,
          "producto_id": 1,
          "nombre": "HP Intel Core I3 - 8GB",
          "precio": "3299000.00",
          "descuento": "54.00",
          "marca": "HP",
          "modelo": "15-fd0026la",
          "cantidad": 1,
          "imagen": "198122843657-001-750Wx750H.webp",
          "created_at": "2025-09-28T03:32:22.000Z",
          "updated_at": "2025-09-28T03:32:22.000Z"
        }
      ]
    }
  ]
}
```

---

### Crear un nuevo pedido

Para crear un nuevo pedido.

**POST** `/`

**Cuerpo de la solicitud**

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

**Respuesta**

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

---

### Actualizar un pedido

Para actualizar los detalles de un pedido existente.

**PUT** `/:id`

**Cuerpo de la solicitud**

```json
{
  "direccion": "Casa nueva, calle verde",
  "estado": "enviado",
  "fecha_entrega": "2025-09-28T05:07:37.000Z"
}
```

**Respuesta**

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

---

### Eliminar un pedido

Para eliminar un pedido existente.

**DELETE** `/:id`

**Respuesta**

```json
{
  "message": "Orden eliminada exitosamente"
}
```
