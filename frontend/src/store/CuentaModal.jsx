import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
  Snackbar,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { printReceipt } from '../utils/printService';

const CuentaModal = ({ open, onClose, productos = [], total, nombrePedido, onSuccess, onError }) => {
  const [printing, setPrinting] = useState(false);
  const [printError, setPrintError] = useState(null);

  const listaProductos = useMemo(() => {
    const productosActivos = productos.filter(p => !p.anulado);
    const agrupados = productosActivos.reduce((acc, p) => {
      const key = p.id_producto || p.idProducto || p.nombre;
      if (!acc[key]) {
        acc[key] = { ...p, cantidad: Number(p.cantidad || 0) };
      } else {
        acc[key].cantidad += Number(p.cantidad || 0);
      }
      return acc;
    }, {});
    return Object.values(agrupados);
  }, [productos]);

  const handlePrint = async () => {
    setPrinting(true);
    setPrintError(null);
    try {
      await printReceipt(
        listaProductos.map(p => ({
          nombre: p.nombre,
          cantidad: p.cantidad,
          precio: Number(p.precio),
        })),
        total,
        nombrePedido
      );
      onSuccess?.();
    } catch (err) {
      const msg = err.message;
      setPrintError(msg);
      onError?.(msg);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cuenta</DialogTitle>
      <DialogContent>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell align="center">Cant</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listaProductos.map((p, i) => {
                const precio = Number(p.precio) || 0;
                const cantidad = Number(p.cantidad) || 0;
                return (
                  <TableRow key={i}>
                    <TableCell>{p.nombre}</TableCell>
                    <TableCell align="center">{cantidad}</TableCell>
                    <TableCell align="right">${precio.toFixed(2)}</TableCell>
                    <TableCell align="right">${(precio * cantidad).toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            Total: ${Number(total || 0).toFixed(2)}
          </Typography>
        </Box>

        <Snackbar
          open={!!printError}
          autoHideDuration={4000}
          onClose={() => setPrintError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={() => setPrintError(null)}>
            {printError}
          </Alert>
        </Snackbar>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button
          variant="contained"
          startIcon={printing ? <CircularProgress size={20} color="inherit" /> : <PrintIcon />}
          onClick={handlePrint}
          disabled={printing || listaProductos.length === 0}
        >
          {printing ? 'Imprimiendo...' : 'Imprimir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CuentaModal;
