import { Router } from "express";
const router = Router();

import {
  register,
  login,
  authToken,
} from "../controllers/account.controller.ts";
import { authMiddleware } from "../middleware/auth.ts";
//rutas de registro y login
router.post("/sign-up", register);
router.post("/sign-in", login);
router.post("/auth", authMiddleware, authToken);
export default router;
