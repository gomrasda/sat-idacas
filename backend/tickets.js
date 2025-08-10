// routes/tickets.js
const express = require('express');
const db = require('./db'); // ajusta la ruta si tu pool está en otro sitio
const router = express.Router();

/**
 * POST /tickets
 * Crea un ticket. Acepta 'description' (inglés) y también 'descripcion' (compat).
 */
router.post('/', async (req, res) => {
  const avisoId = parseInt(req.body.aviso_id, 10);
  const {
    fecha,
    tecnico,
    estado = 'Pausado',
    horas_totales = 0,
    precio_materiales = 0,
    description = req.body.descripcion ?? ''
  } = req.body;

  if (isNaN(avisoId)) {
    return res.status(400).json({ error: 'aviso_id inválido' });
  }

  try {
    const sql = `
      INSERT INTO tickets (
        aviso_id, fecha, tecnico, estado, horas_totales, precio_materiales, description
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
    `;
    const params = [avisoId, fecha, tecnico, estado, horas_totales, precio_materiales, description];
    const { rows } = await db.query(sql, params);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[POST /tickets] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /tickets?aviso_id=...
 * Devuelve tickets ordenados por fecha DESC (y id DESC). Selecciona * para evitar errores por columnas nuevas.
 */
router.get('/', async (req, res) => {
  const avisoId = parseInt(req.query.aviso_id, 10);
  if (isNaN(avisoId)) {
    return res.status(400).json({ error: 'aviso_id inválido' });
  }

  try {
    const sql = `
      SELECT *
      FROM tickets
      WHERE aviso_id = $1
      ORDER BY fecha DESC, id DESC
    `;
    const { rows } = await db.query(sql, [avisoId]);

    const formatted = rows.map(t => ({
      ...t,
      fecha: t.fecha ? new Date(t.fecha).toISOString().split('T')[0] : null
    }));

    res.json(formatted);
  } catch (err) {
    console.error('[GET /tickets] Error:', err);
    res.status(500).json({ error: err.message || 'Error interno' });
  }
});

/**
 * DELETE /tickets/:id
 */
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const result = await db.query('DELETE FROM tickets WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Ticket no encontrado' });
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /tickets/:id] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /tickets/:id/estado
 * Cambia solo el estado.
 */
router.put('/:id/estado', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { estado } = req.body;

  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    await db.query('UPDATE tickets SET estado = $1 WHERE id = $2', [estado, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[PUT /tickets/:id/estado] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /tickets/:id
 * Actualización parcial y segura (incluye 'description').
 */
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const {
    fecha,
    tecnico,
    estado,
    horas_totales,
    precio_materiales,
    // acepta ambos nombres
    description = req.body.descripcion
  } = req.body;

  const campos = [];
  const valores = [];

  if (fecha !== undefined)             { campos.push(`fecha = $${valores.length + 1}`);             valores.push(fecha); }
  if (tecnico !== undefined)           { campos.push(`tecnico = $${valores.length + 1}`);           valores.push(tecnico); }
  if (estado !== undefined)            { campos.push(`estado = $${valores.length + 1}`);            valores.push(estado); }
  if (horas_totales !== undefined)     { campos.push(`horas_totales = $${valores.length + 1}`);     valores.push(horas_totales); }
  if (precio_materiales !== undefined) { campos.push(`precio_materiales = $${valores.length + 1}`); valores.push(precio_materiales); }
  if (description !== undefined)       { campos.push(`description = $${valores.length + 1}`);       valores.push(description ?? ''); }

  if (campos.length === 0) {
    return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
  }

  valores.push(id);
  const sql = `UPDATE tickets SET ${campos.join(', ')} WHERE id = $${valores.length} RETURNING *`;

  try {
    const { rows } = await db.query(sql, valores);
    res.json(rows[0] || { success: true });
  } catch (err) {
    console.error('[PUT /tickets/:id] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /tickets/aviso/:id
 * Devuelve el cliente del aviso (si usas esta ruta).
 */
router.get('/aviso/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID de aviso inválido' });

  try {
    const { rows } = await db.query('SELECT cliente FROM avisos WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Aviso no encontrado' });
    res.json({ cliente: rows[0].cliente });
  } catch (err) {
    console.error('[GET /tickets/aviso/:id] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
