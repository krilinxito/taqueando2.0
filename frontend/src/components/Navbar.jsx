import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Divider
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { styled } from '@mui/material/styles';
import { useState } from 'react';

import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.primary.dark}`
}));

const StyledToolbar = styled(Toolbar)({
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0 1.5rem',
  minHeight: 64
});

const LogoContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  cursor: 'pointer',
  transition: 'transform 0.25s ease',
  '&:hover': {
    transform: 'scale(1.07)'
  }
});

const LogoText = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  fontWeight: 600,
  fontSize: '1.2rem',
  letterSpacing: '0.5px'
}));

const StyledButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  borderColor: 'rgba(255,255,255,0.3)',
  textTransform: 'none',
  fontSize: '0.95rem',
  borderRadius: 8,
  padding: '6px 16px',
  transition: 'all 0.25s ease',
  '&:hover': {
    borderColor: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.light
  }
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.primary.main,
  cursor: 'pointer',
  fontWeight: 600
}));

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogoClick = () =>
    navigate(user?.rol === 'admin' ? '/menu' : user ? '/usuario/pedidos-activos' : '/');

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleProfile = () => {
    handleMenuClose();
    if (!user) return;
    if (user.rol === 'admin') {
      navigate('/menu/configuracion');
    } else {
      navigate('/usuario/configuracion');
    }
  };

  const getUserInitial = () => user?.nombre?.charAt(0)?.toUpperCase() || '?';

  return (
    <StyledAppBar position="static">
      <StyledToolbar>

        {/* LOGO */}
        <LogoContainer onClick={handleLogoClick}>
          <LogoText>Taqueando</LogoText>
        </LogoContainer>

        {/* MENU DERECHO */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

          {user ? (
            <>
              <Typography
                sx={{
                  fontWeight: 500,
                  color: 'primary.contrastText',
                  fontSize: '1.1rem',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                {user.nombre}
              </Typography>

              <Tooltip title="Cuenta">
                <UserAvatar onClick={handleMenuOpen}>
                  {getUserInitial()}
                </UserAvatar>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 1.4,
                      borderRadius: 2,
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText',
                      minWidth: 180,
                      '& .MuiMenuItem-root': {
                        py: 1.2,
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'primary.contrastText'
                      }
                    }
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleProfile}>
                  <AccountCircleIcon sx={{ mr: 2 }} />
                  Usuario
                </MenuItem>

                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 0.5 }} />

                <MenuItem onClick={handleLogout} sx={{ color: '#ff9e9e' }}>
                  <LogoutIcon sx={{ mr: 2 }} />
                  Cerrar sesión
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <StyledButton component={Link} to="/login" variant="outlined">
                Iniciar Sesión
              </StyledButton>

              <StyledButton component={Link} to="/registro" variant="outlined">
                Registro
              </StyledButton>
            </>
          )}

        </Box>
      </StyledToolbar>
    </StyledAppBar>
  );
};

export default Navbar;
