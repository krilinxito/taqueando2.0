// Usamos 127.0.0.1 (IPv4) en vez de 'localhost' a proposito:
// en Windows 'localhost' resuelve a ::1 (IPv6) primero, y si el agente/firewall
// no responde por IPv6 el navegador da ERR_CONNECTION_TIMED_OUT (agente "no detectado").
// El certificado del agente incluye IP:127.0.0.1 en su SAN, asi que no hay error de TLS.
const PRINT_AGENT_URL = 'https://127.0.0.1:9876';

export async function printReceipt(productos, total, nombrePedido, idPedido) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${PRINT_AGENT_URL}/print`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productos, total, nombrePedido, idPedido }),
      signal: controller.signal,
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Error al imprimir');
    }
    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado');
    }
    if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
      throw new Error('Agente de impresion no encontrado. Ejecute iniciar.bat');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkPrinterStatus() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${PRINT_AGENT_URL}/status`, {
      signal: controller.signal,
    });
    return await res.json();
  } catch {
    return { success: false, printerConnected: false, error: 'Agente de impresion no encontrado' };
  } finally {
    clearTimeout(timeout);
  }
}
