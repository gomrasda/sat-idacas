const express = require('express');
const db = require('./db');
const bcrypt = require('bcrypt');
const router = express.Router();

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT id, nombre, usuario, email, rol FROM usuarios');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
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
                 VALUES ($1, $2, $3, $4, $5) RETURNING id`;

    const result = await db.query(sql, [nombre, usuario, email, hashedPassword, rol]);
    res.status(201).json({ id: result.rows[0].id, mensaje: 'Usuario creado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al crear usuario' });
  }
});

// Actualizar un usuario
router.put('/:id', async (req, res) => {
  const { nombre, usuario, email, password, rol } = req.body;

  if (!nombre || !usuario || !email || !rol) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
  }

  try {
    let hashedPassword = null;

    if (password && password.trim() !== '') {
      hashedPassword = await bcrypt.hash(password, 10);
    } else {
      const current = await db.query("SELECT password FROM usuarios WHERE id = $1", [req.params.id]);
      if (current.rows.length === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      hashedPassword = current.rows[0].password;
    }

    const sql = `
      UPDATE usuarios
      SET nombre = $1, usuario = $2, email = $3, password = $4, rol = $5
      WHERE id = $6`;

    await db.query(sql, [nombre, usuario, email, hashedPassword, rol, req.params.id]);
    res.json({ mensaje: 'Usuario actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al actualizar el usuario' });
  }
});

// Eliminar un usuario
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM usuarios WHERE id = $1', [req.params.id]);
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar usuario' });
  }
});

module.exports = router;
