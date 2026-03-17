const pool = require('../config/db');

// Función auxiliar para manejar números
const safeNumber = (value) => {
  const num = Number(value || 0);
  return isNaN(num) ? 0 : num;
};

// Agregar producto a un pedido
const agregarProductoAPedido = async (id_pedido, id_producto, cantidad = 1) => {
  try {
    // Obtener precio actual del producto para congelarlo en el pedido
    const [producto] = await pool.execute(
      'SELECT precio FROM productos WHERE id = ?',
      [id_producto]
    );
    const precio = producto[0]?.precio ?? null;

    const [result] = await pool.execute(
      `INSERT INTO contiene (id_pedido, id_producto, cantidad, precio)
       VALUES (?, ?, ?, ?)`,
      [id_pedido, id_producto, cantidad, precio]
    );
    return { id: result.insertId, id_pedido, id_producto, cantidad, precio };
  } catch (error) {
    throw error;
  }
};

// Anular un producto de un pedido
const anularProductoDePedido = async (id_contiene) => {
  try {
    await pool.execute(
      `UPDATE contiene SET anulado = TRUE WHERE id = ?`,
      [id_contiene]
    );
    return true;
  } catch (error) {
    throw error;
  }
};

// Obtener productos activos de un pedido (para mostrar)
const obtenerProductosDePedido = async (id_pedido) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        c.id,
        c.id_producto,
        c.cantidad,
        c.anulado,
        p.nombre,
        COALESCE(c.precio, p.precio) as precio,
        (COALESCE(c.precio, p.precio) * c.cantidad) as subtotal
       FROM contiene c
       JOIN productos p ON c.id_producto = p.id
       WHERE c.id_pedido = ? `,
      [id_pedido]
    );

    // Calcular el total del pedido
    const total = rows.reduce((sum, row) => {
      return sum + safeNumber(row.subtotal);
    }, 0);

    return {
      productos: rows.map(row => ({
        ...row,
        precio: safeNumber(row.precio),
        cantidad: safeNumber(row.cantidad),
        subtotal: safeNumber(row.subtotal)
      })),
      total: total
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  agregarProductoAPedido,
  anularProductoDePedido,
  obtenerProductosDePedido
};