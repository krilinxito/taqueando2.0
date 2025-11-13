import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  TextField,
  Button,
  Divider,
  Snackbar,
  Dialog,
  DialogContent,
  FormControlLabel,
  Switch,
} from '@mui/material';
import Grid from '@mui/material/Grid';

import RefreshIcon from '@mui/icons-material/Refresh';
import MoneyIcon from '@mui/icons-material/Money';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import QrCodeIcon from '@mui/icons-material/QrCode';
import OnlinePaymentIcon from '@mui/icons-material/Language';
import SaveIcon from '@mui/icons-material/Save';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import { PDFViewer } from '@react-pdf/renderer';

import {
  obtenerResumenDeCaja,
} from '../API/cajaApi';

import {
  crearArqueo,
  obtenerUltimoArqueo
} from '../API/arqueoApi';

import ResumenCajaPDF from '../components/pdf/ResumenCajaPDF';

// ===========================
//  CONFIGURACIÓN
// ===========================
const DENOMINACIONES = [
  { valor: 200, tipo: 'Billete' },
  { valor: 100, tipo: 'Billete' },
  { valor: 50, tipo: 'Billete' },
  { valor: 20, tipo: 'Billete' },
  { valor: 10, tipo: 'Billete' },
  { valor: 5, tipo: 'Billete' },
  { valor: 2, tipo: 'Moneda' },
  { valor: 1, tipo: 'Moneda' },
];

