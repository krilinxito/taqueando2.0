const bcrypt = require('bcrypt');
const pool = require('../config/db');
require("dotenv").config({ path: __dirname + '/../.env' });

async function createAdminUser() {
  const nombre = process.argv[2] || process.env.ADMIN_NOMBRE;
  const email = process.argv[3] || process.env.ADMIN_EMAIL;
  const password = process.argv[4] || process.env.ADMIN_PASSWORD;

  if (!nombre || !email || !password) {
    console.error('Uso: node createAdmin.js <nombre> <email> <password>');
    console.error('O configurar ADMIN_NOMBRE, ADMIN_EMAIL, ADMIN_PASSWORD en .env');
    process.exit(1);
  }

  try {
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.execute(
      'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, password_hash, 'admin']
    );

    console.log('Usuario admin creado exitosamente');
    console.log('ID:', result.insertId);
    console.log('Email:', email);

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error al crear usuario admin:', error.message);
    process.exit(1);
  }
}

createAdminUser();
