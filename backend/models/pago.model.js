const pool = require('../config/db');

// Función auxiliar para manejar números de forma segura
const safeNumber = (value) => {
  const num = Number(value || 0);
  return isNaN(num) ? 0 : num;
};

// Agregar un pago a un pedido
const agregarPago = async (id_pedido, monto, metodo) => {
  try {
    const montoNum = safeNumber(monto);
    const [result] = await pool.execute(
      `INSERT INTO pagos (id_pedido, monto, metodo)
       VALUES (?, ?, ?)`,
      [id_pedido, montoNum, metodo]
    );

    // Después de insertar el pago, verificar si ya está completo
    await verificarYActualizarEstadoPedido(id_pedido);

    return { id: result.insertId, id_pedido, monto: montoNum, metodo };
  } catch (error) {
    throw error;
  }
};

// Obtener todos los pagos de un pedido
const obtenerPagosDePedido = async (id_pedido) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, id_pedido, monto, metodo, hora 
       FROM pagos 
       WHERE id_pedido = ?
       ORDER BY hora ASC`,
      [id_pedido]
    );
    return rows.map(row => ({
      ...row,
      monto: safeNumber(row.monto)
    }));
  } catch (error) {
    throw error;
  }
};

// Calcular el total pagado hasta ahora
const calcularTotalPagado = async (id_pedido) => {
  try {
    const [rows] = await pool.execute(
      `SELECT COALESCE(SUM(monto), 0) AS total_pagado 
       FROM pagos 
       WHERE id_pedido = ?`,
      [id_pedido]
    );
    return safeNumber(rows[0].total_pagado);
  } catch (error) {
    throw error;
  }
};

// Calcular el total a pagar (de productos no anulados)
const calcularTotalPedido = async (id_pedido) => {
  try {
    const [rows] = await pool.execute(
      `SELECT COALESCE(SUM(p.precio * c.cantidad), 0) AS total
       FROM contiene c
       JOIN productos p ON c.id_producto = p.id
       WHERE c.id_pedido = ? AND c.anulado = FALSE`,
      [id_pedido]
    );
    return safeNumber(rows[0].total);
  } catch (error) {
    throw error;
  }
};

// Verificar si el pedido ya fue cancelado y actualizar su estado si corresponde
const verificarYActualizarEstadoPedido = async (id_pedido) => {
  const total = await calcularTotalPedido(id_pedido);
  const pagado = await calcularTotalPagado(id_pedido);

  if (pagado >= total && total > 0) {
    await pool.execute(
      `UPDATE pedidos SET estado = 'cancelado' WHERE id = ?`,
      [id_pedido]
    );
  }
};

module.exports = {
  agregarPago,
  obtenerPagosDePedido,
  calcularTotalPagado,
  calcularTotalPedido,
  verificarYActualizarEstadoPedido
};