import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  Typography,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  Box,
  Divider,
  Autocomplete
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { PDFViewer } from '@react-pdf/renderer';
import { useAuth } from '../context/AuthContext';

// Importaciones corregidas
import contieneApi from '../API/contieneApi';
import { pagoApi } from '../API/pagoApi';
import { crearPedido, obtenerPedidosDelDia, editarPedido } from '../API/pedidosApi';
import { obtenerProductos } from '../API/productosApi';
import ProductosModal from './ProductosModal';
import PagosModal from './PagosModal';
import PedidoTicketPDF from '../components/pdf/PedidoTicketPDF';

const PedidosDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newOrderName, setNewOrderName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [payment, setPayment] = useState({ monto: 0, metodo: 'efectivo' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, title: '', message: '' });
  const [productosModalOpen, setProductosModalOpen] = useState(false);
  const [pagosModalOpen, setPagosModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [selectedPedidoPDF, setSelectedPedidoPDF] = useState(null);

  const safeNumber = (value) => {
    if (value === null || value === undefined) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  };

  const fetchData = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      // Obtener productos
      const productsData = await obtenerProductos();
      
      if (!Array.isArray(productsData)) {
        throw new Error('Formato de datos de productos inválido');
      }
      setProducts(productsData);

      // Obtener pedidos del día
      const response = await obtenerPedidosDelDia();

      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error('Formato de datos de pedidos inválido');
      }

      // Extraer el array de pedidos de la estructura anidada
      const pedidosArray = response.data.data;

      // Filtrar solo los pedidos pendientes
      const pedidosPendientes = pedidosArray.filter(p => p.estado === 'pendiente');

      // Obtener detalles para cada pedido
      const pedidosConDetalles = await Promise.all(
        pedidosPendientes.map(async (pedido) => {
          try {
            // Obtener productos del pedido
            const productosRes = await contieneApi.obtenerProductosDePedido(pedido.id);
            
            let productos = [];
            let totalPedido = 0;
            
            if (productosRes?.data?.productos) {
              productos = productosRes.data.productos;
              // Calcular el total solo con productos no anulados
              totalPedido = productos.reduce((sum, p) => {
                if (p.anulado) return sum;
                return sum + (safeNumber(p.precio) * safeNumber(p.cantidad));
              }, 0);
            }

            // Obtener pagos del pedido
            const pagosRes = await pagoApi.obtenerPagosDePedido(pedido.id);
            let pagos = [];
            if (pagosRes?.data) {
              pagos = Array.isArray(pagosRes.data) ? pagosRes.data : 
                     (pagosRes.data.pagos || []);
            }

            const totalPagado = pagos.reduce((sum, p) => sum + safeNumber(p.monto), 0);
            const pendiente = Math.max(0, totalPedido - totalPagado);

            return {
              ...pedido,
              productos,
              pagos,
              total: totalPedido,
              pagado: totalPagado,
              pendiente
            };
          } catch (error) {
            console.error(`Error obteniendo detalles del pedido ${pedido.id}:`, error);
            return {
              ...pedido,
              productos: [],
              pagos: [],
              total: 0,
              pagado: 0,
              pendiente: 0
            };
          }
        })
      );

      // Establecer los pedidos en el estado
      setOrders(pedidosConDetalles);
      setError(null);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar los datos: ' + (error.response?.data?.message || error.message));
      setProducts([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (mounted) {
        await fetchData();
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [fetchData]);

  const handleAddOrder = async () => {
    if (!user) {
      showError('Debe iniciar sesión para crear pedidos');
      return;
    }
    
    try {
      const { data: response } = await crearPedido({
        nombre: newOrderName,
        id_usuario: user.id
      });

      console.log('Respuesta de crear pedido:', response);
      
      // Cerrar el diálogo y limpiar el formulario
      setIsDialogOpen(false);
      setNewOrderName('');
      
      // Recargar los datos
      await fetchData();
      showSuccess('Pedido creado exitosamente');
    } catch (error) {
      console.error('Error al crear pedido:', error);
      showError('Error al crear el pedido');
    }
  };

  const handleEditOrder = async (id, newName) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      await editarPedido(id, { nombre: newName });
      setOrders(orders.map(order => 
        order.id === id ? {...order, nombre: newName} : order
      ));
      setEditingOrder(null);
      showSuccess('Pedido actualizado exitosamente');
    } catch (error) {
      console.error('Error editing order:', error);
      showError('Error al editar el pedido');
    }
  };

  const handleAddProduct = async (orderId) => {
    if (!selectedProduct) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Obtener la información del producto seleccionado
      const selectedProductInfo = products.find(p => p.id === selectedProduct.id);
      if (!selectedProductInfo) {
        throw new Error('Producto no encontrado');
      }

      const cantidadNum = safeNumber(cantidad);
      
      console.log('Agregando producto:', {
        id_pedido: orderId,
        id_producto: selectedProduct.id,
        cantidad: cantidadNum
      });

      // Agregar el producto al pedido
      const response = await contieneApi.agregarProductoAPedido({
        id_pedido: orderId,
        id_producto: selectedProduct.id,
        cantidad: cantidadNum
      });

      console.log('Respuesta de agregar producto:', response);
      
      if (!response?.data) {
        throw new Error('Error al agregar el producto: respuesta inválida');
      }

      // Limpiar el formulario
      setSelectedProduct(null);
      setCantidad(1);
      
      showSuccess('Producto agregado exitosamente');
      
      // Recargar los datos inmediatamente
      await fetchData();

    } catch (error) {
      console.error('Error adding product:', error);
      showError('Error al agregar el producto');
      // Intentar recargar los datos incluso si hubo un error
      await fetchData();
    }
  };

  const handleCancelProduct = async (productId) => {
    try {
      console.log('Anulando producto:', productId);
      await contieneApi.anularProductoDePedido(productId);
      showSuccess('Producto anulado exitosamente');
      await fetchData(); // Recargar los datos después de anular
    } catch (error) {
      console.error('Error al anular producto:', error);
      showError('Error al anular el producto');
    }
  };

  const handleAddPayment = async (orderId, monto, metodo) => {
    if (safeNumber(monto) <= 0) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      await pagoApi.agregarPago({
        id_pedido: orderId,
        monto: safeNumber(monto),
        metodo: metodo
      });
      
      await fetchData();
      setPayment({ monto: 0, metodo: 'efectivo' });
      showSuccess('Pago registrado exitosamente');
    } catch (error) {
      console.error('Error adding payment:', error);
      showError('Error al registrar el pago');
    }
  };

  const calculateTotal = (productos) => {
    if (!productos || !Array.isArray(productos)) return 0;
    
    return productos.reduce((sum, p) => {
      // Si el producto está anulado o no tiene información básica, no lo sumamos
      if (!p || p.anulado) return sum;
      
      const precio = safeNumber(p.precio);
      const cantidad = safeNumber(p.cantidad);
      const subtotal = precio * cantidad;
      
      return sum + subtotal;
    }, 0);
  };

  const calculatePaid = (pagos) => {
    if (!pagos || !Array.isArray(pagos)) return 0;
    
    return pagos.reduce((sum, p) => {
      const monto = safeNumber(p.monto);
      return sum + monto;
    }, 0);
  };

  const handleViewPDF = (pedido) => {
    setSelectedPedidoPDF(pedido);
    setPdfPreviewOpen(true);
  };

  const agruparProductos = (productos) => {
    if (!Array.isArray(productos)) return [];
    
    const productosAgrupados = productos.reduce((acc, producto) => {
      if (producto.anulado) return acc;
      
      const key = `${producto.id_producto || producto.idProducto}`;
      if (!acc[key]) {
        acc[key] = {
          ...producto,
          cantidad: Number(producto.cantidad || 0)
        };
      } else {
        acc[key].cantidad += Number(producto.cantidad || 0);
      }
      return acc;
    }, {});

    return Object.values(productosAgrupados);
  };

  const renderProductosPedido = (productos) => {
    const productosAgrupados = agruparProductos(productos);
    return productosAgrupados.map(p => (
      <Chip 
        key={p.id}
        label={`${p.cantidad}x ${p.nombre}`}
        color={p.anulado ? "default" : "primary"}
        variant="outlined"
        sx={p.anulado ? { textDecoration: 'line-through' } : undefined}
      />
    ));
  };

  useEffect(() => {
    if (!products.length) return;
    
    const filtered = products.filter(product => 
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Pedidos Pendientes
        </Typography>
        <Box>
          <Tooltip title="Actualizar datos">
            <span>
              <IconButton onClick={fetchData} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
          {user && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={() => setIsDialogOpen(true)}
              sx={{ ml: 1 }}
              disabled={loading}
            >
              Nuevo Pedido
            </Button>
          )}
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      ) : orders.length === 0 ? (
        <Alert severity="info" sx={{ my: 2 }}>
          No hay pedidos pendientes
        </Alert>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Pedido</TableCell>
                <TableCell>Productos</TableCell>
                <TableCell>Pagos</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Pagado</TableCell>
                <TableCell align="right">Pendiente</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {editingOrder === order.id ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                              size="small"
                              value={newOrderName}
                              onChange={(e) => setNewOrderName(e.target.value)}
                              autoFocus
                            />
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleEditOrder(order.id, newOrderName)}
                            >
                              <SaveIcon />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => {
                                setEditingOrder(null);
                                setNewOrderName('');
                              }}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">{order.nombre}</Typography>
                            <IconButton 
                              size="small"
                              onClick={() => {
                                setEditingOrder(order.id);
                                setNewOrderName(order.nombre);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                        <Typography variant="caption" color="textSecondary">
                          Por: {order.nombre_usuario}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(order.fecha).toLocaleString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {renderProductosPedido(order.productos)}
                        </Box>
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            setProductosModalOpen(true);
                          }}
                        >
                          Gestionar Productos
                        </Button>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {order.pagos?.map((p, index) => (
                            <Chip
                              key={index}
                              label={`$${Number(p.monto).toFixed(2)} (${p.metodo})`}
                              color="success"
                              variant="outlined"
                              size="small"
                            />
                          ))}
                        </Box>
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            setPagosModalOpen(true);
                          }}
                        >
                          Gestionar Pagos
                        </Button>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6">
                      ${Number(order.total || 0).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" color="success.main">
                      ${Number(order.pagado || 0).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" color={order.pendiente > 0 ? "error.main" : "success.main"}>
                      ${Math.max(0, Number(order.pendiente || 0)).toFixed(2)}
                      </Typography>
                    </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Tooltip title="Ver Productos">
                        <IconButton 
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            setProductosModalOpen(true);
                          }} 
                          size="small"
                        >
                          <ReceiptIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ver Pagos">
                        <IconButton 
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            setPagosModalOpen(true);
                          }} 
                          size="small"
                        >
                          <PaymentIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ver Ticket">
                        <IconButton 
                          onClick={() => handleViewPDF(order)} 
                          size="small"
                        >
                          <PictureAsPdfIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Crear Nuevo Pedido</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del pedido"
            fullWidth
            value={newOrderName}
            onChange={(e) => setNewOrderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleAddOrder} 
            variant="contained"
            disabled={!user || !newOrderName || loading}
          >
            Crear Pedido
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={productosModalOpen} onClose={() => setProductosModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Productos del Pedido</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Añadir Producto
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Autocomplete
                options={filteredProducts}
                getOptionLabel={(option) => `${option.nombre} - $${option.precio}`}
                value={selectedProduct}
                onChange={(event, newValue) => {
                  setSelectedProduct(newValue);
                  if (newValue) {
                    setCantidad(1); // Reset cantidad when new product is selected
                  }
                }}
                onInputChange={(event, newInputValue) => {
                  setSearchTerm(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Buscar producto"
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                )}
                sx={{ flexGrow: 1 }}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                filterOptions={(x) => x} // Disable built-in filtering
              />
              <TextField
                type="number"
                label="Cantidad"
                value={cantidad}
                onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                InputProps={{ inputProps: { min: 1 } }}
                size="small"
                sx={{ width: 100 }}
              />
              <Button
                variant="contained"
                onClick={() => handleAddProduct(selectedOrderId)}
                disabled={!selectedProduct}
                startIcon={<AddIcon />}
              >
                Agregar
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            Productos en el Pedido
          </Typography>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Precio</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(orders.find(o => o.id === selectedOrderId)?.productos || []).map((producto) => (
                  <TableRow 
                    key={producto.id}
                    sx={producto.anulado ? { backgroundColor: 'rgba(0, 0, 0, 0.04)' } : {}}
                  >
                    <TableCell>{producto.nombre}</TableCell>
                    <TableCell align="right">${producto.precio}</TableCell>
                    <TableCell align="right">{producto.cantidad}</TableCell>
                    <TableCell align="right">
                      ${(safeNumber(producto.precio) * safeNumber(producto.cantidad)).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={producto.anulado ? "Anulado" : "Activo"}
                        color={producto.anulado ? "error" : "success"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {!producto.anulado && (
                        <Tooltip title="Anular producto">
                          <IconButton
                            size="small"
                            onClick={() => handleCancelProduct(producto.id)}
                            color="error"
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductosModalOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {selectedOrderId && (
        <PagosModal
          open={pagosModalOpen}
          onClose={() => {
            setPagosModalOpen(false);
            setSelectedOrderId(null);
          }}
          pagos={orders.find(o => o.id === selectedOrderId)?.pagos || []}
          onAddPago={(pagoData) => handleAddPayment(selectedOrderId, pagoData.monto, pagoData.metodo)}
          totalPedido={orders.find(o => o.id === selectedOrderId)?.total || 0}
          totalPagado={orders.find(o => o.id === selectedOrderId)?.pagado || 0}
        />
      )}

      <Dialog
        open={pdfPreviewOpen}
        onClose={() => {
          setPdfPreviewOpen(false);
          setSelectedPedidoPDF(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxWidth: '300px !important'
          }
        }}
      >
        <DialogContent sx={{ p: 1 }}>
          {selectedPedidoPDF && (
            <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
              <PedidoTicketPDF pedido={selectedPedidoPDF} />
            </PDFViewer>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar 
        open={!!error} 
        autoHideDuration={3000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!success} 
        autoHideDuration={3000} 
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default PedidosDashboard;
