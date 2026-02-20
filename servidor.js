require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs"); // Trocado para bcryptjs para evitar erro no Render
const jwt = require("jsonwebtoken");
const Database = require("better-sqlite3");
const axios = require("axios");

const app = express();
const db = new Database("db.db");

const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_padrao";
const ASAAS_KEY = process.env.ASAAS_KEY;
const ASAAS_URL = process.env.NODE_ENV === "production" ? "https://api.asaas.com" : "https://sandbox.asaas.com";

app.use(express.json());

// Rota de Health Check (Obrigatório para o Render não dar erro de deploy)
app.get("/", (req, res) => res.status(200).send("Servidor Online 🚀"));

// Criar tabelas se não existirem
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE, password TEXT, role TEXT DEFAULT 'user',
    blue REAL DEFAULT 0, asaas_id TEXT, pai_id INTEGER, is_blocked INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS lives (
    id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, price REAL DEFAULT 0,
    is_adult INTEGER DEFAULT 0, creator_id INTEGER, active INTEGER DEFAULT 1
  );
`);

// Middleware de Autenticação
const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.sendStatus(401);
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = db.prepare("SELECT * FROM users WHERE id=?").get(decoded.id);
        if (!user || user.is_blocked) return res.sendStatus(403);
        req.user = user;
        next();
    } catch { res.sendStatus(401); }
};

// Login Master Automático (ID 1)
db.prepare("UPDATE users SET role='master' WHERE id=1").run();

// Iniciar Servidor na porta do Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
          
