const express = require('express');
const cors = require('cors');
const app = express();

require('dotenv').config();


const authMiddleware = require('./authMiddleware'); // ✅ Middleware de autenticación

const auth = require('./auth');        // Rutas públicas: login y registro
const usuarios = require('./usuarios');
const avisos = require('./avisos');
const clientes = require('./clientes');
const tickets = require('./tickets');

// 🔧 Middleware global
app.use(cors());
app.use(express.json());

// 🟢 Rutas públicas
app.use('/api/auth', auth);

// 🔒 Rutas protegidas con prefijo /api
app.use('/api/usuarios', authMiddleware, usuarios);
app.use('/api/avisos', authMiddleware, avisos);
app.use('/api/clientes', authMiddleware, clientes);
app.use('/api/tickets', authMiddleware, tickets);

// Ruta base para prueba rápida
app.get('/', (req, res) => res.send('Servidor SAT activo'));

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor SAT corriendo en puerto ${PORT}`));
