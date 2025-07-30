const express = require('express');
const db = require('./db');
const bcrypt = require('bcrypt');
const router = express.Router();

// Obtener todos los usuarios
router.get('/', (req, res) => {
  db.all('SELECT id, nombre, usuario, email, rol FROM usuarios', [], (err, rows) => {
    if (err) return res.status(500).json({ mensaje: 'Error al obtener usuarios' });
    res.json(rows);
  });
});

// Crear un nuevo usuario
router.post('/', async (req, res) => {
  const { nombre, usuario, email, password, rol } = req.body;

  if (!nombre || !usuario || !email || !password || !rol) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO usuarios (nombre, usuario, email, password, rol)
                 VALUES (?, ?, ?, ?, ?)`;

    db.run(sql, [nombre, usuario, email, hashedPassword, rol], function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ mensaje: 'Error al crear usuario' });
      }
      res.status(201).json({ id: this.lastID, mensaje: 'Usuario creado' });
    });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Actualizar un usuario
router.put('/:id', async (req, res) => {
  const { nombre, usuario, email, password, rol } = req.body;

  if (!nombre || !usuario || !email || !rol) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
  }

  try {
    let hashedPassword;

    if (password && password.trim() !== '') {
      hashedPassword = await bcrypt.hash(password, 10);
    } else {
      const row = await new Promise((resolve, reject) => {
        db.get("SELECT password FROM usuarios WHERE id = ?", [req.params.id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      hashedPassword = row.password;
    }

    const sql = `
      UPDATE usuarios
      SET nombre = ?, usuario = ?, email = ?, password = ?, rol = ?
      WHERE id = ?`;

    db.run(sql, [nombre, usuario, email, hashedPassword, rol, req.params.id], function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ mensaje: 'Error al actualizar el usuario' });
      }
      res.json({ mensaje: 'Usuario actualizado' });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Eliminar un usuario
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM usuarios WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ mensaje: 'Error al eliminar usuario' });
    res.json({ mensaje: 'Usuario eliminado' });
  });
});

module.exports = router;

