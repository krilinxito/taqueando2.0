import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  InputAdornment,
  Box,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { obtenerTodosLosPedidos } from '../../API/pedidosApi';

const ESTADOS = ['pendiente', 'completado', 'cancelado', 'pagado'];

const HistorialPedidos = () => {
  const [allPedidos, setAllPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    fechaInicio: null,
    fechaFin: null,
    estado: '',
    usuario: '',
    nombrePedido: '',
  });

  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { pedidos } = await obtenerTodosLosPedidos();
      setAllPedidos(pedidos);
    } catch (err) {
      console.error('Error al obtener pedidos:', err);
      setError('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  const pedidosFiltradosPorEstado = useMemo(() => {
    let resultado = [...allPedidos];

    if (filtros.fechaInicio && filtros.fechaFin) {
      const inicio = new Date(filtros.fechaInicio);
      const fin = new Date(filtros.fechaFin);
      inicio.setHours(0, 0, 0, 0);
      fin.setHours(23, 59, 59, 999);

      resultado = resultado.filter((pedido) => {
        const fechaPedido = new Date(pedido.fecha);
        return fechaPedido >= inicio && fechaPedido <= fin;
      });
    }

    if (filtros.estado) {
      resultado = resultado.filter(
        (pedido) =>
          pedido.estado?.toLowerCase() === filtros.estado.toLowerCase()
      );
    }

    if (filtros.usuario) {
      resultado = resultado.filter((pedido) =>
        pedido.nombre_usuario
          ?.toLowerCase()
          .includes(filtros.usuario.toLowerCase())
      );
    }

    if (filtros.nombrePedido) {
      resultado = resultado.filter((pedido) =>
        (pedido.nombre_pedido || pedido.nombre || '')
          .toLowerCase()
          .includes(filtros.nombrePedido.toLowerCase())
      );
    }

    return resultado;
  }, [allPedidos, filtros]);

  useEffect(() => {
    const inicio = page * rowsPerPage;
    const fin = inicio + rowsPerPage;
    setPedidosFiltrados(pedidosFiltradosPorEstado.slice(inicio, fin));
    setTotal(pedidosFiltradosPorEstado.length);
  }, [pedidosFiltradosPorEstado, page, rowsPerPage]);

  const handleFiltro = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
    setPage(0);
  };

  const resetFiltros = () => {
    setFiltros({
      fechaInicio: null,
      fechaFin: null,
      estado: '',
      usuario: '',
      nombrePedido: '',
    });
    setPage(0);
  };

  const formatFecha = (value) => {
    try {
      return new Date(value).toLocaleString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '—';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Historial de Pedidos
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <DatePicker
              label="Fecha inicio"
              value={filtros.fechaInicio}
              onChange={(value) => handleFiltro('fechaInicio', value)}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <DatePicker
              label="Fecha fin"
              value={filtros.fechaFin}
              onChange={(value) => handleFiltro('fechaFin', value)}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Estado"
              value={filtros.estado}
              onChange={(e) => handleFiltro('estado', e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {ESTADOS.map((estado) => (
                <MenuItem key={estado} value={estado}>
                  {estado.charAt(0).toUpperCase() + estado.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Usuario"
              value={filtros.usuario}
              onChange={(e) => handleFiltro('usuario', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Nombre del pedido"
              value={filtros.nombrePedido}
              onChange={(e) => handleFiltro('nombrePedido', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid
            size={{ xs: 12, sm: 6, md: 2 }}
            sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
          >
            <Button variant="contained" onClick={() => setPage(0)}>
              Aplicar
            </Button>
            <Button variant="outlined" onClick={resetFiltros}>
              Limpiar
            </Button>
            <Tooltip title="Actualizar">
              <IconButton onClick={fetchPedidos}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell align="right">Total (aprox.)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pedidosFiltrados.map((pedido) => (
                    <TableRow key={pedido.id}>
                      <TableCell>{pedido.id}</TableCell>
                      <TableCell>{pedido.nombre || pedido.nombre_pedido}</TableCell>
                      <TableCell>{pedido.nombre_usuario || '—'}</TableCell>
                      <TableCell>
                        {pedido.estado
                          ? pedido.estado.charAt(0).toUpperCase() +
                            pedido.estado.slice(1)
                          : '—'}
                      </TableCell>
                      <TableCell>{formatFecha(pedido.fecha)}</TableCell>
                      <TableCell align="right">
                        ${Number(pedido.total || pedido.total_pagado || 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!pedidosFiltrados.length && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No hay pedidos que coincidan con los filtros seleccionados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={total}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}
      </Paper>
    </LocalizationProvider>
  );
};

export default HistorialPedidos;
