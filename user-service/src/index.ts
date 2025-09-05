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

// Rutas
app.use(userRoutes);
app.use(accountRoutes);
app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});
