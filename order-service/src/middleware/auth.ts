import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/order.types';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware de autenticación JWT
 * Valida el token Bearer en el header Authorization
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      error: 'Token de acceso requerido',
      message: 'No se proporcionó token de autenticación'
    });
    return;
  }

  try {
    // En producción, usar una clave secreta real desde variables de entorno
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
    
    // Para desarrollo/pruebas, usar mock data
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      req.user = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hora
      };
      next();
      return;
    }

    // Validación JWT real para producción
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'Token inválido',
        message: 'El token proporcionado no es válido'
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Token expirado',
        message: 'El token ha expirado, por favor inicia sesión nuevamente'
      });
    } else {
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Error al procesar la autenticación'
      });
    }
  }
};

/**
 * Middleware para verificar permisos de administrador
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'No autenticado',
      message: 'Se requiere autenticación'
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      error: 'Acceso denegado',
      message: 'Se requieren permisos de administrador'
    });
    return;
  }

  next();
};

/**
 * Middleware para verificar que el usuario es propietario del recurso o administrador
 */
export const isOwnerOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'No autenticado',
      message: 'Se requiere autenticación'
    });
    return;
  }

  const userId = req.params.userId || req.body.userId || req.query.userId;

  if (req.user.role === 'admin' || req.user.userId === userId) {
    next();
  } else {
    res.status(403).json({
      error: 'Acceso denegado',
      message: 'Solo puedes acceder a tus propios recursos'
    });
  }
};

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
    
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      req.user = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60)
      };
    } else {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      req.user = decoded;
    }
  } catch (error) {
    // En autenticación opcional, ignoramos errores de token
    console.warn('Token inválido en autenticación opcional:', error);
  }

  next();
};
