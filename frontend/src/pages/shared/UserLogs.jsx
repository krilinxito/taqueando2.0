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
  Button,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../../context/AuthContext';
import logsApi from '../../API/logsApi';

const UserLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    fechaInicio: null,
    fechaFin: null,
    usuario: '',
    accion: ''
  });
  const [usuarios, setUsuarios] = useState([]);
  const [logsFiltrados, setLogsFiltrados] = useState([]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (user?.rol === 'admin') {
        response = await logsApi.obtenerLogs();
      } else {
        // Para usuarios regulares, solo obtener sus propios logs
        response = await logsApi.obtenerLogs();
      }
      
      // Convertir la respuesta a un array si es un objeto único
      const logsData = Array.isArray(response.logs) ? response.logs : [response.logs];
      
      // Transformar los datos para que coincidan con el formato esperado
      const logsFormateados = logsData.map(log => ({
        fecha: log.login_date || log.fecha,
        nombre_usuario: log.nombre || log.nombre_usuario,
        accion: log.accion || 'Inicio de sesión',
        detalles: `${log.email} - ${log.user_agent} - ${log.ip_address}`
      })).filter(log => log.fecha); // Filtrar logs sin fecha

      console.log('Logs formateados:', logsFormateados);
      
      setLogs(logsFormateados);
      
      // Extraer usuarios únicos para el filtro (solo para admin)
      if (user?.rol === 'admin') {
        const usuariosUnicos = [...new Set(logsFormateados.map(log => log.nombre_usuario))].filter(Boolean);
        setUsuarios(usuariosUnicos);
      }
      
      aplicarFiltros(logsFormateados, filtros);
    } catch (error) {
      console.error('Error al obtener logs:', error);
      setError('Error al cargar los logs: ' + (error.message || 'Error desconocido'));
      setLogs([]);
      setLogsFiltrados([]);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = (logs, filtrosActuales) => {
    let resultados = [...logs];

    // Filtrar por fecha
    if (filtrosActuales.fechaInicio && filtrosActuales.fechaFin) {
      resultados = resultados.filter(log => {
        try {
          const fechaLog = new Date(log.fecha);
          const fechaInicio = new Date(filtrosActuales.fechaInicio);
          const fechaFin = new Date(filtrosActuales.fechaFin);

          fechaLog.setHours(0, 0, 0, 0);
          fechaInicio.setHours(0, 0, 0, 0);
          fechaFin.setHours(23, 59, 59, 999);

          return fechaLog >= fechaInicio && fechaLog <= fechaFin;
        } catch (error) {
          console.error('Error al filtrar por fecha:', error);
          return true;
        }
      });
    }

    // Filtrar por usuario (solo para admin)
    if (user?.rol === 'admin' && filtrosActuales.usuario) {
      resultados = resultados.filter(log => 
        log.nombre_usuario?.toLowerCase().includes(filtrosActuales.usuario.toLowerCase())
      );
    }

    // Filtrar por acción
    if (filtrosActuales.accion) {
      resultados = resultados.filter(log => 
        log.accion?.toLowerCase().includes(filtrosActuales.accion.toLowerCase())
      );
    }

    setTotal(resultados.length);
    
    // Aplicar paginación
    const inicio = page * rowsPerPage;
    const fin = inicio + rowsPerPage;
    setLogsFiltrados(resultados.slice(inicio, fin));
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  useEffect(() => {
    aplicarFiltros(logs, filtros);
  }, [filtros, page, rowsPerPage, logs]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFiltrar = () => {
    setPage(0);
    aplicarFiltros(logs, filtros);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      fechaInicio: null,
      fechaFin: null,
      usuario: '',
      accion: ''
    });
    setPage(0);
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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            {user?.rol === 'admin' ? 'Historial de Logs del Sistema' : 'Mi Historial de Actividad'}
          </Typography>

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
            {user?.rol === 'admin' && (
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <Autocomplete
                  options={usuarios}
                  value={filtros.usuario}
                  onChange={(event, newValue) => {
                    setFiltros(prev => ({ ...prev, usuario: newValue || '' }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Usuario"
                      size="small"
                      fullWidth
                    />
                  )}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Acción"
                value={filtros.accion}
                onChange={(e) => setFiltros(prev => ({ ...prev, accion: e.target.value }))}
              />
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
                <IconButton onClick={fetchLogs}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>

          {/* Tabla de Logs */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      {user?.rol === 'admin' && <TableCell>Usuario</TableCell>}
                      <TableCell>Acción</TableCell>
                      <TableCell>Detalles</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logsFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={user?.rol === 'admin' ? 4 : 3} align="center">
                          No hay registros que coincidan con los filtros
                        </TableCell>
                      </TableRow>
                    ) : (
                      logsFiltrados.map((log, index) => (
                        <TableRow key={index}>
                          <TableCell>{formatearFecha(log.fecha)}</TableCell>
                          {user?.rol === 'admin' && (
                            <TableCell>{log.nombre_usuario}</TableCell>
                          )}
                          <TableCell>{log.accion}</TableCell>
                          <TableCell>{log.detalles}</TableCell>
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
            </>
          )}
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default UserLogs; 
