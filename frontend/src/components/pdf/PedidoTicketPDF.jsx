import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const ROLL_WIDTH = 226.77; // 80mm en puntos

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 16,
    fontFamily: 'Helvetica'
  },
  header: {
    textAlign: 'center',
    marginBottom: 12
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4
  },
  infoLine: {
    fontSize: 10,
    marginBottom: 2
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'dashed',
    marginVertical: 8
  },
  productRow: {
    marginBottom: 6
  },
  productName: {
    fontSize: 11,
    fontWeight: 'bold'
  },
  productDetails: {
    fontSize: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  totalLine: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 8
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4
  },
  paymentRow: {
    fontSize: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2
  },
  footer: {
    textAlign: 'center',
    fontSize: 10,
    marginTop: 12
  }
});

const PedidoTicketPDF = ({ pedido }) => {
  // Formatear fecha a zona horaria de La Paz
  const formatearFecha = (fecha) => {
    try {
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

  // Agrupar productos idénticos
  const agruparProductos = (productos) => {
    if (!productos || !Array.isArray(productos)) return [];
    
    const productosAgrupados = productos.reduce((acc, producto) => {
      if (producto.anulado) return acc;
      
      const key = `${producto.id_producto || producto.idProducto}-${producto.precio}`;
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

  // Calcular total
  const calcularTotal = () => {
    if (!pedido.productos || !Array.isArray(pedido.productos)) return 0;
    
    return pedido.productos.reduce((sum, p) => {
      if (p.anulado) return sum;
      const precio = Number(p.precio) || 0;
      const cantidad = Number(p.cantidad) || 0;
      return sum + (precio * cantidad);
    }, 0);
  };

  // Agrupar los productos antes de renderizar
  const productosAgrupados = agruparProductos(pedido.productos);

  const productosHeight = productosAgrupados.length * 32;
  const pagosHeight = (pedido.pagos?.length || 0) * 24;
  const baseHeight = 420;
  const pageHeight = Math.max(baseHeight, 200 + productosHeight + pagosHeight);

  return (
    <Document>
      <Page
        size={[ROLL_WIDTH, pageHeight]}
        style={styles.page}
        wrap={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Taqueando</Text>
          <Text style={styles.infoLine}>Ticket #{pedido.id}</Text>
          <Text style={styles.infoLine}>Fecha: {formatearFecha(pedido.fecha)}</Text>
          <Text style={styles.infoLine}>
            Cliente: {pedido.nombre || 'Mostrador'}
          </Text>
          <Text style={styles.infoLine}>
            Atendió: {pedido.nombre_usuario || '—'}
          </Text>
        </View>

        <View style={styles.separator} />

        {productosAgrupados.map((producto, index) => (
          <View key={index} style={styles.productRow}>
            <Text style={styles.productName}>{producto.nombre}</Text>
            <View style={styles.productDetails}>
              <Text>
                {producto.cantidad} x ${Number(producto.precio).toFixed(2)}
              </Text>
              <Text>
                ${(Number(producto.precio) * Number(producto.cantidad)).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.separator} />

        <Text style={styles.totalLine}>
          Total: ${calcularTotal().toFixed(2)}
        </Text>

        {pedido.pagos && pedido.pagos.length > 0 && (
          <>
            <View style={styles.separator} />
            <Text style={styles.sectionTitle}>Pagos</Text>
            {pedido.pagos.map((pago, index) => (
              <View key={index} style={styles.paymentRow}>
                <Text>{pago.metodo}</Text>
                <Text>${Number(pago.monto).toFixed(2)}</Text>
              </View>
            ))}
          </>
        )}

        <View style={styles.footer}>
          <Text>Estado: {pedido.estado}</Text>
          <Text>Gracias por su compra</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PedidoTicketPDF; 
