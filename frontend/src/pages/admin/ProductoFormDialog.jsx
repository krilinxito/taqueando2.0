import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';

const ProductoFormDialog = ({ open, onClose, onSave, producto }) => {
  const [form, setForm] = useState({ nombre: '', precio: '' });

  useEffect(() => {
    if (producto) {
      setForm(producto);
    } else {
      setForm({ nombre: '', precio: '' });
    }
  }, [producto]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (form.nombre && form.precio) {
      onSave(form);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {producto ? 'Editar Producto' : 'Nuevo Producto'}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Nombre"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          margin="dense"
          label="Precio"
          name="precio"
          type="number"
          value={form.precio}
          onChange={handleChange}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductoFormDialog;