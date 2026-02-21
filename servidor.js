const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Database = require("better-sqlite3");
const axios = require("axios");

const app = express();
const db = new Database("database.db");

app.use(express.json());
app.use(express.static("public"));

/* ================= CONFIG ================= */

const SECRET = "ice_secret";
const ASAAS_TOKEN = "SUA_CHAVE_AQUI"; // COLOQUE SUA CHAVE ASAAS
const BASE_URL = "https://api.asaas.com/v3";

/* ================= BANCO ================= */

db.prepare(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT
)
`).run();

/* ================= CADASTRO ================= */

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    db.prepare(`
      INSERT INTO users (name, email, password)
      VALUES (?, ?, ?)
    `).run(name, email, hash);

    res.json({ message: "Usuário criado com sucesso" });

  } catch (err) {
    res.status(400).json({ error: "Email já cadastrado" });
  }
});

/* ================= LOGIN ================= */

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare(`
    SELECT * FROM users WHERE email = ?
  `).get(email);

  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) return res.status(401).json({ error: "Senha inválida" });

  const token = jwt.sign({ id: user.id }, SECRET);

  res.json({ token });
});

/* ================= MIDDLEWARE ================= */

function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ error: "Sem token" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}

/* ================= CRIAR CLIENTE ASAAS ================= */

app.post("/criar-cliente", auth, async (req, res) => {
  try {
    const { name, cpfCnpj, email } = req.body;

    const response = await axios.post(
      `${BASE_URL}/customers`,
      {
        name,
        cpfCnpj,
        email
      },
      {
        headers: {
          access_token: ASAAS_TOKEN
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    console.log(error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao criar cliente" });
  }
});

/* ================= CRIAR COBRANÇA PIX ================= */

app.post("/criar-pix", auth, async (req, res) => {
  try {
    const { customerId, value } = req.body;

    const response = await axios.post(
      `${BASE_URL}/payments`,
      {
        customer: customerId,
        billingType: "PIX",
        value: value,
        dueDate: new Date().toISOString().split("T")[0]
      },
      {
        headers: {
          access_token: ASAAS_TOKEN
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    console.log(error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao criar cobrança" });
  }
});

/* ================= WEBHOOK ================= */

app.post("/webhook", (req, res) => {
  console.log("Webhook recebido:", req.body);

  // Aqui você pode atualizar saldo do usuário
  // se req.body.event == "PAYMENT_RECEIVED"

  res.sendStatus(200);
});

/* ================= SERVIDOR ================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
