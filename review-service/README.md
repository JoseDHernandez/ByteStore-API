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

Flujo sencillo para proteger las rutas de creación y modificación:

1. Inicia sesión en el user-service (`POST /users/sign-in`) para recibir tu JWT.
2. Envía el header `Authorization: <token>` en las rutas protegidas.
3. Comprueba si tu token sigue activo consultando `GET /reviews/auth/validate`.

#### Obtener token

```http
POST /users/sign-in
Content-Type: application/json

```js
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

#### Crear Review

```http
POST /api/reviews
Content-Type: application/json
Authorization: <token>

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

```http
PUT /api/reviews/:id
Content-Type: application/json
Authorization: <token>

**Respuesta**

```json
{
  "message": "Reseña eliminada exitosamente"
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
