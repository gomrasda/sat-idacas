const express = require('express');
const cors = require('cors');
const app = express();

const authMiddleware = require('./authMiddleware'); // ✅ Importa el middleware

const auth = require('./auth'); // Login y registro
const usuarios = require('./usuarios');
const avisos = require('./avisos');
const clientes = require('./clientes');
const tickets = require('./tickets');

app.use(cors());
app.use(express.json());

// 🟢 Rutas públicas
app.use('/api/auth', auth);

// 🔒 Rutas protegidas
app.use('/usuarios', authMiddleware, usuarios);
app.use('/avisos', authMiddleware, avisos);
app.use('/clientes', authMiddleware, clientes);
app.use('/tickets', authMiddleware, tickets);

// Ruta para comprobar que el servidor está activo
app.get('/', (req, res) => res.send('Servidor SAT activo'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor SAT corriendo en puerto ${PORT}`));
