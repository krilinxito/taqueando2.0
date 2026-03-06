
const {
  agregarPago,
  obtenerPagosDePedido,
  calcularTotalPagado,
  calcularTotalPedido
} = require('../models/pago.model.js');

const safeNumber = (value) => {
  const num = Number(value || 0);
  return isNaN(num) ? 0 : num;
};

const METODOS_VALIDOS = ['efectivo', 'tarjeta', 'qr', 'online', 'efectivo-py'];

const agregarPagoController = async (req, res) => {
  try {
    const { id_pedido, monto, metodo } = req.body;

    if (!id_pedido || !monto || !metodo) {
      return res.status(400).json({ error: 'Faltan campos requeridos.' });
    }

    const montoNum = safeNumber(monto);
    if (montoNum <= 0) {
      return res.status(400).json({ error: 'El monto debe ser mayor a 0.' });
    }
    const metodoNormalizado = String(metodo).toLowerCase();
    if (!METODOS_VALIDOS.includes(metodoNormalizado)) {
      return res.status(400).json({ error: 'Método de pago inválido.' });
    }

    const pago = await agregarPago(id_pedido, montoNum, metodoNormalizado);
    const [totalPagadoRaw, totalPedidoRaw] = await Promise.all([
      calcularTotalPagado(id_pedido),
      calcularTotalPedido(id_pedido)
    ]);
    const totalPagado = safeNumber(totalPagadoRaw);
    const totalPedido = safeNumber(totalPedidoRaw);
    const restante = Math.max(0, totalPedido - totalPagado);

    res.status(201).json({
      mensaje: 'Pago registrado exitosamente.',
      pago,
      total_pagado: totalPagado,
      total_pedido: totalPedido,
      restante
    });
  } catch (error) {
    console.error('Error al agregar el pago:', error);
    res.status(500).json({ error: 'Error al registrar el pago.' });
  }
};

const obtenerPagosDePedidoController = async (req, res) => {
  try {
    const { id_pedido } = req.params;

    const [pagos, totalPagadoRaw, totalPedidoRaw] = await Promise.all([
      obtenerPagosDePedido(id_pedido),
      calcularTotalPagado(id_pedido),
      calcularTotalPedido(id_pedido)
    ]);
    const totalPagado = safeNumber(totalPagadoRaw);
    const totalPedido = safeNumber(totalPedidoRaw);
    const restante = Math.max(0, totalPedido - totalPagado);

    res.status(200).json({
      pagos,
      total_pagado: totalPagado,
      total_pedido: totalPedido,
      restante
    });
  } catch (error) {
    console.error('Error al obtener los pagos:', error);
    res.status(500).json({ error: 'Error al obtener los pagos.' });
  }
};

module.exports = {
  agregarPagoController,
  obtenerPagosDePedidoController
};
