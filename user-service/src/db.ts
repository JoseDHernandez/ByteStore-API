import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const db = mysql.createPool({
  host: process.env.DATABASE_HOST || "localhost",
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "Dp%mdSM^7MDr3qSQ6Cas",
  database: process.env.DATABASE_NAME || "users",
  waitForConnections: true,
  connectionLimit: 10,
});
