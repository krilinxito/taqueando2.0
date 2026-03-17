const PRINT_AGENT_URL = 'https://localhost:9876';

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
