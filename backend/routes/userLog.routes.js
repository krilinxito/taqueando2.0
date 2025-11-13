const express = require('express');
const router = express.Router();
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');
const { getUserLogs, getUserLogsByUserId } = require('../controllers/userLog.controller');

// Obtener todos los logs (admin) o los logs del usuario actual (empleado)
router.get('/', verificarToken, getUserLogs);

// Obtener logs de un usuario específico (solo admin)
router.get('/:userId', verificarToken, soloAdmin, getUserLogsByUserId);

module.exports = router; 