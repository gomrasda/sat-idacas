const express = require('express');
const db = require('./db');
const router = express.Router();

// Crear ticket con horas_totales y precio_materiales
router.post('/', async (req, res) => {
  const { aviso_id, fecha, tecnico, estado, horas_totales = 0, precio_materiales = 0 } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO tickets (aviso_id, fecha, tecnico, estado, horas_totales, precio_materiales)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [aviso_id, fecha, tecnico, estado, horas_totales, precio_materiales]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener tickets por aviso_id
router.get('/', async (req, res) => {
  const { aviso_id } = req.query;
  try {
    const result = await db.query('SELECT * FROM tickets WHERE aviso_id = $1', [aviso_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Borrar ticket
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM tickets WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cambiar SOLO el estado
router.put('/:id/estado', async (req, res) => {
  const { estado } = req.body;
  try {
    await db.query('UPDATE tickets SET estado = $1 WHERE id = $2', [estado, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Modificar ticket parcialmente (soporte inline edit)
router.put('/:id', async (req, res) => {
  const { fecha, tecnico, estado, horas_totales, precio_materiales } = req.body;

  const campos = [];
  const valores = [];

  if (fecha !== undefined) { campos.push("fecha = $"+(valores.length+1)); valores.push(fecha); }
  if (tecnico !== undefined) { campos.push("tecnico = $"+(valores.length+1)); valores.push(tecnico); }
  if (estado !== undefined) { campos.push("estado = $"+(valores.length+1)); valores.push(estado); }
  if (horas_totales !== undefined) { campos.push("horas_totales = $"+(valores.length+1)); valores.push(horas_totales); }
  if (precio_materiales !== undefined) { campos.push("precio_materiales = $"+(valores.length+1)); valores.push(precio_materiales); }

  if (campos.length === 0) {
    return res.status(400).json({ error: "No se enviaron campos para actualizar" });
  }

  valores.push(req.params.id);
  const sql = `UPDATE tickets SET ${campos.join(", ")} WHERE id = $${valores.length}`;

  try {
    await db.query(sql, valores);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener cliente del aviso
router.get('/aviso/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT cliente FROM avisos WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Aviso no encontrado' });
    res.json({ cliente: result.rows[0].cliente });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
