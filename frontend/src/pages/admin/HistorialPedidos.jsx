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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import { obtenerTodosLosPedidos } from '../../API/pedidosApi';
import { formatearFechaHora } from '../../utils/fecha';

const HistorialPedidos = () => {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [filtros, setFiltros] = useState(() => {
    return {
      fechaInicio: null,
      fechaFin: null,
      estado: '',
      busqueda: ''
    };
  });
  const [error, setError] = useState(null);
  const [allPedidos, setAllPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);

  const estados = ['pendiente', 'cancelado'];

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

    if (filtrosActuales.fechaInicio && filtrosActuales.fechaFin) {
      resultados = resultados.filter(pedido => {
        try {
          const fechaPedido = new Date(pedido.fecha);
          const fechaInicio = new Date(filtrosActuales.fechaInicio);
          const fechaFin = new Date(filtrosActuales.fechaFin);

          fechaPedido.setHours(0, 0, 0, 0);
          fechaInicio.setHours(0, 0, 0, 0);
          fechaFin.setHours(23, 59, 59, 999);

          return fechaPedido >= fechaInicio && fechaPedido <= fechaFin;
        } catch (error) {
          console.error('Error al filtrar por fecha:', error);
          return true;
        }
      });
    }

    if (filtrosActuales.estado) {
      resultados = resultados.filter(pedido =>
        pedido.estado?.toLowerCase() === filtrosActuales.estado.toLowerCase()
      );
    }

    if (filtrosActuales.busqueda) {
      const termino = filtrosActuales.busqueda.toLowerCase();
      resultados = resultados.filter(pedido => {
        const nombre = (pedido.nombre_pedido || pedido.nombre || '').toLowerCase();
        const productos = (pedido.productos || '').toLowerCase();
        const metodos = (pedido.metodos_pago || '').toLowerCase();
        return nombre.includes(termino) || productos.includes(termino) || metodos.includes(termino);
      });
    }

    setTotal(resultados.length);

    const inicio = page * rowsPerPage;
    const fin = inicio + rowsPerPage;
    setPedidosFiltrados(resultados.slice(inicio, fin));
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  useEffect(() => {
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
      busqueda: ''
    });
    setPage(0);
  };

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: 'warning',
      cancelado: 'success',
    };
    return colores[estado] || 'default';
  };

  const formatearFecha = formatearFechaHora;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Historial de Pedidos
          </Typography>

          {/* Búsqueda */}
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por nombre, producto o método de pago..."
            value={filtros.busqueda}
            onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
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

          {/* Filtros */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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
            <Grid size={{ xs: 12, md: 2 }} sx={{ display: 'flex', gap: 1 }}>
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
                  <TableCell>Productos</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Pagos</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">Cargando...</TableCell>
                  </TableRow>
                ) : pedidosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">No hay pedidos que coincidan con los filtros</TableCell>
                  </TableRow>
                ) : (
                  pedidosFiltrados.map((pedido) => (
                    <TableRow key={pedido.id}>
                      <TableCell>{pedido.id}</TableCell>
                      <TableCell>{formatearFecha(pedido.fecha)}</TableCell>
                      <TableCell>{pedido.nombre_pedido || pedido.nombre}</TableCell>
                      <TableCell>{pedido.nombre_usuario}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {pedido.productos ? pedido.productos.split(',').map((prod, i) => (
                            <Chip key={i} label={prod.trim()} size="small" variant="outlined" />
                          )) : '-'}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        ${Number(pedido.total_pagado || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {pedido.metodos_pago ? pedido.metodos_pago.split(',').map((metodo, i) => (
                            <Chip key={i} label={metodo.trim()} size="small" color="primary" variant="outlined" />
                          )) : '-'}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={pedido.estado}
                          color={getEstadoColor(pedido.estado)}
                          size="small"
                        />
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
      </Paper>
    </LocalizationProvider>
  );
};

export default HistorialPedidos;
