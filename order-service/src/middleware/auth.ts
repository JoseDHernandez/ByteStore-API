/** Express types for middleware functions */
import type { Request, Response, NextFunction } from 'express';
/** JWT verification utility */
import { verifyToken } from '../utils/jwt.js';
/** JWT payload structure */
import type { JWTData } from '../types/token.js';
import { errors } from '../utils/httpError.js';

/**
 * Helper to send consistent 401 Unauthorized responses
 * @param res - Express response object
 * @param message - Error message to return
 */
const sendUnauthorized = (res: Response, message: string) =>
  res.status(401).json({ message });

/**
 * Authentication middleware - validates JWT from Authorization header
 * Expects raw token (no 'Bearer ' prefix) in Authorization header
 * Attaches decoded user data to req.auth on success
 * @returns 401 if token missing/invalid, otherwise calls next()
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
 * Authorization middleware - ensures user has admin role
 * Must be used after authMiddleware (requires req.auth)
 * @returns 403 Forbidden if user is not an admin, otherwise calls next()
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
    return next(errors.forbidden('Acceso denegado'));
  }

  return next();
}

/**
 * Authorization middleware - checks if user can access a resource
 * Allows access if user is the resource owner OR has admin role
 * Searches for user ID in multiple possible request locations (params, body, query)
 * @returns 403 Forbidden if user is neither owner nor admin, otherwise calls next()
 */
export function canAccessResource(
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  if (!req.auth) {
    return sendUnauthorized(res, 'Token requerido');
  }

  /** Extract user ID from various possible locations in the request */
  const resourceUserId =
    (req.params.userId as string | undefined) ||
    (req.params.usuarioId as string | undefined) ||
    (req.body?.user_id as string | undefined) ||
    (req.body?.usuario_id as string | undefined) ||
    (req.query?.user_id as string | undefined);

  /** Check if authenticated user owns the resource */
  const isOwner = resourceUserId ? req.auth.id === resourceUserId : false;
  /** Check if user has administrator privileges */
  const isAdminUser = req.auth.role === 'ADMINISTRADOR';

  if (!isOwner && !isAdminUser) {
    return next(errors.forbidden('Acceso denegado'));
  }

  return next();
}
