// controllers/product.controller.js
const {
  crearProducto,
  obtenerTodosLosProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto
} = require('../models/producto.model.js');

// POST /api/productos
const crearProductoController = async (req, res) => {
  const { nombre, precio } = req.body;

  if (!nombre || precio == null) {
    return res.status(400).json({ error: 'Nombre y precio son requeridos' });
  }

  try {
    const producto = await crearProducto(nombre, precio);
    res.status(201).json({ message: 'Producto creado', producto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
};

// GET /api/productos
const obtenerTodosLosProductosController = async (req, res) => {
  try {
    const productos = await obtenerTodosLosProductos();
    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
};

// GET /api/productos/:id
const obtenerProductoPorIdController = async (req, res) => {
  const { id } = req.params;

  try {
    const producto = await obtenerProductoPorId(id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
};

// PUT /api/productos/:id
const actualizarProductoController = async (req, res) => {
  const { id } = req.params;
  const { nombre, precio } = req.body;

  if (!nombre || precio == null) {
    return res.status(400).json({ error: 'Nombre y precio son requeridos' });
  }

  try {
    const productoExistente = await obtenerProductoPorId(id);
    if (!productoExistente) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const productoActualizado = await actualizarProducto(id, nombre, precio);
    res.json({ message: 'Producto actualizado', producto: productoActualizado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};

// DELETE /api/productos/:id
const eliminarProductoController = async (req, res) => {
  const { id } = req.params;

  try {
    const producto = await obtenerProductoPorId(id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await eliminarProducto(id);
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
};

module.exports = {
  crearProductoController,
  obtenerTodosLosProductosController,
  obtenerProductoPorIdController,
  actualizarProductoController,
  eliminarProductoController
};