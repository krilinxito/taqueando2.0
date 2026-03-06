const pool = require('../config/db');

const toNumber = (value) => Number(value ?? 0);
const calcularVariacion = (actual = 0, anterior = 0) => {
  const prev = toNumber(anterior);
  const curr = toNumber(actual);
  if (prev === 0) {
    return curr === 0 ? 0 : 100;
  }
  return ((curr - prev) / prev) * 100;
};

const buildDateFilter = (fechaInicio, fechaFin, dateColumn = 'p.fecha') => {
  if (fechaInicio && fechaFin) {
    return {
      clause: `DATE(CONVERT_TZ(${dateColumn}, '+00:00', '-04:00')) BETWEEN ? AND ?`,
      params: [fechaInicio, fechaFin]
    };
  }
  return {
    clause: `YEARWEEK(CONVERT_TZ(${dateColumn}, '+00:00', '-04:00'), 1) = YEARWEEK(CONVERT_TZ(NOW(), '+00:00', '-04:00'), 1)`,
    params: []
  };
};

const getIngresosPorMetodo = async (fechaInicio, fechaFin) => {
  try {
    const df = buildDateFilter(fechaInicio, fechaFin);
    const query = `
      SELECT
        pg.metodo,
        COUNT(*) as cantidad,
        SUM(pg.monto) as total
      FROM pagos pg
      JOIN pedidos p ON pg.id_pedido = p.id
      WHERE ${df.clause}
      GROUP BY pg.metodo
    `;
    const [rows] = await pool.query(query, df.params);
    return rows;
  } catch (error) {
    console.error('Error en getIngresosPorMetodo:', error);
    throw error;
  }
};

const getProductosMasVendidos = async (limite = 50, fechaInicio, fechaFin) => {
  try {
    const df = buildDateFilter(fechaInicio, fechaFin, 'pd.fecha');
    const query = `
      SELECT
        p.nombre,
        SUM(c.cantidad) as cantidad_total,
        SUM(c.cantidad * p.precio) as ingresos_total
      FROM contiene c
      JOIN productos p ON c.id_producto = p.id
      JOIN pedidos pd ON c.id_pedido = pd.id
      WHERE ${df.clause}
        AND c.anulado = FALSE
      GROUP BY p.id, p.nombre
      HAVING cantidad_total > 0
      ORDER BY cantidad_total DESC
      LIMIT ?
    `;
    const [rows] = await pool.query(query, [...df.params, limite]);
    return rows;
  } catch (error) {
    console.error('Error en getProductosMasVendidos:', error);
    throw error;
  }
};

const getVentasPorHora = async (fechaInicio, fechaFin) => {
  try {
    const df = buildDateFilter(fechaInicio, fechaFin);
    const query = `
      SELECT
        HOUR(CONVERT_TZ(p.fecha, '+00:00', '-04:00')) as hora,
        COUNT(DISTINCT p.id) as total_pedidos,
        COALESCE(SUM(pg.monto), 0) as total_ventas
      FROM pedidos p
      LEFT JOIN pagos pg ON p.id = pg.id_pedido
      WHERE ${df.clause}
      GROUP BY HOUR(CONVERT_TZ(p.fecha, '+00:00', '-04:00'))
      HAVING total_pedidos > 0
      ORDER BY hora
    `;
    const [rows] = await pool.query(query, df.params);
    return rows;
  } catch (error) {
    console.error('Error en getVentasPorHora:', error);
    throw error;
  }
};

// Nota: estado='cancelado' = pedido completado/pagado en este sistema
const getHorariosPicoIngresos = async (fechaInicio, fechaFin) => {
  try {
    const df = buildDateFilter(fechaInicio, fechaFin);
    const query = `
      SELECT
        DAYNAME(CONVERT_TZ(pg.hora, '+00:00', '-04:00')) AS dia_semana,
        HOUR(CONVERT_TZ(pg.hora, '+00:00', '-04:00')) AS hora,
        COUNT(DISTINCT pg.id_pedido) as total_pedidos,
        SUM(pg.monto) AS total_ingresos
      FROM pagos pg
      JOIN pedidos p ON pg.id_pedido = p.id
      WHERE p.estado = 'cancelado'
        AND ${df.clause}
      GROUP BY dia_semana, hora
      ORDER BY total_ingresos DESC;
    `;
    const [rows] = await pool.query(query, df.params);
    return rows;
  } catch (error) {
    console.error('Error en getHorariosPicoIngresos:', error);
    throw error;
  }
};

