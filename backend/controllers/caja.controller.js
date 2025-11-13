const { obtenerResumenDeCaja, obtenerResumenPorFecha } = require('../models/caja.model');

// --- MÉTODO GENERADOR DE RESPUESTAS ---
const generarResumenFormateado = (resumenCrudo) => {
  const resumen = {
    fecha: resumenCrudo.fecha,
    totalDia: Number(resumenCrudo.total_general || 0),
    totalPedidos: Number(resumenCrudo.total_pedidos || 0),

    // Totales por método
    totalEfectivo: 0,
    totalTarjeta: 0,
    totalQR: 0,
    totalOnline: 0,
    totalEfectivoPy: 0,

    detallesPorMetodo: [],

    // Pagos individuales
    pagos: resumenCrudo.pagos.map((p) => ({
      id: p.id,
      idPedido: p.id_pedido,
      monto: Number(p.monto),
      metodo: p.metodo,
      hora: p.hora,
      estadoPedido: p.estado_pedido,
      nombrePedido: p.nombre_pedido,
      nombreUsuario: p.nombre_usuario,
    })),
  };

  // Procesar métodos de pago
  resumenCrudo.por_metodo.forEach((item) => {
    const metodo = item.metodo?.toLowerCase() || '';
    const total = Number(item.total) || 0;
    const cantidad = Number(item.cantidad) || 0;

    const porcentaje =
      resumen.totalDia > 0 ? ((total / resumen.totalDia) * 100).toFixed(2) : '0.00';

    resumen.detallesPorMetodo.push({
      metodo,
      total,
      cantidad,
      porcentaje,
    });

    // Asignar el total correspondiente
    switch (metodo) {
      case 'efectivo':
        resumen.totalEfectivo = total;
        break;
      case 'efectivo-py':
        resumen.totalEfectivoPy = total;
        break;
      case 'tarjeta':
        resumen.totalTarjeta = total;
        break;
      case 'qr':
        resumen.totalQR = total;
        break;
      case 'online':
        resumen.totalOnline = total;
        break;
    }
  });

  // Estadísticas adicionales
  resumen.estadisticas = {
    promedioPorPedido:
      resumen.totalPedidos > 0
        ? Number((resumen.totalDia / resumen.totalPedidos).toFixed(2))
        : 0,

    metodoPagoMasUsado:
      [...resumen.detallesPorMetodo].sort((a, b) => b.cantidad - a.cantidad)[0]?.metodo ||
      'ninguno',

    metodoPagoMayorMonto:
      [...resumen.detallesPorMetodo].sort((a, b) => b.total - a.total)[0]?.metodo ||
      'ninguno',
  };

  return resumen;
};

// =======================================================
// CONTROLLER → RESUMEN DEL DÍA ACTUAL
// =======================================================
const obtenerResumenDeCajaController = async (req, res) => {
  try {
    const resumenCrudo = await obtenerResumenDeCaja();
    const resumenFormateado = generarResumenFormateado(resumenCrudo);
    res.status(200).json(resumenFormateado);
  } catch (error) {
    console.error('Error en obtenerResumenDeCajaController:', error);
    res.status(500).json({
      error: 'Error al obtener el resumen de caja',
      mensaje: error.message,
    });
  }
};

// =======================================================
// CONTROLLER → RESUMEN POR FECHA
// =======================================================
const obtenerResumenPorFechaController = async (req, res) => {
  try {
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({ error: 'La fecha es requerida' });
    }

    const resumenCrudo = await obtenerResumenPorFecha(fecha);
    const resumenFormateado = generarResumenFormateado(resumenCrudo);

    res.status(200).json(resumenFormateado);
  } catch (error) {
    console.error('Error en obtenerResumenPorFechaController:', error);
    res.status(500).json({
      error: 'Error al obtener el resumen de caja por fecha',
      mensaje: error.message,
    });
  }
};

module.exports = {
  obtenerResumenDeCajaController,
  obtenerResumenPorFechaController,
};
