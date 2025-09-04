import type { Request, Response } from "express";
import { db } from "../db.ts";
import bcrypt from "bcrypt";
import {
  deleteSchema,
  updateSchema,
  uuidSchema,
} from "../schemas/user.schema.ts";
import type { ResultSetHeader } from "mysql2";
import type { RowDataPacket } from "mysql2";
import type { UserResponseDTO } from "./dto/userResponse.dto.ts";
import type { User } from "../types/user.ts";
//Obtener usuarios
export const getUsers = async (req: Request, res: Response) => {
  try {
    const [data] = await db.query<User[]>(
      "SELECT users.id as id, users.name as name,users.email as email,users.physical_address as physical_address, roles.name as role  FROM users INNER JOIN roles ON users.role = roles.id"
    );
    if (!data || data.length === 0) {
      return res.status(404).json({ message: "0 users" });
    }
    return res.status(200).json({ total: data.length, data });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
//obtener usuarios paginación
export const getUsersPaginated = async (req: Request, res: Response) => {
  try {
    //Parametros
    const numberPage = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.per_page as string) || 10;
    const search = (req.query.search as string) || "";

    //Buscar nombre
    let condition = "";
    let params: any[] = [];
    if (search) {
      condition = `WHERE users.name LIKE ? OR users.email LIKE ?`;
      params.push(`%${search}%`, `%${search}%`);
    }

    //obtener total
    const [[{ total }]] = await db.query<any[]>(
      `SELECT COUNT(*) as total 
       FROM users 
       INNER JOIN roles ON users.role = roles.id
       ${condition}`,
      params
    );

    //consultar
    const offset = (numberPage - 1) * perPage;
    const [data] = await db.query<User[]>(
      `SELECT users.id as id, users.name as name, users.email as email, users.physical_address as physical_address, roles.name as role FROM users INNER JOIN roles ON users.role = roles.id ${condition} LIMIT ? OFFSET ?`,
      [...params, perPage, offset]
    );
    //datos
    const pages = Math.ceil(total / perPage);
    const page = Math.max(1, Math.min(numberPage, pages));
    const first = 1;
    const prev = page > 1 ? page - 1 : null;
    const next = page < pages ? page + 1 : null;

    const totalPages = Math.ceil(total / perPage);

    return res.status(200).json({
      total: totalPages,
      pages,
      first,
      next,
      prev,
      data,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

//Actualizar cuenta
export const updateUser = async (req: Request, res: Response) => {
  try {
    //Obtener datos
    const { id, name, email, password, physical_address } = req.body;
    const dataBody = updateSchema.safeParse({
      id,
      name,
      email,
      password,
      physical_address,
    });
    //Validar
    if (!dataBody.success)
      return res.status(400).json({ message: "Invalid data" });
    //Validar cuenta
    const data = dataBody.data;
    if (data.id !== req.auth?.id)
      return res.status(401).json({ message: "Invalid Id" });
    const [updateSQL] = await db.query<ResultSetHeader>(
      "UPDATE users SET name=?, email=?, password=?,physical_address=? WHERE id=?",
      [data.name, data.email, data.password, data.physical_address, data.id]
    );
    if (updateSQL.affectedRows === 1)
      return res.status(200).json({ message: "Account updated" });
    return res.status(304).json({ message: "Account not updated" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
//Eliminar cuenta
type UserPassword = RowDataPacket & {
  password: string;
};
export const deleteUser = async (req: Request, res: Response) => {
  try {
    //obtener datos y validar
    const { id, password } = req.body;
    const validation = deleteSchema.safeParse({ id, password });
    if (!validation.success)
      return res.status(400).json({ message: "Invalid data" });
    const data = validation.data;
    if (data.id !== req.auth?.id)
      return res.status(401).json({ message: "Invalid Id" });
    //Obtener usuario
    const [userQuery] = await db.query<UserPassword[]>(
      "SELECT password FROM  WHERE id=?",
      [data.id]
    );
    //validar existencia del usuario
    if (userQuery[0] && userQuery.length === 1) {
      const compareHash = bcrypt.compare(data.password, userQuery[0].password);
      if (!compareHash)
        return res.status(401).json({ message: "Invalid password" });
      //Eliminar cuenta
      const [deleteSQL] = await db.query<ResultSetHeader>(
        "DELETE FROM users WHERE id=?",
        [data.id]
      );
      if (deleteSQL.affectedRows === 1)
        return res.status(200).json({ message: "Account deleted" });
      return res.status(304).json({ message: "Account not deleted" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
//Eliminar cuenta por administrador
export const deleteUserByAdmin = async (req: Request, res: Response) => {
  //obtener datos y validar
  const { id } = req.body;
  const v = uuidSchema.safeParse({ id });
  if (!v.success) return res.status(400).json({ message: "Invalid data" });
  const data = v.data;
  //eliminar
  const [deleteSQL] = await db.query<ResultSetHeader>(
    "DELETE FROM users WHERE id=?",
    [data.id]
  );
  if (deleteSQL.affectedRows === 1)
    return res.status(200).json({ message: "Account deleted" });
  return res.status(304).json({ message: "Account not deleted" });
};
