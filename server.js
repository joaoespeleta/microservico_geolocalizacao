require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ROTAS

// Adicionar restaurante
app.post('/api/restaurantes', (req, res) => {
  const { nome, cep } = req.body;
  // Campos obrigatórios: name, email, password, cep
  // Usando placeholders para email e senha por enquanto
  db.query(
    'INSERT INTO restaurants2 (name, email, password, cep) VALUES (?, "", "", ?)',
    [nome, cep],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao adicionar restaurante' });
      res.status(200).json({ success: true });
    }
  );
});

// Listar restaurantes
app.get('/api/restaurantes', (req, res) => {
  db.query('SELECT id, name AS nome, cep FROM restaurants2', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar restaurantes' });
    res.json(results);
  });
});

// Remover restaurante
app.delete('/api/restaurantes/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM restaurants2 WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao deletar restaurante' });
    res.status(200).json({ success: true });
  });
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
