// --- IMPORTS ORIGINALES --- //
import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Modal,
  Button,
  Chip,
  Divider
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import ScheduleIcon from '@mui/icons-material/Schedule';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { obtenerTodasLasEstadisticas, obtenerIngresosHistoricos } from '../../API/estadisticaApi';


// COLORES PIE
const metodoPagoColors = ['#6366F1', '#22C55E', '#F97316', '#0EA5E9', '#EC4899'];

// MODAL STYLE
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 1200,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 2,
  height: '80vh',
  display: 'flex',
  flexDirection: 'column'
};


// =======================================
//          COMPONENTE PRINCIPAL
// =======================================

const Estadisticas = () => {

  // ---- ESTADOS ---- //
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [ingresosHistoricos, setIngresosHistoricos] = useState([]);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedChart, setSelectedChart] = useState(null);

  // ---- EXTRACCIÓN DE DATOS ---- //
  const resumen = stats?.resumen || {};
  const ingresosData = stats?.ingresos || [];
  const tendenciaData = stats?.tendencia || [];
  const ventasPorHoraData = stats?.ventasPorHora || [];
  const metodosPagoData = stats?.metodosPago || [];
  const productosMasVendidos = stats?.productosMasVendidos || [];
  const comparativaSemanal = stats?.comparativaSemanal || [];

  const horaPico = resumen?.horaPico;
  const mejorDia = resumen?.mejorDia;
  const tiempoPromedioCierre = stats?.tiempoPromedioCierre || 0;

  // ---- MODAL ---- //
  const handleOpenModal = (chartType, title) => {
    setSelectedChart({ type: chartType, title });
    setModalOpen(true);
  };
  const handleCloseModal = () => setModalOpen(false);

  // ---- FETCH ---- //
  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, historicosData] = await Promise.all([
        obtenerTodasLasEstadisticas(),
        obtenerIngresosHistoricos(page + 1, rowsPerPage)
      ]);
      setStats(statsData);
      setIngresosHistoricos(historicosData.ingresos);
      setTotalIngresos(historicosData.total);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, rowsPerPage]);

  // ---- FORMATOS ---- //
  const formatMonto = (m) => Number(m || 0).toFixed(2);
  const formatCurrency = (v) => `$${formatMonto(v)}`;
  const formatPercentage = (v) => `${v > 0 ? '+' : ''}${Number(v || 0).toFixed(1)}%`;

  const getTrendIndicator = (value) => {
    if (value > 0) return { Icon: ArrowDropUpIcon, color: 'success.main' };
    if (value < 0) return { Icon: ArrowDropDownIcon, color: 'error.main' };
    return { Icon: TrendingFlatIcon, color: 'text.secondary' };
  };

  // ---- CARDS RESUMEN ---- //
  const resumenCards = [
    {
      key: 'ingresos',
      title: 'Ingresos semanales',
      value: resumen.ingresosSemana,
      formatter: formatCurrency,
      helper: 'vs semana anterior',
      trend: resumen.variacionIngresos
    },
    {
      key: 'pedidos',
      title: 'Pedidos semanales',
      value: resumen.pedidosSemana,
      formatter: (v) => v || 0,
      helper: 'vs semana anterior',
      trend: resumen.variacionPedidos
    },
    {
      key: 'ticket',
      title: 'Ticket promedio',
      value: resumen.ticketPromedio,
      formatter: formatCurrency,
      helper: `Promedio diario: ${formatCurrency(resumen.promedioDiario || 0)}`,
      trend: null
    },
    {
      key: 'usuarios',
      title: 'Usuarios activos',
      value: resumen.usuariosActivos,
      formatter: (v) => v || 0,
      helper: 'Usuarios activos esta semana',
      trend: null
    }
  ];

  // ---- UI ---- //

  if (loading)
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  if (error)
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

  if (!stats) return null;


  // =======================================
  //               RENDER
  // =======================================

  return (
    <Box sx={{ p: 2 }}>

      {/* TOP BAR */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Dashboard de Estadísticas</Typography>
        <Tooltip title="Actualizar">
          <IconButton onClick={fetchData}><RefreshIcon /></IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={2}>

        {/* -------------------- CARDS RESUMEN -------------------- */}
        {resumenCards.map((card) => {
          const trend = card.trend !== null ? getTrendIndicator(card.trend) : null;

          return (
            <Grid item xs={12} sm={6} md={3} key={card.key}>
              <Card sx={{ p: 1 }}>
                <CardContent sx={{ p: 1 }}>
                  <Typography variant="subtitle2">{card.title}</Typography>

                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 1
                  }}>
                    <Typography variant="h5">
                      {card.formatter(card.value)}
                    </Typography>

                    {trend && (
                      <Box sx={{ display: 'flex', alignItems: 'center', color: trend.color }}>
                        <trend.Icon />
                        <Typography variant="body2" sx={{ ml: .3 }}>
                          {formatPercentage(card.trend)}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    {card.helper}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}

        {/* -------------------- TENDENCIA 30 DÍAS -------------------- */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 340 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Tendencia últimos 30 días</Typography>

            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={tendenciaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip />
                <Legend />
                <Area dataKey="total" stroke="#6366F1" fill="#6366F1" fillOpacity={0.25} name="Ingresos ($)" yAxisId="left" />
                <Area dataKey="total_pedidos" stroke="#22C55E" fill="#22C55E" fillOpacity={0.15} name="Pedidos" yAxisId="right" />
              </AreaChart>
            </ResponsiveContainer>

          </Paper>
        </Grid>

        {/* -------------------- MÉTODOS DE PAGO -------------------- */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 340 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Métodos de pago</Typography>

            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={metodosPagoData} dataKey="total" nameKey="metodo" innerRadius={45} outerRadius={70}>
                  {metodosPagoData.map((_, i) => (
                    <Cell key={i} fill={metodoPagoColors[i % metodoPagoColors.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* LEYENDA */}
            <Box sx={{ mt: 1 }}>
              {metodosPagoData.map((m, i) => (
                <Box key={m.metodo} sx={{ display: 'flex', justifyContent: 'space-between', mb: .5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 10, height: 10, borderRadius: '50%',
                      bgcolor: metodoPagoColors[i % metodoPagoColors.length]
                    }} />
                    <Typography variant="body2">{m.metodo}</Typography>
                  </Box>
                  <Typography variant="body2">{formatCurrency(m.total)}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* -------------------- INGRESOS SEMANALES -------------------- */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 340 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Ingresos semanales</Typography>
              <IconButton size="small" onClick={() => handleOpenModal('ingresos', 'Ingresos Semanales')}>
                <FullscreenIcon />
              </IconButton>
            </Box>

            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={ingresosData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line dataKey="total" stroke="#6366F1" strokeWidth={2} name="Ingresos ($)" />
                <Line dataKey="total_pedidos" stroke="#22C55E" strokeWidth={2} name="Pedidos" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* -------------------- COMPARATIVA SEMANAL -------------------- */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 340 }}>
            <Typography variant="h6" gutterBottom>Comparativa Semanal</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Periodo</TableCell>
                  <TableCell align="right">Pedidos</TableCell>
                  <TableCell align="right">Ventas ($)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comparativaSemanal.map((row) => (
                  <TableRow key={row.periodo}>
                    <TableCell>{row.periodo}</TableCell>
                    <TableCell align="right">{row.total_pedidos}</TableCell>
                    <TableCell align="right">${formatMonto(row.total_ventas)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* -------------------- VENTAS POR HORA -------------------- */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 360 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6">Ventas por Hora</Typography>
              <IconButton size="small" onClick={() => handleOpenModal('ventasHora', 'Ventas por Hora')}>
                <FullscreenIcon />
              </IconButton>
            </Box>

            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={ventasPorHoraData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="total_ventas" fill="#6366F1" />
                <Bar dataKey="total_pedidos" fill="#22C55E" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* -------------------- PRODUCTOS MÁS VENDIDOS -------------------- */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 360 }}>
            <Typography variant="h6" gutterBottom>Productos Más Vendidos</Typography>

            <TableContainer sx={{ maxHeight: 280 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Ingresos ($)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productosMasVendidos.length > 0 ? (
                    productosMasVendidos.map((prod) => (
                      <TableRow key={prod.nombre}>
                        <TableCell>{prod.nombre}</TableCell>
                        <TableCell align="right">{prod.cantidad_total}</TableCell>
                        <TableCell align="right">${formatMonto(prod.ingresos_total)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={3} align="center">Sin datos</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

          </Paper>
        </Grid>

        {/* -------------------- HISTORIAL DE INGRESOS -------------------- */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Historial de Ingresos</Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell align="right">Pedidos</TableCell>
                    <TableCell align="right">Ingresos</TableCell>
                    <TableCell align="right">Promedio</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ingresosHistoricos.map((i) => (
                    <TableRow key={i.fecha}>
                      <TableCell>{new Date(i.fecha).toLocaleDateString()}</TableCell>
                      <TableCell align="right">{i.total_pedidos}</TableCell>
                      <TableCell align="right">${formatMonto(i.total)}</TableCell>
                      <TableCell align="right">${formatMonto(i.total / i.total_pedidos)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={totalIngresos}
              page={page}
              onPageChange={(e, np) => setPage(np)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Filas por página"
            />

          </Paper>
        </Grid>

      </Grid>


      {/* -------------------- MODAL FULLSCREEN -------------------- */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6">{selectedChart?.title}</Typography>
            <Button onClick={handleCloseModal}>Cerrar</Button>
          </Box>

          <ResponsiveContainer width="100%" height="100%">
            {selectedChart?.type === 'ingresos' && (
              <LineChart data={ingresosData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line dataKey="total" stroke="#6366F1" strokeWidth={2} />
                <Line dataKey="total_pedidos" stroke="#22C55E" strokeWidth={2} />
              </LineChart>
            )}

            {selectedChart?.type === 'ventasHora' && (
              <BarChart data={ventasPorHoraData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="total_ventas" fill="#6366F1" />
                <Bar dataKey="total_pedidos" fill="#22C55E" />
              </BarChart>
            )}
          </ResponsiveContainer>

        </Box>
      </Modal>

    </Box>
  );
};

export default Estadisticas;
