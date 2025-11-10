/** JWT library for token operations */
import jwt, { type JwtPayload } from 'jsonwebtoken';
/** Shared JWT payload structure */
import type { JWTData } from '../types/token.js';

/**
 * Secret key for JWT signing/verification
 * Should be overridden via JWT_SECRET environment variable in production
 */
const SECRET_KEY =
  process.env.JWT_SECRET ||
  '@y*&0a%K%7P0t@uQ^38HN$y4Z^PK#0zE7dem700Bbf&pC6HF$aU^ARkE@u$nn';

/**
 * Generates a new JWT token for user authentication
 * @param payload - User identification data (id and role)
 * @returns Signed JWT string valid for 30 days
 */
export function generateToken({ id, role }: JWTData) {
  return jwt.sign({ id, role }, SECRET_KEY, { expiresIn: '30d' });
}

/**
 * Verifies and normalizes a JWT token
 * Accepts raw token (no 'Bearer ' prefix required)
 * Normalizes 'id' or 'sub' claim to consistent 'id' field
 * @param token - Raw JWT string from Authorization header
 * @returns Normalized user data or null if token is invalid/expired
 */
export function verifyToken(token: string): JWTData | null {
  const rawToken = token?.trim();
  if (!rawToken) {
    return null;
  }

  try {
    const payload = jwt.verify(rawToken, SECRET_KEY) as JwtPayload & JWTData;
    const id = payload.id ?? payload.sub;
    const role = payload.role;

    if (!id || !role) {
      return null;
    }

    const normalized: JWTData = {
      id: String(id),
      role: String(role),
    };

    if (typeof payload.iat === 'number') {
      normalized.iat = payload.iat;
    }

    if (typeof payload.exp === 'number') {
      normalized.exp = payload.exp;
    }

    return normalized;
  } catch {
    return null;
  }
}
