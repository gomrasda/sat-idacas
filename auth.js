const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db'); // sqlite3 instance

const SECRET_KEY = 'secreto123';

router.post('/login', (req, res) => {
  const { usuario, password } = req.body;

  db.get('SELECT * FROM usuarios WHERE usuario = ?', [usuario], (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }
    if (!user) {
      return res.status(401).json({ mensaje: 'Usuario no encontrado' });
    }

    bcrypt.compare(password, user.password, (err, match) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ mensaje: 'Error en el servidor' });
      }
      if (!match) {
        return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
      }

      const token = jwt.sign({ id: user.id, rol: user.rol, nombre: user.nombre }, SECRET_KEY, { expiresIn: '1h' });
      res.json({ token });
    });
  });
});

module.exports = router;
