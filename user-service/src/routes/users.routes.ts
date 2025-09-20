import { Router } from "express";
import {
  changeRole,
  deleteUser,
  getUserById,
  getUsers,
  getUsersPaginated,
  updatePassword,
  updateUser,
} from "../controllers/users.controller.ts";
import { authMiddleware, isAdmin } from "../middleware/auth.ts";
const router = Router();

router.get("/", authMiddleware, isAdmin, getUsersPaginated);
router.get("/:id", authMiddleware, getUserById);
router.get("/all", authMiddleware, isAdmin, getUsers);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);
router.patch("/:id/role", authMiddleware, isAdmin, changeRole);
router.patch("/:id/password", authMiddleware, updatePassword);
export default router;
