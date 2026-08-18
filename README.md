# Taqueando 2.0

Sistema de gestión de pedidos y caja para un restaurante de comida mexicana en La Paz. **En producción
desde mediados de 2025**: ≈ 7.950 pedidos procesados en 246 días operativos hasta mayo de 2026.

🔗 **[taqueando.store](https://taqueando.store)**

Es la segunda versión del sistema; la primera se reescribió para limpiar la arquitectura y separar
responsabilidades.

---

## Qué resuelve

El restaurante abre de martes a sábado, de 18:00 a 22:00, y atiende en mesa, para llevar y delivery.
El sistema cubre el turno completo:

- **Pedidos** — alta, edición y seguimiento; impresión de comanda en la cocina.
- **Caja** — cobro por pedido en efectivo, tarjeta, QR u online. Como `pagos` guarda una fila por
  cobro, un mismo pedido admite pagos parciales y divididos entre métodos.
- **Arqueos** — cierre de turno con conteo de billetes denominación por denominación, contra lo que el
  sistema dice que debería haber.
- **Estadísticas** — ventas por día, producto y tipo de pedido, exportables a PDF.
- **Auditoría** — registro de acciones por usuario (`user_logs`), porque en una caja compartida
  importa saber quién hizo qué.

Dos roles: `admin` (todo, incluida gestión de productos y arqueos) y `user` (operación del turno).

---

## Arquitectura

```
React + Vite + MUI                Node.js + Express                MySQL
(navegador)      ──── REST ────►  routes → controllers → models  ──►  (Aiven Cloud)
     │                            JWT + middleware de rol
     │
     └──── HTTP local ────►  print-agent  ──serial ESC/POS──►  impresora térmica
                             (corre en la PC de la caja)
```

Backend en tres capas, con SQL parametrizado sobre un pool de `mysql2/promise` — sin ORM, porque las
consultas de estadísticas y arqueos se escriben más claro a mano.

### El agente de impresión

Una impresora térmica conectada por USB-serie no es alcanzable desde el navegador. `print-agent/` es un
servicio Node que corre en la PC de la caja, expone un HTTP local y traduce los pedidos a ESC/POS.

El detalle que costó: `SerialPort.list()` se cuelga en algunas máquinas Windows por el ahorro de
energía del driver USB-serie. Si el endpoint `/status` lo llamara directamente, una llamada trabada
dejaría la respuesta HTTP colgada y el frontend marcaría "agente no detectado" para siempre. Por eso
`/status` responde al instante desde un caché de puertos que se refresca en segundo plano con un
timeout duro.

---

## Esquema

`productos` · `usuarios` · `pedidos` · `contiene` (detalle del pedido) · `pagos` · `caja` ·
`arqueos_caja` · `user_logs`

Un detalle heredado del POS original: en `pedidos`, **`estado = 'cancelado'` significa pagado**. El
flujo es `pendiente` → `cancelado`, donde el segundo estado marca el cobro confirmado.

DDL completo en [`bd.sql`](bd.sql).

---

## Cómo correrlo

```bash
# backend
cd backend && npm install
cat > .env <<'ENV'
PORT=3000
DB_HOST=...  DB_USER=...  DB_PASSWORD=...  DB_NAME=...  DB_PORT=3306
JWT_SECRET=...
CORS_ORIGINS=http://localhost:5173
ENV
npm run dev

# frontend
cd ../frontend && npm install
echo 'VITE_API_URL=http://localhost:3000/api' > .env
npm run dev
```

El esquema se crea con `bd.sql`. El agente de impresión es opcional en desarrollo:
`cd print-agent && npm install && node index.js`.

## Estructura

```
backend/
├── routes/       un router por recurso, montados en /api
├── controllers/  pedido · pago · caja · arqueo · producto · estadistica · auth
├── models/       SQL parametrizado sobre el pool
├── middlewares/  verificarToken (JWT + caché) · soloAdmin
└── config/db.js  pool mysql2
frontend/src/
├── pages/        admin/ · user/ · Auth/ · shared/
├── API/          un módulo por recurso, sobre una instancia de axios
└── context/      AuthContext (sesión, expiración por inactividad)
print-agent/      agente ESC/POS local
```

Stack: Node.js · Express · MySQL · JWT · React · Vite · Material UI · Recharts · @react-pdf/renderer.
