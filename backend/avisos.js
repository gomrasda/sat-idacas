const express = require('express');
const db = require('./db');
const router = express.Router();

// Obtener todos los avisos
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT id, cliente, tarea, fecha_programada, tecnico, estado FROM avisos');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear un aviso
router.post('/', async (req, res) => {
  const { cliente, tarea, fecha_programada, tecnico, estado } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO avisos (cliente, tarea, fecha_programada, tecnico, estado) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [cliente, tarea, fecha_programada, tecnico, estado]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Editar un aviso existente
router.put('/:id', async (req, res) => {
  const { cliente, tarea, fecha_programada, tecnico, estado } = req.body;
  try {
    await db.query(
      'UPDATE avisos SET cliente=$1, tarea=$2, fecha_programada=$3, tecnico=$4, estado=$5 WHERE id=$6',
      [cliente, tarea, fecha_programada, tecnico, estado, req.params.id]
    );
    res.json({ message: 'Aviso actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar un aviso
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM avisos WHERE id=$1', [req.params.id]);
    res.json({ message: 'Aviso eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener un aviso por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM avisos WHERE id=$1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Aviso no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
