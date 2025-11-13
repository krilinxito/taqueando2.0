const pool = require('../config/db');

const crearArqueo = async (arqueoData) => {
  try {
    const [result] = await pool.execute(
      `INSERT INTO arqueos_caja (
        billete_200, billete_100, billete_50, billete_20, 
        billete_10, moneda_5, moneda_2, moneda_1,
        total_contado, caja_chica, total_sistema, diferencia,
        estado, observaciones, id_usuario
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        arqueoData.conteo[200], arqueoData.conteo[100], 
        arqueoData.conteo[50], arqueoData.conteo[20],
        arqueoData.conteo[10], arqueoData.conteo[5],
        arqueoData.conteo[2], arqueoData.conteo[1],
        arqueoData.totalContado, arqueoData.cajaChica,
        arqueoData.totalSistema, arqueoData.diferencia,
        arqueoData.estado, arqueoData.observaciones,
        arqueoData.idUsuario
      ]
    );
    return result.insertId;
  } catch (error) {
    throw error;
  }
};

const obtenerArqueosPorFecha = async (fecha) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        a.*,
        u.nombre as nombre_usuario
      FROM arqueos_caja a
      LEFT JOIN usuarios u ON a.id_usuario = u.id
      WHERE DATE(CONVERT_TZ(a.fecha, 'UTC', 'America/La_Paz')) = DATE(CONVERT_TZ(?, 'UTC', 'America/La_Paz'))
      ORDER BY a.fecha DESC`,
      [fecha]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

const obtenerUltimoArqueo = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        a.*,
        u.nombre as nombre_usuario
      FROM arqueos_caja a
      LEFT JOIN usuarios u ON a.id_usuario = u.id
      ORDER BY a.fecha DESC
      LIMIT 1`
    );
    return rows[0];
  } catch (error) {
    throw error;
  }
};

module.exports = {
  crearArqueo,
  obtenerArqueosPorFecha,
  obtenerUltimoArqueo
};