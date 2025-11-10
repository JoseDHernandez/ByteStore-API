/** JWT signing and verification library */
import jwt, {
  type Secret,
  type SignOptions,
  type JwtPayload,
} from 'jsonwebtoken';
/** Minimal JWT payload structure used across services */
import type { JWTData } from '../types/token.js';

/** Secret key for signing/verifying JWTs - should be set via environment variable */
const JWT_SECRET: Secret = process.env.JWT_SECRET || 'fallback_secret_key';

/**
 * Verifies and decodes a JWT token
 * Expects raw token (no 'Bearer ' prefix)
 * Normalizes 'id' or 'sub' claim to consistent 'id' field
 * @param token - Raw JWT string from Authorization header
 * @returns Normalized JWT data or null if invalid/expired
 */
export function verifyToken(token: string): JWTData | null {
  const rawToken = token?.trim();
  if (!rawToken) {
    return null;
  }

  try {
    const payload = jwt.verify(rawToken, JWT_SECRET) as JwtPayload & JWTData;
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

/**
 * Generates a new JWT token
 * @param payload - User data to encode (id and role required)
 * @param expiresIn - Expiration time string (e.g., '24h', '7d') - defaults to 24 hours
 * @returns Signed JWT string
 */
export function generateToken(
  payload: Omit<JWTData, 'iat' | 'exp'>,
  expiresIn: string = '24h'
): string {
  const options: SignOptions = { expiresIn: expiresIn as any };
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Decodes a token without verifying signature (for inspection only)
 * WARNING: Does not validate token authenticity - use verifyToken for security
 * @param token - JWT string to decode
 * @returns Decoded payload or null on error
 */
export function decodeToken(token: string): JWTData | null {
  try {
    return jwt.decode(token) as JWTData;
  } catch (error) {
    console.error('Error al decodificar token:', error);
    return null;
  }
}
