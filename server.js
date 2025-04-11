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

// Adicionar loja
app.post('/api/lojas', (req, res) => {
  const { nome, cep } = req.body;
  db.query('INSERT INTO lojas (nome, cep) VALUES (?, ?)', [nome, cep], (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao adicionar loja' });
    res.status(200).json({ success: true });
  });
});

// Listar lojas
app.get('/api/lojas', (req, res) => {
  db.query('SELECT * FROM lojas', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar lojas' });
    res.json(results);
  });
});

// Remover loja
app.delete('/api/lojas/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM lojas WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao deletar loja' });
    res.status(200).json({ success: true });
  });
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
