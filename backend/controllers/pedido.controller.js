const {
  crearPedido,
  obtenerTodosLosPedidos,
  obtenerPedidoPorId,
  actualizarPedido,
  eliminarPedido,
  obtenerLosPedidosPorDia,
  obtenerPedidosDiaConDetalles
} = require('../models/pedido.model.js');


const crearPedidoController = async (req, res) => {
  const { nombre, id_usuario } = req.body;

  if (!nombre || !id_usuario) {
    return res.status(400).json({ error: 'Nombre e ID de usuario son requeridos' });
  }

  try {
    const pedido = await crearPedido(nombre, id_usuario);
    res.status(201).json({ data: pedido });
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    res.status(500).json({ error: 'Error al crear el pedido' });
  }
};


const obtenerTodosLosPedidosController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filtros = {
      fechaInicio: req.query.fechaInicio,
      fechaFin: req.query.fechaFin,
      estado: req.query.estado,
      usuario: req.query.usuario
    };

    const resultado = await obtenerTodosLosPedidos(page, limit, filtros);
    res.json({
      data: resultado.pedidos,
      total: resultado.total
    });
  } catch (error) {
    console.error('Error al obtener todos los pedidos:', error);
    res.status(500).json({
      error: 'Error al obtener los pedidos',
      details: error.message
    });
  }
};

const obtenerLosPedidosPorDiaController = async (req, res) => {
  try {
    const pedidosBase = await obtenerLosPedidosPorDia();

    if (!pedidosBase || pedidosBase.length === 0) {
      return res.json({ data: pedidosBase });
    }

    res.json({ data: pedidosBase });
  } catch (error) {
    console.error('Error al obtener los pedidos del día:', error);
    res.status(500).json({ error: 'Error al obtener los pedidos del día' });
  }
};

const obtenerPedidoPorIdController = async (req, res) => {
  const { id } = req.params;

  try {
    const pedido = await obtenerPedidoPorId(id);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json(pedido);
  } catch (error) {
    console.error('Error al obtener el pedido:', error.message);
    res.status(500).json({ error: 'Error al obtener el pedido' });
  }
};

const actualizarPedidoController = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'Nombre es requerido' });
  }

  try {
    const pedidoExistente = await obtenerPedidoPorId(id);
    if (!pedidoExistente) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const pedidoActualizado = await actualizarPedido(id, nombre);
    res.json({ message: 'Pedido actualizado', pedido: pedidoActualizado });
  } catch (error) {
    console.error('Error al actualizar el pedido:', error.message);
    res.status(500).json({ error: 'Error al actualizar el pedido' });
  }
};

const eliminarPedidoController = async (req, res) => {
  const { id } = req.params;

  try {
    const pedido = await obtenerPedidoPorId(id);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    await eliminarPedido(id);
    res.json({ message: 'Pedido eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el pedido:', error.message);
    res.status(500).json({ error: 'Error al eliminar el pedido' });
  }
};

const obtenerPedidosDiaConDetallesController = async (req, res) => {
  try {
    const estado = req.query.estado || 'pendiente';
    const pedidos = await obtenerPedidosDiaConDetalles(estado);
    res.json({ data: pedidos });
  } catch (error) {
    console.error('Error al obtener pedidos del día con detalles:', error);
    res.status(500).json({ error: 'Error al obtener los pedidos del día' });
  }
};

module.exports = {
  crearPedidoController,
  obtenerTodosLosPedidosController,
  obtenerPedidoPorIdController,
  actualizarPedidoController,
  eliminarPedidoController,
  obtenerLosPedidosPorDiaController,
  obtenerPedidosDiaConDetallesController
};