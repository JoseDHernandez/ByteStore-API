import express from "express";
import userRoutes from "./routes/users.routes.ts";
import accountRoutes from "./routes/account.routes.ts";
import dotenv from "dotenv";
import morgan from "morgan";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(morgan("dev"));
app.use(express.json());
//cache
app.use((req, res, next) => {
  if (req.method === "GET") {
    res.set("Cache-Control", `public, max-age=${5 * 60}`); //5 minutos
  }
  next();
});
// Rutas
app.use;
app.use(userRoutes);
app.use(accountRoutes);
//health
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});
//info
app.get("/info", (req, res) => {
  res.json({
    name: "ByteStore-API user-service",
    description:
      "Microservicio encargado de la gestión de usuarios en ByteStore (registro, autenticación, actualización y eliminación).",
    version: "1.0.0",
    license: "CC BY-NC-SA 4.0",
    author: "José David Hernández Hortúa",
    repository:
      "https://github.com/JoseDHernandez/ByteStore-API/tree/main/user-service",
    docs: "https://github.com/JoseDHernandez/ByteStore-API/blob/main/user-service/README.md",
    endpoints: {
      register: "POST /sign-up",
      login: "POST /sign-in",
      getUser: "GET /:id",
      updateUser: "PATCH /:id",
      deleteUser: "DELETE /:id",
      listUsers: "GET /all",
    },
    status: "running",
    uptime: process.uptime().toFixed(0) + "s",
    timestamp: new Date().toISOString(),
  });
});
app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});
