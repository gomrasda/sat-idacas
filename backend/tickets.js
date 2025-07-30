const express = require('express');
const db = require('./db');
const router = express.Router();

// Crear ticket con horas_totales y precio_materiales
router.post('/', (req, res) => {
  const { aviso_id, fecha, tecnico, estado, horas_totales = 0, precio_materiales = 0 } = req.body;
  db.run(
    `INSERT INTO tickets (aviso_id, fecha, tecnico, estado, horas_totales, precio_materiales) VALUES (?, ?, ?, ?, ?, ?)`,
    [aviso_id, fecha, tecnico, estado, horas_totales, precio_materiales],
    function(err){
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Obtener tickets por aviso_id
router.get('/', (req, res) => {
  const { aviso_id } = req.query;
  db.all('SELECT * FROM tickets WHERE aviso_id = ?', [aviso_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Borrar ticket
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM tickets WHERE id = ?', [req.params.id], function(err){
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Cambiar SOLO el estado
router.put('/:id/estado', (req, res) => {
  const { estado } = req.body;
  db.run('UPDATE tickets SET estado = ? WHERE id = ?', [estado, req.params.id], function(err){
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Modificar ticket parcialmente (soporte inline edit)
router.put('/:id', (req, res) => {
  const { fecha, tecnico, estado, horas_totales, precio_materiales } = req.body;

  const campos = [];
  const valores = [];

  if (fecha !== undefined) { campos.push("fecha = ?"); valores.push(fecha); }
  if (tecnico !== undefined) { campos.push("tecnico = ?"); valores.push(tecnico); }
  if (estado !== undefined) { campos.push("estado = ?"); valores.push(estado); }
  if (horas_totales !== undefined) { campos.push("horas_totales = ?"); valores.push(horas_totales); }
  if (precio_materiales !== undefined) { campos.push("precio_materiales = ?"); valores.push(precio_materiales); }

  if (campos.length === 0) {
    return res.status(400).json({ error: "No se enviaron campos para actualizar" });
  }

  const sql = `UPDATE tickets SET ${campos.join(", ")} WHERE id = ?`;
  valores.push(req.params.id);

  db.run(sql, valores, function(err){
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Obtener cliente del aviso
router.get('/aviso/:id', (req, res) => {
  db.get('SELECT cliente FROM avisos WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Aviso no encontrado' });
    res.json({ cliente: row.cliente });
  });
});

module.exports = router;

