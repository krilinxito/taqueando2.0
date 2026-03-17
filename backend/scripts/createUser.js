require("dotenv").config({ path: __dirname + '/../.env' });

const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function createUser() {
  const nombre = process.argv[2] || process.env.USER_NOMBRE;
  const email = process.argv[3] || process.env.USER_EMAIL;
  const password = process.argv[4] || process.env.USER_PASSWORD;
  const rol = process.argv[5] || 'empleado';

  if (!nombre || !email || !password) {
    console.error('Uso: node createUser.js <nombre> <email> <password> [rol]');
    console.error('O configurar USER_NOMBRE, USER_EMAIL, USER_PASSWORD en .env');
    process.exit(1);
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, hash, rol]
    );

    console.log('Usuario creado:', result.insertId);
    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('Error al crear usuario:', error.message);
    process.exit(1);
  }
}

createUser();
