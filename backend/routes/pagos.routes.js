const express = require('express');
const router = express.Router();

const {
  agregarPagoController,
  obtenerPagosDePedidoController
} = require('../controllers/pago.controller.js');

// POST /api/pagos - Registrar un nuevo pago a un pedido
router.post('/', agregarPagoController);

// GET /api/pagos/:id_pedido - Ver pagos registrados de un pedido
router.get('/:id_pedido', obtenerPagosDePedidoController);

module.exports = router;