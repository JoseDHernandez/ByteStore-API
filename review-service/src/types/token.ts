/**
 * JWT token payload structure
 * Minimal authentication data shared across microservices
 */
export type JWTData = {
  /** User unique identifier */
  id: string;
  /** User role (e.g., 'ADMINISTRADOR', 'CLIENTE') */
  role: string;
  /** Token issued at timestamp (seconds since epoch) */
  iat?: number;
  /** Token expiration timestamp (seconds since epoch) */
  exp?: number;
};

/**
 * Extend Express Request interface to include decoded JWT data
 * Set by authMiddleware after successful token verification
 */
declare global {
  namespace Express {
    interface Request {
      auth?: JWTData;
    }
  }
}
