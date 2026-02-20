require("dotenv").config()
const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const http = require("http")
const { Server } = require("socket.io")
const Database = require("better-sqlite3")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.json())

// ================= DATABASE =================

const db = new Database("db.db")

db.exec(`
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'user',
  blue INTEGER DEFAULT 0,
  parent_id INTEGER,
  is_blocked INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lives(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  price INTEGER,
  creator_id INTEGER,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS transactions(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  amount INTEGER,
  type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS withdraws(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  amount INTEGER,
  status TEXT DEFAULT 'pending'
);
`)

// ================= MASTER AUTO =================

const master = db.prepare("SELECT * FROM users WHERE id=1").get()
if (!master) {
  const hash = bcrypt.hashSync("master123", 10)
  db.prepare(`
    INSERT INTO users(id,username,password,role,blue)
    VALUES(1,'master',?,?,?)
  `).run(hash,"master",0)
  console.log("MASTER CRIADO login: master senha: master123")
}

// ================= AUTH =================

function auth(req,res,next){
  try{
    const token = req.headers.authorization
    if(!token) return res.sendStatus(401)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = db.prepare("SELECT * FROM users WHERE id=?").get(decoded.id)
    if(!user || user.is_blocked) return res.sendStatus(403)
    req.user = user
    next()
  }catch{
    res.sendStatus(401)
  }
}

// ================= REGISTER =================

app.post("/api/register", async (req,res)=>{
  const { username,password,parent } = req.body
  const hash = await bcrypt.hash(password,10)

  const parentUser = parent
    ? db.prepare("SELECT id FROM users WHERE username=?").get(parent)
    : null

  db.prepare(`
    INSERT INTO users(username,password,parent_id)
    VALUES(?,?,?)
  `).run(username,hash,parentUser?.id || null)

  res.json({ok:true})
})

// ================= LOGIN =================

app.post("/api/login",(req,res)=>{
  const { username,password } = req.body
  const user = db.prepare("SELECT * FROM users WHERE username=?").get(username)

  if(!user || !bcrypt.compareSync(password,user.password))
    return res.sendStatus(401)

  const token = jwt.sign({id:user.id},process.env.JWT_SECRET)
  res.json({token})
})

// ================= COMPRA BLUE (85/10/5) =================

app.post("/api/buy",auth,(req,res)=>{
  const { amount } = req.body

  const buyer = req.user

  const userShare = Math.floor(amount * 0.85)
  const parentShare = Math.floor(amount * 0.05)
  const appShare = Math.floor(amount * 0.10)

  db.prepare("UPDATE users SET blue=blue+? WHERE id=?")
    .run(userShare,buyer.id)

  if(buyer.parent_id){
    db.prepare("UPDATE users SET blue=blue+? WHERE id=?")
      .run(parentShare,buyer.parent_id)
  }

  db.prepare(`
    INSERT INTO transactions(user_id,amount,type)
    VALUES(?,?,?)
  `).run(buyer.id,userShare,"purchase")

  res.json({credited:userShare})
})

// ================= CRIAR LIVE =================

app.post("/api/live/start",auth,(req,res)=>{
  const { title,price } = req.body

  db.prepare(`
    INSERT INTO lives(title,price,creator_id)
    VALUES(?,?,?)
  `).run(title,price,req.user.id)

  res.json({ok:true})
})

// ================= ENTRAR LIVE =================

app.post("/api/live/join/:id",auth,(req,res)=>{
  const live = db.prepare("SELECT * FROM lives WHERE id=?")
    .get(req.params.id)

  if(!live) return res.sendStatus(404)
  if(req.user.blue < live.price) return res.sendStatus(400)

  db.prepare("UPDATE users SET blue=blue-? WHERE id=?")
    .run(live.price,req.user.id)

  db.prepare("UPDATE users SET blue=blue+? WHERE id=?")
    .run(live.price,live.creator_id)

  res.json({ok:true})
})

// ================= SAQUE =================

app.post("/api/withdraw",auth,(req,res)=>{
  if(req.user.blue < 20)
    return res.status(400).json({error:"Minimo 20"})

  db.prepare(`
    INSERT INTO withdraws(user_id,amount)
    VALUES(?,?)
  `).run(req.user.id,req.user.blue)

  db.prepare("UPDATE users SET blue=0 WHERE id=?")
    .run(req.user.id)

  res.json({ok:true})
})

// ================= PAINEL MASTER =================

app.get("/api/admin/users",auth,(req,res)=>{
  if(req.user.role !== "master") return res.sendStatus(403)
  const users = db.prepare("SELECT id,username,role,blue FROM users").all()
  res.json(users)
})

// ================= SOCKET (CHAT + WEBRTC SINALIZAÇÃO) =================

io.on("connection",(socket)=>{

  socket.on("join-room",(room)=>{
    socket.join(room)
  })

  socket.on("chat",(data)=>{
    io.to(data.room).emit("chat",data.message)
  })

  socket.on("signal",(data)=>{
    socket.to(data.room).emit("signal",data)
  })

})

// ================= START =================

const PORT = process.env.PORT || 3000
server.listen(PORT,()=>{
  console.log("Servidor rodando na porta "+PORT)
})
