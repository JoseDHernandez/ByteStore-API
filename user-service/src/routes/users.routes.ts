import { Router } from "express";
import { getUsers, updateUser } from "../controllers/users.controller.ts";
import { authMiddleware, isAdmin } from "../middleware/auth.ts";
const router = Router();

router.get("/", getUsers, isAdmin);
router.put("/update", authMiddleware, updateUser);
export default router;
