const express = require('express');
const router = express.Router();

const {
  crearPedidoController,
  obtenerTodosLosPedidosController,
  obtenerPedidoPorIdController,
  actualizarPedidoController,
  eliminarPedidoController,
  obtenerLosPedidosPorDiaController,
  obtenerPedidosDiaConDetallesController
} = require('../controllers/pedido.controller.js');
const { verificarToken } = require('../middlewares/auth.middleware.js');

// GET pedidos del día con productos y pagos embebidos (evita N+1)
router.get('/dia-completo', verificarToken, obtenerPedidosDiaConDetallesController);

// GET pedidos del día (más específica → primero)
router.get('/pedidos-dia', verificarToken, obtenerLosPedidosPorDiaController);

// Rutas CRUD básicas
router.get('/', verificarToken, obtenerTodosLosPedidosController);
router.get('/:id', verificarToken, obtenerPedidoPorIdController);
router.post('/', verificarToken, crearPedidoController);
router.put('/:id', verificarToken, actualizarPedidoController);
router.delete('/:id', verificarToken, eliminarPedidoController);

module.exports = router;