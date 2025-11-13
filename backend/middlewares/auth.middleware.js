const jwt = require('jsonwebtoken');
const pool = require('../config/db'); 
const UserLog = require('../models/userLog.model');
const JWT_SECRET = process.env.JWT_SECRET;

// Cache para tokens verificados recientemente
const tokenCache = new Map();

async function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Formato de token inválido' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Verificar si el token ya está en caché
    if (tokenCache.has(token)) {
      req.user = tokenCache.get(token);
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Consulta el usuario en la base de datos
    const [rows] = await pool.query('SELECT id, nombre, email, rol FROM usuarios WHERE id = ?', [decoded.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Asignar usuario completo a req.user
    req.user = rows[0];

    // Guardar en caché
    tokenCache.set(token, req.user);

    // Solo registrar el log si es una nueva sesión (token no estaba en caché)
    if (req.originalUrl.includes('/auth/login')) {
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.connection.remoteAddress;
      await UserLog.create(req.user.id, userAgent, ipAddress);
    }

    next();
  } catch (error) {
    console.error('Error verificando token:', error);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

function soloAdmin(req, res, next) {
  if (!req.user || req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: solo administradores' });
  }
  next();
}

// Limpiar caché cada hora para evitar problemas de memoria
setInterval(() => {
  tokenCache.clear();
}, 3600000); // 1 hora

module.exports = {
  verificarToken,
  soloAdmin,
};