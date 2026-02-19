require("dotenv").config()

const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Database = require("better-sqlite3")
const axios = require("axios")
const rateLimit = require("express-rate-limit")

const app = express()
const db = new Database("db.db")

app.disable("x-powered-by")

const JWT_SECRET = process.env.JWT_SECRET
const ASAAS_KEY = process.env.ASAAS_KEY
const IS_PROD = process.env.NODE_ENV === "production"

if (!JWT_SECRET || !ASAAS_KEY) {
  console.error("❌ Variáveis não configuradas")
  process.exit(1)
}

const ASAAS_URL = IS_PROD
  ? "https://api.asaas.com"
  : "https://sandbox.asaas.com"

app.use(express.json())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
})
app.use(limiter)

db.exec(`
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'user',
  blue INTEGER DEFAULT 0,
  asaas_id TEXT,
  is_blocked INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lives(
  id INTEGER PRIMARY KEY,
  title TEXT,
  price INTEGER,
  adult INTEGER,
  creator_id INTEGER,
  active INTEGER DEFAULT 1
);
`)

function auth(req, res, next) {
  try {
    const token = req.headers.authorization
    if (!token) return res.sendStatus(401)

    const decoded = jwt.verify(token, JWT_SECRET)
    const user = db.prepare("SELECT * FROM users WHERE id=?").get(decoded.id)

    if (!user || user.is_blocked) return res.sendStatus(403)

    req.user = user
    next()
  } catch {
    res.sendStatus(401)
  }
}

app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password || password.length < 6) {
      return res.status(400).json({ error: "Dados inválidos" })
    }

    const hash = await bcrypt.hash(password, 10)

    const customer = await axios.post(
      `${ASAAS_URL}/customers`,
      { name: username },
      { headers: { access_token: ASAAS_KEY } }
    )

    db.prepare(
      "INSERT INTO users(username,password,asaas_id) VALUES(?,?,?)"
    ).run(username, hash, customer.data.id)

    res.json({ ok: true })
  } catch {
    res.status(400).json({ error: "Erro ao registrar" })
  }
})

app.post("/api/login", (req, res) => {
  const { username, password } = req.body

  const user = db.prepare("SELECT * FROM users WHERE username=?")
    .get(username)

  if (!user || !bcrypt.compareSync(password, user.password))
    return res.sendStatus(401)

  const token = jwt.sign(
    { id: user.id },
    JWT_SECRET,
    { expiresIn: "1d" }
  )

  res.json({ token, role: user.role, blue: user.blue })
})

app.post("/api/buy", auth, async (req, res) => {
  try {
    const allowedValues = [10, 20, 50, 100]
    const { amount } = req.body

    if (!allowedValues.includes(amount)) {
      return res.status(400).json({ error: "Valor inválido" })
    }

    const payment = await axios.post(
      `${ASAAS_URL}/payments`,
      {
        customer: req.user.asaas_id,
        billingType: "PIX",
        value: amount,
        dueDate: new Date().toISOString().split("T")[0],
        description: "BLUE"
      },
      { headers: { access_token: ASAAS_KEY } }
    )

    res.json(payment.data)
  } catch {
    res.sendStatus(500)
  }
})

app.post("/api/webhook/asaas", (req, res) => {
  if (req.headers['asaas-access-token'] !== ASAAS_KEY) {
    return res.sendStatus(403)
  }

  if (req.body.event === "PAYMENT_RECEIVED") {
    db.prepare(
      "UPDATE users SET blue=blue+? WHERE asaas_id=?"
    ).run(
      Math.floor(req.body.payment.value * 0.85),
      req.body.payment.customer
    )
  }

  res.sendStatus(200)
})

app.post("/api/lives/start", auth, (req, res) => {
  db.prepare(
    "INSERT INTO lives(title,price,adult,creator_id) VALUES(?,?,?,?)"
  ).run(
    req.body.title || "Live",
    0,
    0,
    req.user.id
  )

  res.json({ ok: true })
})

app.get("/api/lives/list", auth, (req, res) => {
  const lives = db.prepare(
    "SELECT * FROM lives WHERE active=1"
  ).all()

  res.json(lives)
})

db.prepare("UPDATE users SET role='master' WHERE id=1").run()

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("🚀 Servidor rodando na porta " + PORT)
})
