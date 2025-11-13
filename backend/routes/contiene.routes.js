const express = require('express');
const router = express.Router();

const {
  agregarProductoAPedidoController,
  anularProductoDePedidoController,
  obtenerProductosDePedidoController
} = require('../controllers/contiene.controller');

// POST /api/contiene/agregar - Agregar producto a un pedido
router.post('/agregar', agregarProductoAPedidoController);

// PUT /api/contiene/anular/:id - Anular producto del pedido
router.put('/anular/:id', anularProductoDePedidoController);

// GET /api/contiene/pedido/:id_pedido - Obtener productos activos de un pedido
router.get('/pedido/:id_pedido', obtenerProductosDePedidoController);

module.exports = router;