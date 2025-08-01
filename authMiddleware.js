const jwt = require('jsonwebtoken');
const SECRET_KEY = 'secreto123'; // Usa la misma clave que en auth.js

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]; // Formato "Bearer <token>"
  if (!token) return res.status(401).json({ mensaje: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ mensaje: 'Token inválido' });
  }
}

module.exports = auth;
