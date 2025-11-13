import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const rollWidth = 226.77; // 80mm en puntos

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  header: {
    marginBottom: 12,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'dashed',
    paddingBottom: 8
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  subtitle: {
    fontSize: 10,
    color: '#444',
    marginTop: 2
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    borderBottomStyle: 'solid'
  },
  label: {
    fontSize: 9,
  },
  value: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginTop: 6,
    borderTopWidth: 0.8,
    borderTopColor: '#000',
    borderTopStyle: 'solid'
  },
  footerNote: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 8,
    color: '#555'
  }
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

  const conteoEntries = Object.entries(conteo || {});
  const dynamicHeight = Math.max(
    400,
    360 + conteoEntries.length * 20
  );

  return (
    <Document>
      <Page size={[rollWidth, dynamicHeight]} style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Resumen de Caja</Text>
          <Text style={styles.subtitle}>
            Fecha: {new Date().toLocaleDateString()}
          </Text>
        </View>

        {/* Resumen de Ventas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de Ventas</Text>
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
            <Text style={styles.label}>Total del Día:</Text>
            <Text style={styles.value}>${formatMonto(resumen.totalDia)}</Text>
          </View>
        </View>

        {/* Arqueo de Caja */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Arqueo de Caja</Text>
          {conteoEntries.map(([denominacion, cantidad]) => (
            <View style={styles.row} key={denominacion}>
              <Text style={styles.label}>
                {denominacion >= 5 ? 'Billete' : 'Moneda'} de ${denominacion}:
              </Text>
              <Text style={styles.value}>{cantidad} unidades</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.label}>Total Contado:</Text>
            <Text style={styles.value}>${formatMonto(calcularTotalConteo())}</Text>
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

        <Text style={styles.footerNote}>
          Impreso automáticamente - Formato rollo 80mm
        </Text>
      </Page>
    </Document>
  );
};

export default ResumenCajaPDF; 
