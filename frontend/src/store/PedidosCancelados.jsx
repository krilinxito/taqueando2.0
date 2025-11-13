import React, { useEffect, useState, useCallback } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { PDFViewer } from '@react-pdf/renderer';
import { obtenerPedidosDelDia } from '../API/pedidosApi';
import ProductosModal from './ProductosModal';
import PagosModal from './PagosModal';
import PedidoTicketPDF from '../components/pdf/PedidoTicketPDF';
import contieneApi from '../API/contieneApi';
import { pagoApi } from '../API/pagoApi';
import MoneyIcon from '@mui/icons-material/Money';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import QrCodeIcon from '@mui/icons-material/QrCode';
import LanguageIcon from '@mui/icons-material/Language';

const PedidosCancelados = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productosModalOpen, setProductosModalOpen] = useState(false);
  const [pagosModalOpen, setPagosModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [selectedPedidoPDF, setSelectedPedidoPDF] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' o 'desc'

  const getPaymentMethodColor = (metodo) => {
    switch (metodo.toLowerCase()) {
      case 'efectivo':
        return 'success';
      case 'tarjeta':
        return 'info';
      case 'qr':
        return 'secondary';
      case 'online':
        return 'warning';
      default:
        return 'default';
    }
  };

  const ordenarPedidos = (pedidosArray) => {
    return [...pedidosArray].sort((a, b) => {
      const fechaA = new Date(a.fecha);
      const fechaB = new Date(b.fecha);
      return sortOrder === 'desc' ? fechaB - fechaA : fechaA - fechaB;
    });
  };

  const fetchPedidos = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await obtenerPedidosDelDia();
      
      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error('Formato de datos de pedidos inválido');
      }

      // Filtrar solo los pedidos cancelados del día
      const pedidosCancelados = response.data.data.filter(pedido => {
        try {
          // Convertir la fecha del pedido a la zona horaria de La Paz
        const fechaPedido = new Date(pedido.fecha);
          fechaPedido.setHours(fechaPedido.getHours() - 4); // Ajuste manual a UTC-4 (La Paz)
        
          // Obtener la fecha actual en La Paz
          const ahora = new Date();
          const hoyLaPaz = new Date(ahora);
          hoyLaPaz.setHours(ahora.getHours() - 4); // Ajuste manual a UTC-4 (La Paz)
        
        // Comparar solo la fecha (ignorar la hora)
        const esMismoDia = 
            fechaPedido.getFullYear() === hoyLaPaz.getFullYear() &&
            fechaPedido.getMonth() === hoyLaPaz.getMonth() &&
            fechaPedido.getDate() === hoyLaPaz.getDate();
        
        return pedido.estado === 'cancelado' && esMismoDia;
        } catch (error) {
          console.error('Error procesando fecha del pedido:', error);
          return false;
        }
      });

      // Obtener detalles adicionales para cada pedido
      const pedidosConDetalles = await Promise.all(
        pedidosCancelados.map(async (pedido) => {
          try {
            const [productosRes, pagosRes] = await Promise.all([
              contieneApi.obtenerProductosDePedido(pedido.id),
              pagoApi.obtenerPagosDePedido(pedido.id)
            ]);

            const productos = productosRes?.data?.productos || [];
            const pagos = pagosRes?.data?.pagos || [];
            const total = productos.reduce((sum, p) => {
              if (p.anulado) return sum;
              return sum + (Number(p.precio || 0) * Number(p.cantidad || 0));
            }, 0);

            return {
              ...pedido,
              productos,
              pagos,
              total
            };
          } catch (error) {
            console.error(`Error obteniendo detalles del pedido ${pedido.id}:`, error);
            return pedido;
          }
        })
      );

      // Ordenar los pedidos
      const pedidosOrdenados = ordenarPedidos(pedidosConDetalles);
      setPedidos(pedidosOrdenados);
    } catch (error) {
      console.error('Error al obtener pedidos cancelados:', error);
      setError('Error al cargar los pedidos: ' + (error.response?.data?.message || error.message));
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  }, [sortOrder]);

  useEffect(() => {
    fetchPedidos();

    // Configurar un intervalo para actualizar los datos cada 5 minutos
    const interval = setInterval(fetchPedidos, 300000); // 5 minutos = 300000 ms

    return () => {
      clearInterval(interval); // Limpiar el intervalo al desmontar
    };
  }, [fetchPedidos]);

  const handleViewProducts = async (order) => {
    try {
      const productosRes = await contieneApi.obtenerProductosDePedido(order.id);
      const productos = productosRes?.data?.productos || [];
      
      if (!Array.isArray(productos)) {
        console.error('Productos no es un array:', productos);
        return;
      }

      setSelectedOrder({
        ...order,
        productos
      });
    setProductosModalOpen(true);
    } catch (error) {
      console.error('Error al obtener productos:', error);
    }
  };

  const handleViewPayments = async (order) => {
    try {
      const [productosRes, pagosRes] = await Promise.all([
        contieneApi.obtenerProductosDePedido(order.id),
        pagoApi.obtenerPagosDePedido(order.id)
      ]);

      const productos = productosRes?.data?.productos || [];
      let pagos = pagosRes?.data || [];
      
      // Asegurarnos de que pagos sea un array
      if (!Array.isArray(pagos)) {
        console.error('Pagos no es un array:', pagos);
        pagos = [];
      }

      // Normalizar los IDs de los pagos
      pagos = pagos.map(pago => ({
        ...pago,
        id_pedido: pago.id_pedido || pago.idPedido,
        idPedido: pago.id_pedido || pago.idPedido
      }));

      // Filtrar pagos que corresponden a este pedido
      pagos = pagos.filter(pago => {
        const pagoId = pago.id_pedido || pago.idPedido;
        return pagoId === order.id;
      });

      // Calcular el total del pedido
      const total = productos.reduce((sum, p) => {
        if (p.anulado) return sum;
        return sum + (Number(p.precio || 0) * Number(p.cantidad || 0));
      }, 0);

      // Calcular el total pagado y cambios
      const pagosConCambio = pagos.map(pago => {
        const montoEntregado = Number(pago.monto_entregado || pago.montoEntregado || 0);
        const monto = Number(pago.monto || 0);
        
        if (pago.metodo === 'efectivo' && montoEntregado > monto) {
          return {
            ...pago,
            monto_entregado: montoEntregado,
            montoEntregado: montoEntregado,
            cambio: montoEntregado - monto
          };
        }
        return {
          ...pago,
          monto_entregado: montoEntregado,
          montoEntregado: montoEntregado
        };
      });

      const totalPagado = pagosConCambio.reduce((sum, p) => sum + Number(p.monto || 0), 0);

      console.log('Pagos encontrados:', {
        pedidoId: order.id,
        pagosOriginales: pagosRes?.data,
        pagosFiltrados: pagos,
        pagosConCambio,
        total,
        totalPagado
      });

      setSelectedOrder({
        ...order,
        pagos: pagosConCambio,
        total,
        totalPagado
      });
    setPagosModalOpen(true);
    } catch (error) {
      console.error('Error al obtener pagos:', error);
    }
  };

  const handleViewPDF = (pedido) => {
    setSelectedPedidoPDF(pedido);
    setPdfPreviewOpen(true);
  };

  const formatearFecha = (fecha) => {
    try {
      // Convertir a zona horaria de La Paz
      const fechaLaPaz = new Date(new Date(fecha).toLocaleString('en-US', { timeZone: 'America/La_Paz' }));
      return fechaLaPaz.toLocaleString('es-BO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha inválida';
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Pedidos Cancelados del Día
        </Typography>
        <Tooltip title="Actualizar">
          <span>
            <IconButton onClick={fetchPedidos} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      ) : pedidos.length === 0 ? (
        <Alert severity="info" sx={{ my: 2 }}>
          No hay pedidos cancelados hoy
        </Alert>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Productos</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pedidos.map((pedido) => (
                <TableRow key={pedido.id}>
                  <TableCell>{pedido.id}</TableCell>
                  <TableCell>{formatearFecha(pedido.fecha)}</TableCell>
                  <TableCell>{pedido.nombre}</TableCell>
                  <TableCell>{pedido.nombre_usuario}</TableCell>
                  <TableCell>
                    {pedido.productos?.length || 0} productos
                  </TableCell>
                  <TableCell align="right">
                    ${Number(pedido.total || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {pedido.pagos?.map((pago, index) => (
                        <Chip
                          key={index}
                          label={`$${Number(pago.monto).toFixed(2)}`}
                          color={getPaymentMethodColor(pago.metodo)}
                          icon={
                            pago.metodo.toLowerCase() === 'efectivo' ? <MoneyIcon /> :
                            pago.metodo.toLowerCase() === 'tarjeta' ? <CreditCardIcon /> :
                            pago.metodo.toLowerCase() === 'qr' ? <QrCodeIcon /> :
                            <LanguageIcon />
                          }
                          size="small"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver Productos">
                      <IconButton onClick={() => handleViewProducts(pedido)} size="small">
                        <ReceiptIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ver Pagos">
                      <IconButton onClick={() => handleViewPayments(pedido)} size="small">
                        <PaymentIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ver Ticket">
                      <IconButton onClick={() => handleViewPDF(pedido)} size="small">
                        <PictureAsPdfIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal de Productos (solo lectura) */}
      {selectedOrder && (
        <>
          {productosModalOpen && (
        <ProductosModal
          open={productosModalOpen}
          onClose={() => {
            setProductosModalOpen(false);
            setSelectedOrder(null);
          }}
          productos={selectedOrder.productos || []}
          availableProducts={[]}
          selectedProduct=""
          setSelectedProduct={() => {}}
          cantidad={1}
          setCantidad={() => {}}
          readOnly={true}
        />
      )}

          {pagosModalOpen && (
        <PagosModal
          open={pagosModalOpen}
          onClose={() => {
            setPagosModalOpen(false);
            setSelectedOrder(null);
          }}
          pagos={selectedOrder.pagos || []}
          onAddPago={() => {}}
          totalPedido={selectedOrder.total || 0}
              totalPagado={selectedOrder.totalPagado || 0}
          readOnly={true}
        />
          )}
        </>
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
    </Paper>
  );
};

export default PedidosCancelados; 
