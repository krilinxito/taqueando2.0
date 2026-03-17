const estadisticasModel = require('../models/estadistica.model');

const safeController = (controllerFn) => async (req, res) => {
  try {
    await controllerFn(req, res);
  } catch (error) {
    console.error(`Error en ${controllerFn.name}:`, error);
    res.status(500).json({
      error: 'Ocurrió un error en el servidor',
      details: error.message
    });
  }
};

const getTodasLasEstadisticas = safeController(async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  const [
    resumenGeneral,
    tendenciaMensual,
    ingresosPorMetodo,
    productosMasVendidos,
    ventasPorHora,
    ventasPorDiaSemana,
    tiempoPromedioCierre,
    horariosPicoIngresos,
    gananciasPorSemana
  ] = await Promise.all([
    estadisticasModel.getResumenGeneral(fechaInicio, fechaFin),
    estadisticasModel.getTendenciaMensual(30, fechaInicio, fechaFin),
    estadisticasModel.getIngresosPorMetodo(fechaInicio, fechaFin),
    estadisticasModel.getProductosMasVendidos(50, fechaInicio, fechaFin),
    estadisticasModel.getVentasPorHora(fechaInicio, fechaFin),
    estadisticasModel.getVentasPorDiaSemana(fechaInicio, fechaFin),
    estadisticasModel.getTiempoPromedioCierre(fechaInicio, fechaFin),
    estadisticasModel.getHorariosPicoIngresos(fechaInicio, fechaFin),
    estadisticasModel.getGananciasPorSemana(fechaInicio, fechaFin)
  ]);

  resumenGeneral.promedio_diario = tendenciaMensual.length
    ? resumenGeneral.ingresos_semana / tendenciaMensual.length
    : 0;
  resumenGeneral.mejor_dia = tendenciaMensual.reduce((mejor, dia) => {
    if (!mejor || (dia.total || 0) > (mejor.total || 0)) return dia;
    return mejor;
  }, null);
  resumenGeneral.hora_pico = horariosPicoIngresos[0] || null;

  res.json({
    resumenGeneral,
    tendenciaMensual,
    ingresosPorMetodo,
    productosMasVendidos,
    ventasPorHora,
    ventasPorDiaSemana,
    tiempoPromedioCierre,
    horariosPicoIngresos,
    gananciasPorSemana
  });
});

const getIngresosHistoricos = safeController(async (req, res) => {
  const pagina = parseInt(req.query.pagina) || 1;
  const limite = parseInt(req.query.limite) || 10;

  const [ingresos, total] = await Promise.all([
    estadisticasModel.getIngresosHistoricos(pagina, limite),
    estadisticasModel.getTotalIngresosHistoricos()
  ]);

  res.json({ ingresos, total, pagina, limite });
});

module.exports = {
  getTodasLasEstadisticas,
  getIngresosHistoricos,
};
