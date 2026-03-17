import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import axios, { updateCachedToken, clearCachedToken } from '../API/axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

const TOKEN_TIMEOUT = 12 * 60 * 60 * 1000; // 12 horas en milisegundos

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastActivityRef = useRef(Date.now());

  // Función para verificar el token
  const verifyToken = useCallback(async (token) => {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        return null;
      }

      const userData = {
        id: decodedToken.id,
        email: decodedToken.email,
        rol: decodedToken.rol,
        nombre: decodedToken.nombre || decodedToken.email.split('@')[0]
      };

      // Solo verificar con servidor si expira en menos de 1 hora
      if (decodedToken.exp - currentTime < 3600) {
        try {
          const response = await axios.post('/auth/verify-token', {}, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.data?.user) {
            return response.data.user;
          }
        } catch {
          // usar datos locales si falla la verificacion con servidor
        }
      }

      return userData;
    } catch (error) {
      console.error('Error verificando token:', error.message);
      return null;
    }
  }, []);

  // Función para actualizar la última actividad (throttled a 30s)
  const updateActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityRef.current < 30000) return;
    lastActivityRef.current = now;
    localStorage.setItem('lastActivity', now.toString());
  }, []);

  // Función de logout
  const logout = useCallback((redirect = true) => {
    clearCachedToken();
    localStorage.removeItem('token');
    localStorage.removeItem('lastActivity');
    setUser(null);
    lastActivityRef.current = 0;
    if (redirect) {
      window.location.replace('/');
    }
  }, []);

  // Efecto para cargar el usuario inicial
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedLastActivity = localStorage.getItem('lastActivity');
      
      if (token && storedLastActivity) {
        const lastActivityTime = parseInt(storedLastActivity);
        const timeSinceLastActivity = Date.now() - lastActivityTime;

        if (timeSinceLastActivity > TOKEN_TIMEOUT) {
          logout();
          setIsLoading(false);
          return;
        }

        try {
          const userData = await verifyToken(token);
          if (userData) {
            setUser(userData);
            updateActivity();
          } else {
            logout();
          }
        } catch (error) {
          console.error('Error en la inicialización de auth:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [verifyToken, logout, updateActivity]);

  // Efecto para monitorear la actividad
  useEffect(() => {
    if (!user) return;

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    const checkActivity = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      if (timeSinceLastActivity > TOKEN_TIMEOUT) {
        logout();
      }
    }, 60000); // Revisar cada minuto

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      clearInterval(checkActivity);
    };
  }, [user, updateActivity, logout]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', {
        email,
        password
      });

      const { token } = response.data;
      
      if (!token) {
        throw new Error('No se recibió el token de autenticación');
      }

      const decodedToken = jwtDecode(token);
      const userData = {
        id: decodedToken.id,
        email: decodedToken.email,
        rol: decodedToken.rol,
        nombre: decodedToken.nombre || email.split('@')[0]
      };
      
      localStorage.setItem('token', token);
      updateCachedToken(token);
      updateActivity();
      setUser(userData);
      
      return userData;
    } catch (error) {
      console.error('Error en login:', error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (nombre, email, password) => {
    try {
      const response = await axios.post('/auth/register', {
        nombre,
        email,
        password
      });
      return response.data;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
