const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Asegúrate que esta variable esté en .env
  ssl: {
    rejectUnauthorized: false,
  },
});

// Función para crear las tablas
async function crearTablas() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nombre TEXT,
      usuario TEXT,
      email TEXT,
      password TEXT,
      rol TEXT
    );
    
    CREATE TABLE IF NOT EXISTS avisos (
      id SERIAL PRIMARY KEY,
      cliente TEXT,
      tarea TEXT,
      fecha_programada DATE,
      tecnico TEXT,
      estado TEXT DEFAULT 'Pendiente'
    );
    
    CREATE TABLE IF NOT EXISTS clientes (
      id SERIAL PRIMARY KEY,
      nombre TEXT,
      obs TEXT
    );
    
    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      aviso_id INTEGER,
      fecha DATE,
      tecnico TEXT,
      estado TEXT,
      horas_totales REAL DEFAULT 0,
      precio_materiales REAL DEFAULT 0
    );
  `);
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  crearTablas,
};
