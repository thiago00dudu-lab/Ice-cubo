require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Database = require("better-sqlite3");
const axios = require("axios");
const path = require("path");

const app = express();
const db = new Database("db.db");
const PORT = process.env.PORT || 10000;

// ⚙️ Configurações e Variáveis
const { JWT_SECRET, ASAAS_KEY, NODE_ENV } = process.env;
const ASAAS_URL = NODE_ENV === "production" ? "https://api.asaas.com" : "https://sandbox.asaas.com";

app.use(express.json());

// 📂 NOVO: Faz o servidor entregar seu index.html e outros arquivos da pasta
app.use(express.static("."));

// 📂 NOVO: Rota principal que abre o seu site automaticamente
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🗄️ Tabelas do Banco
db.exec(`
  CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, role TEXT DEFAULT 'user', blue INTEGER DEFAULT 0, asaas_id TEXT, is_blocked INTEGER DEFAULT 0);
  CREATE TABLE IF NOT EXISTS lives(id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, price INTEGER, adult INTEGER, creator_id INTEGER, active INTEGER DEFAULT 1);
`);

// 🔐 Middleware de Autenticação
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = db.prepare("SELECT * FROM users WHERE id=?").get(decoded.id);
    if (!req.user || req.user.is_blocked) return res.sendStatus(403);
    next();
  } catch { res.sendStatus(401); }
};

// 👤 Rotas de Usuário (Login/Registro)
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const customer = await axios.post(`${ASAAS_URL}/customers`, { name: username }, { headers: { access_token: ASAAS_KEY } });
    db.prepare("INSERT INTO users(username, password, asaas_id) VALUES(?,?,?)").run(username, hash, customer.data.id);
    res.json({ ok: true });
  } catch { res.status(400).json({ error: "Erro no registro" }); }
});

app.post("/api/login", (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE username=?").get(req.body.username);
  if (!user || !bcrypt.compareSync(req.body.password, user.password)) return res.sendStatus(401);
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });
  res.json({ token, role: user.role, blue: user.blue });
});

// 💰 Pagamento e Webhook
app.post("/api/buy", auth, async (req, res) => {
  try {
    const pay = await axios.post(`${ASAAS_URL}/payments`, {
      customer: req.user.asaas_id, billingType: "PIX", value: req.body.amount, dueDate: new Date().toISOString().split("T")[0], description: "Recarga BLUE"
    }, { headers: { access_token: ASAAS_KEY } });
    res.json(pay.data);
  } catch { res.sendStatus(500); }
});

app.post("/api/webhook/asaas", (req, res) => {
  if (req.body.event === "PAYMENT_RECEIVED") {
    db.prepare("UPDATE users SET blue=blue+? WHERE asaas_id=?").run(Math.floor(req.body.payment.value * 0.85), req.body.payment.customer);
  }
  res.sendStatus(200);
});

// 🚀 Inicialização (Importante: 0.0.0.0 é obrigatório no Render)
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Servidor ON: Porta ${PORT}`));
