import axios from './axios';

export default {
  login: (email, password) => 
    axios.post('/auth/login', { email, password }),
  
  register: (nombre, email, password) => 
    axios.post('/auth/register', { 
      nombre,    
      email,
      password
    }),
  
  verifyToken: (token) => 
    axios.post('/auth/verify-token'),

  
  getAdminData: () => 
    axios.get('/auth/admin', {
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      }
    }),

  actualizarPassword: async (currentPassword, newPassword) => {
    try {
      const response = await axios.post('/auth/update-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
