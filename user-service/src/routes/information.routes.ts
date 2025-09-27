import { Router } from "express";
const router = Router();
//health
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});
//info
router.get("/info", (req, res) => {
  res.status(200).json({
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
      information: "GET /info",
      health: "GET /health",
    },
    status: "running",
    uptime: process.uptime().toFixed(0) + "s",
    timestamp: new Date().toISOString(),
  });
});
export default router;
