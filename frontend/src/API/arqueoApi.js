import axios from './axios';

export const crearArqueo = async (arqueoData) => {
  try {
    const response = await axios.post('/arqueos', arqueoData);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Sesión expirada, por favor inicie sesión nuevamente');
    }
    throw error;
  }
};

export const obtenerArqueosPorFecha = async (fecha) => {
  try {
    const response = await axios.get(`/arqueos/fecha?fecha=${fecha}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Sesión expirada, por favor inicie sesión nuevamente');
    }
    throw error;
  }
};

export const obtenerUltimoArqueo = async () => {
  try {
    const response = await axios.get('/arqueos/ultimo');
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Sesión expirada, por favor inicie sesión nuevamente');
    }
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export default {
  crearArqueo,
  obtenerArqueosPorFecha,
  obtenerUltimoArqueo
};
