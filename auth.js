const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

const SECRET_KEY = 'secreto123';

router.post('/login', async (req, res) => {
  const { usuario, password } = req.body;
  try {
    console.log('Buscando usuario:', usuario);
    const result = await db.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);
    if (result.rows.length === 0) {
      console.log('Usuario no encontrado');
      return res.status(401).json({ mensaje: 'Usuario no encontrado' });
    }
    
    const user = result.rows[0];
    console.log('Usuario encontrado:', user.usuario);
    
    const match = await bcrypt.compare(password, user.password);
    console.log('Resultado bcrypt compare:', match);
    if (!match) {
      console.log('Contraseña incorrecta');
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }
    
    const token = jwt.sign({ id: user.id, rol: user.rol, nombre: user.nombre }, SECRET_KEY, { expiresIn: '1h' });
    console.log('Token generado:', token);
    
    res.json({ token });
  } catch (err) {
    console.error('Error completo en /login:', err);
    if (err instanceof AggregateError) {
      for (const individualError of err.errors) {
        console.error('Suberror:', individualError);
      }
    }
    res.status(500).json({ mensaje: 'Error en el servidor', error: err.toString() });
  }
});


module.exports = router;
