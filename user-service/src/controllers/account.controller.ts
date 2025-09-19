import type { Request, Response } from "express";
import { db } from "../db.ts";
import bcrypt from "bcrypt";
import { registerSchema, loginSchema } from "../schemas/user.schema.ts";
import { v7 as uuid } from "uuid";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { User } from "../types/user.ts";
import { generateToken } from "../utils/jwt.ts";
import type { UserResponseDTO } from "./dto/userResponse.dto.ts";
export const login = async (req: Request, res: Response) => {
  try {
    //Obtener datos
    const { email, password } = req.body;
    //Validar
    const dataBody = loginSchema.safeParse({ email, password });
    if (!dataBody.success)
      return res
        .status(400)
        .json({ message: "Invalid data", errors: dataBody.error.format });
    const data = dataBody.data;
    //Obtener usuario
    const [userData] = await db.query<User[]>(
      "SELECT users.id as id, users.name as name,users.email as email,users.password as password,users.physical_address as physical_address, UPPER(roles.name) as role  FROM users INNER JOIN roles ON users.role = roles.id WHERE email=?",
      [data.email]
    );
    if (userData[0] && userData[0].password) {
      //Comprar contraseña
      const compareHash = await bcrypt.compare(
        data.password,
        userData[0].password
      );
      if (!compareHash)
        return res.status(401).json({ message: "Invalid password" });
      //Generar token
      const token = generateToken({
        id: userData[0].id,
        role: userData[0].role,
      });
      const dto: UserResponseDTO = {
        id: userData[0].id,
        name: userData[0].name,
        email: userData[0].email,
        physical_address: userData[0].physical_address,
        role: userData[0].role,
        token,
      };
      return res.status(200).json({ data: dto });
    }
    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
//Registro
interface CountUsers extends RowDataPacket {
  count: number;
}
export const register = async (req: Request, res: Response) => {
  try {
    //Obtener datos
    const { name, email, password, physical_address } = req.body;
    //Validar
    const dataBody = registerSchema.safeParse({
      name,
      email,
      password,
      physical_address,
    });
    //Retornar error de validación
    if (!dataBody.success)
      return res
        .status(400)
        .json({ message: "Invalid data", errors: dataBody.error.format });
    const data = dataBody.data;
    //Consultar existencia
    const [SearchUser] = await db.query<CountUsers[]>(
      "SELECT COUNT(*) as count FROM users WHERE users.email = ?",
      [data.email]
    );
    if (SearchUser[0]?.count && SearchUser[0]?.count !== 0)
      return res.status(200).json({ message: "Existing account" });
    //Registrar
    const passwordHashed = await bcrypt.hash(data.password, 13);
    const [registerUser] = await db.query<ResultSetHeader>(
      "INSERT INTO users (id, name, email, password, physical_address) VALUES (?,?,?,?,?)",
      [uuid(), data.name, data.email, passwordHashed, data.physical_address]
    );
    if (registerUser.affectedRows == 1) {
      //obtener id y rol
      const [userData] = await db.query<User[]>(
        "SELECT users.id as id,  UPPER(roles.name) as role  FROM users INNER JOIN roles ON users.role = roles.id WHERE email=?",
        [data.email]
      );
      if (!userData[0])
        return res.status(400).json({ message: "User not found" });
      //retornar usuario creado
      const Dto: UserResponseDTO = {
        ...data,
        id: userData[0].id,
        role: userData[0].role,
      };
      return res
        .status(201)
        .json({ message: "The user was registered", data: Dto });
    }
    return res
      .status(400)
      .json({ message: "Error to register a new user", data });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
