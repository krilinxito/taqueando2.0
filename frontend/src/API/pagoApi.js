// API/pagoApi.js
import axios from './axios';

export const agregarPago = async (pagoData) => {
  try {
    const response = await axios.post('/pagos', pagoData);
    return response.data;
  } catch (error) {
    console.error('Error al agregar pago:', error.response?.data || error.message);
    throw error;
  }
};

const obtenerPagosDePedido = async (idPedido) => {
  try {
    const response = await axios.get(`/pagos/${idPedido}`);

    // Asegurarnos de que siempre devolvemos un array de pagos
    let pagos = [];
    if (response.data) {
      // Si la respuesta es un array, usarlo directamente
      if (Array.isArray(response.data)) {
        pagos = response.data;
      } 
      // Si la respuesta tiene una propiedad pagos, usar esa
      else if (response.data.pagos) {
        pagos = Array.isArray(response.data.pagos) ? response.data.pagos : [];
      }
      // Si la respuesta tiene una propiedad data, usar esa
      else if (response.data.data) {
        pagos = Array.isArray(response.data.data) ? response.data.data : [];
      }
    }

    return { data: pagos };
  } catch (error) {
    console.error('Error al obtener pagos:', error.response?.data || error.message);
    throw error;
  }
};

export const pagoApi = {
  agregarPago,
  obtenerPagosDePedido
};