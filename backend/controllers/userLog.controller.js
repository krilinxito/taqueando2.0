const UserLog = require('../models/userLog.model');

const getUserLogs = async (req, res) => {
  try {
    // Si es admin, puede ver todos los logs
    if (req.user.rol === 'admin') {
      const logs = await UserLog.getAllLogs();
      return res.json(logs);
    }
    
    // Si es empleado, solo puede ver sus propios logs
    const logs = await UserLog.getLogsByUserId(req.user.id);
    return res.json(logs);
  } catch (error) {
    console.error('Error al obtener logs:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getUserLogsByUserId = async (req, res) => {
  try {
    // Solo admin puede ver logs de otros usuarios
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const userId = parseInt(req.params.userId);
    const logs = await UserLog.getLogsByUserId(userId);
    return res.json(logs);
  } catch (error) {
    console.error('Error al obtener logs de usuario:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getUserLogs,
  getUserLogsByUserId
}; 