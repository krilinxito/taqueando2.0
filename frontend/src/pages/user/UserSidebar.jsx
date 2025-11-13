// components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box
} from '@mui/material';
import {
  ListAlt,
  Settings,
  History,
  AccountBalanceWallet,
  Article
} from '@mui/icons-material';

const UserSidebar = () => {
  return (
    <Box sx={{ 
      width: 240,
      height: '100vh',
      bgcolor: 'background.paper',
      borderRight: '1px solid rgba(0, 0, 0, 0.12)'
    }}>
      <List>
        <NavLink to="/usuario/pedidos-activos" style={{ textDecoration: 'none', color: 'inherit' }}>
          {({ isActive }) => (
            <ListItemButton selected={isActive}>
              <ListItemIcon>
                <ListAlt />
              </ListItemIcon>
              <ListItemText primary="Pedidos Activos" />
            </ListItemButton>
          )}
        </NavLink>

        <NavLink to="/usuario/pedidos-cancelados" style={{ textDecoration: 'none', color: 'inherit' }}>
          {({ isActive }) => (
            <ListItemButton selected={isActive}>
              <ListItemIcon>
                <History />
              </ListItemIcon>
              <ListItemText primary="Pedidos Cancelados" />
            </ListItemButton>
          )}
        </NavLink>

        <NavLink to="/usuario/resumen-caja" style={{ textDecoration: 'none', color: 'inherit' }}>
          {({ isActive }) => (
            <ListItemButton selected={isActive}>
              <ListItemIcon>
                <AccountBalanceWallet />
              </ListItemIcon>
              <ListItemText primary="Resumen de Caja" />
            </ListItemButton>
          )}
        </NavLink>

        <Divider sx={{ my: 1 }} />
        
        <NavLink to="/usuario/configuracion" style={{ textDecoration: 'none', color: 'inherit' }}>
          {({ isActive }) => (
            <ListItemButton selected={isActive}>
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <ListItemText primary="Configuración" />
            </ListItemButton>
          )}
        </NavLink>
      </List>
    </Box>
  );
};

export default UserSidebar;