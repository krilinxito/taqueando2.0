import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import {
  obtenerProductos,
  eliminarProducto,
  crearProducto,
  actualizarProducto,
} from '../../API/productosApi';
import ProductoFormDialog from './ProductoFormDialog';

const ProductosTable = () => {
  const [productos, setProductos] = useState([]);
  const [open, setOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const cargarProductos = async () => {
    const data = await obtenerProductos();
    setProductos(data);
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      await eliminarProducto(id);
      cargarProductos();
    }
  };

  const handleGuardar = async (producto) => {
    if (producto.id) {
      await actualizarProducto(producto.id, producto);
    } else {
      await crearProducto(producto);
    }
    setOpen(false);
    setProductoSeleccionado(null);
    cargarProductos();
  };

  const abrirFormulario = (producto = null) => {
    setProductoSeleccionado(producto);
    setOpen(true);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Lista de Productos
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Add />}
        onClick={() => abrirFormulario()}
        sx={{ mb: 2 }}
      >
        Añadir Producto
      </Button>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Precio (Bs.)</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {productos.map((producto) => (
            <TableRow key={producto.id}>
              <TableCell>{producto.id}</TableCell>
              <TableCell>{producto.nombre}</TableCell>
              <TableCell>{producto.precio}</TableCell>
              <TableCell>
                <IconButton
                  color="primary"
                  onClick={() => abrirFormulario(producto)}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleEliminar(producto.id)}
                >
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ProductoFormDialog
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleGuardar}
        producto={productoSeleccionado}
      />
    </Container>
  );
};

export default ProductosTable;
