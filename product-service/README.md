# Servicio de producto

Este servicio permite **registrar, obtener, actualizar y eliminar productos**, además de manejar el inventario y la categorización de productos.

La mayoría de las operaciones de este servicio requieren autenticación mediante JWT (con el rol de ADMINISTRADOR), excepto la obtención de productos y filtros.

## Tecnologías utilizadas

- Nestjs + TypeScript
- TypeORM
- MySQL
- jwt (jsonwebtoken)

---

## Indice

- [Variables de entorno](#variables-de-entorno)
- [Autenticación](#autenticación)
- [Peticiones de la API](#peticiones-de-la-api)
  - [Productos](#productos)
    - [Solicitar productos (Publica)](#solicitar-productos-pública)
    - [Obtener un producto por ID (Publica)](#obtener-un-producto-por-id-pública)
    - [Obtener filtros disponibles (Publica)](#obtener-filtros-disponibles-pública)
    - [Crear un producto](#crear-un-producto)
    - [Editar un producto](#editar-un-producto)
    - [Actualizar calificación de un producto](#actualizar-calificación-de-un-producto)
    - [Eliminar un producto](#eliminar-un-producto)
  - [Gestión de imágenes](#gestión-de-imágenes)
    - [Obtener una imagen (Pública)](#obtener-una-imagen-pública)
    - [Subir una imagen](#subir-una-imagen)
    - [Cambiar una imagen existente](#cambiar-una-imagen-existente)
    - [Eliminar una imagen](#eliminar-una-imagen)
  - [Marcas (Brands)](#marcas-brands)
    - [Solicitar marcas (Pública)](#solicitar-marcas-pública)
    - [Obtener una marca por ID (Pública)](#obtener-una-marca-por-id-pública)
    - [Crear una marca](#crear-una-marca)
    - [Actualizar una marca](#actualizar-una-marca)
    - [Eliminar una marca](#eliminar-una-marca)
  - [Gráficos (Displays)](#gráficos-displays)
    - [Solicitar gráficos (Pública)](#solicitar-gráficos-pública)
    - [Obtener un gráfico por ID (Pública)](#obtener-un-gráfico-por-id-pública)
    - [Crear un gráfico](#crear-un-gráfico)
    - [Actualizar un gráfico](#actualizar-un-gráfico)
    - [Eliminar un gráfico](#eliminar-un-gráfico)
  - [Procesadores (Processors)](#procesadores-processors)
    - [Solicitar procesadores (Pública)](#solicitar-procesadores-pública)
    - [Obtener un procesador por ID (Pública)](#obtener-un-procesador-por-id-pública)
    - [Crear un procesador](#crear-un-procesador)
    - [Actualizar un procesador](#actualizar-un-procesador)
    - [Eliminar un procesador](#eliminar-un-procesador)
  - [Sistemas operativos (Systems)](#sistemas-operativos-systems)
    - [Solicitar sistemas operativos (Pública)](#solicitar-sistemas-operativos-pública)
    - [Obtener un sistema operativo por ID (Pública)](#obtener-un-sistema-operativo-por-id-pública)
    - [Crear un sistema operativo](#crear-un-sistema-operativo)
    - [Actualizar un sistema operativo](#actualizar-un-sistema-operativo)
    - [Eliminar un sistema operativo](#eliminar-un-sistema-operativo)
- [Códigos de estado HTTP](#códigos-de-estado-http)
- [Instalación](#instalación)
- [Licencia](#licencia)

---

## Variables de entorno

| Variable            | Descripción                                                                           | Valor por defecto                                               |
| ------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `JWT_SECRET`        | Clave secreta para firmar los tokens JWT                                              | `@y*&0a%K%7P0t@uQ^38HN$y4Z^PK#0zE7dem700Bbf&pC6HF$aU^ARkE@u$nn` |
| `DATABASE_HOST`     | Host de la base de datos                                                              | Se espera: `product-db`                                         |
| `DATABASE_PORT`     | Puerto de la base de datos                                                            |                                                                 |
| `DATABASE_USER`     | Usuario de la base de datos                                                           |                                                                 |
| `DATABASE_PASSWORD` | Contraseña de la base de datos                                                        |                                                                 |
| `DATABASE_NAME`     | Nombre de la base de datos                                                            | Se espera: `products`                                           |
| `API_URL`           | URL base del servicio (para servir imágenes), debe ser la dirección de este servicio. | `http://localhost:3000/products`                                |

---

## Autenticación

Este servicio utiliza JWT para autenticar las solicitudes. La mayoría de las rutas requieren un token JWT válido en el encabezado `Authorization` con el valor `<token>`. Solo los usuarios con el rol de `ADMINISTRADOR` pueden acceder a las rutas protegidas. Estos token son generados por el [servicio de usuarios](https://github.com/JoseDHernandez/ByteStore-API/tree/main/user-service).

## Peticiones de la API

### Productos

En las peticiones que devuelven productos, se utiliza el siguiente esquema:

**Esquema de producto:**

```js
{
  "id": 1,
  "name": "HP Intel Core I3 - 8GB", // Marca + Familia del procesador + RAM
  "description": "Con el Portátil HP 15-fd0026la.....",
  "price": 3299000,
  "discount": 54, //54%
  "stock": 10, // Si es 0, está agotado y el cliente lo interpreta como "sin stock"
  //La imagen se sirve desde este mismo servicio bajo la ruta /images/:imageName
  "image": "{API_URL}/images/198122843657-001-750Wx750H.webp",
  "model": "15-fd0026la",
  "ram_capacity": 8,
  "disk_capacity": 512,
  //Calificación general, esta se actualiza en relación al servicio de reseñas
  "qualification": "0.0",
  // Brand, Processor, System, Display tiene sus propios cruds
  "brand": "HP",
  "processor": {
    "brand": "Intel",
    "family": "Intel Core I3",
    "model": "N305",
    "cores": 8,
    "speed": "Hasta 3,8 GHz...."
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
```

---

#### Solicitar productos (Publica)

**GET** `/`

Al solicitar la lista de productos, se pueden usar los siguientes parámetros para paginación y filtros:

**Parámetros:**
| Parámetro |Tipo | Valor por defecto | Descripción |
| --------- | ----------------------------------- | ------- | ----------------- |
| `page` | number | 1 | Número de página (debe ser positivo) |
| `limit` | number | 15 | Cantidad de productos en la respuesta (máximo 100) |
| `search` | string | | Término de búsqueda (nombre, modelo, marca del producto, marca de los gráficos o marca del procesador) |

**Respuesta:**

```js
{
  "total": 45,
    "pages": 3,
    "first": 1,
    "next": 2,
    "prev": null,
    "data": products[] // Array de productos (esquema arriba)
}
```

---

#### Obtener un producto por ID (Publica)

**GET** `/:id`

Obtiene un producto por su ID (numérico).

**Respuesta:** `/2`

```js
{
  "id": 2,
  "name": "Lenovo AMD R5 - 24GB",
  "description": "Potencia y elegancia...",
  "price": 3999000,
  "discount": 40,
  "stock": 10,
  "image": "http://localhost:3000/products/images/198155958762-001-750Wx750H.webp",
  "model": "83KA001NLM",
  "ram_capacity": 24,
  "disk_capacity": 512,
  "qualification": "0.0",
  "brand": "LENOVO",
  "processor": {
    "brand": "AMD",
    "family": "Ryzen 5",
    "model": "8640HS",
    "cores": 6,
    "speed": "12T, 3.5 / 4.9GHz, 6MB L2 / 16MB L3"
  },
  "system": {
    "system": "Windows",
    "distribution": "Windows 11 Home LTS"
  },
  "display": {
    "size": 15,
    "resolution": "WUXGA",
    "graphics": "Gráficos integrados",
    "brand": "AMD Radeon"
  }
}
```

---

#### Obtener filtros disponibles (Publica)

esta ruta devuelve las opciones disponibles para los filtros en la búsqueda de productos, util para interfaces de usuario.

**GET** `/filters`

**Respuesta:**

```js
{
  //Marcas de los productos
  "brands": [
    {
      "name": "Acer"
    },
    {
      "name": "Asus"
    },
    {
      "name": "Hp"
    },
    {
      "name": "Lenovo"
    },
    {
      "name": "Msi"
    },
    {
      "name": "Rog"
    }
  ],
  //Marcas de los procesadores
  "processors": [
    {
      "name": "Intel"
    },
    {
      "name": "Amd"
    },
    {
      "name": "Apple"
    }
  ],
  //Marcas de los gráficos (displays)
  "displays": [
    {
      "name": "Intel graphics"
    },
    {
      "name": "Amd radeon"
    },
    {
      "name": "Nvidia"
    },
    {
      "name": "Apple"
    }
  ]
}
```

---

#### Crear un producto

Esta ruta permite crear un nuevo producto en el sistema.
**POST** `/`

**Body:**

```js
{
  // Todos los campos son obligatorios

  // Nombre del producto: Marca + Familia del procesador + RAM
  "name": "LENOVO IdeaPad Intel Core I5 - 16GB",

  // Descripción entre 10 a 1000 caracteres
  "description": "En el portátil .....",

  // Precio en COP (número entero positivo) entre 100.000 y 20.000.000
  "price": 3899000,

  // Descuento en porcentaje (número entero positivo) entre 0 y 90
  "discount": 41,

  // Stock (número entero positivo)
  "stock": 10,

  // Nombre del archivo de la imagen (debe subirse en /images/upload)
  "image": "198158432276-001-750Wx750H.webp",

  // Modelo del producto (string único)
  "model": "83K100HFLM",

  // Capacidad de RAM en GB (número entero positivo) entre 8 y 128
  "ram_capacity": 16,

  // Capacidad de disco en GB (número entero positivo) entre 128 (128 GB) y 10000 (10 TB)
  "disk_capacity": 512,

  //Calificación general, esta se actualiza en relación al servicio de reseñas.
  //Inicialmente es 0.0
  "qualification": "0.0",

  // Brand, Processor, System, Display tiene sus propios cruds
  // Pero se pueden crear si los datos ingresados no existen
  //en caso de que ya existan, se usan los existentes
  "brand": "LENOVO",
  "processor": {
    "brand": "Intel",
    "family": "Intel Core I5",
    "model": "13420H",
    "cores": 8,
    "speed": "Hasta 4,6 GHz ..."
  },
  "system": {
    "system": "Windows",
    "distribution": "Windows 11 Home LTS"
  },
  "display": {
    "size": 15,
    "resolution": "WUXGA",
    "graphics": "Gráficos integrados",
    "brand": "Intel Graphics"
  }
}
```

**Respuesta:**

```js
{
  "id": 7, // ID automático
  "name": "LENOVO IdeaPad Intel Core I5 - 16GB",
  "description": "En el portátil ...",
  "price": 3899000,
  "discount": 41,
  "stock": 10,
  "image": "http://localhost:3000/products/images/198158432276-001-750Wx750H.webp",
  "model": "83K100HFLM",
  "ram_capacity": 16,
  "disk_capacity": 512,
  "qualification": "0.0",
  "brand": "LENOVO",
  "processor": {
    "brand": "Intel",
    "family": "Intel Core I5",
    "model": "13420H",
    "cores": 8,
    "speed": "Hasta 4,6 GHz ..."
  },
  "system": {
    "system": "Windows",
    "distribution": "Windows 11 Home LTS"
  },
  "display": {
    "size": 15,
    "resolution": "WUXGA",
    "graphics": "Gráficos integrados",
    "brand": "Intel Graphics"
  }
}
```

---

#### Editar un producto

Esta ruta permite editar un producto existente en el sistema.

**PUT** `/:id`

**Body:**

```js
{
  // Todos los campos son opcionales, pero al menos uno debe ser enviado
  "name": "HP Intel Core I5 - 8GB",
  "description": "Con el Portátil HP ....",
  "price": 3999000,
  "discount": 45,
  "stock": 10,
  // Para cambiar la imagen ver la sección de imágenes
  "image": "198415103550-001-750Wx750H.webp",
  "model": "14-Ep1001la",
  "ram_capacity": 8,
  "disk_capacity": 512,
  "qualification": "5.0",
  "brand_id": 1, // ID de una marca existente
  "processor_id": 1, // ID de un procesador existente
  "system_id": 1, // ID de un sistema existente
  "display_id": 1 // ID de un display existente
}
```

**Respuesta:**

```js
{
  "id": 8,
  "name": "HP Intel Core I5 - 8GB",
  "description": "Con el Portátil ...",
  "price": 3999000,
  "discount": 45,
  "stock": 10,
  "image": "http://localhost:3000/products/images/198415103550-001-750Wx750H.webp",
  "model": "14-Ep1001la",
  "ram_capacity": 8,
  "disk_capacity": 512,
  "qualification": "0.0",
  "brand": "HP",
  "processor": {
    "brand": "Intel",
    "family": "Intel Core I5",
    "model": "125H",
    "cores": 14,
    "speed": "Hasta 4.5 GHz ..."
  },
  "system": {
    "system": "Windows",
    "distribution": "Windows 11"
  },
  "display": {
    "size": 14,
    "resolution": "Full HD",
    "graphics": "Gráficos integrados",
    "brand": "Intel Graphics"
  }
}
```

---

#### Actualizar calificación de un producto

Esta ruta permite actualizar la calificación general de un producto, esta se calcula en base a las reseñas del servicio de reseñas.

**PATCH** `/:id`

**Body:**

```js
{
  // Calificación entre 0.0 y 5.0
  "qualification": 4.5
}
```

**Respuesta:**

```js
{
  "id": 8,
  "name": "HP Intel Core I5 - 8GB",
  "description": "Con el Portátil ...",
  "price": 3999000,
  "discount": 45,
  "stock": 10,
  "image": "http://localhost:3000/products/images/198415103550-001-750Wx750H.webp",
  "model": "14-Ep1001la",
  "ram_capacity": 8,
  "disk_capacity": 512,
  "qualification": "4.5",
  "brand": "HP",
  "processor": {
    "brand": "Intel",
    "family": "Intel Core I5",
    "model": "125H",
    "cores": 4,
    "speed": "Hasta 4.5 GHz ..."
  },
  "system": {
    "system": "Windows",
    "distribution": "Windows 11"
  },
  "display": {
    "size": 14,
    "resolution": "Full HD",
    "graphics": "Gráficos integrados",
    "brand": "Intel Graphics"
  }
}
```

---

#### Eliminar un producto

Esta ruta permite eliminar un producto existente en el sistema.

**DELETE** `/:id`

**Respuesta:**

```js
{
  "message": "Se elimino correctamente el registro del producto con id: 8"
}
```

---

### Gestión de imágenes

Este servicio permite subir, cambiar y servir imágenes de productos. **Estas deben pesar menos de 300 KB y estar en formato WEBP**. Se aconseja que tenga las dimensiones de 750x750 píxeles.

#### Obtener una imagen (Pública)

Esta ruta permite obtener una imagen por su nombre de archivo. Según la variable de entorno `API_URL`, esta ruta puede variar.

La estructura de la URL es:

`{API_URL}/images/{filename}`

**Ejemplos:**

- `http://localhost:3000/products/images/198158432276-001-750Wx750H.webp`
- `https://bytestore/api/product_service/images/198158432276-001-750Wx750H.webp`

---

#### Subir una imagen

Esta ruta permite subir una imagen al servidor.

**POST** `/images/upload`

**Body (form-data):**

| Clave | Tipo | Requerido | Descripción                 |
| ----- | ---- | --------- | --------------------------- |
| file  | file | Sí        | Imagen del producto (webp). |

**Respuesta:**

```js
{
  "message": "Imagen subida correctamente",
  // La URL para acceder a la imagen
  "filepath": "{API_URL}/images/198158432276-001-750Wx750H.webp"
}
```

---

#### Cambiar una imagen existente

Esta ruta permite reemplazar una imagen existente en el servidor.

**PUT** `/images/:filename`

_Nota:_ `:filename` es el nombre del archivo a reemplazar (incluida la extensión .webp). Ej: `198158432276-001-750Wx750H.webp`

**Body (form-data):**

| Clave | Tipo | Requerido | Descripción                       |
| ----- | ---- | --------- | --------------------------------- |
| file  | file | Sí        | Nueva imagen del producto (webp). |

**Respuesta:**

```js
{
  "message": "Imagen reemplazada correctamente",
  "filepath": "{API_URL}/images/198158432276-001-750Wx750H.webp"
}
```

---

#### Eliminar una imagen

Esta ruta permite eliminar una imagen existente en el servidor. Esto no elimina el producto asociado, solo la imagen del servidor.

**DELETE** `/images/:filename`

**Respuesta:**

```js
{
  "message": "La imagen 198158432276-001-750Wx750H.webp fue eliminada."
}
```

---

### Marcas (Brands)

Las marcas son entidades que representan los fabricantes de los productos .

#### Solicitar marcas (Pública)

Esta ruta devuelve la lista de marcas disponibles en el sistema.

**GET** `/brands`

**Respuesta:**

```js
[
  {
    id: 1,
    name: 'Acer',
  },
  {
    id: 2,
    name: 'Asus',
  },
  {
    id: 3,
    name: 'Hp',
  },
  {
    id: 4,
    name: 'Lenovo',
  },
  {
    id: 5,
    name: 'Msi',
  },
  {
    id: 6,
    name: 'Rog',
  },
];
```

---

#### Obtener una marca por ID (Pública)

Esta ruta devuelve una marca específica por su ID.

**GET** `/brands/:id`

**Respuesta:**

```js
{
  "id": 1,
  "name": "HP"
}
```

---

#### Crear una marca

Esta ruta permite crear una nueva marca en el sistema.

**POST** `/brands`

**Body:**

```js
{
  // Nombre de la marca (string único, obligatorio)
  // En caso de que ya exista, no se crea y se retornan los datos existentes
  "name": "Nueva Marca"
}
```

**Respuesta:**

```js
{
  "id": 7,
  "name": "Nueva Marca"
}
```

---

#### Actualizar una marca

Esta ruta permite actualizar una marca existente en el sistema.

**PATCH** `/brands/:id`

**Body:**

```js
{
  "name": "Marca Actualizada"
}
```

**Respuesta:**

```js
{
  "id": 7,
  "name": "Marca Actualizada"
}
```

---

#### Eliminar una marca

Esta ruta permite eliminar una marca existente en el sistema. Esto no elimina los productos asociados, solo la marca.

**DELETE** `/brands/:id`

**Respuesta:**

```js
{
  "message": "Se elimino correctamente el registro de la marca con id: 7"
}
```

---

### Gráficos (Displays)

Los gráficos son entidades que representan las tarjetas gráficas o soluciones gráficas integradas en los productos.

#### Solicitar gráficos (Pública)

Esta ruta devuelve la lista de gráficos disponibles en el sistema.

**GET** `/displays`

**Respuesta:**

```js
[
  {
    id: 1,
    brand: 'Intel Graphics',
    size: 15,
    resolution: 'Full HD',
    graphics: 'Gráficos integrados',
  },
  {
    id: 2,
    brand: 'Amd Radeon',
    size: 15,
    resolution: 'WUXGA',
    graphics: 'Gráficos integrados',
  },
  {
    id: 3,
    brand: 'Nvidia',
    size: 15,
    resolution: 'Full HD',
    graphics: 'Nvidia GeForce RTX 3050',
  },
  {
    id: 4,
    brand: 'Apple',
    size: 13,
    resolution: '2560 x 1600',
    graphics: 'Apple M1',
  },
];
```

---

#### Obtener un gráfico por ID (Pública)

Esta ruta devuelve un gráfico específico por su ID.

**GET** `/displays/:id`

**Respuesta:**

```js
{
  "id": 1,
  "brand": "Intel Graphics",
  "size": 15,
  "resolution": "Full HD",
  "graphics": "Gráficos integrados"
}
```

---

#### Crear un gráfico

Esta ruta permite crear un nuevo gráfico en el sistema.

**POST** `/displays`

**Body:**

```js
{
  // Todos los campos son obligatorios
  // En caso de que ya exista, no se crea y se retornan los datos existentes

  // Marca del gráfico (string)
  "brand": "Intel Graphics",

  // Tamaño de la pantalla en pulgadas (número entero positivo) entre 10 y 20
  "size": 15,

  // Resolución de la pantalla (string)
  "resolution": "Full HD",

  // Tipo de gráficos (string)
  "graphics": "Gráficos integrados"
}
```

**Respuesta:**

```js
{
  "id": 5,
  "brand": "Intel Graphics",
  "size": 15,
  "resolution": "Full HD",
  "graphics": "Gráficos integrados"
}
```

---

#### Actualizar un gráfico

Esta ruta permite actualizar un gráfico existente en el sistema.

**PATCH** `/displays/:id`

**Body:**

```js
{
  // Todos los campos son opcionales, pero al menos uno debe ser enviado
  "brand": "Intel Graphics",
  "size": 15,
  "resolution": "Full HD",
  "graphics": "Gráficos integrados"
}
```

**Respuesta:**

```js
{
  "id": 5,
  "brand": "Intel Graphics",
  "size": 15,
  "resolution": "Full HD",
  "graphics": "Gráficos integrados"
}
```

---

#### Eliminar un gráfico

Esta ruta permite eliminar un gráfico existente en el sistema. Esto elimina los productos asociados.

**DELETE** `/displays/:id`

**Respuesta:**

```js
{
  "message": "Se elimino correctamente el registro de la pantalla con id: 5"
}
```

---

### Procesadores (Processors)

Los procesadores son entidades que representan las unidades de procesamiento central (CPU) en los productos.

#### Solicitar procesadores (Pública)

Esta ruta devuelve la lista de procesadores disponibles en el sistema.

**GET** `/processors`

**Respuesta:**

```js
[
  {
    id: 1,
    brand: 'Intel',
    family: 'Intel Core I3',
    model: 'N305',
    cores: 8,
    speed: 'Hasta 3,8 GHz con tecnología Intel Turbo Boost',
  },
  {
    id: 2,
    brand: 'Amd',
    family: 'Ryzen 5',
    model: '8640HS',
    cores: 6,
    speed: '12T, 3.5 / 4.9GHz, 6MB L2 / 16MB L3',
  },
];
```

---

#### Obtener un procesador por ID (Pública)

Esta ruta devuelve un procesador específico por su ID.

**GET** `/processors/:id`

**Respuesta:**

```js
{
  "id": 1,
  "brand": "Intel",
  "family": "Intel Core I3",
  "model": "N305",
  "cores": 8,
  "speed": "Hasta 3,8 GHz con tecnología Intel Turbo Boost"
}
```

---

#### Crear un procesador

Esta ruta permite crear un nuevo procesador en el sistema.

**POST** `/processors`

**Body:**

```js
{
  // Todos los campos son obligatorios
  // En caso de que ya exista, no se crea y se retornan los datos existentes

  // Marca del procesador (string)
  "brand": "Intel",

  // Familia del procesador (string)
  "family": "Intel Core I5",

  // Modelo del procesador (string)
  "model": "13420H",

  // Número de núcleos (número entero positivo) entre 4 y 64
  "cores": 8,

  // Velocidad del procesador (string)
  "speed": "Hasta 4,6 GHz con tecnología Intel Turbo Boost"
}
```

**Respuesta:**

```js
{
  "id": 3,
  "brand": "Intel",
  "family": "Intel Core I5",
  "model": "13420H",
  "cores": 8,
  "speed": "Hasta 4,6 GHz con tecnología Intel Turbo Boost"
}
```

---

#### Actualizar un procesador

Esta ruta permite actualizar un procesador existente en el sistema.

**PUT** `/processors/:id`

**Body:**

```js
{
  // Todos los campos son opcionales, pero al menos uno debe ser enviado
  "brand": "Intel",
  "family": "Intel Core I5",
  "model": "13420H",
  "cores": 8,
  "speed": "Hasta 4,6 GHz con tecnología Intel Turbo Boost"
}
```

**Respuesta:**

```js
{
  "id": 3,
  "brand": "Intel",
  "family": "Intel Core I5",
  "model": "13420H",
  "cores": 8,
  "speed": "Hasta 4,6 GHz con tecnología Intel Turbo Boost"
}
```

---

#### Eliminar un procesador

Esta ruta permite eliminar un procesador existente en el sistema. Esto elimina los productos asociados.

**DELETE** `/processors/:id`

**Respuesta:**

```js
{
  "message": "Se elimino correctamente el registro del procesador con id: 3"
}
```

---

### Sistemas operativos (Systems)

Los sistemas operativos son entidades que representan los sistemas operativos instalados en los productos. Estos tienen un nombre (system o sistema) y una distribución específica.

#### Solicitar sistemas operativos (Pública)

Esta ruta devuelve la lista de sistemas operativos disponibles en el sistema.

**GET** `/systems`

**Respuesta:**

```js
[
  {
    id: 1,
    system: 'Windows',
    distribution: 'Windows 11 Home LTS',
  },
  {
    id: 2,
    system: 'Windows',
    distribution: 'Windows 11 Pro',
  },
  {
    id: 3,
    system: 'MacOS',
    distribution: 'MacOS Ventura',
  },
];
```

---

#### Obtener un sistema operativo por ID (Pública)

Esta ruta devuelve un sistema operativo específico por su ID.

**GET** `/systems/:id`

**Respuesta:**

```js
{
  "id": 1,
  "system": "Windows",
  "distribution": "Windows 11 Home LTS"
}
```

---

#### Crear un sistema operativo

Esta ruta permite crear un nuevo sistema operativo en el sistema.

**POST** `/systems`

**Body:**

```js
{
  // Todos los campos son obligatorios
  // En caso de que ya exista, no se crea y se retornan los datos existentes

  // Nombre del sistema operativo (string)
  "system": "Windows",

  // Distribución específica del sistema operativo (string)
  "distribution": "Windows 11 Home LTS"
}
```

**Respuesta:**

```js
{
  "id": 4,
  "system": "Windows",
  "distribution": "Windows 11 Home LTS"
}
```

---

#### Actualizar un sistema operativo

Esta ruta permite actualizar un sistema operativo existente en el sistema.

**PUT** `/systems/:id`

**Body:**

```js
{
  // Todos los campos son opcionales, pero al menos uno debe ser enviado
  "system": "Windows",
  "distribution": "Windows 11 Home LTS"
}
```

**Respuesta:**

```js
{
  "id": 4,
  "system": "Windows",
  "distribution": "Windows 11 Home LTS"
}
```

---

#### Eliminar un sistema operativo

Esta ruta permite eliminar un sistema operativo existente en el sistema. Esto elimina los productos asociados.

**DELETE** `/systems/:id`

**Respuesta:**

```js
{
  "message": "Se elimino correctamente el registro del sistema operativo con id: 4"
}
```

---

## Códigos de estado HTTP

| Código | Descripción                                                                                         |
| ------ | --------------------------------------------------------------------------------------------------- |
| 200    | OK - La solicitud se ha procesado con éxito.                                                        |
| 201    | Created - El recurso se ha creado con éxito.                                                        |
| 400    | Bad Request - La solicitud es inválida o falta algún parámetro obligatorio.                         |
| 401    | Unauthorized - No se proporcionaron credenciales válidas.                                           |
| 403    | Forbidden - No tiene permiso para acceder a este recurso.                                           |
| 404    | Not Found - El recurso solicitado no se encontró.                                                   |
| 413    | Payload Too Large - La imagen subida excede el tamaño máximo permitido (300 KB).                    |
| 415    | Unsupported Media Type - El formato de la imagen no es compatible (solo se permiten archivos WEBP). |
| 500    | Internal Server Error - Error en el servidor.                                                       |
| 404    | Not Found - Recurso no encontrado, común en los `:id`                                               |

---

## Instalación

Para la instalación y ejecución del **servicio de productos**, sigue estos pasos:

1. Clona el repositorio:

   ```bash
   git clone https://github.com/JoseDHernandez/ByteStore-API.git
   cd ByteStore-API/product-service
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Configura las [variables de entorno](#variables-de-entorno) en un archivo `.env`.
4. Asegúrate de tener un contenedor de MySQL en ejecución o una base de datos MySQL accesible.
5. Ejecuta las migraciones para crear las tablas necesarias. Los esquemas se encuentran en la carpeta `/init`, en el archivo `data.sql`.
6. Inicia el servicio:

   ```bash
   npm run start:dev
   ```

7. El servicio estará disponible en `http://localhost:3000/products` (o la URL que hayas configurado en `API_URL`).

---

## Licencia

[Product-service](https://github.com/JoseDHernandez/ByteStore-API/tree/main/product-service) &copy; 2025 por [José Hernández](https://josedhernandez.com) bajo la licencia [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
