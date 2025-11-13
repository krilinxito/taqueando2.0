// src/API/productsApi.js (por ejemplo)
import axios from './axios';

export const obtenerProductos = async () => {
  const response = await axios.get('/productos');
  return response.data;
};
export const obtenerProductoPorId = async (id) => {
  const response = await axios.get(`/productos/${id}`);
  return response.data;
}

export const crearProducto = async (producto) => {
  const response = await axios.post('/productos', producto);
  return response.data;
};
export const actualizarProducto = async (id, producto) => {
  const response = await axios.put(`/productos/${id}`, producto);
  return response.data;
};  
export const eliminarProducto = async (id) => {
  const response = await axios.delete(`/productos/${id}`);
  return response.data;
};  