import React, { useState } from 'react';
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
  Paper,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Dialog as ConfirmDialog,
  DialogContent as ConfirmDialogContent,
  DialogActions as ConfirmDialogActions,
  DialogTitle as ConfirmDialogTitle,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const ProductosModal = ({ 
  open, 
  onClose, 
  productos, 
  onAddProduct, 
  onCancelProduct,
  availableProducts,
  selectedProduct,
  setSelectedProduct,
  cantidad,
  setCantidad,
  readOnly = false
}) => {
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    productId: null
  });

  const handleConfirmCancel = (productId) => {
    setConfirmDialog({
      open: true,
      productId
    });
  };

  const handleCancelConfirmed = async () => {
    if (confirmDialog.productId) {
      await onCancelProduct(confirmDialog.productId);
    }
    setConfirmDialog({ open: false, productId: null });
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" component="div">
            {readOnly ? 'Detalle de Productos' : 'Productos del Pedido'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Precio</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  {!readOnly && <TableCell align="center">Acciones</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {productos.map((producto) => (
                  <TableRow 
                    key={producto.id}
                    sx={producto.anulado ? { 
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      textDecoration: 'line-through' 
                    } : {}}
                  >
                    <TableCell>{producto.nombre}</TableCell>
                    <TableCell align="right">
                      ${Number(producto.precio).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">{producto.cantidad}</TableCell>
                    <TableCell align="right">
                      ${(Number(producto.precio) * Number(producto.cantidad)).toFixed(2)}
                    </TableCell>
                    {!readOnly && (
                      <TableCell align="center">
                        {!producto.anulado && (
                          <IconButton 
                            color="error" 
                            onClick={() => handleConfirmCancel(producto.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {/* Fila de total */}
                <TableRow>
                  <TableCell colSpan={readOnly ? 3 : 4} align="right">
                    <Typography variant="subtitle1" fontWeight="bold">
                      Total:
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1" fontWeight="bold">
                      ${productos.reduce((sum, p) => {
                        if (p.anulado) return sum;
                        return sum + (Number(p.precio) * Number(p.cantidad));
                      }, 0).toFixed(2)}
                    </Typography>
                  </TableCell>
                  {!readOnly && <TableCell />}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {!readOnly && (
            <>
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  displayEmpty
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="" disabled>
                    Seleccionar producto
                  </MenuItem>
                  {availableProducts.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.nombre} (${Number(product.precio).toFixed(2)})
                    </MenuItem>
                  ))}
                </Select>

                <TextField
                  type="number"
                  label="Cantidad"
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, Number(e.target.value)))}
                  sx={{ width: 100 }}
                  inputProps={{ min: 1 }}
                />

                <Button
                  variant="contained"
                  onClick={() => {
                    onAddProduct();
                    setCantidad(1);
                  }}
                  disabled={!selectedProduct || cantidad < 1}
                >
                  Agregar Producto
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación */}
      {!readOnly && (
        <Dialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ open: false, productId: null })}
        >
          <DialogTitle>Confirmar Anulación</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Está seguro que desea anular este producto del pedido?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setConfirmDialog({ open: false, productId: null })}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCancelConfirmed}
              color="error"
              variant="contained"
            >
              Anular Producto
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default ProductosModal; 