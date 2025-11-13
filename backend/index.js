require('dotenv').config();
const express = require('express');
const cors = require('cors');

const indexRoutes = require('./routes/index.routes.js');
const authRoutes = require('./routes/auth.routes.js');
const productoRoutes = require('./routes/producto.routes.js');
const pedidoRoutes = require('./routes/pedido.routes.js');
const pagosRoutes = require('./routes/pagos.routes.js');
const contieneRoutes = require('./routes/contiene.routes.js');
const cajaRoutes = require('./routes/caja.routes.js');
const userLogRoutes = require('./routes/userLog.routes.js');
const arqueoRoutes = require('./routes/arqueo.routes.js');
const estadisticaRoutes = require('./routes/estadistica.routes.js');

const app = express();

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173'];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Rutas principales de la API
app.use('/api', indexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/contiene', contieneRoutes);
app.use('/api/caja', cajaRoutes);
app.use('/api/user-logs', userLogRoutes);
app.use('/api/arqueos', arqueoRoutes);
app.use('/api/estadisticas', estadisticaRoutes);

// test de conexion a la base de datos
async function testDbConnection() {
  try {
    console.log('Conexión a la base de datos exitosa');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error.message);
  }
}
const PORT = process.env.PORT;
app.listen(PORT, () => {
  testDbConnection();
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
