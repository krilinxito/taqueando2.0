const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { SerialPort } = require('serialport');
const EscPosEncoder = require('esc-pos-encoder');
const config = require('./config.json');

function buildReceiptBytes(productos, total) {
  const encoder = new EscPosEncoder();
  const width = config.paperWidth;

  encoder.initialize();

  // Titulo centrado
  encoder.align('center');
  encoder.bold(true);
  encoder.line('CUENTA');
  encoder.bold(false);
  encoder.line('='.repeat(width));

  // Productos
  encoder.align('left');
  for (const p of productos) {
    const nombre = p.nombre || 'Producto';
    const cant = Number(p.cantidad) || 0;
    const precio = Number(p.precio) || 0;
    const subtotal = cant * precio;

    const cantStr = `x${cant}`;
    const precioStr = `$${precio.toFixed(2)}`;
    const subtotalStr = `$${subtotal.toFixed(2)}`;
    const detalle = `  ${cantStr}  ${precioStr}`;
    const rightPart = `  ${subtotalStr}`;

    encoder.line(nombre);
    // Segunda linea con detalles alineados
    const spacesNeeded = Math.max(1, width - detalle.length - rightPart.length);
    encoder.line(detalle + ' '.repeat(spacesNeeded) + rightPart);
  }

  // Total
  encoder.line('-'.repeat(width));
  encoder.align('right');
  encoder.bold(true);
  encoder.line(`TOTAL: $${Number(total).toFixed(2)}`);
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
    try {
      const ports = await SerialPort.list();
      const found = ports.some(p => p.path === config.printerPort);
      sendJson(res, 200, {
        success: true,
        status: 'running',
        printerPort: config.printerPort,
        printerConnected: found,
      });
    } catch {
      sendJson(res, 200, {
        success: true,
        status: 'running',
        printerPort: config.printerPort,
        printerConnected: false,
      });
    }
    return;
  }

  if (req.method === 'GET' && req.url === '/ports') {
    try {
      const ports = await SerialPort.list();
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
      const { productos, total } = await parseBody(req);

      if (!Array.isArray(productos) || total === undefined) {
        sendJson(res, 400, { success: false, error: 'Se requiere productos (array) y total (number)' });
        return;
      }

      const bytes = buildReceiptBytes(productos, total);
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

if (hasSSL) {
  const sslOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
  const server = https.createServer(sslOptions, handler);
  server.listen(config.port, '127.0.0.1', () => {
    console.log(`Agente de impresion (HTTPS) corriendo en https://localhost:${config.port}`);
    console.log(`Puerto impresora: ${config.printerPort} @ ${config.baudRate} baud`);
  });
} else {
  console.warn('AVISO: No se encontraron cert.pem/key.pem. Ejecute generate-cert.bat para habilitar HTTPS.');
  console.warn('Sin HTTPS, el agente no funcionara desde sitios HTTPS (como Netlify).\n');
  const server = http.createServer(handler);
  server.listen(config.port, '127.0.0.1', () => {
    console.log(`Agente de impresion (HTTP) corriendo en http://localhost:${config.port}`);
    console.log(`Puerto impresora: ${config.printerPort} @ ${config.baudRate} baud`);
  });
}
