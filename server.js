const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');

const app = express();

// Habilitar CORS
app.use(cors({
  origin: '*', // Cambia esto al dominio donde se hospeda tu frontend
  methods: ['GET', 'POST']
}));
app.use(express.json());

// Conexión directa a la base de datos (sin variables de entorno)
const db = mysql.createConnection({
  host: 'rafadetallado.neuroseeq.com',
  user: 'u475816193_rafa',
  password: 'Danny9710',
  database: 'u475816193_rafadetallado'
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    process.exit(1);
  }
  console.log('Conectado a la base de datos MySQL');
});

// Endpoint de login de administrador
app.post('/api/admin-login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM admins WHERE username = ?', [username], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).send('Error en el servidor.');
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado.' });
    }

    const admin = results[0];
    bcrypt.compare(password, admin.password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
      }
      res.json({ success: true });
    });
  });
});

// Endpoint para guardar reportes
app.post('/api/reportes', (req, res) => {
  const { service, date, price, received, change } = req.body;

  // Validar entradas
  if (!service || !date || !price || !received || !change) {
    return res.status(400).json({ success: false, message: 'Faltan datos necesarios.' });
  }

  const query = 'INSERT INTO reportes (service, date, price, received, change_amount) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [service, date, price, received, change], (error, results) => {
    if (error) {
      console.error('Error en la consulta SQL:', error.message);
      return res.status(500).send('Error al guardar el reporte en la base de datos.');
    }
    res.status(201).json({ success: true });
  });
});

// Cerrar la conexión a la base de datos al finalizar el servidor
process.on('SIGINT', () => {
  db.end((err) => {
    if (err) {
      console.error('Error al cerrar la conexión a la base de datos', err);
    } else {
      console.log('Conexión a la base de datos cerrada.');
    }
    process.exit();
  });
});

app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});
