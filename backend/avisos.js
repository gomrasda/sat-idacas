const express = require('express');
const db = require('./db');
const router = express.Router();

// Obtener todos los avisos con cliente, tarea, etc.
router.get('/', (req, res) => {
  db.all('SELECT id, cliente, tarea, fecha_programada, tecnico, estado FROM avisos', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Crear un aviso
router.post('/', (req, res) => {
  const { cliente, tarea, fecha_programada, tecnico, estado } = req.body;
  db.run(`INSERT INTO avisos (cliente, tarea, fecha_programada, tecnico, estado) VALUES (?, ?, ?, ?, ?)`,
    [cliente, tarea, fecha_programada, tecnico, estado],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Editar un aviso existente
router.put('/:id', (req, res) => {
  const { cliente, tarea, fecha_programada, tecnico, estado } = req.body;
  db.run(`UPDATE avisos SET cliente=?, tarea=?, fecha_programada=?, tecnico=?, estado=? WHERE id=?`,
    [cliente, tarea, fecha_programada, tecnico, estado, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Aviso actualizado' });
    }
  );
});

// Eliminar un aviso
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM avisos WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Aviso eliminado' });
  });
});

// Obtener un aviso por ID
router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM avisos WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Aviso no encontrado' });
    res.json(row);
  });
});


module.exports = router;
