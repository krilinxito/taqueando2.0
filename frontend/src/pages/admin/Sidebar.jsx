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
  Inventory,
  ListAlt,
  Settings,
  History,
  AccountBalanceWallet,
  Assessment,
  Article,
  Home
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

const Sidebar = () => {
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
        <NavLink to="/menu/inicio" style={{ textDecoration: 'none', color: 'inherit' }}>
          {({ isActive }) => (
            <ListItemButton selected={isActive} sx={sidebarItemSx}>
              <ListItemIcon><Home /></ListItemIcon>
              <ListItemText primary="Inicio" />
            </ListItemButton>
          )}
        </NavLink>

        <NavLink to="/menu/productos" style={{ textDecoration: 'none', color: 'inherit' }}>
          {({ isActive }) => (
            <ListItemButton selected={isActive} sx={sidebarItemSx}>
              <ListItemIcon><Inventory /></ListItemIcon>
              <ListItemText primary="Productos" />
            </ListItemButton>
          )}
        </NavLink>

        <NavLink to="/menu/pedidos" style={{ textDecoration: 'none', color: 'inherit' }}>
          {({ isActive }) => (
            <ListItemButton selected={isActive} sx={sidebarItemSx}>
              <ListItemIcon><ListAlt /></ListItemIcon>
              <ListItemText primary="Pedidos Activos" />
            </ListItemButton>
          )}
        </NavLink>

        <NavLink to="/menu/pedidos-cancelados" style={{ textDecoration: 'none', color: 'inherit' }}>
          {({ isActive }) => (
            <ListItemButton selected={isActive} sx={sidebarItemSx}>
              <ListItemIcon><History /></ListItemIcon>
              <ListItemText primary="Pedidos Cancelados" />
            </ListItemButton>
          )}
        </NavLink>

        <NavLink to="/menu/historial-pedidos" style={{ textDecoration: 'none', color: 'inherit' }}>
          {({ isActive }) => (
            <ListItemButton selected={isActive} sx={sidebarItemSx}>
              <ListItemIcon><History /></ListItemIcon>
              <ListItemText primary="Historial de Pedidos" />
            </ListItemButton>
          )}
        </NavLink>

        <NavLink to="/menu/resumen-caja" style={{ textDecoration: 'none', color: 'inherit' }}>
          {({ isActive }) => (
            <ListItemButton selected={isActive} sx={sidebarItemSx}>
              <ListItemIcon><AccountBalanceWallet /></ListItemIcon>
              <ListItemText primary="Resumen de Caja" />
            </ListItemButton>
          )}
        </NavLink>

        <NavLink to="/menu/arqueos" style={{ textDecoration: 'none', color: 'inherit' }}>
          {({ isActive }) => (
            <ListItemButton selected={isActive} sx={sidebarItemSx}>
              <ListItemIcon><Assessment /></ListItemIcon>
              <ListItemText primary="Historial de Arqueos" />
            </ListItemButton>
          )}
        </NavLink>

        <NavLink to="/menu/estadisticas" style={{ textDecoration: 'none', color: 'inherit' }}>
          {({ isActive }) => (
            <ListItemButton selected={isActive} sx={sidebarItemSx}>
              <ListItemIcon><Assessment /></ListItemIcon>
              <ListItemText primary="Estadísticas" />
            </ListItemButton>
          )}
        </NavLink>

        <NavLink to="/menu/logs" style={{ textDecoration: 'none', color: 'inherit' }}>
          {({ isActive }) => (
            <ListItemButton selected={isActive} sx={sidebarItemSx}>
              <ListItemIcon><Article /></ListItemIcon>
              <ListItemText primary="Logs del Sistema" />
            </ListItemButton>
          )}
        </NavLink>

        <Divider sx={{ my: 1, mx: 1 }} />

        <NavLink to="/menu/configuracion" style={{ textDecoration: 'none', color: 'inherit' }}>
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

export default Sidebar;
