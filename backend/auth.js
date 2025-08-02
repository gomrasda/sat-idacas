const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

console.log("Conectando a la base de datos:", process.env.DATABASE_URL);


const SECRET_KEY = 'secreto123';

router.post('/login', async (req, res) => {
  console.log("BODY RECIBIDO:", req.body);  // 👈 Verificación clave

  const { usuario, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ mensaje: 'Usuario no encontrado' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user.id, rol: user.rol, nombre: user.nombre },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error("ERROR en login:", err);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

module.exports = router;
