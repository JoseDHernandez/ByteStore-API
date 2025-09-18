
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') || 
                req.header('x-auth-token') ||
                req.body.token ||
                req.query.token;

  if (!token) {
    return res.status(401).json({ 
      error: 'Token de acceso requerido',
      message: 'No se proporcionó token de autenticación' 
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Token inválido',
      message: 'El token proporcionado no es válido o ha expirado' 
    });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMINISTRADOR') {
    return res.status(403).json({ 
      error: 'Acceso denegado',
      message: 'Se requieren permisos de administrador' 
    });
  }
  next();
};

module.exports = {
  verifyToken,
  verifyAdmin
};