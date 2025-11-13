import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  TextField
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import { obtenerArqueosPorFecha } from '../API/arqueoApi';

const ArqueosLista = () => {
  const [arqueos, setArqueos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());

  // Función para obtener fecha en formato YYYY-MM-DD en UTC
  const obtenerFechaFormateada = (fecha) => {
    try {
      // Asegurarnos de que la fecha sea un objeto Date
      const fechaObj = new Date(fecha);
      if (isNaN(fechaObj.getTime())) {
        throw new Error('Fecha inválida');
      }

      // Ajustar la fecha a UTC+1 para compensar la conversión del backend
      const fechaAjustada = new Date(fechaObj);
      fechaAjustada.setDate(fechaAjustada.getDate() + 1);
      
      // Obtener los componentes de la fecha
      const anio = fechaAjustada.getFullYear();
      const mes = String(fechaAjustada.getMonth() + 1).padStart(2, '0');
      const dia = String(fechaAjustada.getDate()).padStart(2, '0');

      // Crear la fecha en formato YYYY-MM-DD
      return `${anio}-${mes}-${dia}`;
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return '';
    }
  };

  // Función para formatear hora
  const formatearHora = (fecha) => {
    try {
      // Crear fecha en UTC
      const fechaUTC = new Date(fecha);
      
      // Restar 4 horas para ajustar a la zona horaria de La Paz (UTC-4)
      fechaUTC.setHours(fechaUTC.getHours() - 4);
      
      return fechaUTC.toLocaleTimeString('es-BO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formateando hora:', error);
      return 'Hora inválida';
    }
  };

  const fetchArqueos = async (fecha) => {
    setLoading(true);
    setError(null);
    try {
      const fechaFormateada = obtenerFechaFormateada(fecha);
      if (!fechaFormateada) {
        throw new Error('Fecha inválida');
      }

      const data = await obtenerArqueosPorFecha(fechaFormateada);
      
      if (!Array.isArray(data)) {
        console.error('Respuesta inválida de la API:', data);
        throw new Error('Formato de respuesta inválido');
      }

      // Ordenar por fecha descendente
      const arqueosOrdenados = data.sort((a, b) => 
        new Date(b.fecha) - new Date(a.fecha)
      );
      
      setArqueos(arqueosOrdenados);
    } catch (error) {
      console.error('Error al cargar arqueos:', error);
      let mensajeError = 'Error al cargar los arqueos';
      
      if (error.message === 'Se requiere iniciar sesión' || 
          error.message === 'Sesión expirada, por favor inicie sesión nuevamente') {
        mensajeError = error.message;
      } else if (error.response?.status === 401) {
        mensajeError = 'Su sesión ha expirado, por favor inicie sesión nuevamente';
      } else if (error.response?.data?.message) {
        mensajeError = error.response.data.message;
      }
      
      setError(mensajeError);
      setArqueos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArqueos(fechaSeleccionada);
  }, [fechaSeleccionada]);

  const formatMonto = (monto) => {
    const numero = Number(monto);
    return isNaN(numero) ? '0.00' : numero.toFixed(2);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Paper sx={{ p: 3, m: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Historial de Arqueos
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DatePicker
              label="Seleccionar fecha"
              value={fechaSeleccionada}
              onChange={(newValue) => {
                if (newValue && !isNaN(newValue.getTime())) {
                  // Establecer la hora a mediodía para evitar problemas con cambios de día
                  const fecha = new Date(newValue);
                  fecha.setHours(12, 0, 0, 0);
                  setFechaSeleccionada(fecha);
                }
              }}
              slotProps={{ 
                textField: { 
                  size: "small",
                  helperText: "Seleccione una fecha para ver los arqueos"
                }
              }}
              format="dd/MM/yyyy"
            />
            <Tooltip title="Actualizar">
              <IconButton onClick={() => fetchArqueos(fechaSeleccionada)}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && arqueos.length === 0 ? (
          <Alert severity="info">
            No hay arqueos registrados para esta fecha
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Hora</TableCell>
                  <TableCell align="right">Total Contado</TableCell>
                  <TableCell align="right">Caja Chica</TableCell>
                  <TableCell align="right">Total Sistema</TableCell>
                  <TableCell align="right">Diferencia</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Observaciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {arqueos.map((arqueo) => (
                  <TableRow key={arqueo.id}>
                    <TableCell>
                      {formatearHora(arqueo.fecha)}
                    </TableCell>
                    <TableCell align="right">
                      ${formatMonto(arqueo.total_contado)}
                    </TableCell>
                    <TableCell align="right">
                      ${formatMonto(arqueo.caja_chica)}
                    </TableCell>
                    <TableCell align="right">
                      ${formatMonto(arqueo.total_sistema)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        color={arqueo.diferencia === 0 ? 'success.main' : 'error.main'}
                      >
                        ${formatMonto(arqueo.diferencia)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={arqueo.estado}
                        color={
                          arqueo.estado === 'cuadrado' ? 'success' :
                          arqueo.estado === 'sobrante' ? 'warning' : 'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{arqueo.nombre_usuario}</TableCell>
                    <TableCell>{arqueo.observaciones}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </LocalizationProvider>
  );
};

export default ArqueosLista; 
