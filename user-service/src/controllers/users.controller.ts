import type { Request, Response } from "express";
import { db } from "../db.ts";
import bcrypt from "bcrypt";
import {
  changeRoleSchema,
  deleteSchema,
  searchUserSchema,
  updatePasswordSchema,
  updateSchema,
  userIdSchema,
  uuidSchema,
} from "../schemas/user.schema.ts";
import type { ResultSetHeader } from "mysql2";
import type { RowDataPacket } from "mysql2";
import type { User } from "../types/user.ts";
import type { UserResponseDTO } from "./dto/userResponse.dto.ts";
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
//obtener usuario por id
export const getUserById = async (req: Request, res: Response) => {
  try {
    //Obtener datos
    const { id } = req.params;
    const dataBody = userIdSchema.safeParse({
      id,
    });
    //Validar
    if (!dataBody.success)
      return res.status(400).json({
        message: "Invalid data",
        errors: dataBody.error._zod.def.map((e) => e.message),
      });
    //Validar cuenta
    const data = dataBody.data;
    if (data.id !== req.auth?.id && req.auth?.role !== "ADMINISTRADOR")
      return res.status(401).json({ message: "Invalid role" });
    const [selectSQL] = await db.query<User[]>(
      "SELECT name,email,physical_address FROM users WHERE id=?",
      [data.id]
    );
    if (selectSQL[0]) {
      const dto: UserResponseDTO = {
        ...selectSQL[0],
        role: req.auth?.role === "ADMINISTRADOR" ? "ADMINISTRADOR" : "CLIENTE",
        id: data.id,
      };
      return res.status(200).json({ ...dto });
    }
    return res.status(404).json({ message: "Account not found" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
//obtener usuarios paginación
export const getUsersPaginated = async (req: Request, res: Response) => {
  try {
    const validation = searchUserSchema.safeParse(req.query);
    if (!validation.success)
      return res.status(400).json({
        message: "Invalid data",
        errors: validation.error._zod.def.map((e) => e.message),
      });

    const { page: numberPage, limit: perPage, search } = validation.data;
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

    const totalItems = data.length;

    return res.status(200).json({
      total: totalItems,
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
    const { id } = req.params;
    const { name, email, physical_address } = req.body;
    const dataBody = updateSchema.safeParse({
      id,
      name,
      email,
      physical_address,
    });
    //Validar
    if (!dataBody.success)
      return res.status(400).json({
        message: "Invalid data",
        errors: dataBody.error._zod.def.map((e) => e.message),
      });
    //Validar cuenta
    const data = dataBody.data;
    if (data.id !== req.auth?.id && req.auth?.role !== "ADMINISTRADOR")
      return res.status(401).json({ message: "Invalid role" });
    // Validar datos vacíos
    if (!data.email && !data.name && !data.physical_address) {
      return res.status(400).json({ message: "Datos vacíos" });
    }

    const fields: string[] = [];
    const values: any[] = [];

    // Agregar campos
    if (data.email) {
      fields.push("email = ?");
      values.push(data.email);
    }

    if (data.name) {
      fields.push("name = ?");
      values.push(data.name);
    }

    if (data.physical_address) {
      fields.push("physical_address = ?");
      values.push(data.physical_address);
    }

    //consulta
    const query = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
    values.push(data.id);

    //actulizar
    const [updateSQL] = await db.query<ResultSetHeader>(query, values);

    //retornar datos
    const [selectSQL] = await db.query<User[]>(
      "SELECT name,email,physical_address FROM users WHERE id=?",
      [data.id]
    );
    if (updateSQL.affectedRows === 1 && selectSQL[0]) {
      const dto: UserResponseDTO = {
        ...selectSQL[0],
        role: req.auth?.role === "ADMINISTRADOR" ? "ADMINISTRADOR" : "CLIENTE",
      };
      return res.status(200).json({ ...dto });
    }
    return res.status(304).json({ message: "Account not updated" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
//Actualizar contraseña
export const updatePassword = async (req: Request, res: Response) => {
  try {
    //Obtener datos
    const { id } = req.params;
    const { password } = req.body;
    const validation = updatePasswordSchema.safeParse({ id, password });
    if (!validation.success)
      return res.status(400).json({
        message: "Invalid data",
        errors: validation.error._zod.def.map((e) => e.message),
      });
    const data = validation.data;
    //diferente usuario y no es administrador
    if (data.id !== req.auth?.id && req.auth?.role !== "ADMINISTRADOR")
      return res.status(401).json({ message: "Invalid role" });
    const passwordHashed = await bcrypt.hash(data.password, 13);
    const [updateSQL] = await db.query<ResultSetHeader>(
      "UPDATE users SET password=? WHERE id=?",
      [passwordHashed, data.id]
    );
    if (updateSQL.affectedRows === 1)
      return res.status(200).json({ message: "Password updated" });
    return res.status(304).json({ message: "Password not updated" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
//Actualizar rol
type UserRole = RowDataPacket & {
  role: string;
};
export const changeRole = async (req: Request, res: Response) => {
  try {
    //Obtener datos y validar
    const { id } = req.params;
    const { role } = req.body ?? "";
    const validation = changeRoleSchema.safeParse({ id, role: role.toLowerCase() });
    if (!validation.success)
      return res.status(400).json({
        message: "Invalid data",
        errors: validation.error._zod.def.map((e) => e.message),
      });
    const userId = validation.data.id;
    //Convertir rol
    const rol =
      validation.data.role.charAt(0).toUpperCase() +
      validation.data.role.slice(1);
    //obtener rol
    const [getRole] = await db.query<UserRole[]>(
      "SELECT id as role FROM roles WHERE name=? ",
      [rol]
    );
    if (!getRole[0]?.role)
      return res.status(404).json({ message: "Invalid role" });
    //actualizar
    const [updateRole] = await db.query<ResultSetHeader>(
      "UPDATE users SET role=? WHERE id=?",
      [getRole[0].role, userId]
    );
    if (updateRole.affectedRows === 1) {
      const [userQuery] = await db.query<User[]>(
        "SELECT name,email,physical_address FROM users WHERE id=?",
        [userId]
      );
      if (!userQuery[0])
        return res.status(404).json({ message: "User not found" });
      const data: UserResponseDTO = {
        id: userId,
        name: userQuery[0].name,
        email: userQuery[0].email,
        physical_address: userQuery[0].physical_address,
        role: rol.toUpperCase(),
      };
      return res.status(200).json({ ...data });
    }
    return res.status(304).json({ message: "Role not changed" });
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
    const { id } = req.params;
    //Variable id
    let userId: string = "";
    //Validar según el rol
    if (req.auth?.role === "ADMINISTRADOR") {
      const v = uuidSchema.safeParse({ id });
      if (!v.success)
        return res.status(400).json({
          message: "Invalid data",
          errors: v.error._zod.def.map((e) => e.message),
        });
      //Validar
      const [userQuery] = await db.query<UserPassword[]>(
        "SELECT role FROM users WHERE id=?",
        [v.data.id]
      );
      if (!userQuery[0])
        return res.status(404).json({ message: "not found account by Id" });
      userId = v.data.id;
    } else {
      const { password } = req.body;
      const validation = deleteSchema.safeParse({ id, password });
      if (!validation.success)
        return res.status(400).json({
          message: "Invalid data",
          errors: validation.error._zod.def.map((e) => e.message),
        });
      const data = validation.data;
      if (data.id !== req.auth?.id)
        return res.status(401).json({ message: "Invalid Id" });
      //Obtener usuario
      const [userQuery] = await db.query<UserPassword[]>(
        "SELECT password FROM users WHERE id=?",
        [data.id]
      );
      //validar existencia del usuario
      if (userQuery[0] && userQuery.length === 1) {
        const compareHash = await bcrypt.compare(
          data.password,
          userQuery[0].password
        );
        if (!compareHash)
          return res.status(401).json({ message: "Invalid password" });
        userId = data.id;
      }
      return res.status(404).json({ message: "not found account by Id" });
    }
    if (!userId) {
      return res.status(400).json({ message: "Invalid Id" });
    }
    //Eliminar cuenta
    const [deleteSQL] = await db.query<ResultSetHeader>(
      "DELETE FROM users WHERE id=?",
      [userId]
    );
    //Retornar estado
    if (deleteSQL.affectedRows === 1)
      return res.status(200).json({ message: "Account deleted" });
    return res.status(304).json({ message: "Account not deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
