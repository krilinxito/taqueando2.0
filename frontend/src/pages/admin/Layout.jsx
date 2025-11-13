// components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: 'calc(100% - 240px)',
        }}
      >
        <Outlet /> {/* Aquí se renderizan las rutas hijas */}
      </Box>
    </Box>
  );
};

export default Layout;