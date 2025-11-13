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

const validateLogsResponse = (data) => {
  if (!data) {
    throw new Error('No se recibieron datos del servidor');
  }
  
  // Si es un array, devolverlo directamente
  if (Array.isArray(data)) {
    return data;
  }
  
  // Si es un objeto de log único, convertirlo en array
  if (data.id && (data.login_date || data.fecha)) {
    return [data];
  }
  
  // Si los logs están dentro de una propiedad
  if (data.logs) {
    return Array.isArray(data.logs) ? data.logs : [data.logs];
  }
  
  throw new Error('El formato de los logs recibidos no es válido');
};

export default {
  // Obtener todos los logs (admin) o los logs del usuario actual (empleado)
  obtenerLogs: async () => {
    try {
      const response = await axios.get('/user-logs', getAuthHeaders());
      const logs = validateLogsResponse(response.data);
      return { logs };
    } catch (error) {
      console.error('Error en obtenerLogs:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Error al obtener los logs');
      }
      throw error;
    }
  },

  // Obtener logs de un usuario específico (solo admin)
  obtenerLogsPorUsuario: async (userId) => {
    try {
      const response = await axios.get(`/user-logs/${userId}`, getAuthHeaders());
      const logs = validateLogsResponse(response.data);
      return { logs };
    } catch (error) {
      console.error('Error en obtenerLogsPorUsuario:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Error al obtener los logs del usuario');
      }
      throw error;
    }
  }
}; 
