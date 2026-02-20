require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Database = require("better-sqlite3");
const axios = require("axios");

const app = express();
const db = new Database("db.db");

// Variáveis vindas do painel "Environment" do Render
const JWT_SECRET = process.env.JWT_SECRET || "chave_mestre_123";
const ASAAS_KEY = process.env.ASAAS_KEY;
const ASAAS_URL = process.env.NODE_ENV === "production" ? "https://api.asaas.com" : "https://sandbox.asaas.com";

app.use(express.json());

// 🗄️ Criação Automática das Tabelas
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

// 🔐 Login com Retorno de Cargo (Role)
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username=?").get(username);
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: "Erro" });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, role: user.role, blue: user.blue });
});

// 🔔 Recebimento PIX Asaas (Lógica 85/10/5%)
app.post("/api/webhook/asaas", (req, res) => {
    if (req.body.event === "PAYMENT_RECEIVED") {
        const payment = req.body.payment;
        const total = payment.value;
        const user = db.prepare("SELECT * FROM users WHERE asaas_id=?").get(payment.customer);
        if (user) {
            db.prepare("UPDATE users SET blue = blue + ? WHERE id = ?").run(total * 0.85, user.id); // 85% Usuário
            if (user.pai_id) db.prepare("UPDATE users SET blue = blue + ? WHERE id = ?").run(total * 0.05, user.pai_id); // 5% Pai
        }
    }
    res.sendStatus(200);
});

// 👑 Garantir que o Login 1 seja Master
db.prepare("UPDATE users SET role='master' WHERE id=1").run();

// 🚀 PORTA DINÂMICA (Isso corrige o erro de travamento no Render)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor voando na porta ${PORT}`));
