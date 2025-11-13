const express = require('express');
const router = express.Router();

const {
  crearPedidoController,
  obtenerTodosLosPedidosController,
  obtenerPedidoPorIdController,
  actualizarPedidoController,
  eliminarPedidoController,
  obtenerLosPedidosPorDiaController
} = require('../controllers/pedido.controller.js');

// GET pedidos del día (más específica → primero)
router.get('/pedidos-dia', obtenerLosPedidosPorDiaController);

// Rutas CRUD básicas
router.get('/', obtenerTodosLosPedidosController);
router.get('/:id', obtenerPedidoPorIdController);
router.post('/', crearPedidoController);
router.put('/:id', actualizarPedidoController);
router.delete('/:id', eliminarPedidoController);

module.exports = router;