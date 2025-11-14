const pool = require('../config/db');

const TZ = 'America/La_Paz';

const pad = (value) => String(value).padStart(2, '0');

const buildDateString = ({ year, month, day }) =>
  `${year}-${pad(month)}-${pad(day)} 00:00:00`;

const getNextDay = ({ year, month, day }) => {
  const daysInMonth = new Date(year, month, 0).getDate();

  if (day < daysInMonth) return { year, month, day: day + 1 };
  if (month < 12) return { year, month: month + 1, day: 1 };

  return { year: year + 1, month: 1, day: 1 };
};

const getDatePartsForTimezone = (date) => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const [year, month, day] = formatter.format(date).split('-').map(Number);
  return { year, month, day };
};

const parseRawDate = (rawDate) => {
  if (!rawDate) return getDatePartsForTimezone(new Date());

  if (typeof rawDate === 'string') {
    const match = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      return {
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3]),
      };
    }
  }

  return getDatePartsForTimezone(new Date(rawDate));
};

const getDateRange = (rawDate) => {
  const current = parseRawDate(rawDate);
  const next = getNextDay(current);
  const etiqueta = `${current.year}-${pad(current.month)}-${pad(current.day)}`;
  return {
    inicio: buildDateString(current),
    fin: buildDateString(next),
    etiqueta,
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
