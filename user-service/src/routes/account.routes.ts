import { Router } from "express";
const router = Router();

import { register, login } from "../controllers/account.controller.ts";
//rutas de registro y login
router.post("/sign-up", register);
router.post("/sign-in", login);
export default router;
