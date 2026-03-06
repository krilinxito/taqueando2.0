const express = require('express');
const router = express.Router();

const {
  agregarPagoController,
  obtenerPagosDePedidoController
} = require('../controllers/pago.controller.js');
const { verificarToken } = require('../middlewares/auth.middleware.js');

// POST /api/pagos - Registrar un nuevo pago a un pedido
router.post('/', verificarToken, agregarPagoController);

// GET /api/pagos/:id_pedido - Ver pagos registrados de un pedido
router.get('/:id_pedido', verificarToken, obtenerPagosDePedidoController);

module.exports = router;