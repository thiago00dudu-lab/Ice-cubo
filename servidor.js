require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Database = require("better-sqlite3");
const axios = require("axios");

const app = express();
// No Render, o banco db.db será criado na pasta raiz do projeto
const db = new Database("db.db");

// 🔐 Variáveis de ambiente (Devem ser configuradas no painel do Render)
const JWT_SECRET = process.env.JWT_SECRET;
const ASAAS_KEY = process.env.ASAAS_KEY;
const IS_PROD = process.env.NODE_ENV === "production";

// Verifica se as chaves existem para não quebrar o app
if (!JWT_SECRET || !ASAAS_KEY) {
  console.warn("⚠️ Atenção: Variáveis JWT_SECRET ou ASAAS_KEY não encontradas. O app pode falhar.");
}

const ASAAS_URL = IS_PROD
  ? "https://api.asaas.com"
  : "https://sandbox.asaas.com";

app.use(express.json());

// 🗄️ Criação das tabelas
db.exec(`
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'user',
  blue INTEGER DEFAULT 0,
  asaas_id TEXT,
  is_blocked INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lives(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  price INTEGER,
  adult INTEGER,
  creator_id INTEGER,
  active INTEGER DEFAULT 1
);
`);

// 🔐 Middleware de Autenticação
function auth(req, res, next) {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "Token não fornecido" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare("SELECT * FROM users WHERE id=?").get(decoded.id);

    if (!user || user.is_blocked) return res.status(403).json({ error: "Acesso negado" });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
}

// 👤 Registro de Usuário
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    // Cria cliente no Asaas
    const customer = await axios.post(
      `${ASAAS_URL}/customers`,
      { name: username },
      { headers: { access_token: ASAAS_KEY } }
    );

    db.prepare(
      "INSERT INTO users(username, password, asaas_id) VALUES(?,?,?)"
    ).run(username, hash, customer.data.id);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Erro ao registrar usuário" });
  }
});

// 🔑 Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE username=?").get(username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });
  res.json({ token, role: user.role, blue: user.blue });
});

// 💰 Gerar cobrança PIX (Asaas)
app.post("/api/buy", auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const payment = await axios.post(
      `${ASAAS_URL}/payments`,
      {
        customer: req.user.asaas_id,
        billingType: "PIX",
        value: amount,
        dueDate: new Date().toISOString().split("T")[0],
        description: "Recarga de créditos BLUE"
      },
      { headers: { access_token: ASAAS_KEY } }
    );
    res.json(payment.data);
  } catch (err) {
    res.status(500).json({ error: "Erro ao gerar pagamento" });
  }
});

// 🔔 Webhook de confirmação do Asaas
app.post("/api/webhook/asaas", (req, res) => {
  if (req.body.event === "PAYMENT_RECEIVED") {
    db.prepare("UPDATE users SET blue=blue+? WHERE asaas_id=?")
      .run(Math.floor(req.body.payment.value * 0.85), req.body.payment.customer);
  }
  res.sendStatus(200);
});

// 🚀 Inicialização com a porta correta para o Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
