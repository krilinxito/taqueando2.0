const jwt = require('jsonwebtoken');
const {
  getUserByEmail,
  getUserById,
  createUser,
  updateUserPassword,
  validatePassword
} = require('../models/user.model');
const UserLog = require('../models/userLog.model');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';


// Validación de fuerza de contraseña con regex
function validarFuerzaPassword(password) {
  if (!password) return 'débil';
  if (password.length < 6) return 'débil';

  const fuerteRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/; 
  const intermediaRegex = /^(?=.*[a-z])(?=.*\d).{6,}$/;

  if (fuerteRegex.test(password)) return 'fuerte';
  if (intermediaRegex.test(password)) return 'intermedia';
  return 'débil';
}

async function register(req, res) {
  const { nombre, email, password } = req.body;

  try {
    const fuerza = validarFuerzaPassword(password);
    if (fuerza === 'débil') {
      return res.status(400).json({ error: 'La contraseña es demasiado débil.' });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado.' });
    }

    const userId = await createUser({ nombre, email, password });
    res.status(201).json({ message: 'Usuario creado correctamente', userId });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  try {
    // Verificar que existe el usuario
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Verificar contraseña
    const validPass = await validatePassword(password, user.password_hash);
    if (!validPass) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Verificar que existe JWT_SECRET
    if (!JWT_SECRET) {
      console.error('JWT_SECRET no está configurado');
      return res.status(500).json({ error: 'Error de configuración del servidor' });
    }

    // Generar token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        nombre: user.nombre,
        rol: user.rol 
      }, 
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Registrar el log de inicio de sesión
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    await UserLog.create(user.id, userAgent, ipAddress);

    // Enviar respuesta exitosa
    return res.json({ 
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}

async function updatePassword(req, res) {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Debe proporcionar ambas contraseñas' });
    }

    const fuerza = validarFuerzaPassword(newPassword);
    if (fuerza === 'débil') {
      return res
        .status(400)
        .json({ error: 'La contraseña es demasiado débil' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const validCurrent = await validatePassword(
      currentPassword,
      user.password_hash
    );
    if (!validCurrent) {
      return res
        .status(400)
        .json({ error: 'La contraseña actual no es correcta' });
    }

    await updateUserPassword(userId, newPassword);

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error actualizando contraseña:', error);
    res.status(500).json({ error: 'Error al actualizar la contraseña' });
  }
}

module.exports = { register, login, updatePassword };
