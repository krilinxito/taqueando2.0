const express = require('express');
const router = express.Router();

const {
  agregarProductoAPedidoController,
  anularProductoDePedidoController,
  obtenerProductosDePedidoController
} = require('../controllers/contiene.controller');
const { verificarToken } = require('../middlewares/auth.middleware.js');

// POST /api/contiene/agregar - Agregar producto a un pedido
router.post('/agregar', verificarToken, agregarProductoAPedidoController);

// PUT /api/contiene/anular/:id - Anular producto del pedido
router.put('/anular/:id', verificarToken, anularProductoDePedidoController);

// GET /api/contiene/pedido/:id_pedido - Obtener productos activos de un pedido
router.get('/pedido/:id_pedido', verificarToken, obtenerProductosDePedidoController);

module.exports = router;