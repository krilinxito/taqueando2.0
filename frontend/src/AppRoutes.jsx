// AppRoutes.jsx actualizado
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import AdminIdle from './pages/admin/AdminIdle';
import ProductosTable from './pages/admin/ProductosTable';
import Layout from './pages/admin/Layout';
import UserLayout from './pages/user/UserLayout';
import { useAuth } from './context/AuthContext';
import PedidosDashboard from './store/PedidosDashboard';
import PedidosCancelados from './store/PedidosCancelados';
import ResumenCaja from './store/ResumenCaja';
import ArqueosLista from './store/ArqueosLista';
import UserConfig from './pages/shared/UserConfig';
import UserLogs from './pages/shared/UserLogs';

const Estadisticas = React.lazy(() => import('./pages/admin/Estadisticas'));
const HistorialPedidos = React.lazy(() => import('./pages/admin/HistorialPedidos'));

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
    <CircularProgress />
  </Box>
);

const AppRoutes = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>Cargando autenticación...</h2>;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />

      {/* Rutas de administrador */}
      <Route path="/menu" element={
        <ProtectedRoute adminOnly>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminIdle />} />
        <Route path="productos" element={<ProductosTable />} />
        <Route path="pedidos" element={<PedidosDashboard />} />
        <Route path="pedidos-cancelados" element={<PedidosCancelados />} />
        <Route path="resumen-caja" element={<ResumenCaja />} />
        <Route path="arqueos" element={<ArqueosLista />} />
        <Route path="estadisticas" element={<Suspense fallback={<LoadingFallback />}><Estadisticas /></Suspense>} />
        <Route path="historial-pedidos" element={<Suspense fallback={<LoadingFallback />}><HistorialPedidos /></Suspense>} />
        <Route path="logs" element={<UserLogs />} />
        <Route path="configuracion" element={<UserConfig />} />
      </Route>

      {/* Rutas de usuario */}
      <Route path="/usuario" element={
        <ProtectedRoute>
          <UserLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminIdle />} />
        <Route path="pedidos-activos" element={<PedidosDashboard />} />
        <Route path="pedidos-cancelados" element={<PedidosCancelados />} />
        <Route path="resumen-caja" element={<ResumenCaja />} />
        <Route path="logs" element={<UserLogs />} />
        <Route path="configuracion" element={<UserConfig />} />
      </Route>

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
