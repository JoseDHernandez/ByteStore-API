import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import type { JWTData } from "../types/token.ts";
const SECRET_KEY =
  process.env.JWT_SECRET ||
  "@y*&0a%K%7P0t@uQ^38HN$y4Z^PK#0zE7dem700Bbf&pC6HF$aU^ARkE@u$nn";

export function generateToken({ id, role }: JWTData) {
  return jwt.sign({ id, role }, SECRET_KEY, { expiresIn: "30d" });
}

export function verifyToken(token: string): JWTData | null {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    return { id: decoded.id as string, role: decoded.role as string };
  } catch (err) {
    return null;
  }
}
