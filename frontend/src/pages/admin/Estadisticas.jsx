import React, { useEffect, useState, useCallback } from 'react';
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
  Divider,
  TextField,
  Stack
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import ScheduleIcon from '@mui/icons-material/Schedule';

import {
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
import { formatearFecha } from '../../utils/fecha';

const COLORS = {
  primary: '#6366F1',
  secondary: '#22C55E',
  tertiary: '#F97316',
  info: '#0EA5E9',
  pink: '#EC4899'
};
const metodoPagoColors = [COLORS.primary, COLORS.secondary, COLORS.tertiary, COLORS.info, COLORS.pink];

const dayNameMap = {
  Sunday: 'Dom', Monday: 'Lun', Tuesday: 'Mar', Wednesday: 'Mié',
  Thursday: 'Jue', Friday: 'Vie', Saturday: 'Sáb'
};

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
  borderRadius: 2,
  height: '80vh',
  display: 'flex',
  flexDirection: 'column'
};

const paperSx = { p: 2 };

const getPreset = (key) => {
  const hoy = new Date();
  const fmt = (d) => new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/La_Paz', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d);
  const hoyStr = fmt(hoy);

  switch (key) {
    case 'hoy': return { fechaInicio: hoyStr, fechaFin: hoyStr, label: 'de hoy' };
    case 'semana': {
      const day = hoy.getDay();
      const diff = day === 0 ? 6 : day - 1;
      const lunes = new Date(hoy);
      lunes.setDate(hoy.getDate() - diff);
      return { fechaInicio: fmt(lunes), fechaFin: hoyStr, label: 'semanales' };
    }
    case 'mes': {
      const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      return { fechaInicio: fmt(inicio), fechaFin: hoyStr, label: 'del mes' };
    }
    case '3meses': {
      const inicio = new Date(hoy);
      inicio.setDate(inicio.getDate() - 90);
      return { fechaInicio: fmt(inicio), fechaFin: hoyStr, label: 'de los últimos 3 meses' };
    }
    case 'todo': {
      return { fechaInicio: '2020-01-01', fechaFin: hoyStr, label: 'históricos' };
    }
    default: {
      const day = hoy.getDay();
      const diff = day === 0 ? 6 : day - 1;
      const lunes = new Date(hoy);
      lunes.setDate(hoy.getDate() - diff);
      return { fechaInicio: fmt(lunes), fechaFin: hoyStr, label: 'semanales' };
    }
  }
};

const CurrencyTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper sx={{ p: 1.5, borderRadius: 1 }} elevation={3}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      {payload.map((entry) => (
        <Typography key={entry.name} variant="body2" sx={{ color: entry.color }}>
          {entry.name}: {entry.name.includes('$') || entry.name.includes('Ingreso') || entry.name.includes('Venta')
            ? `$${Number(entry.value).toFixed(2)}`
            : entry.value}
        </Typography>
      ))}
    </Paper>
  );
};

