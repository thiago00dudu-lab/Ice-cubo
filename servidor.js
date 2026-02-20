require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Database = require("better-sqlite3");
const axios = require("axios");

const app = express();
const db = new Database("db.db"); // Lembre-se: No Render Free, os dados resetam ao reiniciar

// Configurações das Variáveis de Ambiente (Configure no painel do Render!)
const JWT_SECRET = process.env.JWT_SECRET || "sua_senha_secreta_aqui";
const ASAAS_KEY = process.env.ASAAS_KEY;
const ASAAS_URL = process.env.NODE_ENV === "production" ? "https://api.asaas.com" : "https://sandbox.asaas.com";

app.use(express.json());

// 🗄️ CRIAÇÃO DAS TABELAS (Garante que o banco tenha tudo o que você pediu)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user', -- 'master', 'super_mod', 'user'
    blue REAL DEFAULT 0,
    asaas_id TEXT,
    pai_id INTEGER,
    is_blocked INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS lives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    price REAL DEFAULT 0,
    is_adult INTEGER DEFAULT 0, -- 1 para Pimenta (Adulta)
    creator_id INTEGER,
    active INTEGER DEFAULT 1
  );
`);

// 🔐 MIDDLEWARE DE AUTENTICAÇÃO (Corrige o erro de travamento no login)
const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.sendStatus(401);
        
        const token = authHeader.split(" ")[1]; // Pega apenas o código do token
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = db.prepare("SELECT * FROM users WHERE id=?").get(decoded.id);
        
        if (!user || user.is_blocked) return res.status(403).json({ error: "Acesso negado ou usuário bloqueado" });
        
        req.user = user;
        next();
    } catch (err) {
        res.sendStatus(401);
    }
};

// 👤 REGISTRO COM INDICAÇÃO (Sistema Pai e Filho)
app.post("/api/register", async (req, res) => {
    const { username, password, convite_id } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        
        // Cria o cliente no Asaas para poder gerar PIX depois
        const customer = await axios.post(`${ASAAS_URL}/v3/customers`, 
            { name: username }, 
            { headers: { access_token: ASAAS_KEY } }
        );

        db.prepare("INSERT INTO users (username, password, asaas_id, pai_id) VALUES (?, ?, ?, ?)")
          .run(username, hash, customer.data.id, convite_id || null);

        res.json({ ok: true });
    } catch (err) {
        res.status(400).json({ error: "Erro ao registrar. Username já existe ou erro no Asaas." });
    }
});

// 🔑 LOGIN (Retorna o cargo para mostrar a estrela no frontend)
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username=?").get(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    
    // Retorna dados para o frontend decidir se mostra estrela dourada ou azul
    res.json({ 
        token, 
        role: user.role, 
        blue: user.blue, 
        id: user.id 
    });
});

// 🔔 WEBHOOK ASAAS (Lógica 85% / 10% / 5%) - RECEBER DINHEIRO
app.post("/api/webhook/asaas", (req, res) => {
    if (req.body.event === "PAYMENT_RECEIVED") {
        const payment = req.body.payment;
        const total = payment.value; // 1 Real = 1 Blue
        const user = db.prepare("SELECT * FROM users WHERE asaas_id=?").get(payment.customer);

        if (user) {
            // 85% para o usuário
            db.prepare("UPDATE users SET blue = blue + ? WHERE id = ?").run(total * 0.85, user.id);

            // 5% para o Pai (Indicador)
            if (user.pai_id) {
                db.prepare("UPDATE users SET blue = blue + ? WHERE id = ?").run(total * 0.05, user.pai_id);
            }
            // Os 10% do app ficam retidos no saldo do seu painel Asaas
        }
    }
    res.sendStatus(200);
});

// 🎥 CRIAR LIVE (Com opção de pimenta)
app.post("/api/lives/start", auth, (req, res) => {
    const { title, price, is_adult } = req.body;
    db.prepare("INSERT INTO lives (title, price, is_adult, creator_id) VALUES (?, ?, ?, ?)")
      .run(title, price || 0, is_adult ? 1 : 0, req.user.id);
    res.json({ ok: true });
});

// 💰 SAQUE MÍNIMO DE 20 REAIS
app.post("/api/saque", auth, (req, res) => {
    const { valor } = req.body;
    if (valor < 20) return res.status(400).json({ error: "O saque mínimo é de 20 Blues" });
    if (req.user.blue < valor) return res.status(400).json({ error: "Saldo insuficiente" });

    db.prepare("UPDATE users SET blue = blue - ? WHERE id = ?").run(valor, req.user.id);
    // Aqui você integraria com a API de transferência do Asaas ou salvaria para pagar manual
    res.json({ ok: true, message: "Saque solicitado com sucesso!" });
});

// 👑 CONFIGURAÇÃO AUTOMÁTICA DO MASTER (Sempre o ID 1)
db.prepare("UPDATE users SET role='master' WHERE id=1").run();

// 🚀 START NO SERVIDOR (Porta configurada para o Render)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
