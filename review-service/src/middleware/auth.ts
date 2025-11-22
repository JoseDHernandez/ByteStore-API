/** Express types for middleware signature */
import type { Request, Response, NextFunction } from 'express';
/** JWT verification utility */
import { verifyToken } from '../utils/jwt.js';
/** JWT payload type definition */
import type { JWTData } from '../types/token.js';

/**
 * Helper function for consistent unauthorized error responses
 * @param res - Express response object
 * @param message - Error message to return to client
 */
const sendUnauthorized = (res: Response, message: string) =>
  res.status(401).json({ message });

/**
 * Authentication middleware - validates JWT token
 * Expects raw token in Authorization header (no 'Bearer ' prefix)
 * Populates req.auth with decoded user data on success
 * @returns 401 if token missing/invalid, otherwise proceeds to next middleware
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return sendUnauthorized(res, 'Token requerido');
  }

  const decoded: JWTData | null = verifyToken(authHeader);
  if (!decoded) {
    return sendUnauthorized(res, 'Token inválido o expirado');
  }

  req.auth = decoded;
  return next();
}

/**
 * Authorization middleware - ensures user has admin privileges
 * Requires authMiddleware to run first (needs req.auth populated)
 * @returns 403 Forbidden if not admin, otherwise calls next()
 */
export async function isAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  if (!req.auth) {
    return sendUnauthorized(res, 'Token requerido');
  }

  if (req.auth.role !== 'ADMINISTRADOR') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }

  return next();
}

/**
 * Resource ownership authorization middleware
 * Grants access if user owns the resource OR has admin role
 * Checks for user ID in params, body, or query under various field names
 * @returns 403 Forbidden if neither owner nor admin, otherwise calls next()
 */
export function canAccessResource(
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  if (!req.auth) {
    return sendUnauthorized(res, 'Token requerido');
  }

  /** Try multiple possible locations for resource owner ID */
  const resourceUserId =
    (req.params.userId as string | undefined) ||
    (req.params.usuarioId as string | undefined) ||
    (req.body?.usuario_id as string | undefined) ||
    (req.query?.user_id as string | undefined);

  /** Verify if authenticated user owns this resource */
  const isOwner = resourceUserId ? req.auth.id === resourceUserId : false;
  /** Check for administrator role */
  const isAdminUser = req.auth.role === 'ADMINISTRADOR';

  if (!isOwner && !isAdminUser) {
    return res.status(403).json({ message: 'Acceso denegado' });
  }

  return next();
}
