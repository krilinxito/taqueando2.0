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
  const estadisticas = {
    resumenGeneral: estadisticasModel.getResumenGeneral(),
    ingresosSemanales: estadisticasModel.getIngresosSemanales(),
    tendenciaMensual: estadisticasModel.getTendenciaMensual(30),
    ingresosPorMetodo: estadisticasModel.getIngresosPorMetodo(),
    productosMasVendidos: estadisticasModel.getProductosMasVendidos(),
    ventasPorHora: estadisticasModel.getVentasPorHora(),
    comparativaSemanal: estadisticasModel.getComparativaSemanal(),
    tiempoPromedioCierre: estadisticasModel.getTiempoPromedioCierre(),
    horariosPicoIngresos: estadisticasModel.getHorariosPicoIngresos(),
  };

  const resultados = {};
  for (const key in estadisticas) {
    resultados[key] = await estadisticas[key];
  }

  res.json(resultados);
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
