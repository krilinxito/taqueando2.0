const express = require('express');
const router = express.Router();

// Importa los controladores y middlewares correctamente
const { register, login, updatePassword } = require('../controllers/auth.controller'); // ✅ Agrega esta línea
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');

// Asegura que esta ruta exista y devuelva la estructura correcta
router.post('/verify-token', verificarToken, (req, res) => {
  // Devuelve todos los datos cargados en req.user
  res.json({ user: req.user });
});


// Rutas existentes
router.post('/register', register); // ← Ahora register está definido
router.post('/login', login);       // ← login también estará definido
router.post('/update-password', verificarToken, updatePassword);

// Ruta de admin
// Modifica la ruta para incluir datos relevantes
router.get('/admin', verificarToken, soloAdmin, (req, res) => {
  res.json({
    message: `Bienvenido admin ${req.user.email}`,
    adminData: {
      nombre: req.user.nombre,
      email: req.user.email,
      rol: req.user.rol,
    }
  });
});

module.exports = router;
