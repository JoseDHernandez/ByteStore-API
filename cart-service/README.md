
# ByteStore - Servicio de Carritos


Este microservicio gestiona los carritos de compra de ByteStore, permitiendo a cada usuario tener un solo carrito y realizar operaciones CRUD seguras y validadas.
Ahora utiliza UUID v7 para los identificadores de carritos (con fallback a v4 si es necesario).


## Características principales

- **Rutas CRUD limpias:**
   - `GET /` : Obtener carritos paginados (admin ve todos, usuario ve el suyo)
   - `POST /` : Crear carrito (`user_id` y `products[]` en el body)
   - `PUT /:id` : Actualizar todos los productos del carrito (body: `products[]`)
   - `DELETE /:id` : Eliminar el carrito del usuario (por `user_id`)
   - `GET /cart?user_id=...` : Obtener un carrito por user_id (nuevo formato)


- **Validaciones robustas:**

   # Cart Service

   Servicio para la gestión de carritos de compras.

   ---

   ## Endpoints


   ### 1. Crear carrito

   - **POST** `/`
   - **Requiere autenticación:** Sí (Bearer Token en `Authorization`)
   - **Body:**
      ```json
      {
         "user_id": "string",
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
   - **Respuesta exitosa:**
      ```json
      {
         "id": "uuidv7",
         "user_id": "string",
         "products": [],
         "createdAt": "fecha",
         "updatedAt": "fecha"
      }
      ```
   - **Errores:**
      - 400: Datos inválidos
      - 401: Token inválido o ausente

   ---


   ### 2. Obtener todos los carritos

   - **GET** `/`
   - **Requiere autenticación:** Sí (Bearer Token en `Authorization`)
   - **Respuesta exitosa:**
      ```json
      [
         {
            "id": "uuidv7",
            "user_id": "string",
            "products": [],
            "createdAt": "fecha",
            "updatedAt": "fecha"
         }
      ]
      ```

   ---


   ### 3. Obtener carrito por ID

   - **GET** `/:id`
   - **Requiere autenticación:** Sí (Bearer Token en `Authorization`)
   - **Respuesta exitosa:**
      ```json
      {
         "id": "uuidv7",
         "user_id": "string",
         "products": [],
         "createdAt": "fecha",
         "updatedAt": "fecha"
      }
      ```
   - **Errores:**
      - 404: Carrito no encontrado
      - 401: Token inválido o ausente

   ---


   ### 4. Obtener carrito por userId

   - **GET** `/cart?user_id={userId}`
   - **Requiere autenticación:** Sí (Bearer Token en `Authorization`)
   - **Respuesta exitosa:**
      ```json
      [
         {
            "id": "uuidv7",
            "user_id": "string",
            "products": [],
            "createdAt": "fecha",
            "updatedAt": "fecha"
         }
      ]
      ```
   - **Errores:**
      - 404: Carrito no encontrado
      - 401: Token inválido o ausente

   ---


   ### 5. Agregar producto a carrito

   - **POST** `/:id/products`
   - **Requiere autenticación:** Sí (Bearer Token en `Authorization`)
   - **Body:**
      ```json
      {
         "id": 2,
         "name": "Mouse Logitech",
         "price": 50000,
         "discount": 10,
         "stock": 100,
         "image": "http://localhost:3000/products/images/mouse-logitech.webp",
         "model": "M185",
         "brand": "Logitech",
         "quantity": 1
      }
      ```
   - **Respuesta exitosa:**
      ```json
      {
         "id": "uuidv7",
         "user_id": "string",
         "products": []
      }
      ```
   - **Errores:**
      - 404: Carrito no encontrado
      - 401: Token inválido o ausente

   ---



   ### 6. Actualizar cantidad de producto en carrito

   - **PUT** `/:id/products/:productId`
   - **Requiere autenticación:** Sí (Bearer Token en `Authorization`)
   - **Body:**
      ```json
      {
         "quantity": 3
      }
      ```
   - **Respuesta exitosa:**
      ```json
      {
         "id": "uuidv7",
         "user_id": "string",
         "products": []
      }
      ```
   - **Errores:**
      - 404: Producto no encontrado en el carrito
      - 401: Token inválido o ausente

   ---



   ### 7. Eliminar producto de carrito

   - **DELETE** `/:id/products/:productId`
   - **Requiere autenticación:** Sí (Bearer Token en `Authorization`)
   - **Respuesta exitosa:**
      ```json
      {
         "id": "uuidv7",
         "user_id": "string",
         "products": []
      }
      ```
   - **Errores:**
      - 404: Producto no encontrado en el carrito
      - 401: Token inválido o ausente

   ---



   ### 8. Eliminar carrito

   - **DELETE** `/:id`
   - **Requiere autenticación:** Sí (Bearer Token en `Authorization`)
   - **Respuesta exitosa:**
      ```json
      {
         "message": "Carrito eliminado correctamente"
      }
      ```
   - **Errores:**
      - 404: Carrito no encontrado
      - 401: Token inválido o ausente

   ### 9. Limpiar carrito (eliminar todos los productos)

   - **DELETE** `/:id/clear`
   - **Requiere autenticación:** Sí (Bearer Token en `Authorization`)
   - **Respuesta exitosa:**
      ```json
      {
         "id": "uuidv7",
         "user_id": "string",
         "products": []
      }
      ```
   - **Errores:**
      - 404: Carrito no encontrado
      - 401: Token inválido o ausente

   ### 10. Información del servicio

   - **GET** `/info`
   - **Respuesta exitosa:**
      ```json
      {
         "service": "cart-service",
         "status": "ok"
      }
      ```

   ### 11. Healthcheck

   - **GET** `/health`
   - **Respuesta exitosa:**
      ```json
      {
         "status": "healthy",
         "timestamp": "2025-09-20T00:00:00.000Z"
      }
      ```

   ---

   ## Autenticación

   - Todos los endpoints protegidos requieren un token Bearer en el header `Authorization`.

   ---

   ## Ejemplo de db.json vacío recomendado

   ```json
   {
      "carts": []
   }
   ```

   ---

   ## Notas

   - Los IDs de carrito se generan con uuidv7.
   - Las respuestas de error siguen el formato:
      ```json
      {
         "error": "Mensaje de error"
      }
      ```
   - El flujo completo ha sido probado con Docker Compose.

   ---

   ¿Dudas o soporte? Revisa el archivo `API_DOC.md` o contacta al desarrollador.
2. Ejecuta:
   ```bash
   docker-compose up --build
   ```
3. El servicio estará disponible en `http://localhost:5000` y la base de datos MongoDB en el puerto 27017.

---


---

Para dudas o soporte, revisa el archivo `API_DOC.md` o contacta al desarrollador.
