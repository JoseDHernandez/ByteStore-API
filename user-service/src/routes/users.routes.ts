import { Router } from "express";
import {
  changeRole,
  deleteUser,
  getUsers,
  updatePassword,
  updateUser,
} from "../controllers/users.controller.ts";
import { authMiddleware, isAdmin } from "../middleware/auth.ts";
const router = Router();

router.get("/", getUsers, isAdmin);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);
router.patch("/:id/role", authMiddleware, isAdmin, changeRole);
router.patch("/:id/password", authMiddleware, updatePassword);
export default router;
