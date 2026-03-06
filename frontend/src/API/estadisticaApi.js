import axios from "./axios";

export const obtenerTodasLasEstadisticas = async (fechaInicio, fechaFin) => {
  try {
    const params = new URLSearchParams();
    if (fechaInicio) params.set('fechaInicio', fechaInicio);
    if (fechaFin) params.set('fechaFin', fechaFin);
    const qs = params.toString();
    const { data } = await axios.get(
      `/estadisticas${qs ? `?${qs}` : ''}`
    );

    return normalizarEstadisticas(data);
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    throw error;
  }
};

export const obtenerIngresosHistoricos = async (pagina = 1, limite = 10) => {
  try {
    const { data } = await axios.get(
      `/estadisticas/ingresos-historicos?pagina=${pagina}&limite=${limite}`
    );

    const ingresos =
      data.ingresos?.map((ing) => ({
        fecha: ing.fecha,
        total: Number(ing.total || 0),
        total_pedidos: Number(ing.total_pedidos || 0),
      })) || [];

    return {
      ...data,
      ingresos,
    };
  } catch (error) {
    console.error("Error al obtener ingresos históricos:", error);
    throw error;
  }
};

function normalizarEstadisticas(data) {
  const toNumber = (value) => (value !== undefined && value !== null ? Number(value) : 0);
  const resumen = data.resumenGeneral || {};

  return {
    resumen: {
      ingresosSemana: toNumber(resumen.ingresos_semana),
      pedidosSemana: toNumber(resumen.pedidos_semana),
      ticketPromedio: toNumber(resumen.ticket_promedio),
      usuariosActivos: toNumber(resumen.usuarios_activos),
      variacionIngresos: Number(resumen.variacion_ingresos || 0),
      variacionPedidos: Number(resumen.variacion_pedidos || 0),
      variacionTicket: Number(resumen.variacion_ticket || 0),
      promedioDiario: toNumber(resumen.promedio_diario),
      mejorDia: resumen.mejor_dia || null,
      horaPico: resumen.hora_pico || null,
    },

    tendencia: (data.tendenciaMensual || []).map((punto) => ({
      fecha: punto.fecha,
      total: toNumber(punto.total),
      total_pedidos: toNumber(punto.total_pedidos),
    })),

    metodosPago: (data.ingresosPorMetodo || []).map((m) => ({
      metodo: m.metodo,
      cantidad: toNumber(m.cantidad),
      total: toNumber(m.total),
    })),

    productosMasVendidos: (data.productosMasVendidos || []).map((p) => ({
      nombre: p.nombre,
      cantidad_total: toNumber(p.cantidad_total ?? p.cantidad),
      ingresos_total: toNumber(p.ingresos_total ?? p.ingresos),
    })),

    ventasPorHora: (data.ventasPorHora || []).map((v) => ({
      hora: Number(v.hora),
      total_pedidos: toNumber(v.total_pedidos),
      total_ventas: toNumber(v.total_ventas),
    })),

    ventasPorDiaSemana: (data.ventasPorDiaSemana || []).map((d) => ({
      dia: Number(d.dia),
      nombre_dia: d.nombre_dia,
      total_pedidos: toNumber(d.total_pedidos),
      total_ventas: toNumber(d.total_ventas),
    })),

    gananciasPorSemana: (data.gananciasPorSemana || []).map((s) => ({
      anio: Number(s.anio),
      mes: Number(s.mes),
      semana: Number(s.semana),
      fecha_inicio: s.fecha_inicio,
      fecha_fin: s.fecha_fin,
      total_pedidos: toNumber(s.total_pedidos),
      total_ventas: toNumber(s.total_ventas),
    })),

    tiempoPromedioCierre: toNumber(data.tiempoPromedioCierre?.tiempo_promedio_minutos),
    horariosPicoIngresos: (data.horariosPicoIngresos || []).map((registro) => ({
      dia_semana: registro.dia_semana,
      hora: Number(registro.hora),
      total_pedidos: toNumber(registro.total_pedidos),
      total_ingresos: toNumber(registro.total_ingresos),
    })),
  };
}

export const formatearMonto = (monto) =>
  isNaN(Number(monto)) ? "0.00" : Number(monto).toFixed(2);

export const formatearFecha = (fecha) => {
  try {
    return new Date(fecha).toLocaleString("es-BO", {
      timeZone: "America/La_Paz",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "Fecha inválida";
  }
};

export const obtenerColorMetodoPago = (metodo = "") => {
  const mapa = {
    efectivo: "success",
    "efectivo-py": "danger",
    tarjeta: "info",
    qr: "secondary",
    online: "warning",
  };
  return mapa[metodo.toLowerCase()] || "default";
};

export default {
  obtenerTodasLasEstadisticas,
  obtenerIngresosHistoricos,
  formatearMonto,
  formatearFecha,
  obtenerColorMetodoPago,
};
