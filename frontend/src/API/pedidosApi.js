import axios from './axios';

// pedidosApi.js
export const crearPedido = (pedidoData) => 
  axios.post('/pedidos', pedidoData);
  
export const obtenerPedidosDelDia = async () => {
  try {
    const response = await axios.get('/pedidos/pedidos-dia');
    console.log('Respuesta pedidos del día:', response);
    return response;
  } catch (error) {
    console.error('Error al obtener pedidos del día:', error);
    throw error;
  }
};

export const obtenerPedidosCancelados = async () => {
  try {
    const response = await axios.get('/pedidos');
    
    if (!response || !response.data) {
      throw new Error('Respuesta inválida del servidor');
    }
    
    if (!Array.isArray(response.data)) {
      throw new Error('Formato de datos inválido');
    }
    
    // Filtrar solo los pedidos cancelados
    const pedidosCancelados = response.data.filter(pedido => 
      pedido.estado === 'cancelado'
    );
    
    return {
      data: {
        data: pedidosCancelados
      }
    };
  } catch (error) {
    console.error('Error al obtener pedidos cancelados:', error);
    throw error;
  }
};

export const obtenerPedidoPorId = async (id) => {
  try {
    const response = await axios.get(`/pedidos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    throw error;
  }
};

export const editarPedido = async (id, pedidoData) => {
  try {
    const response = await axios.put(`/pedidos/${id}`, pedidoData);
    return response.data;
  } catch (error) {
    console.error('Error al editar pedido:', error);
    throw error;
  }
};

// Obtener todos los pedidos con paginación y filtros
export const obtenerTodosLosPedidos = async (pagina = 1, limite = 10000, filtros = {}) => {
  try {
    // Crear objeto de parámetros base
    const params = new URLSearchParams({
      page: pagina.toString(),
      limit: limite.toString()
    });

    // Agregar filtros si existen y tienen valor
    if (filtros.fechaInicio) {
      params.append('fechaInicio', filtros.fechaInicio);
    }
    if (filtros.fechaFin) {
      params.append('fechaFin', filtros.fechaFin);
    }
    if (filtros.estado && filtros.estado.trim() !== '') {
      params.append('estado', filtros.estado.trim());
    }
    if (filtros.usuario && filtros.usuario.trim() !== '') {
      params.append('usuario', filtros.usuario.trim());
    }

    console.log('Enviando request con params:', params.toString());
    
    const response = await axios.get(`/pedidos?${params.toString()}`);
    
    if (!response.data) {
      console.warn('Respuesta sin datos:', response);
      return { pedidos: [], total: 0 };
    }

    // Asegurarse de que la respuesta tenga la estructura esperada
    const pedidos = Array.isArray(response.data.data) ? response.data.data : [];
    const total = typeof response.data.total === 'number' ? response.data.total : pedidos.length;

    return {
      pedidos,
      total
    };
  } catch (error) {
    console.error('Error al obtener todos los pedidos:', error);
    // Propagar el error para que pueda ser manejado por el componente
    throw error;
  }
};

// Obtener pedidos del día actual
export const obtenerPedidosDelDiaActual = async () => {
  try {
    const response = await axios.get('/pedidos/dia');
    return response.data;
  } catch (error) {
    console.error('Error al obtener pedidos del día:', error);
    throw error;
  }
};

// Obtener pedidos cancelados del día
export const obtenerPedidosCanceladosDelDia = async () => {
  try {
    const response = await axios.get('/pedidos/cancelados/dia');
    return response.data;
  } catch (error) {
    console.error('Error al obtener pedidos cancelados:', error);
    throw error;
  }
};

// Crear nuevo pedido
export const crearPedidoActual = async (pedido) => {
  try {
    const response = await axios.post('/pedidos', pedido);
    return response.data;
  } catch (error) {
    console.error('Error al crear pedido:', error);
    throw error;
  }
};

// Editar pedido existente
export const editarPedidoActual = async (id, pedido) => {
  try {
    const response = await axios.put(`/pedidos/${id}`, pedido);
    return response.data;
  } catch (error) {
    console.error('Error al editar pedido:', error);
    throw error;
  }
};

// Cancelar pedido
export const cancelarPedidoActual = async (id) => {
  try {
    const response = await axios.put(`/pedidos/${id}/cancelar`);
    return response.data;
  } catch (error) {
    console.error('Error al cancelar pedido:', error);
    throw error;
  }
};

// Obtener resumen de caja del día
export const obtenerResumenCajaDia = async () => {
  try {
    const response = await axios.get('/pedidos/resumen-caja/dia');
    return response.data;
  } catch (error) {
    console.error('Error al obtener resumen de caja:', error);
    throw error;
  }
};

// Eliminar pedido
export const eliminarPedido = async (id) => {
  try {
    const response = await axios.delete(`/pedidos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar pedido:', error);
    throw error;
  }
};

// Exportar todas las funciones juntas también
export default {
  obtenerTodosLosPedidos,
  obtenerPedidosDelDia,
  obtenerPedidosCancelados,
  obtenerPedidoPorId,
  editarPedido,
  obtenerPedidosDelDiaActual,
  obtenerPedidosCanceladosDelDia,
  crearPedidoActual,
  editarPedidoActual,
  cancelarPedidoActual,
  obtenerResumenCajaDia,
  eliminarPedido
};