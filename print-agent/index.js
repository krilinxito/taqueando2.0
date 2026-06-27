const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { SerialPort } = require('serialport');
const EscPosEncoder = require('esc-pos-encoder');
const config = require('./config.json');

// --- Cache de puertos serie ---
// SerialPort.list() puede colgarse en algunas maquinas (driver USB-serie, ahorro
// de energia de Windows). Si lo llamamos en cada /status, una llamada trabada deja
// la respuesta HTTP colgada y el frontend marca "Agente no detectado".
// Por eso /status responde al instante usando este cache, que se refresca en
// segundo plano con un timeout duro para que nunca bloquee.
let cachedPorts = [];
let scanInProgress = false;
let lastScan = 0;
// No re-escanear los puertos mas seguido que esto, aunque /status se consulte mas
// a menudo. Asi el frontend puede preguntar cada 10s sin forzar enumeraciones USB
// constantes (que es lo unico costoso / lo que puede trabarse).
const MIN_SCAN_INTERVAL_MS = 15000;

function refreshPortsCache() {
  if (scanInProgress) return;
  if (Date.now() - lastScan < MIN_SCAN_INTERVAL_MS) return;
  scanInProgress = true;
  lastScan = Date.now();
  Promise.race([
    SerialPort.list(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('serialport-list-timeout')), 3000)),
  ])
    .then((ports) => { cachedPorts = ports; })
    .catch(() => { /* mantenemos el cache anterior */ })
    .finally(() => { scanInProgress = false; });
}

function buildReceiptBytes(productos, total, nombrePedido, idPedido) {
  const encoder = new EscPosEncoder();
  const width = config.paperWidth; // 32 chars for 58mm (48mm printable)

  encoder.initialize();

  // Titulo centrado
  encoder.align('center');
  encoder.bold(true);
  encoder.line('CUENTA');
  if (nombrePedido) {
    encoder.line(nombrePedido);
  }
  encoder.bold(false);
  if (idPedido) {
    encoder.line(`Pedido #${idPedido}`);
  }
  encoder.align('left');
  encoder.line('='.repeat(width));

  // Productos
  encoder.align('left');
  for (const p of productos) {
    const nombre = (p.nombre || 'Producto').substring(0, width);
    const cant = Number(p.cantidad) || 0;
    const precio = Number(p.precio) || 0;
    const subtotal = cant * precio;

    const leftPart = ` x${cant}`;
    const rightPart = `$${subtotal.toFixed(2)}`;
    const spacesNeeded = Math.max(1, width - leftPart.length - rightPart.length);

    encoder.line(nombre);
    encoder.line(leftPart + ' '.repeat(spacesNeeded) + rightPart);
  }

  // Total
  encoder.line('-'.repeat(width));
  encoder.align('left');
  encoder.bold(true);
  encoder.line(`TOTAL: $ ${Number(total).toFixed(2)}`);
  encoder.bold(false);
  encoder.line('='.repeat(width));

  // Pie
  encoder.align('center');
  encoder.line('Gracias por su compra!');
  encoder.newline();
  encoder.newline();
  encoder.cut();

  return encoder.encode();
}

async function printToSerial(data) {
  return new Promise((resolve, reject) => {
    const port = new SerialPort({
      path: config.printerPort,
      baudRate: config.baudRate,
    });

    port.on('error', (err) => {
      reject(err);
    });

    port.on('open', () => {
      port.write(Buffer.from(data), (err) => {
        if (err) {
          port.close();
          return reject(err);
        }
        port.drain(() => {
          port.close();
          resolve();
        });
      });
    });
  });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('JSON invalido'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Private-Network': 'true',
  });
  res.end(JSON.stringify(data));
}

const handler = async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (req.method === 'GET' && req.url === '/status') {
    // Respuesta inmediata: el agente esta vivo si contesta. La deteccion de la
    // impresora sale del cache (best-effort) y disparamos un refresco en segundo plano.
    refreshPortsCache();
    const found = cachedPorts.some(p => p.path === config.printerPort);
    sendJson(res, 200, {
      success: true,
      status: 'running',
      printerPort: config.printerPort,
      printerConnected: found,
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/ports') {
    try {
      const ports = await Promise.race([
        SerialPort.list(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('serialport-list-timeout')), 3000)),
      ]);
      cachedPorts = ports;
      sendJson(res, 200, {
        success: true,
        ports: ports.map(p => ({
          path: p.path,
          manufacturer: p.manufacturer || null,
          friendlyName: p.friendlyName || null,
          pnpId: p.pnpId || null,
        })),
      });
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/print') {
    try {
      const { productos, total, nombrePedido, idPedido } = await parseBody(req);

      if (!Array.isArray(productos) || total === undefined) {
        sendJson(res, 400, { success: false, error: 'Se requiere productos (array) y total (number)' });
        return;
      }

      const bytes = buildReceiptBytes(productos, total, nombrePedido, idPedido);
      await printToSerial(bytes);
      sendJson(res, 200, { success: true });
    } catch (err) {
      console.error('Error de impresion:', err.message);
      let errorMsg = err.message;
      if (errorMsg.includes('Access denied') || errorMsg.includes('File not found')) {
        errorMsg = `Puerto ${config.printerPort} no encontrado. Verifique config.json`;
      }
      sendJson(res, 500, { success: false, error: errorMsg });
    }
    return;
  }

  sendJson(res, 404, { success: false, error: 'Ruta no encontrada' });
};

// Check if SSL certs exist for HTTPS
const certPath = path.join(__dirname, 'cert.pem');
const keyPath = path.join(__dirname, 'key.pem');
const hasSSL = fs.existsSync(certPath) && fs.existsSync(keyPath);

// Escuchar en ambos loopbacks: 127.0.0.1 (IPv4) y ::1 (IPv6).
// En Windows, 'localhost' resuelve a ::1 primero; si solo escuchamos en IPv4,
// el intento por IPv6 puede quedar colgado (firewall/proxy) y dar ERR_CONNECTION_TIMED_OUT.
// Mantenemos solo loopback para no exponer el agente a la red local.
const LOOPBACK_HOSTS = ['127.0.0.1', '::1'];

function startServer(createServer, scheme) {
  for (const host of LOOPBACK_HOSTS) {
    const server = createServer();
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`ERROR: el puerto ${config.port} ya esta en uso (${host}).`);
      } else if (err.code === 'EAFNOSUPPORT' || err.code === 'EADDRNOTAVAIL') {
        // El sistema no soporta esa familia (p.ej. IPv6 deshabilitado): se ignora.
        console.warn(`Aviso: no se pudo escuchar en ${host} (${err.code}), se omite.`);
      } else {
        console.error(`Error al escuchar en ${host}:`, err.message);
      }
    });
    server.listen(config.port, host, () => {
      console.log(`Agente de impresion (${scheme}) corriendo en ${scheme.toLowerCase()}://${host === '::1' ? '[::1]' : host}:${config.port}`);
    });
  }
  console.log(`Puerto impresora: ${config.printerPort} @ ${config.baudRate} baud`);
  refreshPortsCache();
}

if (hasSSL) {
  const sslOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
  startServer(() => https.createServer(sslOptions, handler), 'HTTPS');
} else {
  console.warn('AVISO: No se encontraron cert.pem/key.pem. Ejecute generate-cert.bat para habilitar HTTPS.');
  console.warn('Sin HTTPS, el agente no funcionara desde sitios HTTPS (como Netlify).\n');
  startServer(() => http.createServer(handler), 'HTTP');
}
