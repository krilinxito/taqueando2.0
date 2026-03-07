import axios from 'axios';

let cachedToken = localStorage.getItem('token');
let isRedirecting = false;

export const updateCachedToken = (token) => { cachedToken = token; };
export const clearCachedToken = () => { cachedToken = null; };

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

instance.interceptors.request.use(
  (config) => {
    if (cachedToken) {
      config.headers.Authorization = `Bearer ${cachedToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if ((status === 401 || status === 403) && !isRedirecting) {
      isRedirecting = true;
      clearCachedToken();
      localStorage.removeItem('token');
      localStorage.removeItem('lastActivity');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
