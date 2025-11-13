import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Container, Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError('');

  try {
    const usuario = await login(email, password);
    
    // Añadir verificación de respuesta
    if (!usuario) {
      throw new Error('No se recibieron datos de usuario');
    }

    // Debug: Verificar estructura completa
    console.log('Datos de usuario recibidos:', usuario);

    // Redirección condicional mejorada
    const targetPath = usuario.rol === 'admin' 
      ? '/menu' 
      : usuario.rol === 'empleado'
        ? '/usuario/pedidos-activos'
        : '/';

    navigate(targetPath);

  } catch (err) {
    setError(err.message || 'Error en el inicio de sesión');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Inicio de Sesión
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Ingresar'}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Login;
