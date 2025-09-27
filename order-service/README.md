# Order Service - ByteStore

Servicio de historial de pedidos para la plataforma ByteStore. Permite gestionar y consultar el historial de órdenes de los usuarios.

## Características

- Historial completo de pedidos por usuario
- Estados de pedidos (pendiente, procesando, enviado, entregado, cancelado)
- Detalles de productos comprados
- Información de transacciones y montos
- API RESTful con autenticación JWT

## Endpoints

### Órdenes
- `GET /orders` - Obtener historial de pedidos del usuario autenticado
- `GET /orders/:id` - Obtener detalles de un pedido específico
- `POST /orders` - Crear un nuevo pedido
- `PUT /orders/:id/status` - Actualizar estado de un pedido

## Tecnologías

- Node.js + Express
- TypeScript
- MySQL
- JWT para autenticación
- Zod para validación

## Instalación

```bash
npm install
npm run dev
```

## Variables de Entorno

```
PORT=3004
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=bytestore_orders
JWT_SECRET=your_jwt_secret
```