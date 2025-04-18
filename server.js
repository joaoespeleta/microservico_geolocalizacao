// Carrega variáveis de ambiente do arquivo .env
require('dotenv').config();

// Importações de bibliotecas
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

// Inicializa o app Express
const app = express();

// Middlewares
app.use(cors()); // Permite requisições de outras origens (Cross-Origin)
app.use(express.json()); // Permite leitura de JSON no corpo das requisições
app.use(express.static(path.join(__dirname, 'public'))); // Servir arquivos estáticos da pasta 'public'

// =================== ROTAS =================== //

// Rota para adicionar restaurante
app.post('/api/restaurantes', (req, res) => {
  const { nome, cep } = req.body;

  // Validação simples
  if (!nome || !cep) {
    return res.status(400).json({ error: 'Nome e CEP são obrigatórios' });
  }

  // Inserção na tabela com campos fixos para email e senha (podem ser ajustados futuramente)
  const query = 'INSERT INTO restaurants2 (name, email, password, cep) VALUES (?, "", "", ?)';
  db.query(query, [nome, cep], (err) => {
    if (err) {
      console.error('Erro ao inserir restaurante:', err);
      return res.status(500).json({ error: 'Erro ao adicionar restaurante' });
    }
    res.status(200).json({ success: true });
  });
});

// Rota para listar todos os restaurantes
app.get('/api/restaurantes', (req, res) => {
  const query = 'SELECT id, name AS nome, cep FROM restaurants2';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar restaurantes:', err);
      return res.status(500).json({ error: 'Erro ao buscar restaurantes' });
    }
    res.json(results);
  });
});

// Rota para remover um restaurante pelo ID
app.delete('/api/restaurantes/:id', (req, res) => {
  const id = req.params.id;

  const query = 'DELETE FROM restaurants2 WHERE id = ?';
  db.query(query, [id], (err) => {
    if (err) {
      console.error('Erro ao deletar restaurante:', err);
      return res.status(500).json({ error: 'Erro ao deletar restaurante' });
    }
    res.status(200).json({ success: true });
  });
});

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
