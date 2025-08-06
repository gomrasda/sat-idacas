const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./sat.db');

db.serialize(() => {
  // Renombrar la columna 'nombre' a 'nombre_completo' si existe
  db.all("PRAGMA table_info(usuarios)", (err, columns) => {
    if (err) {
      console.error("Error obteniendo información de la tabla:", err);
      return;
    }

    const nombres = columns.map(c => c.name);
    if (nombres.includes('nombre') && !nombres.includes('nombre_completo')) {
      console.log("Arreglando la tabla usuarios...");

      db.run(`ALTER TABLE usuarios RENAME TO usuarios_old`, (err) => {
        if (err) return console.error(err);

        db.run(`CREATE TABLE usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre_completo TEXT,
          usuario TEXT,
          email TEXT,
          password TEXT,
          rol TEXT
        )`, (err) => {
          if (err) return console.error(err);

          db.run(`INSERT INTO usuarios (id, nombre_completo, usuario, email, password, rol)
                  SELECT id, nombre, usuario, email, password, rol FROM usuarios_old`, (err) => {
            if (err) return console.error(err);

            db.run(`DROP TABLE usuarios_old`, (err) => {
              if (err) return console.error(err);
              console.log("✅ Tabla usuarios corregida correctamente.");
              db.close();
            });
          });
        });
      });
    } else {
      console.log("La tabla ya está correcta. No hay cambios necesarios.");
      db.close();
    }
  });
});
