import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography
} from '@mui/material';
import {
  Home,
  ListAlt,
  Settings,
  History,
  AccountBalanceWallet
} from '@mui/icons-material';

const sidebarItemSx = {
  '&.Mui-selected': {
    bgcolor: 'rgba(36,168,105,0.08)',
    '& .MuiListItemIcon-root': { color: 'secondary.main' },
    '& .MuiListItemText-primary': { color: 'secondary.main', fontWeight: 600 },
  },
  '&.Mui-selected:hover': {
    bgcolor: 'rgba(36,168,105,0.12)',
  },
};

const UserSidebar = () => {
  return (
    <Box sx={{
      width: 240,
      height: '100vh',
      bgcolor: 'background.paper',
      borderRight: 1,
      borderColor: 'divider',
      pt: 2,
      px: 1,
    }}>
      <Typography
        variant="subtitle2"
        sx={{ px: 2, pb: 1.5, color: 'text.secondary', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.7rem' }}
      >
        Menu
      </Typography>

      <List disablePadding>
        <NavLink to="/usuario/inicio" style={{ textDecoration: 'none', color: 'inherit' }}>
          {({ isActive }) => (
            <ListItemButton selected={isActive} sx={sidebarItemSx}>
              <ListItemIcon><Home /></ListItemIcon>
              <ListItemText primary="Inicio" />
            </ListItemButton>
          )}
        </NavLink>

        <NavLink to="/usuario/pedidos-activos" style={{ textDecoration: 'none', color: 'inherit' }}>
          {({ isActive }) => (
            <ListItemButton selected={isActive} sx={sidebarItemSx}>
              <ListItemIcon><ListAlt /></ListItemIcon>
              <ListItemText primary="Pedidos Activos" />
            </ListItemButton>
          )}
        </NavLink>

        <NavLink to="/usuario/pedidos-cancelados" style={{ textDecoration: 'none', color: 'inherit' }}>
          {({ isActive }) => (
            <ListItemButton selected={isActive} sx={sidebarItemSx}>
              <ListItemIcon><History /></ListItemIcon>
              <ListItemText primary="Pedidos Cancelados" />
            </ListItemButton>
          )}
        </NavLink>

        <NavLink to="/usuario/resumen-caja" style={{ textDecoration: 'none', color: 'inherit' }}>
          {({ isActive }) => (
            <ListItemButton selected={isActive} sx={sidebarItemSx}>
              <ListItemIcon><AccountBalanceWallet /></ListItemIcon>
              <ListItemText primary="Resumen de Caja" />
            </ListItemButton>
          )}
        </NavLink>

        <Divider sx={{ my: 1, mx: 1 }} />

        <NavLink to="/usuario/configuracion" style={{ textDecoration: 'none', color: 'inherit' }}>
          {({ isActive }) => (
            <ListItemButton selected={isActive} sx={sidebarItemSx}>
              <ListItemIcon><Settings /></ListItemIcon>
              <ListItemText primary="Configuración" />
            </ListItemButton>
          )}
        </NavLink>
      </List>
    </Box>
  );
};

export default UserSidebar;
