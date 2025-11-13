// contieneApi.js
// src/API/contieneApi.js
import axios from './axios';

// Agregar producto a un pedido
export const agregarProductoAPedido = async ({ id_pedido, id_producto, cantidad }) => {
  try {
    const response = await axios.post('/contiene/agregar', {
      id_pedido,
      id_producto,
      cantidad
    });
    return response;
  } catch (error) {
    console.error('Error al agregar producto:', error);
    throw error;
  }
};

// Anular producto de un pedido (por id de la tabla contiene)
export const anularProductoDePedido = async (id_contiene) => {
  try {
    const response = await axios.put(`/contiene/anular/${id_contiene}`);
    return response;
  } catch (error) {
    console.error('Error al anular producto:', error);
    if (error.response) {
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
};

// Obtener productos activos de un pedido
export const obtenerProductosDePedido = async (id_pedido) => {
  try {
    const response = await axios.get(`/contiene/pedido/${id_pedido}`);

    // Si no hay respuesta
    if (!response.data) {
      return { data: { productos: [] } };
    }

    // Extraer productos de la estructura anidada
    const productos = response.data.productos?.productos || [];

    return { 
      data: { 
        productos: productos,
        total: response.data.productos?.total || 0
      } 
    };
    
  } catch (error) {
    console.error(`Error al obtener productos del pedido ${id_pedido}:`, error);
    if (error.response) {
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
};

export default {
  agregarProductoAPedido,
  anularProductoDePedido,
  obtenerProductosDePedido,
};