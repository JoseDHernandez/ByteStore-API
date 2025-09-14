const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
// ...existing code...

const express = require('express');
const config = require('./config/config');
const cartRoutes = require('./routes/cartRoutes');
const jwt = require('jsonwebtoken');

const app = express();

// Endpoint de login personalizado para pruebas (debe ir después de inicializar app)
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  // Usuarios de ejemplo (puedes agregar más si lo deseas)
  const users = [
    {
      id: '01991c0e-16f0-707f-9f6f-3614666caead',
      name: 'José David Hernández Hortúa',
      email: 'jose.hernandez@test.com',
      password: 'Contrasea34^5G',
      role: 2
    },
    {
      id: '01991c11-412e-7569-bb85-a4f77ba08bb7',
      name: 'María Fernanda López',
      email: 'maria.lopez@test.com',
      password: 'Contrasea34^5G',
      role: 1
    },
    {
      id: '01989493-0def-7f41-ab40-20b04679fbb4',
      name: 'José David Hernández Hortúa',
      email: 'test@test.test',
      password: 'Contrasea34^5G',
      role: 1
    },
    {
      id: 'sr0vjcu',
      name: 'Lucas Rojas',
      email: 'correo@electronico.com',
      password: 'Contrasea34^5G',
      role: 0
    }
  ];
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  res.json({
    message: 'Login exitoso',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  });
});
// The following JSON-like block was removed because it is invalid in JavaScript files.
// If you need this data, store it in a variable or an external JSON file and import it as needed.

// Middlewares de seguridad
app.use(helmet());
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para logging de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/', cartRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'ByteStore Cart Service',
    version: '1.0.0'
  });
});

// Ruta raíz personalizada
app.get('/', (req, res) => {
  res.json({
    message: 'API de Carrito de Compras',
    autor: 'Daniel',
    version: '1.0.0',
        endpoints: {
          health: '/health',
          // const path = require('path');
          // const fs = require('fs');
        }
      });
    });
    
    // Manejador global de errores no controlados
    process.on('uncaughtException', (err) => {
      console.error('Excepción no controlada:', err);
      process.exit(1);
    });
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Rechazo de promesa no manejado:', reason);
      process.exit(1);
    });

    // Inicia el servidor
    const PORT = config.port || 8000;
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });