const pool = require('../config/db');

const TZ = 'America/La_Paz';

const toMySQLDateTime = (date) => date.toISOString().slice(0, 19).replace('T', ' ');

const getDateRange = (rawDate) => {
  const date = rawDate ? new Date(rawDate) : new Date();
  const inicio = new Date(date);
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 1);
  return {
    inicio: toMySQLDateTime(inicio),
    fin: toMySQLDateTime(fin),
    etiqueta: inicio.toISOString().slice(0, 10),
  };
};

const rangoSQL = `
  WHERE CONVERT_TZ(p.fecha,'UTC',?) >= ?
    AND CONVERT_TZ(p.fecha,'UTC',?) < ?
`;

const rangoParams = (inicio, fin) => [TZ, inicio, TZ, fin];

const obtenerDatosBase = async (inicio, fin) => {
  const params = rangoParams(inicio, fin);

  const [totales] = await pool.query(
    `
      SELECT 
        DATE(CONVERT_TZ(p.fecha,'UTC',?)) AS fecha,
        COUNT(DISTINCT p.id) AS total_pedidos,
        COALESCE(SUM(pg.monto), 0) AS total_general
      FROM pedidos p
      LEFT JOIN pagos pg ON pg.id_pedido = p.id
      ${rangoSQL}
      GROUP BY DATE(CONVERT_TZ(p.fecha,'UTC',?))
    `,
    [TZ, ...params, TZ]
  );

  const [porMetodo] = await pool.query(
    `
      SELECT 
        COALESCE(pg.metodo, 'desconocido') AS metodo,
        COUNT(pg.id) AS cantidad,
        COALESCE(SUM(pg.monto), 0) AS total
      FROM pedidos p
      LEFT JOIN pagos pg ON pg.id_pedido = p.id
      ${rangoSQL}
      GROUP BY metodo
    `,
    params
  );

  const [pagos] = await pool.query(
    `
      SELECT
        pg.id,
        pg.id_pedido,
        pg.monto,
        pg.metodo,
        DATE_FORMAT(CONVERT_TZ(pg.hora,'UTC',?), '%Y-%m-%d %H:%i:%s') AS hora,
        p.estado AS estado_pedido,
        p.nombre AS nombre_pedido,
        u.nombre AS nombre_usuario
      FROM pagos pg
      JOIN pedidos p ON p.id = pg.id_pedido
      LEFT JOIN usuarios u ON u.id = p.id_usuario
      ${rangoSQL}
      ORDER BY pg.hora ASC
    `,
    [TZ, ...params]
  );

  const totalesRow = totales[0] || {};

  return {
    fecha: totalesRow.fecha,
    total_general: Number(totalesRow.total_general || 0),
    total_pedidos: Number(totalesRow.total_pedidos || 0),
    por_metodo: porMetodo.map((row) => ({
      metodo: row.metodo,
      cantidad: Number(row.cantidad || 0),
      total: Number(row.total || 0),
    })),
    pagos: pagos.map((row) => ({
      ...row,
      monto: Number(row.monto || 0),
    })),
  };
};

const obtenerResumenPorFecha = async (fecha) => {
  const { inicio, fin, etiqueta } = getDateRange(fecha);
  const resumen = await obtenerDatosBase(inicio, fin);
  return {
    ...resumen,
    fecha: resumen.fecha || etiqueta,
  };
};

const obtenerResumenDeCaja = async () => obtenerResumenPorFecha(new Date());

module.exports = {
  obtenerResumenDeCaja,
  obtenerResumenPorFecha,
};
