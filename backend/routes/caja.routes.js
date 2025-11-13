const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth.middleware');

const {
  obtenerResumenDeCajaController,
  obtenerResumenPorFechaController
} = require('../controllers/caja.controller');


router.get('/resumen', verificarToken, obtenerResumenDeCajaController);


router.get('/resumen/fecha', verificarToken, obtenerResumenPorFechaController);

module.exports = router;