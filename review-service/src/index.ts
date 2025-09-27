import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import reviewRoutes from './routes/review.routes';

// Configurar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(morgan('combined')); // Logging de requests
app.use(express.json({ limit: '10mb' })); // Parser JSON
app.use(express.urlencoded({ extended: true })); // Parser URL-encoded

// CORS básico
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Rutas
app.use('/reviews', reviewRoutes);

// Ruta de salud del servicio
app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'review-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'ByteStore Review Service API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      reviews: '/api/reviews',
      documentation: 'Ver README.md para documentación completa'
    }
  });
});

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    message: `La ruta ${req.method} ${req.originalUrl} no existe`,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api/reviews',
      'POST /api/reviews',
      'GET /api/reviews/:id',
      'PUT /api/reviews/:id',
      'DELETE /api/reviews/:id',
      'GET /api/reviews/product/:productId',
      'GET /api/reviews/user/:userId'
    ]
  });
});

// Manejo global de errores
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error no manejado:', error);
  
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal'
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Review Service ejecutándose en puerto ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API Base: http://localhost:${PORT}/api/reviews`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
};

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recibido, cerrando servidor...');
  process.exit(0);
});

// Iniciar la aplicación
startServer();