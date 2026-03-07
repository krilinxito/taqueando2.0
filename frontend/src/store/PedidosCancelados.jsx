import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import { obtenerPedidosDiaConDetalles } from '../API/pedidosApi';
import MoneyIcon from '@mui/icons-material/Money';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import QrCodeIcon from '@mui/icons-material/QrCode';
import LanguageIcon from '@mui/icons-material/Language';
import { formatearFechaHora } from '../utils/fecha';
import CuentaModal from './CuentaModal';
import PrinterStatusIndicator from './PrinterStatusIndicator';

const PedidosCancelados = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  const [busqueda, setBusqueda] = useState('');
  const [selectedPedidoForPrint, setSelectedPedidoForPrint] = useState(null);
  const [success, setSuccess] = useState(null);

  const getPaymentMethodColor = (metodo) => {
    switch (metodo.toLowerCase()) {
      case 'efectivo':
        return 'success';
      case 'tarjeta':
        return 'info';
      case 'qr':
        return 'secondary';
      case 'online':
        return 'warning';
      default:
        return 'default';
    }
  };

  const ordenarPedidos = (pedidosArray) => {
    return [...pedidosArray].sort((a, b) => {
      const fechaA = new Date(a.fecha);
      const fechaB = new Date(b.fecha);
      return sortOrder === 'desc' ? fechaB - fechaA : fechaA - fechaB;
    });
  };

  const fetchPedidos = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);
    try {
      const response = await obtenerPedidosDiaConDetalles('cancelado');

      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error('Formato de datos de pedidos inválido');
      }

      const pedidosConTotal = response.data.data.map(pedido => ({
        ...pedido,
        total: (pedido.productos || []).reduce((sum, p) => {
          if (p.anulado) return sum;
          return sum + (Number(p.precio || 0) * Number(p.cantidad || 0));
        }, 0)
      }));

      setPedidos(ordenarPedidos(pedidosConTotal));
    } catch (error) {
      console.error('Error al obtener pedidos cancelados:', error);
      setError('Error al cargar los pedidos: ' + (error.response?.data?.message || error.message));
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  }, [sortOrder]);

  useEffect(() => {
    fetchPedidos();

    const interval = setInterval(fetchPedidos, 300000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchPedidos]);

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((pedido) => {
      if (!busqueda) return true;
      const termino = busqueda.toLowerCase();
      const coincideNombre = pedido.nombre?.toLowerCase().includes(termino);
      const coincideProducto = pedido.productos?.some(p =>
        p.nombre?.toLowerCase().includes(termino)
      );
      const coincidePago = pedido.pagos?.some(p =>
        p.metodo?.toLowerCase().includes(termino)
      );
      return coincideNombre || coincideProducto || coincidePago;
    });
  }, [pedidos, busqueda]);

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4">
            Pedidos Cancelados del Día
          </Typography>
          <PrinterStatusIndicator />
        </Box>
        <Tooltip title="Actualizar">
          <span>
            <IconButton onClick={fetchPedidos} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <TextField
        fullWidth
        size="small"
        placeholder="Buscar por nombre, producto o método de pago..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        sx={{ mb: 2 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          },
        }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      ) : pedidosFiltrados.length === 0 ? (
        <Alert severity="info" sx={{ my: 2 }}>
          {busqueda ? 'No se encontraron pedidos con esa búsqueda' : 'No hay pedidos cancelados hoy'}
        </Alert>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Productos</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Pagos</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pedidosFiltrados.map((pedido) => (
                <TableRow key={pedido.id}>
                  <TableCell>{pedido.id}</TableCell>
                  <TableCell>{formatearFechaHora(pedido.fecha)}</TableCell>
                  <TableCell>{pedido.nombre}</TableCell>
                  <TableCell>{pedido.nombre_usuario}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {pedido.productos?.filter(p => !p.anulado).map((p, i) => (
                        <Chip key={i} label={`${p.cantidad}x ${p.nombre}`} size="small" variant="outlined" />
                      )) || '-'}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    ${Number(pedido.total || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {pedido.pagos?.map((pago, index) => (
                        <Chip
                          key={index}
                          label={`$${Number(pago.monto).toFixed(2)}`}
                          color={getPaymentMethodColor(pago.metodo)}
                          icon={
                            pago.metodo.toLowerCase() === 'efectivo' ? <MoneyIcon /> :
                            pago.metodo.toLowerCase() === 'tarjeta' ? <CreditCardIcon /> :
                            pago.metodo.toLowerCase() === 'qr' ? <QrCodeIcon /> :
                            <LanguageIcon />
                          }
                          size="small"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Imprimir cuenta">
                      <IconButton
                        size="small"
                        onClick={() => setSelectedPedidoForPrint(pedido)}
                      >
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedPedidoForPrint && (
        <CuentaModal
          open={!!selectedPedidoForPrint}
          onClose={() => setSelectedPedidoForPrint(null)}
          productos={selectedPedidoForPrint.productos || []}
          total={selectedPedidoForPrint.total || 0}
          nombrePedido={selectedPedidoForPrint.nombre}
          onSuccess={() => setSuccess('Cuenta impresa correctamente')}
          onError={(msg) => setError(msg)}
        />
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success">{success}</Alert>
      </Snackbar>
    </Paper>
  );
};

export default PedidosCancelados;