const Estadisticas = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [ingresosHistoricos, setIngresosHistoricos] = useState([]);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedChart, setSelectedChart] = useState(null);

  const [fechaInicio, setFechaInicio] = useState(() => getPreset('semana').fechaInicio);
  const [fechaFin, setFechaFin] = useState(() => getPreset('semana').fechaFin);
  const [periodoLabel, setPeriodoLabel] = useState('semanales');
  const [presetActivo, setPresetActivo] = useState('semana');

  const resumen = stats?.resumen || {};
  const tendenciaData = stats?.tendencia || [];
  const ventasPorHoraData = stats?.ventasPorHora || [];
  const metodosPagoData = stats?.metodosPago || [];
  const productosMasVendidos = stats?.productosMasVendidos || [];
  const ventasPorDiaSemana = stats?.ventasPorDiaSemana || [];
  const gananciasPorSemana = stats?.gananciasPorSemana || [];
  const tiempoPromedioCierre = stats?.tiempoPromedioCierre || 0;

  const handleOpenModal = (chartType, title) => {
    setSelectedChart({ type: chartType, title });
    setModalOpen(true);
  };
  const handleCloseModal = () => setModalOpen(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, historicosData] = await Promise.all([
        obtenerTodasLasEstadisticas(fechaInicio || undefined, fechaFin || undefined),
        obtenerIngresosHistoricos(page + 1, rowsPerPage)
      ]);
      setStats(statsData);
      setIngresosHistoricos(historicosData.ingresos);
      setTotalIngresos(historicosData.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }, [fechaInicio, fechaFin, page, rowsPerPage]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePreset = (key) => {
    const { fechaInicio: fi, fechaFin: ff, label } = getPreset(key);
    setFechaInicio(fi);
    setFechaFin(ff);
    setPeriodoLabel(label);
    setPresetActivo(key);
  };

  const handleCustomDate = (field, value) => {
    setPresetActivo('custom');
    if (field === 'inicio') {
      setFechaInicio(value);
    } else {
      setFechaFin(value);
    }
    setPeriodoLabel('del periodo');
  };

  const formatMonto = (m) => Number(m || 0).toFixed(2);
  const formatCurrency = (v) => `$${formatMonto(v)}`;
  const formatPercentage = (v) => `${v > 0 ? '+' : ''}${Number(v || 0).toFixed(1)}%`;

  const getTrendIndicator = (value) => {
    if (value > 0) return { Icon: ArrowDropUpIcon, color: 'success.main' };
    if (value < 0) return { Icon: ArrowDropDownIcon, color: 'error.main' };
    return { Icon: TrendingFlatIcon, color: 'text.secondary' };
  };

  const ventasPorHoraFormatted = ventasPorHoraData.map(v => ({
    ...v,
    horaLabel: `${v.hora}hs`
  }));

  const ventasPorDiaSemanaFormatted = ventasPorDiaSemana.map(d => ({
    ...d,
    diaLabel: dayNameMap[d.nombre_dia] || d.nombre_dia
  }));

  const productosTop10 = productosMasVendidos.slice(0, 10);

  const resumenCards = [
    {
      key: 'ingresos',
      title: `Ingresos ${periodoLabel}`,
      value: resumen.ingresosSemana,
      formatter: formatCurrency,
      helper: 'vs periodo anterior',
      trend: resumen.variacionIngresos
    },
    {
      key: 'pedidos',
      title: `Pedidos ${periodoLabel}`,
      value: resumen.pedidosSemana,
      formatter: (v) => v || 0,
      helper: 'vs periodo anterior',
      trend: resumen.variacionPedidos
    },
    {
      key: 'ticket',
      title: 'Ticket promedio',
      value: resumen.ticketPromedio,
      formatter: formatCurrency,
      helper: 'vs periodo anterior',
      trend: resumen.variacionTicket
    },
    {
      key: 'tiempo',
      title: 'Tiempo promedio cierre',
      value: tiempoPromedioCierre,
      formatter: (v) => `${Math.round(v || 0)} min`,
      helper: 'desde pedido hasta pago',
      trend: null,
      icon: ScheduleIcon
    }
  ];

  const presets = [
    { key: 'hoy', label: 'Hoy' },
    { key: 'semana', label: 'Esta semana' },
    { key: 'mes', label: 'Este mes' },
    { key: '3meses', label: 'Últimos 3 meses' },
    { key: 'todo', label: 'Todo el historial' },
  ];

  if (loading && !stats)
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  if (error)
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

  if (!stats) return null;

  return (
    <Box sx={{ p: 2 }}>

      {/* TOP BAR */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Dashboard de Estadísticas</Typography>
        <Tooltip title="Actualizar">
          <IconButton onClick={fetchData} disabled={loading}><RefreshIcon /></IconButton>
        </Tooltip>
      </Box>

      {/* FILTRO DE FECHAS */}
      <Paper sx={{ ...paperSx, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" flexWrap="wrap">
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {presets.map((p) => (
              <Chip
                key={p.key}
                label={p.label}
                variant={presetActivo === p.key ? 'filled' : 'outlined'}
                color={presetActivo === p.key ? 'primary' : 'default'}
                onClick={() => handlePreset(p.key)}
                size="small"
              />
            ))}
          </Stack>
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              type="date"
              label="Desde"
              size="small"
              value={fechaInicio}
              onChange={(e) => handleCustomDate('inicio', e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ width: 160 }}
            />
            <TextField
              type="date"
              label="Hasta"
              size="small"
              value={fechaFin}
              onChange={(e) => handleCustomDate('fin', e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ width: 160 }}
            />
          </Stack>
          {loading && <CircularProgress size={20} />}
        </Stack>
      </Paper>

      <Grid container spacing={2}>

        {/* ---- ROW 1: 4 KPI CARDS ---- */}
        {resumenCards.map((card) => {
          const trend = card.trend !== null && card.trend !== undefined ? getTrendIndicator(card.trend) : null;
          const CardIcon = card.icon;

          return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.key}>
              <Card sx={{ p: 1 }}>
                <CardContent sx={{ p: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">{card.title}</Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
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

                    {CardIcon && (
                      <CardIcon sx={{ color: COLORS.primary, fontSize: 28 }} />
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

        {/* ---- ROW 2: TENDENCIA UNIFICADA ---- */}
        <Grid size={12}>
          <Paper sx={{ ...paperSx, height: 420 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6">
                Tendencia {periodoLabel}
              </Typography>
              <IconButton size="small" onClick={() => handleOpenModal('tendencia', `Tendencia ${periodoLabel}`)}>
                <FullscreenIcon />
              </IconButton>
            </Box>

            <ResponsiveContainer width="100%" height="88%">
              <AreaChart data={tendenciaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <RechartsTooltip content={<CurrencyTooltip />} />
                <Legend />
                <Area dataKey="total" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.2} name="Ingresos ($)" yAxisId="left" />
                <Area dataKey="total_pedidos" stroke={COLORS.secondary} fill={COLORS.secondary} fillOpacity={0.1} name="Pedidos" yAxisId="right" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* ---- ROW 3: TRES PANELES SECUNDARIOS ---- */}

        {/* Ventas por Hora */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ ...paperSx, height: 380 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6">Ventas por Hora</Typography>
              <IconButton size="small" onClick={() => handleOpenModal('ventasHora', 'Ventas por Hora')}>
                <FullscreenIcon />
              </IconButton>
            </Box>

            <ResponsiveContainer width="100%" height="88%">
              <BarChart data={ventasPorHoraFormatted}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="horaLabel" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <RechartsTooltip content={<CurrencyTooltip />} />
                <Legend />
                <Bar dataKey="total_ventas" fill={COLORS.primary} name="Ventas ($)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total_pedidos" fill={COLORS.secondary} name="Pedidos" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Ventas por Día de Semana */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ ...paperSx, height: 380 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Ventas por Día</Typography>

            <ResponsiveContainer width="100%" height="88%">
              <BarChart data={ventasPorDiaSemanaFormatted}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="diaLabel" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <RechartsTooltip content={<CurrencyTooltip />} />
                <Legend />
                <Bar dataKey="total_ventas" fill={COLORS.tertiary} name="Ventas ($)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total_pedidos" fill={COLORS.info} name="Pedidos" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Métodos de Pago */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ ...paperSx, height: 380 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Métodos de Pago</Typography>

            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={metodosPagoData} dataKey="total" nameKey="metodo" innerRadius={50} outerRadius={75}>
                  {metodosPagoData.map((_, i) => (
                    <Cell key={i} fill={metodoPagoColors[i % metodoPagoColors.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>

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
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatCurrency(m.total)}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* ---- ROW 4: PRODUCTOS MÁS VENDIDOS ---- */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ ...paperSx, height: 420 }}>
            <Typography variant="h6" gutterBottom>Top 10 Productos</Typography>

            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={productosTop10} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11 }} width={90} />
                <RechartsTooltip content={<CurrencyTooltip />} />
                <Legend />
                <Bar dataKey="cantidad_total" fill={COLORS.primary} name="Cantidad" radius={[0, 4, 4, 0]} />
                <Bar dataKey="ingresos_total" fill={COLORS.secondary} name="Ingresos ($)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ ...paperSx, height: 420, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Todos los Productos ({productosMasVendidos.length})
            </Typography>

            <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Producto</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Cantidad vendida</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Ingresos generados</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productosMasVendidos.length > 0 ? (
                    productosMasVendidos.map((prod, idx) => (
                      <TableRow key={prod.nombre} hover>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{prod.nombre}</TableCell>
                        <TableCell align="right">{prod.cantidad_total}</TableCell>
                        <TableCell align="right">${formatMonto(prod.ingresos_total)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={4} align="center">Sin datos</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* ---- ROW 5: GANANCIAS POR SEMANA ---- */}
        {gananciasPorSemana.length > 0 && (
          <>
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper sx={{ ...paperSx, height: 420 }}>
                <Typography variant="h6" gutterBottom>Ganancias por Semana</Typography>

                <ResponsiveContainer width="100%" height="88%">
                  <BarChart data={gananciasPorSemana.map(s => ({
                    ...s,
                    label: `S${s.semana}`
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RechartsTooltip content={<CurrencyTooltip />} />
                    <Legend />
                    <Bar dataKey="total_ventas" fill={COLORS.primary} name="Ventas ($)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="total_pedidos" fill={COLORS.secondary} name="Pedidos" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Paper sx={{ ...paperSx, height: 420, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>Registro Semanal</Typography>

                <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Semana</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Periodo</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Pedidos</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Ganancias</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {gananciasPorSemana.map((s) => {
                        const mesNombre = new Date(2000, s.mes - 1).toLocaleString('es', { month: 'short' });
                        return (
                          <TableRow key={`${s.anio}-${s.semana}`} hover>
                            <TableCell>S{s.semana} - {mesNombre}</TableCell>
                            <TableCell>{s.fecha_inicio?.slice(5)} al {s.fecha_fin?.slice(5)}</TableCell>
                            <TableCell align="right">{s.total_pedidos}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 500 }}>${formatMonto(s.total_ventas)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </>
        )}

        {/* ---- ROW 6: HISTORIAL DE INGRESOS ---- */}
        <Grid size={12}>
          <Paper sx={paperSx}>
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
                      <TableCell>{formatearFecha(i.fecha)}</TableCell>
                      <TableCell align="right">{i.total_pedidos}</TableCell>
                      <TableCell align="right">${formatMonto(i.total)}</TableCell>
                      <TableCell align="right">${formatMonto(i.total_pedidos ? i.total / i.total_pedidos : 0)}</TableCell>
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

      {/* ---- MODAL FULLSCREEN ---- */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6">{selectedChart?.title}</Typography>
            <Button onClick={handleCloseModal}>Cerrar</Button>
          </Box>

          <ResponsiveContainer width="100%" height="100%">
            {selectedChart?.type === 'tendencia' ? (
              <AreaChart data={tendenciaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip content={<CurrencyTooltip />} />
                <Legend />
                <Area dataKey="total" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.2} name="Ingresos ($)" yAxisId="left" />
                <Area dataKey="total_pedidos" stroke={COLORS.secondary} fill={COLORS.secondary} fillOpacity={0.1} name="Pedidos" yAxisId="right" />
              </AreaChart>
            ) : (
              <BarChart data={ventasPorHoraFormatted}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="horaLabel" />
                <YAxis />
                <RechartsTooltip content={<CurrencyTooltip />} />
                <Legend />
                <Bar dataKey="total_ventas" fill={COLORS.primary} name="Ventas ($)" />
                <Bar dataKey="total_pedidos" fill={COLORS.secondary} name="Pedidos" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </Box>
      </Modal>

    </Box>
  );
};

export default Estadisticas;
