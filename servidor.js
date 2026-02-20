require("dotenv").config()
const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const axios = require("axios")
const http = require("http")
const { Server } = require("socket.io")

const db = require("./database")
const auth = require("./auth")
const { distribute } = require("./finance")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.json())
app.use(express.static("public"))

if (!process.env.JWT_SECRET || !process.env.ASAAS_KEY) {
  console.error("Variáveis não configuradas")
  process.exit(1)
}

const ASAAS_URL = "https://api.asaas.com"

// REGISTRO
app.post("/api/register", async (req, res) => {
  const { username, password, parent } = req.body
  const hash = await bcrypt.hash(password, 10)

  const parentUser = parent
    ? db.prepare("SELECT id FROM users WHERE username=?").get(parent)
    : null

  db.prepare(`
    INSERT INTO users(username,password,parent_id)
    VALUES(?,?,?)
  `).run(username, hash, parentUser?.id || null)

  res.json({ ok: true })
})

// LOGIN
app.post("/api/login", (req, res) => {
  const { username, password } = req.body
  const user = db.prepare("SELECT * FROM users WHERE username=?")
    .get(username)

  if (!user || !bcrypt.compareSync(password, user.password))
    return res.sendStatus(401)

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET)
  res.json({ token })
})

// CRIAR LIVE
app.post("/api/live/start", auth, (req, res) => {
  const { title, price } = req.body
  db.prepare(`
    INSERT INTO lives(title,price,creator_id)
    VALUES(?,?,?)
  `).run(title, price, req.user.id)

  res.json({ ok: true })
})

// ENTRAR NA LIVE
app.post("/api/live/join/:id", auth, (req, res) => {
  const live = db.prepare("SELECT * FROM lives WHERE id=?")
    .get(req.params.id)

  if (!live) return res.sendStatus(404)
  if (req.user.blue < live.price) return res.sendStatus(400)

  db.prepare("UPDATE users SET blue=blue-? WHERE id=?")
    .run(live.price, req.user.id)

  distribute(live.price, live.creator_id)

  res.json({ ok: true })
})

// SAQUE
app.post("/api/withdraw", auth, (req, res) => {
  if (req.user.blue < 20)
    return res.status(400).json({ error: "Minimo 20" })

  db.prepare(`
    INSERT INTO withdraws(user_id,amount)
    VALUES(?,?)
  `).run(req.user.id, req.user.blue)

  db.prepare("UPDATE users SET blue=0 WHERE id=?")
    .run(req.user.id)

  res.json({ ok: true })
})

// SOCKET CHAT + SINALIZAÇÃO WEBRTC
io.on("connection", socket => {
  socket.on("join-room", room => {
    socket.join(room)
  })

  socket.on("signal", data => {
    socket.to(data.room).emit("signal", data)
  })

  socket.on("chat", data => {
    io.to(data.room).emit("chat", data.message)
  })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () =>
  console.log("Servidor rodando na porta " + PORT)
)