const getResumenGeneral = async (fechaInicio, fechaFin) => {
  try {
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      const diffMs = fin.getTime() - inicio.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const prevFin = new Date(inicio);
      prevFin.setDate(prevFin.getDate() - 1);
      const prevInicio = new Date(prevFin);
      prevInicio.setDate(prevInicio.getDate() - diffDays);
      const prevInicioStr = prevInicio.toISOString().slice(0, 10);
      const prevFinStr = prevFin.toISOString().slice(0, 10);

      const queryPeriodo = `
        SELECT
          COUNT(DISTINCT p.id) as total_pedidos,
          COALESCE(SUM(pg.monto), 0) as total_ventas,
          COUNT(DISTINCT p.id_usuario) as usuarios_activos
        FROM pedidos p
        LEFT JOIN pagos pg ON p.id = pg.id_pedido
        WHERE DATE(CONVERT_TZ(p.fecha, '+00:00', '-04:00')) BETWEEN ? AND ?
      `;

      const [actualRows] = await pool.query(queryPeriodo, [fechaInicio, fechaFin]);
      const [anteriorRows] = await pool.query(queryPeriodo, [prevInicioStr, prevFinStr]);

      const actual = actualRows[0] || {};
      const anterior = anteriorRows[0] || {};

      const ingresosPeriodo = toNumber(actual.total_ventas);
      const pedidosPeriodo = toNumber(actual.total_pedidos);
      const ingresosAnterior = toNumber(anterior.total_ventas);
      const pedidosAnterior = toNumber(anterior.total_pedidos);
      const ticketPromedio = pedidosPeriodo ? ingresosPeriodo / pedidosPeriodo : 0;
      const ticketPromedioAnterior = pedidosAnterior ? ingresosAnterior / pedidosAnterior : 0;

      return {
        ingresos_semana: ingresosPeriodo,
        pedidos_semana: pedidosPeriodo,
        usuarios_activos: toNumber(actual.usuarios_activos),
        ingresos_semana_anterior: ingresosAnterior,
        pedidos_semana_anterior: pedidosAnterior,
        ticket_promedio: ticketPromedio,
        variacion_ingresos: calcularVariacion(ingresosPeriodo, ingresosAnterior),
        variacion_pedidos: calcularVariacion(pedidosPeriodo, pedidosAnterior),
        variacion_ticket: calcularVariacion(ticketPromedio, ticketPromedioAnterior),
      };
    }

    const querySemanaActual = `
      SELECT
        COUNT(DISTINCT p.id) as total_pedidos,
        COALESCE(SUM(pg.monto), 0) as total_ventas,
        COUNT(DISTINCT p.id_usuario) as usuarios_activos
      FROM pedidos p
      LEFT JOIN pagos pg ON p.id = pg.id_pedido
      WHERE YEARWEEK(CONVERT_TZ(p.fecha, '+00:00', '-04:00'), 1) = YEARWEEK(CONVERT_TZ(NOW(), '+00:00', '-04:00'), 1)
    `;

    const querySemanaAnterior = `
      SELECT
        COUNT(DISTINCT p.id) as total_pedidos,
        COALESCE(SUM(pg.monto), 0) as total_ventas
      FROM pedidos p
      LEFT JOIN pagos pg ON p.id = pg.id_pedido
      WHERE YEARWEEK(CONVERT_TZ(p.fecha, '+00:00', '-04:00'), 1) = YEARWEEK(DATE_SUB(CONVERT_TZ(NOW(), '+00:00', '-04:00'), INTERVAL 1 WEEK), 1)
    `;

    const [actualRows] = await pool.query(querySemanaActual);
    const [anteriorRows] = await pool.query(querySemanaAnterior);

    const actual = actualRows[0] || {};
    const anterior = anteriorRows[0] || {};

    const ingresosSemana = toNumber(actual.total_ventas);
    const pedidosSemana = toNumber(actual.total_pedidos);
    const ingresosAnterior = toNumber(anterior.total_ventas);
    const pedidosAnterior = toNumber(anterior.total_pedidos);
    const ticketPromedio = pedidosSemana ? ingresosSemana / pedidosSemana : 0;
    const ticketPromedioAnterior = pedidosAnterior ? ingresosAnterior / pedidosAnterior : 0;

    return {
      ingresos_semana: ingresosSemana,
      pedidos_semana: pedidosSemana,
      usuarios_activos: toNumber(actual.usuarios_activos),
      ingresos_semana_anterior: ingresosAnterior,
      pedidos_semana_anterior: pedidosAnterior,
      ticket_promedio: ticketPromedio,
      variacion_ingresos: calcularVariacion(ingresosSemana, ingresosAnterior),
      variacion_pedidos: calcularVariacion(pedidosSemana, pedidosAnterior),
      variacion_ticket: calcularVariacion(ticketPromedio, ticketPromedioAnterior),
    };
  } catch (error) {
    console.error('Error en getResumenGeneral:', error);
    throw error;
  }
};

