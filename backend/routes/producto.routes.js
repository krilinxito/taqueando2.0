const express = require('express');
const router = express.Router();

const {
  crearProductoController,
  obtenerTodosLosProductosController,
  obtenerProductoPorIdController,
  actualizarProductoController,
  eliminarProductoController
} = require('../controllers/producto.controller.js');

// Rutas CRUD para productos

// GET /api/productos - Obtener todos los productos
router.get('/', obtenerTodosLosProductosController);

// GET /api/productos/:id - Obtener un producto por ID
router.get('/:id', obtenerProductoPorIdController);

// POST /api/productos - Crear un nuevo producto
router.post('/', crearProductoController);

// PUT /api/productos/:id - Actualizar un producto completo
router.put('/:id', actualizarProductoController);

// DELETE /api/productos/:id - Eliminar un producto
router.delete('/:id', eliminarProductoController);

module.exports = router;