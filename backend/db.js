require('dotenv').config();
const { Pool } = require('pg');

console.log("Intentando conectar con:", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.connect()
  .then(() => console.log("✅ ¡Conexión exitosa a PostgreSQL desde Node!"))
  .catch(err => console.error("❌ Error conectando a PostgreSQL:", err));

module.exports = pool;