const getTendenciaMensual = async (dias = 30, fechaInicio, fechaFin) => {
  try {
    if (fechaInicio && fechaFin) {
      const query = `
        SELECT
          DATE(CONVERT_TZ(p.fecha, '+00:00', '-04:00')) as fecha,
          COUNT(DISTINCT p.id) as total_pedidos,
          COALESCE(SUM(pg.monto), 0) as total
        FROM pedidos p
        LEFT JOIN pagos pg ON p.id = pg.id_pedido
        WHERE DATE(CONVERT_TZ(p.fecha, '+00:00', '-04:00')) BETWEEN ? AND ?
        GROUP BY DATE(CONVERT_TZ(p.fecha, '+00:00', '-04:00'))
        ORDER BY fecha
      `;
      const [rows] = await pool.query(query, [fechaInicio, fechaFin]);
      return rows;
    }

    const fechaInicioCalc = new Date();
    fechaInicioCalc.setDate(fechaInicioCalc.getDate() - dias);
    const fechaFiltro = fechaInicioCalc.toISOString().slice(0, 10);

    const query = `
      SELECT
        DATE(CONVERT_TZ(p.fecha, '+00:00', '-04:00')) as fecha,
        COUNT(DISTINCT p.id) as total_pedidos,
        COALESCE(SUM(pg.monto), 0) as total
      FROM pedidos p
      LEFT JOIN pagos pg ON p.id = pg.id_pedido
      WHERE DATE(CONVERT_TZ(p.fecha, '+00:00', '-04:00')) >= ?
      GROUP BY DATE(CONVERT_TZ(p.fecha, '+00:00', '-04:00'))
      ORDER BY fecha
    `;

    const [rows] = await pool.query(query, [fechaFiltro]);
    return rows;
  } catch (error) {
    console.error('Error en getTendenciaMensual:', error);
    throw error;
  }
};

