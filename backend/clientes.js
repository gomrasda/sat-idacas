const express = require('express');
const db = require('./db');
const router = express.Router();

router.get('/', (req, res) => {
  db.all('SELECT * FROM clientes', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { nombre, obs } = req.body;
  db.run('INSERT INTO clientes (nombre, obs) VALUES (?, ?)', [nombre, obs], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

router.put('/:id', (req, res) => {
  const { nombre, obs } = req.body;
  db.run(
    'UPDATE clientes SET nombre = ?, obs = ? WHERE id = ?',
    [nombre, obs, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Cliente actualizado' });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM clientes WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Cliente eliminado' });
  });
});

module.exports = router;
