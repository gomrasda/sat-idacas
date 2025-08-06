const express = require('express');
const db = require('./db');
const router = express.Router();

// GET /avisos
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT a.id,
              a.cliente AS cliente_id,
              c.nombre AS cliente,
              a.tarea,
              a.fecha_programada,
              a.tecnico,
              a.estado
       FROM avisos a
       JOIN clientes c ON a.cliente = c.id
       ORDER BY a.fecha_programada DESC`
    );

    const avisos = result.rows.map(a => ({
      ...a,
      fecha_programada: new Date(a.fecha_programada).toISOString().split('T')[0]
    }));

    res.json(avisos);
  } catch (err) {
    console.error('Error en GET /avisos:', err);
    res.status(500).json({ error: 'Error al obtener avisos' });
  }
});

// GET /avisos/:id
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    const result = await db.query(
      `SELECT a.id,
              a.cliente AS cliente_id,
              c.nombre AS cliente,
              a.tarea,
              a.fecha_programada,
              a.tecnico,
              a.estado
       FROM avisos a
       JOIN clientes c ON a.cliente = c.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aviso no encontrado' });
    }

    const aviso = {
      ...result.rows[0],
      fecha_programada: new Date(result.rows[0].fecha_programada).toISOString().split('T')[0]
    };

    res.json(aviso);
  } catch (err) {
    console.error('Error en GET /avisos/:id:', err);
    res.status(500).json({ error: 'Error al obtener el aviso' });
  }
});

// POST /avisos
router.post('/', async (req, res) => {
  const clienteId = parseInt(req.body.cliente, 10);
  const { tarea, fecha_programada, tecnico, estado } = req.body;

  if (isNaN(clienteId)) {
    return res.status(400).json({ error: 'El campo "cliente" debe ser un ID numérico.' });
  }
  if (!tarea) {
    return res.status(400).json({ error: 'El campo "tarea" es obligatorio.' });
  }
  if (!fecha_programada) {
    return res.status(400).json({ error: 'El campo "fecha_programada" es obligatorio.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO avisos
        (cliente, tarea, fecha_programada, tecnico, estado)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [clienteId, tarea, fecha_programada, tecnico || null, estado || 'Pendiente']
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    console.error('ERROR en POST /avisos:', err);
    res.status(500).json({ error: 'Error al crear el aviso.' });
  }
});

// PUT /avisos/:id
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const clienteId = parseInt(req.body.cliente, 10);
  const { tarea, fecha_programada, tecnico, estado } = req.body;

  if (isNaN(id) || isNaN(clienteId)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  if (!tarea || !fecha_programada) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const result = await db.query(
      `UPDATE avisos
       SET cliente = $1, tarea = $2, fecha_programada = $3, tecnico = $4, estado = $5
       WHERE id = $6`,
      [clienteId, tarea, fecha_programada, tecnico, estado, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Aviso no encontrado' });
    }
    res.json({ mensaje: 'Aviso actualizado correctamente' });
  } catch (err) {
    console.error('Error en PUT /avisos/:id:', err);
    res.status(500).json({ error: 'Error al actualizar el aviso' });
  }
});

// DELETE /avisos/:id
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    const result = await db.query('DELETE FROM avisos WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Aviso no encontrado' });
    }
    res.json({ mensaje: 'Aviso eliminado correctamente' });
  } catch (err) {
    console.error('Error en DELETE /avisos/:id:', err);
    res.status(500).json({ error: 'Error al eliminar el aviso' });
  }
});

module.exports = router;