const getIngresosHistoricos = async (pagina, limite) => {
  try {
    const offset = (pagina - 1) * limite;
    const query = `
      SELECT
        DATE(CONVERT_TZ(pedidos.fecha, '+00:00', '-04:00')) AS fecha,
        COALESCE(SUM(pagos.monto), 0) AS total,
        COUNT(DISTINCT pedidos.id) AS total_pedidos
      FROM pedidos
      LEFT JOIN pagos ON pagos.id_pedido = pedidos.id
      GROUP BY DATE(CONVERT_TZ(pedidos.fecha, '+00:00', '-04:00'))
      ORDER BY fecha DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [parseInt(limite), parseInt(offset)]);
    return rows;
  } catch (error) {
    console.error('Error en getIngresosHistoricos:', error);
    throw error;
  }
};

const getTotalIngresosHistoricos = async () => {
  try {
    const query = `
      SELECT
        COUNT(*) as total
      FROM (
        SELECT DATE(CONVERT_TZ(pedidos.fecha, '+00:00', '-04:00')) AS fecha
        FROM pedidos
        GROUP BY DATE(CONVERT_TZ(pedidos.fecha, '+00:00', '-04:00'))
      ) AS subquery
    `;
    const [rows] = await pool.query(query);
    return rows[0].total;
  } catch (error) {
    console.error('Error en getTotalIngresosHistoricos:', error);
    throw error;
  }
};

const getTiempoPromedioCierre = async (fechaInicio, fechaFin) => {
  try {
    const df = buildDateFilter(fechaInicio, fechaFin);
    const query = `
      SELECT
        AVG(TIMESTAMPDIFF(MINUTE, p.fecha, pg.hora)) AS tiempo_promedio_minutos
      FROM pedidos p
      JOIN pagos pg ON p.id = pg.id_pedido
      WHERE p.estado = 'cancelado'
        AND ${df.clause};
    `;
    const [rows] = await pool.query(query, df.params);
    return rows[0];
  } catch (error) {
    console.error('Error en getTiempoPromedioCierre:', error);
    throw error;
  }
};

const getGananciasPorSemana = async (fechaInicio, fechaFin) => {
  try {
    const df = buildDateFilter(fechaInicio, fechaFin);
    const query = `
      SELECT
        YEAR(CONVERT_TZ(p.fecha, '+00:00', '-04:00')) as anio,
        MONTH(CONVERT_TZ(p.fecha, '+00:00', '-04:00')) as mes,
        WEEK(CONVERT_TZ(p.fecha, '+00:00', '-04:00'), 1) as semana,
        MIN(DATE(CONVERT_TZ(p.fecha, '+00:00', '-04:00'))) as fecha_inicio,
        MAX(DATE(CONVERT_TZ(p.fecha, '+00:00', '-04:00'))) as fecha_fin,
        COUNT(DISTINCT p.id) as total_pedidos,
        COALESCE(SUM(pg.monto), 0) as total_ventas
      FROM pedidos p
      LEFT JOIN pagos pg ON p.id = pg.id_pedido
      WHERE ${df.clause}
      GROUP BY anio, mes, semana
      ORDER BY anio, semana
    `;
    const [rows] = await pool.query(query, df.params);
    return rows;
  } catch (error) {
    console.error('Error en getGananciasPorSemana:', error);
    throw error;
  }
};

const getVentasPorDiaSemana = async (fechaInicio, fechaFin) => {
  try {
    const df = buildDateFilter(fechaInicio, fechaFin);
    const query = `
      SELECT
        DAYOFWEEK(CONVERT_TZ(p.fecha, '+00:00', '-04:00')) as dia,
        DAYNAME(CONVERT_TZ(p.fecha, '+00:00', '-04:00')) as nombre_dia,
        COUNT(DISTINCT p.id) as total_pedidos,
        COALESCE(SUM(pg.monto), 0) as total_ventas
      FROM pedidos p
      LEFT JOIN pagos pg ON p.id = pg.id_pedido
      WHERE ${df.clause}
      GROUP BY dia, nombre_dia
      ORDER BY dia
    `;
    const [rows] = await pool.query(query, df.params);
    return rows;
  } catch (error) {
    console.error('Error en getVentasPorDiaSemana:', error);
    throw error;
  }
};

module.exports = {
  getIngresosPorMetodo,
  getProductosMasVendidos,
  getVentasPorHora,
  getHorariosPicoIngresos,
  getResumenGeneral,
  getTendenciaMensual,
  getIngresosHistoricos,
  getTotalIngresosHistoricos,
  getTiempoPromedioCierre,
  getVentasPorDiaSemana,
  getGananciasPorSemana
};
