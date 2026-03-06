import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(
        formData.nombre.trim(),
        formData.email.trim(),
        formData.password
      );

      setSuccess('Registro exitoso. Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Ocurrió un error al registrarse';
      setError(message);
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
          Completa tus datos para empezar a usar Taqueando.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            name="nombre"
            label="Nombre completo"
            fullWidth
            margin="normal"
            value={formData.nombre}
            onChange={handleChange}
            required
          />

          <TextField
            name="email"
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <TextField
            name="password"
            label="Contraseña"
            type="password"
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <TextField
            name="confirmPassword"
            label="Confirmar contraseña"
            type="password"
            fullWidth
            margin="normal"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {success && (
            <Typography color="success.main" sx={{ mb: 2 }}>
              {success}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            color="secondary"
            fullWidth
            disabled={isSubmitting}
            sx={{ mt: 1, mb: 2 }}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Registrarse'}
          </Button>
        </form>

        <Typography variant="body2" color="text.secondary">
          ¿Ya tienes cuenta?{' '}
          <Button component={Link} to="/login" size="small">
            Inicia sesión
          </Button>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Register;
