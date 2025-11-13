const express = require('express');
const router = express.Router();
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');
const estadisticasController = require('../controllers/estadistica.controller');

// Middleware para todas las rutas de estadísticas
router.use(verificarToken, soloAdmin);

// Ruta principal para obtener el dashboard de estadísticas
router.get('/', estadisticasController.getTodasLasEstadisticas);

// Ruta para obtener datos históricos con paginación
router.get('/ingresos-historicos', estadisticasController.getIngresosHistoricos);

module.exports = router;