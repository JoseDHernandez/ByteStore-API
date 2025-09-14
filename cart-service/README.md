# ByteStore - Servicio de Carritos

Este microservicio gestiona los carritos de compra de ByteStore, permitiendo a cada usuario tener un solo carrito y realizar operaciones CRUD seguras y validadas.

## Características principales

- **Rutas CRUD limpias:**
   - `GET /` : Obtener carritos paginados (admin ve todos, usuario ve el suyo)
   - `POST /` : Crear carrito (`user_id` y `products[]` en el body)
   - `PUT /:id` : Actualizar todos los productos del carrito (body: `products[]`)
   - `DELETE /:id` : Eliminar el carrito del usuario (por `user_id`)
   - `GET /cart?user_id=...` : Obtener un carrito por user_id (nuevo formato)

- **Validaciones robustas:**
- Todas las entradas se validan con Zod, devolviendo errores claros y estructurados.
- El body de productos y user_id ahora exige:
  - `user_id`: UUID v4/v7
  - `products[]`: cada producto debe tener los siguientes campos y validaciones:
    - `id` (int, >=1)
    - `name` (string, 5-40, solo letras/números/espacios/-)
    - `model` (string, 5-36, letras/números/-/\)
    - `price` (número, 100000-20000000)
    - `discount` (número, 0-90)
    - `stock` (int, >0)
    - `image` (url)
    - `brand` (string, 2-10, solo letras/números/espacios/-)
    - `quantity` (int, >=1)

- **Paginación estándar:**
   ```json
   {
      "total": 51,
      "pages": 3,
      "first": 1,
      "next": 2,
      "prev": null,
      "data": [ ... ]
   }
   ```
- **Autenticación JWT:** Todas las rutas requieren token. El rol "ADMINISTRADOR" tiene permisos ampliados.
- **Preparado para Docker:** Incluye `docker-compose.yml` y `dockerfile` para despliegue rápido.

## Instalación y uso rápido

1. Instala dependencias:
    ```bash
    npm install
    ```
2. (Opcional) Configura variables en `.env` o usa las del ejemplo.
3. Inicia el servidor:
    ```bash
    npm run dev
    ```
4. (Opcional) Levanta todo con Docker:
    ```bash
    docker-compose up --build
    ```

## Endpoints principales

> Todas las rutas requieren JWT válido en el header `Authorization: Bearer <token>`

- **GET /** : Carritos paginados
- **POST /** : Crear carrito
   ```json
   {
      "user_id": "01a2b3c4-...",
      "products": [
        {
          "id": 1,
          "name": "HP Intel Core I3 - 8GB",
          "model": "15-600261a",
          "price": 3299000,
          "discount": 5,
          "stock": 20,
          "image": "http://...",
          "brand": "HP",
          "quantity": 1
        }
      ]
   }
   ```
- **PUT /:id** : Actualizar productos
   Puedes enviar los productos como array (varios o uno solo):
   ```json
   {
      "products": [
        {
          "id": 1,
          "name": "HP Intel Core I3 - 8GB",
          "price": 3299000,
          "discount": 54,
          "stock": 20,
          "image": "http://localhost:3000/products/images/198122843657-001-750Wx750H.webp",
          "model": "15-fd0026la",
          "brand": "HP",
          "quantity": 1
        }
      ]
   }
   ```
   O como objeto (un solo producto):
   ```json
   {
      "products": {
        "id": 1,
        "name": "HP Intel Core I3 - 8GB",
        "price": 3299000,
        "discount": 54,
        "stock": 20,
        "image": "http://localhost:3000/products/images/198122843657-001-750Wx750H.webp",
        "model": "15-fd0026la",
        "brand": "HP",
        "quantity": 1
      }
   }
   ```
   Ambos formatos son válidos.
- **DELETE /:id** : Eliminar carrito
- **GET /?user_id=...** : Obtener carrito por user_id

Ejemplo:
```http
GET /?user_id=01a2b3c4-...
Authorization: Bearer <token>
```

Respuesta:
```json
{
   "id": "...",
   "user_id": "01a2b3c4-...",
   "products": [
      {
         "id": 1,
         "name": "HP Intel Core I3 - 8GB",
         "model": "15-600261a",
         "price": 3299000,
         "discount": 5,
         "stock": 20,
         "image": "http://...",
         "brand": "HP",
         "quantity": 1
      }
   ],
   "createdAt": "2025-09-13T05:14:56.890Z",
   "updatedAt": "2025-09-13T05:14:56.890Z"
}
```

## Validaciones y errores

Las entradas se validan con Zod. Si hay error, la respuesta incluye detalles en el campo `details`:
```json
{
   "error": "Datos inválidos",
   "details": [ ... ]
}
```

## Códigos de respuesta

- 200 OK: Operación exitosa
- 201 Created: Recurso creado
- 204 No Content: Sin contenido
- 400 Bad Request: Datos inválidos
- 401 Unauthorized: Token requerido o inválido
- 403 Forbidden: Permisos insuficientes
- 404 Not Found: Recurso no encontrado
- 409 Conflict: Conflicto (ejemplo: carrito ya existe)
- 500 Internal Server Error: Error inesperado

## Pruebas automáticas y generación de tokens

1. Ejecuta `node generate-tokens.js` para obtener tokens válidos de prueba (admin y usuario).
2. Copia los tokens generados y pégalos en `src/test-api.js`.
3. Ejecuta las pruebas con:
   ```bash
   node src/test-api.js
   ```

## Despliegue con Docker

1. Asegúrate de tener Docker y Docker Compose instalados.
2. Ejecuta:
   ```bash
   docker-compose up --build
   ```
3. El servicio estará disponible en `http://localhost:5000` y la base de datos MongoDB en el puerto 27017.

---

Para dudas o soporte, revisa el archivo `API_DOC.md` o contacta al desarrollador.
