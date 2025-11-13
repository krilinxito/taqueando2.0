require("dotenv").config({ path: __dirname + '/../.env' });

const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function createUser() {
  try {
    const userData = {
      nombre: 'user1',
      email: 'user@gmail.com',
      password: 'Omegalul123',
      rol: 'empleado'
    };

    const hash = await bcrypt.hash(userData.password, 10);

    const [result] = await pool.execute(
      'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
      [userData.nombre, userData.email, hash, userData.rol]
    );

    console.log('Usuario creado:', result.insertId);
    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('Error al crear usuario:', error);
    process.exit(1);
  }
}

createUser();
