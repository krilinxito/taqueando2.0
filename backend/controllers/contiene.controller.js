
const {
  agregarProductoAPedido,
  anularProductoDePedido
} = require('../models/contiene.model');
const { obtenerProductosDePedido } = require('../models/contiene.model');


const agregarProductoAPedidoController = async (req, res) => {
  try {
    const { id_pedido, id_producto, cantidad } = req.body;

    if (!id_pedido || !id_producto || !cantidad || cantidad <= 0) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }

    const result = await agregarProductoAPedido(id_pedido, id_producto, cantidad);
    res.status(201).json({ mensaje: 'Producto agregado al pedido', data: result });
  } catch (error) {
    console.error('Error al agregar producto:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

const anularProductoDePedidoController = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await anularProductoDePedido(id);
    res.status(200).json({ mensaje: 'Producto anulado del pedido', data: result });
  } catch (error) {
    console.error('Error al anular producto:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

const obtenerProductosDePedidoController = async (req, res) => {
  try {
    const { id_pedido } = req.params;

    if (!id_pedido) {
      return res.status(400).json({ error: 'ID de pedido requerido' });
    }

    const productos = await obtenerProductosDePedido(id_pedido);
    res.status(200).json({ productos });
  } catch (error) {
    console.error('Error al obtener productos del pedido:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

module.exports = {
  agregarProductoAPedidoController,
  anularProductoDePedidoController,
  obtenerProductosDePedidoController
};
