const express = require('express');
const router = express.Router();
const { 
  crearArqueoController,
  obtenerArqueosPorFechaController,
  obtenerUltimoArqueoController
} = require('../controllers/arqueo.controller');
const { verificarToken } = require('../middlewares/auth.middleware'); // Asumiendo que tienes este middleware

// Todas las rutas requieren autenticación
router.use(verificarToken);

// POST /api/arqueos - Crear nuevo arqueo
router.post('/', crearArqueoController);

// GET /api/arqueos/fecha?fecha=YYYY-MM-DD - Obtener arqueos por fecha
router.get('/fecha', obtenerArqueosPorFechaController);

// GET /api/arqueos/ultimo - Obtener el último arqueo
router.get('/ultimo', obtenerUltimoArqueoController);

module.exports = router;