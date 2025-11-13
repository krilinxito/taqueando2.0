import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderBottomStyle: 'solid',
    paddingVertical: 5,
  },
  label: {
    fontSize: 12,
  },
  value: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#000',
    borderTopStyle: 'solid',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  arqueoSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderTopStyle: 'solid',
    paddingTop: 10,
  },
});

const ResumenCajaPDF = ({ resumen, conteo, cajaChica, diferencia }) => {
  const formatMonto = (monto) => {
    const numero = Number(monto);
    return isNaN(numero) ? '0.00' : numero.toFixed(2);
  };

  const calcularTotalConteo = () => {
    return Object.entries(conteo).reduce((total, [denominacion, cantidad]) => {
      return total + (Number(denominacion) * Number(cantidad));
    }, 0);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Resumen de Caja</Text>
          <Text style={styles.subtitle}>
            Fecha: {new Date().toLocaleDateString()}
          </Text>
        </View>

        {/* Resumen de Ventas */}
        <View style={styles.section}>
          <Text style={styles.totalLabel}>Resumen de Ventas</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Efectivo:</Text>
            <Text style={styles.value}>${formatMonto(resumen.totalEfectivo)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Tarjeta:</Text>
            <Text style={styles.value}>${formatMonto(resumen.totalTarjeta)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total QR:</Text>
            <Text style={styles.value}>${formatMonto(resumen.totalQR)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Online:</Text>
            <Text style={styles.value}>${formatMonto(resumen.totalOnline)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total del Día:</Text>
            <Text style={styles.totalValue}>${formatMonto(resumen.totalDia)}</Text>
          </View>
        </View>

        {/* Arqueo de Caja */}
        <View style={styles.arqueoSection}>
          <Text style={styles.totalLabel}>Arqueo de Caja</Text>
          {Object.entries(conteo).map(([denominacion, cantidad]) => (
            <View style={styles.row} key={denominacion}>
              <Text style={styles.label}>
                {denominacion >= 5 ? 'Billete' : 'Moneda'} de ${denominacion}:
              </Text>
              <Text style={styles.value}>{cantidad} unidades</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Contado:</Text>
            <Text style={styles.totalValue}>${formatMonto(calcularTotalConteo())}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Caja Chica:</Text>
            <Text style={styles.value}>${formatMonto(cajaChica)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Diferencia:</Text>
            <Text style={styles.value}>${formatMonto(diferencia)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ResumenCajaPDF; 