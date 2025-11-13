const pool = require('../config/db');

// Crear producto
const crearProducto = async (nombre, precio) => {
  try {
    const [result] = await pool.execute(
      'INSERT INTO productos (nombre, precio) VALUES (?, ?)',
      [nombre, precio]
    );
    return { id: result.insertId, nombre, precio };
  } catch (error) {
    throw error;
  }
};

// Obtener todos los productos
const obtenerTodosLosProductos = async () => {
  try {
    const [rows] = await pool.execute('SELECT * FROM productos');
    return rows;
  } catch (error) {
    throw error;
  }
};

// Obtener producto por ID
const obtenerProductoPorId = async (id) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM productos WHERE id = ?',
      [id]
    );
    return rows[0];
  } catch (error) {
    throw error;
  }
};

// Actualizar producto
const actualizarProducto = async (id, nombre, precio) => {
  try {
    await pool.execute(
      'UPDATE productos SET nombre = ?, precio = ? WHERE id = ?',
      [nombre, precio, id]
    );
    return { id, nombre, precio };
  } catch (error) {
    throw error;
  }
};

// Eliminar producto
const eliminarProducto = async (id) => {
  try {
    await pool.execute('DELETE FROM productos WHERE id = ?', [id]);
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  crearProducto,
  obtenerTodosLosProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto
};