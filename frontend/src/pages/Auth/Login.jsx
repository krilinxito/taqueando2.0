import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Typography, Box, CircularProgress, Paper } from '@mui/material';
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

      if (!usuario) {
        throw new Error('No se recibieron datos de usuario');
      }

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
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper sx={{ maxWidth: 400, width: '100%', p: 4, textAlign: 'center' }}>
        <Typography variant="h4" color="primary.main" gutterBottom>
          Taqueando
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Inicia sesión para continuar
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
            color="secondary"
            disabled={isSubmitting}
            sx={{ mt: 1, mb: 2 }}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Ingresar'}
          </Button>
        </form>

        <Typography variant="body2" color="text.secondary">
          ¿No tienes cuenta?{' '}
          <Button component={Link} to="/registro" size="small">
            Regístrate
          </Button>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
