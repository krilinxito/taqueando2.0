import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  DarkMode,
  Lock
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useTheme2 } from '../../context/ThemeContext';
import authApi from '../../API/authApi';

const UserConfig = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme2();
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'La contraseña actual es requerida';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'La nueva contraseña es requerida';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Debe confirmar la nueva contraseña';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.actualizarPassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      
      setSnackbar({
        open: true,
        message: 'Contraseña actualizada correctamente',
        severity: 'success'
      });
      
      setOpenPasswordDialog(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setFormErrors({});
      
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Error al actualizar la contraseña',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleInputChange = (field) => (event) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Limpiar el error del campo cuando el usuario empieza a escribir
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Información del Usuario */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{ 
              width: 80, 
              height: 80, 
              mr: 2,
              bgcolor: user?.rol === 'admin' ? 'primary.main' : 'secondary.main'
            }}
          >
            {user?.nombre?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h5">{user?.nombre}</Typography>
            <Typography color="textSecondary">{user?.email}</Typography>
            <Typography
              variant="subtitle2"
              sx={{
                color: user?.rol === 'admin' ? 'primary.main' : 'secondary.main',
                textTransform: 'capitalize'
              }}
            >
              {user?.rol}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Configuraciones */}
      <Paper elevation={3} sx={{ mb: 3 }}>
        <List>
          <ListItem>
            <ListItemIcon>
              <DarkMode />
            </ListItemIcon>
            <ListItemText 
              primary="Modo Oscuro" 
              secondary="Cambiar apariencia de la aplicación"
            />
            <Switch
              edge="end"
              checked={darkMode}
              onChange={toggleDarkMode}
            />
          </ListItem>
        </List>
      </Paper>

      {/* Seguridad */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Seguridad
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Lock />}
            onClick={() => setOpenPasswordDialog(true)}
          >
            Cambiar Contraseña
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={logout}
          >
            Cerrar Sesión
          </Button>
        </Box>
      </Paper>

      {/* Diálogo de Cambio de Contraseña */}
      <Dialog 
        open={openPasswordDialog} 
        onClose={() => !isSubmitting && setOpenPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Contraseña Actual"
            type="password"
            fullWidth
            value={passwordForm.currentPassword}
            onChange={handleInputChange('currentPassword')}
            error={!!formErrors.currentPassword}
            helperText={formErrors.currentPassword}
            disabled={isSubmitting}
          />
          <TextField
            margin="dense"
            label="Nueva Contraseña"
            type="password"
            fullWidth
            value={passwordForm.newPassword}
            onChange={handleInputChange('newPassword')}
            error={!!formErrors.newPassword}
            helperText={formErrors.newPassword}
            disabled={isSubmitting}
          />
          <TextField
            margin="dense"
            label="Confirmar Nueva Contraseña"
            type="password"
            fullWidth
            value={passwordForm.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            error={!!formErrors.confirmPassword}
            helperText={formErrors.confirmPassword}
            disabled={isSubmitting}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenPasswordDialog(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handlePasswordSubmit} 
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} />
            ) : (
              'Actualizar'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensajes */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserConfig; 