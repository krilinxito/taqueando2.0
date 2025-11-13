import axios from './axios';

// =========================
//   🚀 OBTENER RESUMEN
// =========================
export const obtenerResumenDeCaja = async () => {
  try {
    const { data } = await axios.get('/caja/resumen');
    return normalizarDatosCaja(data);
  } catch (error) {
    console.error('Error al obtener resumen de caja:', error);
    throw error;
  }
};

export const obtenerResumenPorFecha = async (fecha) => {
  try {
    const { data } = await axios.get(`/caja/resumen/fecha?fecha=${fecha}`);
    return normalizarDatosCaja(data);
  } catch (error) {
    console.error('Error al obtener resumen por fecha:', error);
    throw error;
  }
};

// =========================
//   🔧 NORMALIZADOR
// =========================
function normalizarDatosCaja(data) {
  const {
    fecha,
    totalDia = 0,
    totalPedidos = 0,
    pagos = [],
    detallesPorMetodo = [],
    estadisticas = {},
  } = data;

  // Métodos válidos según el ENUM de tu DB
  const METODOS_VALIDOS = [
    'efectivo',
    'efectivo-py',
    'tarjeta',
    'qr',
    'online'
  ];

  // Convertimos lista a mapa
  const totalesPorMetodo = detallesPorMetodo.reduce((acc, d) => {
    const metodo = (d.metodo || '').toLowerCase();

    acc[metodo] = {
      total: Number(d.total || 0),
      cantidad: Number(d.cantidad || 0),
      porcentaje: d.porcentaje
        ? `${Number(d.porcentaje).toFixed(2)}%`
        : '0.00%',
    };
    return acc;
  }, {});

  // Asegurar que todos los métodos existan
  METODOS_VALIDOS.forEach((m) => {
    if (!totalesPorMetodo[m]) {
      totalesPorMetodo[m] = {
        total: 0,
        cantidad: 0,
        porcentaje: '0.00%',
      };
    }
  });

  // Normalizar pagos
  const pagosNormalizados = pagos.map((p) => ({
    id: p.id,
    idPedido: p.id_pedido ?? p.idPedido,
    monto: Number(p.monto),
    metodo: p.metodo?.toLowerCase() || '',
    hora: p.hora,
    estadoPedido: p.estadoPedido || p.estado_pedido,
    nombrePedido: p.nombrePedido || p.nombre_pedido,
    nombreUsuario: p.nombreUsuario || p.nombre_usuario,
  }));

  return {
    fecha,
    totalDia: Number(totalDia),
    totalPedidos: Number(totalPedidos),
    totalesPorMetodo,
    pagos: pagosNormalizados,
    estadisticas,
  };
}

// =========================
//   💲 FORMATEADORES
// =========================
export const formatearMonto = (monto) => {
  const numero = Number(monto);
  return isNaN(numero) ? '0.00' : numero.toFixed(2);
};

export const formatearFecha = (fecha) => {
  try {
    return new Date(fecha).toLocaleString('es-BO', {
      timeZone: 'America/La_Paz',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha inválida';
  }
};

// =========================
//   🎨 COLORES
// =========================
export const obtenerColorMetodoPago = (metodo = '') => {
  const m = metodo.toLowerCase();

  const colores = {
    efectivo: 'success',
    'efectivo-py': 'error',
    tarjeta: 'info',
    qr: 'secondary',
    online: 'warning',
  };

  return colores[m] || 'default';
};

export default {
  obtenerResumenDeCaja,
  obtenerResumenPorFecha,
  formatearMonto,
  formatearFecha,
  obtenerColorMetodoPago,
};
