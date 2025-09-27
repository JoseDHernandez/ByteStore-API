# Byte store API

Repositorio monorepo que contiene los servicios de la API para la aplicación [Byte Store](https://github.com/JoseDHernandez/ByteStore). Estos servicios incluyen:

- [Servicio de usuarios (user-service)](https://github.com/JoseDHernandez/ByteStore-API/tree/main/user-service)
- [Servicio de productos (product-service)](https://github.com/JoseDHernandez/ByteStore-API/tree/main/product-service)
- [Servicio de pedidos (order-service)](https://github.com/JoseDHernandez/ByteStore-API/tree/main/order-service)
- [Servicio de calificaciones (review-service)](https://github.com/JoseDHernandez/ByteStore-API/tree/main/review-service)
- [Servicio de carrito de compras (cart-service)](https://github.com/JoseDHernandez/ByteStore-API/tree/main/cart-service)

Cada servicio es una aplicación independiente que se comunica con los demás a través de HTTP. Cada uno tiene su propia base de datos y lógica de negocio.

---

## Tecnologías utilizadas

Las siguientes tecnologías y herramientas se utilizan en los servicios de la API:

### Servicio de usuarios (user-service)

- Node.js
- TypeScript
- Express
- MySQL
- JWT (jsonwebtoken para autenticación (generación y verificación de tokens))
- Zod (validación de esquemas)
- bcrypt (hashing de contraseñas)
- uuid (identificadores únicos)

### Servicio de productos (product-service)

- Node.js
- TypeScript
- NestJS
- MySQL
- JWT (jsonwebtoken solo para verificación de tokens)
- TypeORM (ORM para MySQL)
- class-validator (validación de esquemas)
- class-transformer (transformación de objetos)

### Servicio de pedidos (order-service)

- Node.js
- TypeScript
- Express
- MySQL
- JWT (jsonwebtoken para verificación de tokens)
- Zod (validación de esquemas)
- bcrypt (hashing de contraseñas)
- uuid (identificadores únicos)
- Morgan (logging de requests)

### Servicio de calificaciones (review-service)

- Node.js
- TypeScript
- Express
- MySQL
- JWT (jsonwebtoken para verificación de tokens)
- Zod (validación de esquemas)
- bcrypt (hashing de contraseñas)
- uuid (identificadores únicos)
- Morgan (logging de requests)

### Servicio de carrito de compras (cart-service)

- Node.js
- Express
- JWT (jsonwebtoken para verificación de tokens)
- Zod (validación de esquemas)
- MongoDB
- Mongoose (ODM para MongoDB)
- uuid (identificadores únicos)

---

## Estructura del proyecto

Cada servicio tiene la siguiente estructura de carpetas y archivos, en donde podrá encontrar el código fuente, configuraciones y documentación específica de cada servicio.

```text
byte-store-API/
├── api-gateway/ #API Gateway (pendiente)
├── user-service/ #Servicio de Usuarios
    ├── init/data.sql #Script para inicializar la base de datos
├── product-service/ #Servicio de Productos
    ├── init/data.sql #Script para inicializar la base de datos
├── order-service/ #Servicio de Pedidos
├── review-service/ #Servicio de Calificaciones
├── cart-service/ #Servicio de Carrito de Compras

```

---

## Usando Docker (opcional)

Cada servicio tiene un `Dockerfile` para construir una imagen Docker del servicio. También hay un archivo `docker-compose.yml` en la raíz del proyecto para orquestar los contenedores de los servicios y sus bases de datos.

Para construir y ejecutar los servicios usando Docker, asegúrate de tener Docker y Docker Compose instalados en tu máquina. Luego, desde la raíz del proyecto, ejecuta:

1. Crear una red de Docker para que los contenedores puedan comunicarse entre sí:
   ```bash
   docker network create app_network
   ```
2. Construir y ejecutar los contenedores:
   ```bash
   docker compose -f docker-compose.dev.yml build --no-cache
   docker compose -f docker-compose.dev.yml up -d
   ```

---

## Documentación de los servicios

Cada servicio tiene su propia documentación en su respectivo archivo `README.md`. A continuación, se proporcionan enlaces directos a la documentación de cada servicio:

- [Servicio de usuarios (user-service)](https://github.com/JoseDHernandez/ByteStore-API/tree/main/user-service/README.md)
- [Servicio de productos (product-service)](https://github.com/JoseDHernandez/ByteStore-API/tree/main/product-service/README.md)
- [Servicio de pedidos (order-service)](https://github.com/JoseDHernandez/ByteStore-API/tree/main/order-service/README.md)
- [Servicio de calificaciones (review-service)](https://github.com/JoseDHernandez/ByteStore-API/tree/main/review-service/README.md)
- [Servicio de carrito de compras (cart-service)](https://github.com/JoseDHernandez/ByteStore-API/tree/main/cart-service/README.md)

---

## Licencia

[Byte Store API](https://github.com/JoseDHernandez/ByteStore-API/tree/main) &copy; 2025 [José Hernández](https://josedhernandez.com), Daniel Leiton & [Anderson Lozada](https://github.com/andersoncoder-droid). bajo la licencia [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
