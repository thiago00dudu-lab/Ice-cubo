require("dotenv").config()
const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Database = require("better-sqlite3")
const axios = require("axios")

const app = express()
// No Render, o banco SQLite pode resetar se não houver um "Disk" montado
const db = new Database("db.db")

// 🔐 Variáveis de ambiente (Configure-as no painel 'Environment' do Render)
const JWT_SECRET = process.env.JWT_SECRET || "chave_mestra_temporaria"
const ASAAS_KEY = process.env.ASAAS_KEY
const IS_PROD = process.env.NODE_ENV === "production"

// Ajuste da URL do Asaas
const ASAAS_URL = IS_PROD
  ? "https://api.asaas.com"
  : "https://sandbox.asaas.com"

app.use(express.json())

// 🗄️ Inicialização do Banco
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

// 🔐 Middleware de Autenticação
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

// 👤 Rota de Registro
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body
    const hash = await bcrypt.hash(password, 10)
    
    // Cadastro no Asaas
    const customer = await axios.post(
      `${ASAAS_URL}/customers`,
      { name: username },
      { headers: { access_token: ASAAS_KEY } }
    )

    db.prepare(
      "INSERT INTO users(username,password,asaas_id) VALUES(?,?,?)"
    ).run(username, hash, customer.data.id)

    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: "Erro ao registrar. Verifique sua ASAAS_KEY." })
  }
})

// 🔑 Rota de Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body
  const user = db.prepare("SELECT * FROM users WHERE username=?").get(username)

  if (!user || !bcrypt.compareSync(password, user.password))
    return res.sendStatus(401)

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" })
  res.json({ token, role: user.role, blue: user.blue })
})

// 🚀 CONFIGURAÇÃO DE PORTA PARA O RENDER
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Servidor Ice-cubo rodando na porta ${PORT}`)
})

// 👑 Torna o primeiro usuário Master automaticamente
try {
    db.prepare("UPDATE users SET role='master' WHERE id=1").run()
} catch(e) {}
