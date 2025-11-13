// AppRoutes.jsx actualizado
import { Routes, Route, Navigate } from 'react-router-dom';
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
import Estadisticas from './pages/admin/Estadisticas';
import HistorialPedidos from './pages/admin/HistorialPedidos';
import UserConfig from './pages/shared/UserConfig';
import UserLogs from './pages/shared/UserLogs';

const AppRoutes = () => {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>Cargando autenticación...</h2>;
  }

  // Componente para proteger rutas de admin
  const AdminRoute = ({ children }) => {
    return user?.rol === 'admin' ? children : <Navigate to="/" replace />;
  };

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
        <Route path="inicio" element={<AdminIdle />} />
        <Route path="productos" element={<ProductosTable />} />
        <Route path="pedidos" element={<PedidosDashboard />} />
        <Route path="pedidos-cancelados" element={<PedidosCancelados />} />
        <Route path="resumen-caja" element={<ResumenCaja />} />
        <Route path="arqueos" element={<ArqueosLista />} />
        <Route path="estadisticas" element={<Estadisticas />} />
        <Route path="historial-pedidos" element={<HistorialPedidos />} />
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
        <Route path="inicio" element={<AdminIdle />} />
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
