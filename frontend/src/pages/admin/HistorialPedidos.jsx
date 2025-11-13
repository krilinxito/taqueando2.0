import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Box,
  Typography,
  Grid,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';
import { obtenerTodosLosPedidos } from '../../API/pedidosApi';
import ProductosModal from '../../store/ProductosModal';
import PagosModal from '../../store/PagosModal';
import contieneApi from '../../API/contieneApi';
import { pagoApi } from '../../API/pagoApi';

const HistorialPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [filtros, setFiltros] = useState(() => {
    return {
      fechaInicio: null,
      fechaFin: null,
      estado: '',
      usuario: ''
    };
  });
  const [error, setError] = useState(null);
  const [productosModalOpen, setProductosModalOpen] = useState(false);
  const [pagosModalOpen, setPagosModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [allPedidos, setAllPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);

  const estados = ['pendiente', 'completado', 'cancelado', 'pagado'];

  const formatearFechaParaFiltro = (fecha) => {
    if (!fecha) return null;
    try {
      // Obtener los componentes de la fecha en la zona horaria local
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      
      // Formatear como YYYY-MM-DD
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formateando fecha para filtro:', error);
      return null;
    }
  };

  const fetchPedidos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await obtenerTodosLosPedidos();
      const pedidos = response.pedidos || [];
      setAllPedidos(pedidos);
      aplicarFiltros(pedidos, filtros);
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      let mensajeError = 'Error al cargar los pedidos';
      if (error.response) {
        if (error.response.status === 500) {
          mensajeError = 'Error interno del servidor. Por favor, intente más tarde.';
        } else if (error.response.data?.message) {
          mensajeError = error.response.data.message;
        }
      }
      setError(mensajeError);
      setAllPedidos([]);
      setPedidosFiltrados([]);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = (pedidos, filtrosActuales) => {
    let resultados = [...pedidos];

    // Solo aplicar filtros de fecha si ambas fechas están presentes
    if (filtrosActuales.fechaInicio && filtrosActuales.fechaFin) {
      resultados = resultados.filter(pedido => {
        try {
          const fechaPedido = new Date(pedido.fecha);
          const fechaInicio = new Date(filtrosActuales.fechaInicio);
          const fechaFin = new Date(filtrosActuales.fechaFin);

          // Ajustar las fechas para ignorar las horas
          fechaPedido.setHours(0, 0, 0, 0);
          fechaInicio.setHours(0, 0, 0, 0);
          fechaFin.setHours(23, 59, 59, 999);

          return fechaPedido >= fechaInicio && fechaPedido <= fechaFin;
        } catch (error) {
          console.error('Error al filtrar por fecha:', error);
          return true; // Si hay error, incluir el pedido
        }
      });
    }

    if (filtrosActuales.estado) {
      resultados = resultados.filter(pedido => 
        pedido.estado?.toLowerCase() === filtrosActuales.estado.toLowerCase()
      );
    }

    if (filtrosActuales.usuario) {
      resultados = resultados.filter(pedido => 
        pedido.nombre_usuario?.toLowerCase().includes(filtrosActuales.usuario.toLowerCase())
      );
    }

    // Guardar el total antes de aplicar la paginación
    setTotal(resultados.length);

    // Aplicar paginación
    const inicio = page * rowsPerPage;
    const fin = inicio + rowsPerPage;
    setPedidosFiltrados(resultados.slice(inicio, fin));
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  useEffect(() => {
    // Aplicar filtros cuando cambien los filtros o la paginación
    aplicarFiltros(allPedidos, filtros);
  }, [filtros, page, rowsPerPage, allPedidos]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFiltrar = () => {
    setPage(0);
    aplicarFiltros(allPedidos, filtros);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      fechaInicio: null,
      fechaFin: null,
      estado: '',
      usuario: ''
    });
    setPage(0);
  };

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: 'warning',
      completado: 'success',
      cancelado: 'error',
      pagado: 'info'
    };
    return colores[estado] || 'default';
  };

  const formatearFecha = (fecha) => {
    try {
      return new Date(fecha).toLocaleString('es-BO', {
        timeZone: 'America/La_Paz',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha inválida';
    }
  };

  const handleViewProducts = async (order) => {
    try {
      const productosRes = await contieneApi.obtenerProductosDePedido(order.id);
      const productos = productosRes?.data?.productos || [];
      if (!Array.isArray(productos)) {
        console.error('Productos no es un array:', productos);
        return;
      }
      setSelectedOrder({
        ...order,
        productos
      });
      setProductosModalOpen(true);
    } catch (error) {
      console.error('Error al obtener productos:', error);
    }
  };

  const handleViewPayments = async (order) => {
    try {
      const [productosRes, pagosRes] = await Promise.all([
        contieneApi.obtenerProductosDePedido(order.id),
        pagoApi.obtenerPagosDePedido(order.id)
      ]);

      const productos = productosRes?.data?.productos || [];
      let pagos = pagosRes?.data || [];
      
      // Asegurarnos de que pagos sea un array
      if (!Array.isArray(pagos)) {
        console.error('Pagos no es un array:', pagos);
        pagos = [];
      }

      // Normalizar los IDs de los pagos
      pagos = pagos.map(pago => ({
        ...pago,
        id_pedido: pago.id_pedido || pago.idPedido,
        idPedido: pago.id_pedido || pago.idPedido
      }));

      // Filtrar pagos que corresponden a este pedido
      pagos = pagos.filter(pago => {
        const pagoId = pago.id_pedido || pago.idPedido;
        return pagoId === order.id;
      });

      // Calcular el total del pedido
      const total = productos.reduce((sum, p) => {
        if (p.anulado) return sum;
        return sum + (Number(p.precio || 0) * Number(p.cantidad || 0));
      }, 0);

      // Calcular el total pagado y cambios
      const pagosConCambio = pagos.map(pago => {
        const montoEntregado = Number(pago.monto_entregado || pago.montoEntregado || 0);
        const monto = Number(pago.monto || 0);
        
        if (pago.metodo === 'efectivo' && montoEntregado > monto) {
          return {
            ...pago,
            monto_entregado: montoEntregado,
            montoEntregado: montoEntregado,
            cambio: montoEntregado - monto
          };
        }
        return {
          ...pago,
          monto_entregado: montoEntregado,
          montoEntregado: montoEntregado
        };
      });

      const totalPagado = pagosConCambio.reduce((sum, p) => sum + Number(p.monto || 0), 0);

      console.log('Pagos encontrados:', {
        pedidoId: order.id,
        pagosOriginales: pagosRes?.data,
        pagosFiltrados: pagos,
        pagosConCambio,
        total,
        totalPagado
      });

      setSelectedOrder({
        ...order,
        pagos: pagosConCambio,
        total,
        totalPagado
      });
      setPagosModalOpen(true);
    } catch (error) {
      console.error('Error al obtener pagos:', error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Historial de Pedidos
          </Typography>
          
          {/* Filtros */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid container={12} sm={6} md={3}>
              <DatePicker
                label="Fecha inicio"
                value={filtros.fechaInicio}
                onChange={(newValue) => setFiltros(prev => ({ ...prev, fechaInicio: newValue }))}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    size: "small"
                  }
                }}
              />
            </Grid>
            <Grid container={12} sm={6} md={3}>
              <DatePicker
                label="Fecha fin"
                value={filtros.fechaFin}
                onChange={(newValue) => setFiltros(prev => ({ ...prev, fechaFin: newValue }))}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    size: "small"
                  }
                }}
              />
            </Grid>
            <Grid container={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Estado"
                value={filtros.estado}
                onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
              >
                <MenuItem value="">Todos</MenuItem>
                {estados.map((estado) => (
                  <MenuItem key={estado} value={estado}>
                    {estado.charAt(0).toUpperCase() + estado.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid container={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Usuario"
                value={filtros.usuario}
                onChange={(e) => setFiltros(prev => ({ ...prev, usuario: e.target.value }))}
              />
            </Grid>
            <Grid container={12} md={2} sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleFiltrar}
                startIcon={<SearchIcon />}
              >
                Filtrar
              </Button>
              <Button
                variant="outlined"
                onClick={handleLimpiarFiltros}
              >
                Limpiar
              </Button>
              <Tooltip title="Actualizar">
                <IconButton onClick={fetchPedidos}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>

          {/* Tabla */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">Cargando...</TableCell>
                  </TableRow>
                ) : pedidosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No hay pedidos que coincidan con los filtros</TableCell>
                  </TableRow>
                ) : (
                  pedidosFiltrados.map((pedido) => (
                    <TableRow key={pedido.id}>
                      <TableCell>{pedido.id}</TableCell>
                      <TableCell>{formatearFecha(pedido.fecha)}</TableCell>
                      <TableCell>{pedido.nombre_pedido || pedido.nombre}</TableCell>
                      <TableCell>{pedido.nombre_usuario}</TableCell>
                      <TableCell>
                        <Chip 
                          label={pedido.estado} 
                          color={getEstadoColor(pedido.estado)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver Productos">
                          <IconButton onClick={() => handleViewProducts(pedido)} size="small">
                            <ReceiptIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ver Pagos">
                          <IconButton onClick={() => handleViewPayments(pedido)} size="small">
                            <PaymentIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Filas por página"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
            }
          />
        </Box>

        {/* Modales */}
        {selectedOrder && (
          <>
            {productosModalOpen && (
              <ProductosModal
                open={productosModalOpen}
                onClose={() => {
                  setProductosModalOpen(false);
                  setSelectedOrder(null);
                }}
                productos={selectedOrder.productos || []}
                availableProducts={[]}
                selectedProduct=""
                setSelectedProduct={() => {}}
                cantidad={1}
                setCantidad={() => {}}
                readOnly={true}
              />
            )}

            {pagosModalOpen && (
              <PagosModal
                open={pagosModalOpen}
                onClose={() => {
                  setPagosModalOpen(false);
                  setSelectedOrder(null);
                }}
                pagos={selectedOrder.pagos || []}
                onAddPago={() => {}}
                totalPedido={selectedOrder.total || 0}
                totalPagado={selectedOrder.totalPagado || 0}
                readOnly={true}
              />
            )}
          </>
        )}
      </Paper>
    </LocalizationProvider>
  );
};

export default HistorialPedidos; 
