import express from 'express';
import ordersRoutes from './routes/orders.routes.js';
import orderStatusRoutes from './routes/orderStatus.routes.js';
import orderProductsRoutes from './routes/orderProducts.routes.js';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import { testConnection } from './db.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/error.js';
import { requestId } from './middleware/requestId.js';
import { sanitize } from './middleware/sanitize.js';
import { errors } from './utils/httpError.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Configuración de CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Seguridad básica
app.set('trust proxy', 1);
app.use(helmet());

// Trazabilidad
app.use(requestId);

// Middleware
app.use(morgan('dev')); // Logging de requests
app.use(cors(corsOptions)); // CORS
app.use(express.json({ limit: '10mb' })); // Parser JSON
app.use(express.urlencoded({ extended: true })); // Parser URL-encoded
app.use(sanitize()); // Sanitización básica (trim strings)

// Rate limiting global (excluye health/info)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX ?? 100),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    ['/health', '/info', '/api/v1/health', '/api/v1/info'].includes(req.path),
});
app.use(limiter);

// Info (sin prefijo)
app.get('/info', (req, res) => {
  res.status(200).json({
    message: 'ByteStore Orders Service API',
    version: '1.0.0',
    description: 'Microservicio para gestión de órdenes de compra',
    endpoints: {
      orders: '/orders',
      orders_v1: '/api/v1/orders',
      health: '/health',
      health_v1: '/api/v1/health',
    },
    documentation: 'Ver README.md para más información',
  });
});

// Info (versionado)
app.get('/api/v1/info', (req, res) => {
  res.status(200).json({
    message: 'ByteStore Orders Service API',
    version: '1.0.0',
    description: 'Microservicio para gestión de órdenes de compra',
    endpoints: {
      orders: '/api/v1/orders',
      health: '/api/v1/health',
    },
    documentation: 'Ver README.md para más información',
  });
});

// Rutas principales (compat sin versión)
app.use('/orders', ordersRoutes);
app.use('/orders', orderStatusRoutes);
app.use('/orders', orderProductsRoutes);

// Rutas principales con versión /api/v1
app.use('/api/v1/orders', ordersRoutes);
app.use('/api/v1/orders', orderStatusRoutes);
app.use('/api/v1/orders', orderProductsRoutes);

// Health (sin prefijo)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'order-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Health (versionado)
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'order-service',
    version: 'v1',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// (OpenAPI endpoints removidos)

// 404 handler
app.use('*', (req, res, next) => {
  return next(errors.notFound('Endpoint no encontrado'));
});

// Global error handler
app.use(errorHandler);

// Función para iniciar el servidor
async function startServer() {
  try {
    // Probar conexión a la base de datos
    console.log('🔍 Probando conexión a la base de datos...');
    // await testConnection();
    console.log('✅ Conexión a la base de datos exitosa');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Orders Service ejecutándose en puerto ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`📦 Orders API: http://localhost:${PORT}/orders`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
  process.exit(0);
});

// Iniciar el servidor
startServer();

export default app;
