import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.ts";
import type { RowDataPacket } from "mysql2";
import { db } from "../db.ts";
import type { JWTData } from "../types/token.ts";
type UserId = RowDataPacket & {
  id: string;
};
type UserRole = RowDataPacket & {
  role: string;
};
//Validar token
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  //Obtener token
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Token required" });
  }
  //Decodificar token
  const decoded: JWTData | null = verifyToken(authHeader ?? "");

  if (!decoded) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  try {
    //Validar existencia
    const [getUser] = await db.query<UserId[]>(
      "SELECT id FROM users WHERE id = ?",
      [decoded.id]
    );
    if (!getUser[0]?.id) {
      return res.status(401).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }

  //Guardar datos
  req.auth = decoded;
  next();
}
//Validar rol
export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  //Validar si existe validación del token
  if (!req.auth) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  //Validar rol token
  if (req.auth.role !== "ADMINISTRADOR") {
    return res.status(403).json({ message: "Forbidden" });
  }
  //Validar con base de datos
  try {
    const [getUser] = await db.query<UserRole[]>(
      "SELECT UPPER(roles.name) as role FROM users INNER JOIN roles ON users.role=roles.id WHERE users.id = ?",
      [req.auth.id]
    );
    if (getUser[0]?.role !== "ADMINISTRADOR")
      return res.status(403).json({ message: "Forbidden" });
    //Continuar proceso
    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
}
