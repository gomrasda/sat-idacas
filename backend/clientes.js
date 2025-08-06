const express = require('express');
const db = require('./db');
const router = express.Router();

// Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM clientes');
    res.json(result.rows);
  } catch (err) {
    console.error('Error en GET /clientes:', err);
    res.status(500).json({ error: 'Error al obtener los clientes.' });
  }
});

// Crear un nuevo cliente
router.post('/', async (req, res) => {
  console.log('Datos recibidos en POST /clientes:', req.body);

  const { nombre, obs } = req.body;
  const observacion = obs || '';

  if (!nombre || typeof nombre !== 'string') {
    return res.status(400).json({ error: 'El campo "nombre" es obligatorio y debe ser texto.' });
  }

  try {
    const result = await db.query(
      'INSERT INTO clientes (nombre, obs) VALUES ($1, $2) RETURNING id',
      [nombre, observacion]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    console.error('Error en POST /clientes:', err);
    res.status(500).json({ error: 'Error al crear el cliente.' });
  }
});


// Actualizar un cliente
router.put('/:id', async (req, res) => {
  const { nombre, obs } = req.body;
  const observacion = obs || '';

  try {
    await db.query(
      'UPDATE clientes SET nombre = $1, obs = $2 WHERE id = $3',
      [nombre, observacion, req.params.id]
    );
    res.json({ message: 'Cliente actualizado' });
  } catch (err) {
    console.error('Error en PUT /clientes:', err);
    res.status(500).json({ error: 'Error al actualizar el cliente.' });
  }
});

// Eliminar un cliente
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM clientes WHERE id = $1', [req.params.id]);
    res.json({ message: 'Cliente eliminado' });
  } catch (err) {
    console.error('Error en DELETE /clientes:', err);
    res.status(500).json({ error: 'Error al eliminar el cliente.' });
  }
});

module.exports = router;
