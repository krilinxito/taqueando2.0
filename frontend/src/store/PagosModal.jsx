import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Divider,
  Alert,
  InputAdornment
} from '@mui/material';

const PagosModal = ({
  open,
  onClose,
  pagos,
  onAddPago,
  totalPedido,
  totalPagado,
  readOnly = false
}) => {
  const [montoIngresado, setMontoIngresado] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [cambio, setCambio] = useState(0);

  useEffect(() => {
    const monto = Number(montoIngresado) || 0;
    if (metodoPago === 'efectivo' && monto > (totalPedido - totalPagado)) {
      setCambio(monto - (totalPedido - totalPagado));
    } else {
      setCambio(0);
    }
  }, [montoIngresado, metodoPago, totalPedido, totalPagado]);

  const handleSubmit = () => {
    const monto = Number(montoIngresado);
    if (monto <= 0) return;

    onAddPago({
      monto: metodoPago === 'efectivo' ? 
        Math.min(monto, totalPedido - totalPagado) : // En efectivo, solo registrar lo necesario
        monto, // Para otros métodos, registrar el monto completo
      metodo: metodoPago
    });

    // Resetear el formulario
    setMontoIngresado('');
    setMetodoPago('efectivo');
  };

  const pendiente = totalPedido - totalPagado;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h5" component="div">
          {readOnly ? 'Detalle de Pagos' : 'Gestión de Pagos'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Resumen
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Total del pedido:</Typography>
            <Typography>${totalPedido.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Total pagado:</Typography>
            <Typography color="success.main">${totalPagado.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography>Pendiente:</Typography>
            <Typography color={pendiente > 0 ? "error.main" : "success.main"}>
              ${pendiente.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Pagos Realizados
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {pagos.map((pago, index) => {
            // Calcular el monto pendiente antes de este pago
            const montoAntesDelPago = totalPedido - pagos
              .filter((_, i) => i < index)
              .reduce((sum, p) => sum + Number(p.monto), 0);

            // Calcular si hubo cambio (solo para efectivo)
            const cambio = pago.metodo === 'efectivo' && Number(pago.monto) > montoAntesDelPago
              ? Number(pago.monto) - montoAntesDelPago
              : 0;

            return (
              <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Chip
                  label={`$${Number(pago.monto).toFixed(2)} (${pago.metodo})`}
                  color="success"
                  variant="outlined"
                />
                {cambio > 0 && (
                  <Typography variant="caption" color="success.main">
                    Cambio: ${cambio.toFixed(2)}
                  </Typography>
                )}
              </Box>
            );
          })}
          {pagos.length === 0 && (
            <Typography color="text.secondary">
              No hay pagos registrados
            </Typography>
          )}
        </Box>

        {!readOnly && (
          <>
            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Nuevo Pago
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <TextField
                label="Monto"
                type="number"
                value={montoIngresado}
                onChange={(e) => setMontoIngresado(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                sx={{ width: 150 }}
              />
              <Select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="efectivo">Efectivo</MenuItem>
                <MenuItem value="efectivo-py">Efectivo-Py</MenuItem>
                <MenuItem value="tarjeta">Tarjeta</MenuItem>
                <MenuItem value="qr">QR</MenuItem>
                <MenuItem value="online">Online</MenuItem>
              </Select>
            </Box>

            {metodoPago === 'efectivo' && cambio > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Cambio a devolver: ${cambio.toFixed(2)}
              </Alert>
            )}

            {pendiente <= 0 && (
              <Alert severity="success" sx={{ mb: 2 }}>
                ¡El pedido está completamente pagado!
              </Alert>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cerrar
        </Button>
        {!readOnly && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!montoIngresado || Number(montoIngresado) <= 0 || pendiente <= 0}
          >
            Registrar Pago
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PagosModal; 
