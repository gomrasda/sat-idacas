const express = require('express');
const db = require('./db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM clientes');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { nombre, obs } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO clientes (nombre, obs) VALUES ($1, $2) RETURNING id',
      [nombre, obs]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { nombre, obs } = req.body;
  try {
    await db.query(
      'UPDATE clientes SET nombre = $1, obs = $2 WHERE id = $3',
      [nombre, obs, req.params.id]
    );
    res.json({ message: 'Cliente actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM clientes WHERE id = $1', [req.params.id]);
    res.json({ message: 'Cliente eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
