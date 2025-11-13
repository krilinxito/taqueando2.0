const bcrypt = require('bcrypt');
const pool = require('../config/db');
require("dotenv").config({ path: __dirname + '/../.env' });

async function createAdminUser() {
  try {
    // Datos del usuario admin
    const adminData = {
      nombre: 'maxi',
      email: 'barryallen4207@gmail.com',
      password: 'admin123', 
      rol: 'admin'
    };

    // Generar hash de la contraseña
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(adminData.password, saltRounds);

    // Insertar el usuario en la base de datos
    const [result] = await pool.execute(
      'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
      [adminData.nombre, adminData.email, password_hash, adminData.rol]
    );

    console.log('Usuario admin creado exitosamente');
    console.log('ID:', result.insertId);
    console.log('Email:', adminData.email);
    console.log('Contraseña (sin hash):', adminData.password);
    console.log('Hash generado:', password_hash);

    // Cerrar la conexión
    await pool.end();
    
    process.exit(0);
  } catch (error) {
    console.error('Error al crear usuario admin:', error);
    process.exit(1);
  }
}

createAdminUser(); 