import express from "express";
import userRoutes from "./routes/users.routes.ts";
import accountRoutes from "./routes/account.routes.ts";
import infoRoutes from "./routes/information.routes.ts";
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
app.use(accountRoutes);
app.use(infoRoutes);
app.use(userRoutes);
app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});
