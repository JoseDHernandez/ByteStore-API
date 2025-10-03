# 📝 Reviews Service - ByteStore API

Este servicio maneja las operaciones relacionadas con las reseñas de productos en la plataforma ByteStore. Permite a los usuarios crear, leer, actualizar y eliminar reseñas, así como gestionar las respuestas a estas reseñas.

Para los tokens de autenticación, se utiliza JWT (JSON Web Tokens). Asegúrate de incluir el token en el encabezado `Authorization` de tus solicitudes para los endpoints que requieren autenticación. Este token debe ser obtenido a través del [servicio de usuarios](https://github.com/JoseDHernandez/ByteStore-API/tree/main/user-service).

## API Endpoints

Los parámetros de consulta disponibles para los endpoints GET son:

| Parámetro           | Descripción                              | Tipo    | Valores posibles               | Por defecto   |
| ------------------- | ---------------------------------------- | ------- | ------------------------------ | ------------- |
| `page`              | Página de resultados a mostrar           | Integer | Cualquier número entero        | 1             |
| `limit`             | Número de resultados por página          | Integer | Cualquier número entero        | 10            |
| `sort`              | Campo por el cual ordenar los resultados | String  | `review_date`, `qualification` | `review_date` |
| `order`             | Orden de los resultados                  | String  | `ASC`, `DESC`                  | `DESC`        |
| `product_id`        | Filtrar reseñas por ID de producto       | Integer | Cualquier número entero        | Ninguno       |
| `min_qualification` | Filtrar reseñas por calificación mínima  | Float   | Cualquier número decimal       | Ninguno       |
| `max_qualification` | Filtrar reseñas por calificación máxima  | Float   | Cualquier número decimal       | Ninguno       |
| `user_id`           | Filtrar reseñas por ID de usuario        | String  | Cualquier cadena               | Ninguno       |

### Obtener todas las reseñas

Para obtener todas las reseñas de productos.

**GET** `/`

**Respuesta**

```json
{
  "total": 2,
  "pages": 1,
  "first": 1,
  "next": null,
  "prev": null,
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "qualification": "4.5",
      "comment": "Excelente producto, muy satisfecho con la compra.",
      "review_date": "2025-10-02T23:49:37.000Z",
      "user_name": "José Hernández"
    },
    {
      "id": 2,
      "product_id": 1,
      "qualification": "3.0",
      "comment": "El producto es bueno pero el envío fue lento.",
      "review_date": "2025-10-02T23:49:37.000Z",
      "user_name": "José Hernández"
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
  "id": 1,
  "product_id": 1,
  "qualification": "4.5",
  "comment": "Excelente producto, muy satisfecho con la compra.",
  "review_date": "2025-10-02T23:49:37.000Z",
  "user_name": "José Hernández"
}
```

---

### Crear una nueva reseña (Requiere autenticación)

Para crear una nueva reseña de producto.

**POST** `/`

**Cuerpo de la solicitud**

```js
{
  "product_id": 2,
  "user_name": "Maria Lopez", // Generado o pasado desde el cliente
  "qualification": 4.3,
  "comment": "Un buen producto, lo recomiendo."
}
```

**Respuesta**

```json
{
  "message": "Calificación creada",
  "data": {
    "id": 1,
    "product_id": 2,
    "qualification": "4.3",
    "comment": "Un buen producto, lo recomiendo.",
    "review_date": "2025-10-03T00:06:15.000Z",
    "user_name": "Maria Lopez"
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
  "qualification": 3.2,
  "comment": "No me gusto, una entrega muy lenta"
}
```

**Respuesta**

```json
{
  "message": "Calificación actualizada",
  "data": {
    "id": 1,
    "product_id": 2,
    "qualification": "3.2",
    "comment": "No me gusto, una entrega muy lenta",
    "review_date": "2025-10-03T00:06:15.000Z",
    "user_name": "José Hernández"
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
