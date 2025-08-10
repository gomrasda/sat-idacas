const express = require('express');
const db = require('./db');
const router = express.Router();

// Crear ticket
router.post('/', async (req, res) => {
  const avisoId = parseInt(req.body.aviso_id, 10);
  const {
    fecha,
    tecnico,
    estado,
    horas_totales = 0,
    precio_materiales = 0,
    // acepta ambos nombres por compatibilidad
    description = req.body.descripcion ?? ''
  } = req.body;

  if (isNaN(avisoId)) {
    return res.status(400).json({ error: 'aviso_id inválido' });
  }

  try {
    const result = await db.query(
      `INSERT INTO tickets
         (aviso_id, fecha, tecnico, estado, horas_totales, precio_materiales, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [avisoId, fecha, tecnico, estado, horas_totales, precio_materiales, description]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener tickets por aviso_id (ordenados y con fecha YYYY-MM-DD)
router.get('/', async (req, res) => {
  const avisoId = parseInt(req.query.aviso_id, 10);

  if (isNaN(avisoId)) {
    return res.status(400).json({ error: 'aviso_id inválido' });
  }

  try {
    const result = await db.query(
      `SELECT id, aviso_id, fecha, tecnico,
              horas_totales, precio_materiales, estado, description
         FROM tickets
        WHERE aviso_id = $1
        ORDER BY fecha DESC, id DESC`,
      [avisoId]
    );

    const formattedRows = result.rows.map(ticket => ({
      ...ticket,
      fecha: ticket.fecha ? ticket.fecha.toISOString().split('T')[0] : null
    }));

    res.json(formattedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Borrar ticket
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    const result = await db.query('DELETE FROM tickets WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cambiar SOLO el estado
router.put('/:id/estado', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { estado } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    await db.query('UPDATE tickets SET estado = $1 WHERE id = $2', [estado, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Modificar ticket parcialmente (incluye description)
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const {
    fecha,
    tecnico,
    estado,
    horas_totales,
    precio_materiales,
    // acepta ambos nombres por compatibilidad
    description = req.body.descripcion
  } = req.body;

  const campos = [];
  const valores = [];

  if (fecha !== undefined)            { campos.push(`fecha = $${valores.length+1}`);            valores.push(fecha); }
  if (tecnico !== undefined)          { campos.push(`tecnico = $${valores.length+1}`);          valores.push(tecnico); }
  if (estado !== undefined)           { campos.push(`estado = $${valores.length+1}`);           valores.push(estado); }
  if (horas_totales !== undefined)    { campos.push(`horas_totales = $${valores.length+1}`);    valores.push(horas_totales); }
  if (precio_materiales !== undefined){ campos.push(`precio_materiales = $${valores.length+1}`);valores.push(precio_materiales); }
  if (description !== undefined)      { campos.push(`description = $${valores.length+1}`);      valores.push(description ?? ''); }

  if (campos.length === 0) {
    return res.status(400).json({ error: "No se enviaron campos para actualizar" });
  }

  valores.push(id);
  const sql = `UPDATE tickets SET ${campos.join(", ")} WHERE id = $${valores.length}`;

  try {
    await db.query(sql, valores);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// (Opcional) Obtener cliente del aviso desde aquí
router.get('/aviso/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID de aviso inválido' });
  }

  try {
    const result = await db.query('SELECT cliente FROM avisos WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Aviso no encontrado' });
    res.json({ cliente: result.rows[0].cliente });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
