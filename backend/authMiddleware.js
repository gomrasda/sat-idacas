const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
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
