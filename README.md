# Byte store API

Repositorio monorepo que contiene los servicios de la API para la aplicación [Byte Store](https://github.com/JoseDHernandez/ByteStore). Estos servicios incluyen:

- [Servicio de usuarios (user-service)](https://github.com/JoseDHernandez/ByteStore-API/tree/main/user-service)
- [Servicio de productos (product-service)](https://github.com/JoseDHernandez/ByteStore-API/tree/main/product-service)
- [Servicio de pedidos (order-service)](https://github.com/JoseDHernandez/ByteStore-API/tree/main/order-service)
- [Servicio de calificaciones (review-service)](https://github.com/JoseDHernandez/ByteStore-API/tree/main/review-service)
- [Servicio de carrito de compras (cart-service)](https://github.com/JoseDHernandez/ByteStore-API/tree/main/cart-service)

Cada servicio es una aplicación independiente que se comunica con los demás a través de HTTP. Cada uno tiene su propia base de datos y lógica de negocio.

Para acceder a los endpoints de cada servicio, use las siguientes URLs base:

- `http://localhost:3000/users/` para el servicio de usuarios.
- `http://localhost:3000/products/` para el servicio de productos.
- `http://localhost:3000/orders/` para el servicio de pedidos.
- `http://localhost:3000/reviews/` para el servicio de calificaciones.
- `http://localhost:3000/carts/` para el servicio de carrito de compras.

_Ejemplos:_

- `http://localhost:3000/users/sign-in` para iniciar sesión en el servicio de usuarios.
- `http://localhost:3000/products?limit=10&page=1` para obtener una lista paginada de productos en el servicio de productos.

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

## Documentación de los servicios

Cada servicio tiene su propia documentación en su respectivo archivo `README.md`. A continuación, se proporcionan enlaces directos a la documentación de cada servicio:

- [Servicio de usuarios (user-service)](https://github.com/JoseDHernandez/ByteStore-API/tree/main/user-service/README.md)
- [Servicio de productos (product-service)](https://github.com/JoseDHernandez/ByteStore-API/tree/main/product-service/README.md)
- [Servicio de pedidos (order-service)](https://github.com/JoseDHernandez/ByteStore-API/tree/main/order-service/README.md)
- [Servicio de calificaciones (review-service)](https://github.com/JoseDHernandez/ByteStore-API/tree/main/review-service/README.md)
- [Servicio de carrito de compras (cart-service)](https://github.com/JoseDHernandez/ByteStore-API/tree/main/cart-service/README.md)

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
3. Verificar que los contenedores estén corriendo:
   ```bash
    docker ps
   ```

---

### Pruebas básicas

Para probar que los servicios están funcionando correctamente, puedes usar herramientas como Postman o cURL para hacer solicitudes HTTP a los endpoints de cada servicio.

> **Nota**: Asegúrate de que los servicios estén corriendo y que las bases de datos estén inicializadas con los scripts SQL proporcionados en cada servicio. Ademas, de configurar las variables de entorno necesarias para cada servicio en caso de no usar Docker.

**Importante:** La mayoría de los servicios requieren autenticación mediante JWT. Asegúrate de incluir un token válido en el encabezado `Authorization` de tus solicitudes. El token puede obtenerse del servicio de usuarios [(user-service)](https://github.com/JoseDHernandez/ByteStore-API/tree/main/user-service/README.md) al iniciar sesión.

---

#### Consultar el estado de user-service

**GET** `http://localhost:3000/users/health`

**Respuesta esperada:**

```json
{
  "status": "ok",
  "uptime": 809.061648571,
  "timestamp": 1758935632730
}
```

---

#### Obtener un token JWT (user-service)

**POST** `http://localhost:3000/users/sign-in`

**Cuerpo de la solicitud:**

```json
{
  "email": "jose.hernandez@test.com",
  "password": "Contrasea34^5G"
}
```

**Respuesta esperada:**

```json
{
  "data": {
    "id": "01991c0e-16f0-707f-9f6f-3614666caead",
    "name": "José David Hernández Hortúa",
    "email": "jose.hernandez@test.com",
    "physical_address": "Calle 12 #67-56",
    "role": "ADMINISTRADOR",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAxOTkxYzBlLTE2ZjAtNzA3Zi05ZjZmLTM2MTQ2NjZjYWVhZCIsInJvbGUiOiJBRE1JTklTVFJBRE9SIiwiaWF0IjoxNzU4OTM1NzI0LCJleHAiOjE3NjE1Mjc3MjR9.L-LitWfEzGXOLeCGF0j13clQ2Osnh__n6VpOf3RBAYM"
  }
}
```

---

#### Crear un carrito de compras (cart-service)

**POST** `http://localhost:3000/carts/`

**Encabezados:**

```
Authorization: <token_jwt_obtenido_anteriormente>
content-type: application/json
```

**Cuerpo de la solicitud:**

```json
{
  "user_id": "01991c0e-16f0-707f-9f6f-3614666caead",
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

**Respuesta esperada:**

```json
{
  "data": {
    "id": "c1a2b3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6",
    "user_id": "01991c0e-16f0-707f-9f6f-3614666caead",
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
    ],
    "created_at": "2025-01-01T12:00:00.000Z"
  }
}
```

---

#### Consultar productos (product-service)

**GET** `http://localhost:3000/products?limit=1`

**Respuesta esperada:**

```json
{
  "total": 45,
  "pages": 45,
  "first": 1,
  "next": 2,
  "prev": null,
  "data": [
    {
      "id": 1,
      "name": "HP Intel Core I3 - 8GB",
      "description": "Con el Portátil ....",
      "price": 3299000,
      "discount": 54,
      "stock": 10,
      "image": "http://localhost:3000/products/images/198122843657-001-750Wx750H.webp",
      "model": "15-fd0026la",
      "ram_capacity": 8,
      "disk_capacity": 512,
      "qualification": "0.0",
      "brand": "HP",
      "processor": {
        "brand": "Intel",
        "family": "Intel Core I3",
        "model": "N305",
        "cores": 8,
        "speed": "Hasta 3,8 GHz ..."
      },
      "system": {
        "system": "Windows",
        "distribution": "Windows 11 Home LTS"
      },
      "display": {
        "size": 15,
        "resolution": "Full HD",
        "graphics": "Gráficos integrados",
        "brand": "Intel Graphics"
      }
    }
  ]
}
```

---

## Licencia

[Byte Store API](https://github.com/JoseDHernandez/ByteStore-API/tree/main) &copy; 2025 [José Hernández](https://josedhernandez.com), Diego Lemus, Daniel Leiton & [Anderson Lozada](https://github.com/andersoncoder-droid). bajo la licencia [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
