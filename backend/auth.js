const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db'); // nuevo db.js con pg

const SECRET_KEY = 'secreto123';

router.post('/login', async (req, res) => {
  const { usuario, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);
    if (result.rows.length === 0) return res.status(401).json({ mensaje: 'Usuario no encontrado' });
    
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    
    const token = jwt.sign({ id: user.id, rol: user.rol, nombre: user.nombre }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Error completo en /login:', err);
    res.status(500).json({ mensaje: 'Error en el servidor', error: err.toString() });
  }
});

module.exports = router;
