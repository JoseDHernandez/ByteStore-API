const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
// ...existing code...

const express = require("express");
const config = require("./config/config");
const { router: cartRoutes, legacyRouter } = require("./routes/cartRoutes");

const app = express();

// Middlewares de seguridad
app.use(helmet());
//app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

// Middlewares de parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware para logging de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas

// Rutas principales
app.use("/", cartRoutes);

// Rutas legacy bajo prefijo /legacy
app.use("/legacy", legacyRouter);

// Ruta de salud
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "ByteStore Cart Service",
    version: "1.0.0",
  });
});

// Ruta raíz personalizada
app.get("/", (req, res) => {
  res.json({
    message: "API de Carrito de Compras",
    autor: "Daniel",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      // const path = require('path');
      // const fs = require('fs');
    },
  });
});

// Manejador global de errores no controlados
process.on("uncaughtException", (err) => {
  console.error("Excepción no controlada:", err);
  process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Rechazo de promesa no manejado:", reason);
  process.exit(1);
});

// Inicia el servidor
const PORT = config.port || 8000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