// ===========================
//  COMPONENTE PRINCIPAL
// ===========================
const ResumenCaja = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [mostrarSoloCancelados, setMostrarSoloCancelados] = useState(false);

  const [resumen, setResumen] = useState(null);
  const [pagosFiltrados, setPagosFiltrados] = useState([]);

  // Arqueo
  const [conteo, setConteo] = useState(
    DENOMINACIONES.reduce((acc, d) => ({ ...acc, [d.valor]: 0 }), {})
  );
  const [cajaChica, setCajaChica] = useState(0);
  const [observaciones, setObservaciones] = useState('');

  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);

  // ===========================
  //  FORMATEADORES
  // ===========================
  const formatMonto = (m) => Number(m || 0).toFixed(2);

  const formatFecha = (f) => {
    try {
      return new Date(f).toLocaleString('es-BO', {
        timeZone: 'America/La_Paz',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  // ===========================
  //  FETCH PRINCIPAL
  // ===========================
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await obtenerResumenDeCaja();
      setResumen(data);

      // Cargar caja chica del arqueo previo
      try {
        const ultimo = await obtenerUltimoArqueo();
        if (ultimo?.caja_chica != null) setCajaChica(Number(ultimo.caja_chica));
      } catch {}

    } catch (err) {
      setError('Error al cargar datos de caja.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ===========================
  //  FILTRADO DE PAGOS
  // ===========================
  useEffect(() => {
    if (!resumen) return;

    const filtrados = resumen.pagos.filter((p) =>
      mostrarSoloCancelados ? p.estadoPedido === 'cancelado' : true
    );

    setPagosFiltrados(filtrados);
  }, [resumen, mostrarSoloCancelados]);

  // ===========================
  //  ARQUEO
  // ===========================
  const calcularTotalConteo = () => {
    return Object.entries(conteo).reduce(
      (acc, [den, cant]) => acc + Number(den) * Number(cant),
      0
    );
  };

  const totalContado = calcularTotalConteo();
  const totalSistemaEfectivo = resumen?.totalesPorMetodo?.efectivo?.total ?? 0;
  const diferencia = totalContado - cajaChica - totalSistemaEfectivo;

  const guardarArqueo = async () => {
    try {
      const datos = {
        conteo,
        cajaChica,
        totalContado,
        totalSistema: totalSistemaEfectivo,
        diferencia,
        observaciones,
        estado:
          diferencia === 0 ? 'cuadrado' : diferencia > 0 ? 'sobrante' : 'faltante',
      };

      await crearArqueo(datos);
      setSuccess('Arqueo guardado exitosamente.');
      setObservaciones('');
      setConteo(DENOMINACIONES.reduce((acc, d) => ({ ...acc, [d.valor]: 0 }), {}));
    } catch (e) {
      setError('Error al guardar el arqueo.');
    }
  };

  // ===========================
  //  UI
  // ===========================
  if (loading)
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {error}
      </Alert>
    );

  if (!resumen) return null;

  const { totalDia, totalesPorMetodo } = resumen;

  // ===========================
  //  TARJETAS MÉTODO DE PAGO
  // ===========================
  const MetodoCard = ({ titulo, icono, monto, color }) => (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icono}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {titulo}
          </Typography>
        </Box>
        <Typography variant="h4" color={color}>
          ${formatMonto(monto)}
        </Typography>
      </CardContent>
    </Card>
  );

  // ===========================
  //  RENDER
  // ===========================
  return (
    <Paper sx={{ p: 3, m: 2 }}>
      {/* HEADER */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4">Resumen de Caja</Typography>
          <Typography>{formatFecha(resumen.fecha)}</Typography>

          <FormControlLabel
            control={
              <Switch
                checked={mostrarSoloCancelados}
                onChange={(e) => setMostrarSoloCancelados(e.target.checked)}
              />
            }
            label="Mostrar solo pedidos cancelados"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Ver PDF">
            <IconButton onClick={() => setPdfPreviewOpen(true)}>
              <PictureAsPdfIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Actualizar">
            <IconButton onClick={fetchData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* TOTAL */}
      <Card sx={{ bgcolor: 'primary.main', color: 'white', mb: 4 }}>
        <CardContent>
          <Typography variant="h6">
            Total del Día
          </Typography>
          <Typography variant="h3">
            ${formatMonto(totalDia)}
          </Typography>
        </CardContent>
      </Card>

      {/* MÉTODOS DE PAGO */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetodoCard
            titulo="Efectivo"
            icono={<MoneyIcon sx={{ fontSize: 30, color: 'success.main' }} />}
            monto={totalesPorMetodo.efectivo.total}
            color="success.main"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetodoCard
            titulo="Efectivo - PY"
            icono={<MoneyIcon sx={{ fontSize: 30, color: 'error.main' }} />}
            monto={totalesPorMetodo['efectivo-py'].total}
            color="error.main"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetodoCard
            titulo="Tarjeta"
            icono={<CreditCardIcon sx={{ fontSize: 30, color: 'info.main' }} />}
            monto={totalesPorMetodo.tarjeta.total}
            color="info.main"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetodoCard
            titulo="QR"
            icono={<QrCodeIcon sx={{ fontSize: 30, color: 'secondary.main' }} />}
            monto={totalesPorMetodo.qr.total}
            color="secondary.main"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetodoCard
            titulo="Online"
            icono={<OnlinePaymentIcon sx={{ fontSize: 30, color: 'warning.main' }} />}
            monto={totalesPorMetodo.online.total}
            color="warning.main"
          />
        </Grid>
      </Grid>

      {/* ARQUEO */}
      <Typography variant="h5" sx={{ mt: 4 }}>
        Arqueo de Caja
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        {/* CONTEO */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Conteo de Efectivo</Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                {DENOMINACIONES.map((den) => (
                  <Grid size={{ xs: 6, md: 4 }} key={den.valor}>
                    <TextField
                      fullWidth
                      label={`${den.tipo} de $${den.valor}`}
                      type="number"
                      value={conteo[den.valor]}
                      onChange={(e) =>
                        setConteo({
                          ...conteo,
                          [den.valor]: Number(e.target.value),
                        })
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* RESUMEN ARQUEO */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Resumen del Arqueo</Typography>

              <TextField
                fullWidth
                sx={{ mt: 2 }}
                label="Caja Chica"
                type="number"
                value={cajaChica}
                onChange={(e) => setCajaChica(Number(e.target.value))}
              />

              <TextField
                fullWidth
                sx={{ mt: 2 }}
                label="Observaciones"
                multiline
                rows={3}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />

              <Divider sx={{ my: 2 }} />

              <Typography>Total Contado: ${formatMonto(totalContado)}</Typography>
              <Typography>Caja Chica: ${formatMonto(cajaChica)}</Typography>
              <Typography>
                Total en Sistema (Efectivo): ${formatMonto(totalSistemaEfectivo)}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="h6"
                color={diferencia === 0 ? 'success.main' : 'error.main'}
              >
                Diferencia: ${formatMonto(diferencia)}
              </Typography>

              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3 }}
                startIcon={<SaveIcon />}
                onClick={guardarArqueo}
              >
                Guardar Arqueo
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* SNACKBAR */}
      <Snackbar
        open={!!success}
        autoHideDuration={5000}
        onClose={() => setSuccess(null)}
        message={success}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />

      {/* PDF */}
      <Dialog open={pdfPreviewOpen} onClose={() => setPdfPreviewOpen(false)} maxWidth="lg" fullWidth>
        <DialogContent sx={{ height: '90vh' }}>
          <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
            <ResumenCajaPDF
              resumen={resumen}
              conteo={conteo}
              cajaChica={cajaChica}
              diferencia={diferencia}
            />
          </PDFViewer>
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default ResumenCaja;
