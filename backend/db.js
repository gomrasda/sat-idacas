const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./sat.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    usuario TEXT,
    email TEXT,
    password TEXT,
    rol TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS avisos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente TEXT,
    tarea TEXT,
    fecha_programada TEXT,
    tecnico TEXT,
    estado TEXT DEFAULT 'Pendiente'
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    obs TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aviso_id INTEGER,
    fecha TEXT,
    tecnico TEXT,
    estado TEXT
  )`);

  // Chequear columnas y añadir solo si faltan:
  db.all(`PRAGMA table_info(tickets)`, (err, columns) => {
    if (err) return;
    const names = columns.map(c => c.name);
    if (!names.includes('horas_totales')) {
      db.run(`ALTER TABLE tickets ADD COLUMN horas_totales REAL DEFAULT 0`);
    }
    if (!names.includes('precio_materiales')) {
      db.run(`ALTER TABLE tickets ADD COLUMN precio_materiales REAL DEFAULT 0`);
    }
  });
});

module.exports = db;
