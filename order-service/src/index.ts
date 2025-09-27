import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import orderRoutes from './routes/order.routes';
import { connectDB } from './config/database';

// Configurar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Rutas públicas ABSOLUTAMENTE PRIMERO - sin ningún middleware previo
app.get('/health', (req, res) => {
  console.log('=== HEALTH CHECK ACCESSED - PUBLIC ROUTE ===');
  console.log('Request headers:', req.headers);
  console.log('Request method:', req.method);
  console.log('Request path:', req.path);
  res.status(200).json({
    status: 'OK',
    message: 'Order Service está funcionando correctamente',
    timestamp: new Date().toISOString(),
    port: PORT,
    service: 'order-service',
    version: '1.0.0',
    debug: 'This is a public route - no authentication required'
  });
});

app.get('/', (req, res) => {
  console.log('=== ROOT PATH ACCESSED - PUBLIC ROUTE ===');
  res.status(200).json({
    service: 'Order Service',
    version: '1.0.0',
    status: 'running',
    endpoints: ['/health', '/orders'],
    timestamp: new Date().toISOString(),
    debug: 'This is a public route - no authentication required'
  });
});

// Middleware básico DESPUÉS de las rutas públicas
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
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

// Logging middleware
app.use(morgan('combined'));

// Rutas protegidas (con autenticación) - Sin prefijo para compatibilidad con API Gateway
app.use('/', orderRoutes);

// Middleware de manejo de errores 404
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    message: `La ruta ${req.method} ${req.path} no existe`
  });
});

// Middleware global de manejo de errores
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error no manejado:', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: 'Ha ocurrido un error inesperado'
  });
});

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Order Service ejecutándose en puerto ${PORT}`);
      console.log(`📊 Health check disponible en: http://localhost:${PORT}/health`);
      console.log(`📦 API disponible en: http://localhost:${PORT}/orders`);
      console.log('✅ Conectado a la base de datos MySQL');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

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