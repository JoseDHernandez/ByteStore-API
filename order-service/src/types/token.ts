/**
 * JWT token payload structure
 * Contains minimal user authentication data attached to requests
 */
export interface JWTData {
  /** User unique identifier */
  id: string;
  /** User role (e.g., 'ADMINISTRADOR', 'CLIENTE') */
  role: string;
  /** Token issued at timestamp (seconds since epoch) */
  iat?: number;
  /** Token expiration timestamp (seconds since epoch) */
  exp?: number;
}

/**
 * Extend Express Request type to include decoded JWT data
 * Populated by authMiddleware after successful token verification
 */
declare global {
  namespace Express {
    interface Request {
      auth?: JWTData;
    }
  }
}
