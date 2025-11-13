const pool = require('../config/db');

// Crear pedido
const crearPedido = async (nombre, id_usuario) => {
  try {
    const [result] = await pool.execute(
      'INSERT INTO pedidos (nombre, id_usuario, estado) VALUES (?, ?, \'pendiente\')',
      [nombre, id_usuario]
    );
    
    // Obtener el pedido recién creado
    const [pedido] = await pool.execute(
      `SELECT 
        p.id, 
        p.nombre, 
        p.fecha, 
        p.estado,
        p.id_usuario,
        u.nombre as nombre_usuario
       FROM pedidos p
       LEFT JOIN usuarios u ON p.id_usuario = u.id
       WHERE p.id = ?`,
      [result.insertId]
    );

    console.log('Pedido creado en la BD:', pedido[0]);
    return pedido[0];
  } catch (error) {
    console.error('Error en crearPedido:', error);
    throw error;
  }
};

// Obtener todos los pedidos
// ... existing code ...

const obtenerTodosLosPedidos = async (page = 1, limit = 10, filtros = {}) => {
  try {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Construir filtros dinámicamente
    if (filtros.fechaInicio) {
      whereClause += ' AND p.fecha >= ?';
      params.push(filtros.fechaInicio);
    }
    if (filtros.fechaFin) {
      whereClause += ' AND p.fecha <= ?';
      params.push(filtros.fechaFin);
    }
    if (filtros.estado) {
      whereClause += ' AND p.estado = ?';
      params.push(filtros.estado);
    }
    if (filtros.usuario) {
      whereClause += ' AND u.nombre LIKE ?';
      params.push(`%${filtros.usuario}%`);
    }

    // Consulta principal con JOIN para obtener información relacionada
    const [pedidos] = await pool.query(`
      SELECT 
        p.id,
        p.nombre as nombre_pedido,
        p.fecha,
        p.estado,
        u.nombre as nombre_usuario,
        COALESCE(SUM(pg.monto), 0) as total_pagado,
        COUNT(DISTINCT c.id) as cantidad_productos,
        GROUP_CONCAT(DISTINCT pr.nombre) as productos
      FROM pedidos p
      LEFT JOIN usuarios u ON p.id_usuario = u.id
      LEFT JOIN pagos pg ON p.id = pg.id_pedido
      LEFT JOIN contiene c ON p.id = c.id_pedido
      LEFT JOIN productos pr ON c.id_producto = pr.id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.fecha DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    // Obtener el total de registros para la paginación
    const [totalRows] = await pool.query(`
      SELECT COUNT(DISTINCT p.id) as total
      FROM pedidos p
      LEFT JOIN usuarios u ON p.id_usuario = u.id
      ${whereClause}
    `, params);

    return {
      pedidos,
      total: totalRows[0].total,
      pagina: page,
      totalPaginas: Math.ceil(totalRows[0].total / limit)
    };
  } catch (error) {
    console.error('Error en obtenerTodosLosPedidos:', error);
    throw error;
  }
};

// ... existing code ...

// Obtener pedidos del día actual
const obtenerLosPedidosPorDia = async () => {
  try {
    const query = `
      SELECT 
        p.id,
        p.nombre,
        p.fecha,
        p.estado,
        p.id_usuario,
        u.nombre as nombre_usuario
      FROM pedidos p
      LEFT JOIN usuarios u ON p.id_usuario = u.id
      WHERE DATE(CONVERT_TZ(fecha, '+00:00', '-04:00')) = DATE(CONVERT_TZ(NOW(), '+00:00', '-04:00'))
      ORDER BY p.fecha DESC
    `;

    console.log('Ejecutando query:', query);
    const [rows] = await pool.execute(query);
    console.log('Resultados encontrados:', rows.length);

    return rows;
  } catch (error) {
    console.error('Error al obtener pedidos del día:', error);
    throw error;
  }
};

// Obtener pedido por ID
const obtenerPedidoPorId = async (id) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM pedidos WHERE id = ?',
      [id]
    );
    return rows[0];
  } catch (error) {
    throw error;
  }
};

// Actualizar pedido
const actualizarPedido = async (id, nombre) => {
  try {
    await pool.execute(
      'UPDATE pedidos SET nombre = ? WHERE id = ?',
      [nombre, id]
    );
    return { id, nombre };
  } catch (error) {
    throw error;
  }
};

// Eliminar pedido
const eliminarPedido = async (id) => {
  try {
    await pool.execute('DELETE FROM pedidos WHERE id = ?', [id]);
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  crearPedido,
  obtenerTodosLosPedidos,
  obtenerPedidoPorId,
  actualizarPedido,
  eliminarPedido,
  obtenerLosPedidosPorDia
};