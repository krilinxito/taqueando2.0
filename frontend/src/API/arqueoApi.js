import axios from './axios';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

export const crearArqueo = async (arqueoData) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post('/arqueos', arqueoData, headers);
    return response.data;
  } catch (error) {
    if (!localStorage.getItem('token')) {
      console.error('Error de autenticación: No hay token');
      throw new Error('Se requiere iniciar sesión');
    }
    if (error.response?.status === 401) {
      console.error('Error de autenticación: Token inválido o expirado');
      throw new Error('Sesión expirada, por favor inicie sesión nuevamente');
    }
    console.error('Error al crear arqueo:', error);
    throw error;
  }
};

export const obtenerArqueosPorFecha = async (fecha) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`/arqueos/fecha?fecha=${fecha}`, headers);
    return response.data;
  } catch (error) {
    if (!localStorage.getItem('token')) {
      console.error('Error de autenticación: No hay token');
      throw new Error('Se requiere iniciar sesión');
    }
    if (error.response?.status === 401) {
      console.error('Error de autenticación: Token inválido o expirado');
      throw new Error('Sesión expirada, por favor inicie sesión nuevamente');
    }
    console.error('Error al obtener arqueos por fecha:', error);
    throw error;
  }
};

export const obtenerUltimoArqueo = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get('/arqueos/ultimo', headers);
    return response.data;
  } catch (error) {
    if (!localStorage.getItem('token')) {
      console.error('Error de autenticación: No hay token');
      throw new Error('Se requiere iniciar sesión');
    }
    if (error.response?.status === 401) {
      console.error('Error de autenticación: Token inválido o expirado');
      throw new Error('Sesión expirada, por favor inicie sesión nuevamente');
    }
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error al obtener último arqueo:', error);
    throw error;
  }
};

export default {
  crearArqueo,
  obtenerArqueosPorFecha,
  obtenerUltimoArqueo
}; 