require("dotenv").config()
const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Database = require("better-sqlite3")
const axios = require("axios")

const app = express()
const db = new Database("db.db")
app.use(express.json())

const { JWT_SECRET, ASAAS_KEY, NODE_ENV } = process.env
const ASAAS_URL = NODE_ENV === "production"
  ? "https://api.asaas.com"
  : "https://sandbox.asaas.com"

/* ================= BANCO ================= */

db.exec(`
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'user',
  blue REAL DEFAULT 0,
  balance REAL DEFAULT 0,
  parent_id INTEGER,
  asaas_id TEXT,
  is_blocked INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lives(
  id INTEGER PRIMARY KEY,
  title TEXT,
  price REAL DEFAULT 0,
  adult INTEGER DEFAULT 0,
  creator_id INTEGER,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS payments_processed(
  payment_id TEXT PRIMARY KEY
);
`)

db.prepare("UPDATE users SET role='master' WHERE id=1").run()

/* ================= AUTH ================= */

function auth(req,res,next){
  try{
    const token = req.headers.authorization
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = db.prepare("SELECT * FROM users WHERE id=?").get(decoded.id)
    if(!user || user.is_blocked) return res.sendStatus(403)
    req.user = user
    next()
  }catch{ res.sendStatus(401) }
}

/* ================= REGISTER ================= */

app.post("/register", async (req,res)=>{
  try{
    const { username,password,ref } = req.body
    const hash = await bcrypt.hash(password,10)

    const customer = await axios.post(
      `${ASAAS_URL}/customers`,
      { name: username },
      { headers:{ access_token: ASAAS_KEY }}
    )

    db.prepare(`
      INSERT INTO users(username,password,parent_id,asaas_id)
      VALUES(?,?,?,?)
    `).run(username,hash,ref || null,customer.data.id)

    res.json({ ok:true })
  }catch{ res.status(400).json({ error:"Erro" }) }
})

/* ================= LOGIN ================= */

app.post("/login",(req,res)=>{
  const { username,password } = req.body
  const user = db.prepare("SELECT * FROM users WHERE username=?").get(username)
  if(!user || !bcrypt.compareSync(password,user.password))
    return res.sendStatus(401)

  const token = jwt.sign({ id:user.id },JWT_SECRET,{ expiresIn:"1d" })
  res.json({ token, role:user.role, blue:user.blue })
})

/* ================= BUY BLUE ================= */

app.post("/buy",auth, async (req,res)=>{
  const { amount } = req.body
  const payment = await axios.post(
    `${ASAAS_URL}/payments`,
    {
      customer:req.user.asaas_id,
      billingType:"PIX",
      value:amount,
      dueDate:new Date().toISOString().split("T")[0],
      description:"BLUE"
    },
    { headers:{ access_token:ASAAS_KEY }}
  )
  res.json(payment.data)
})

/* ================= WEBHOOK ================= */

app.post("/webhook", async (req,res)=>{
  try{
    const event = req.body
    if(event.event !== "PAYMENT_RECEIVED")
      return res.sendStatus(200)

    const already = db.prepare(
      "SELECT * FROM payments_processed WHERE payment_id=?"
    ).get(event.payment.id)

    if(already) return res.sendStatus(200)

    const check = await axios.get(
      `${ASAAS_URL}/payments/${event.payment.id}`,
      { headers:{ access_token: ASAAS_KEY }}
    )

    if(check.data.status !== "RECEIVED")
      return res.sendStatus(200)

    const value = check.data.value

    const user = db.prepare(
      "SELECT * FROM users WHERE asaas_id=?"
    ).get(check.data.customer)

    if(user){
      const userShare = value * 0.85
      const parentShare = value * 0.05

      db.prepare("UPDATE users SET blue=blue+? WHERE id=?")
        .run(userShare,user.id)

      if(user.parent_id){
        db.prepare("UPDATE users SET balance=balance+? WHERE id=?")
          .run(parentShare,user.parent_id)
      }
    }

    db.prepare(
      "INSERT INTO payments_processed(payment_id) VALUES(?)"
    ).run(event.payment.id)

  }catch(err){ console.error(err) }

  res.sendStatus(200)
})

/* ================= LIVES ================= */

app.post("/live/start",auth,(req,res)=>{
  const { title,price,adult } = req.body
  db.prepare(`
    INSERT INTO lives(title,price,adult,creator_id)
    VALUES(?,?,?,?)
  `).run(title || "Live",price || 0,adult?1:0,req.user.id)
  res.json({ ok:true })
})

app.get("/lives",auth,(req,res)=>{
  res.json(db.prepare("SELECT * FROM lives WHERE active=1").all())
})

app.post("/live/join/:id",auth,(req,res)=>{
  const live = db.prepare("SELECT * FROM lives WHERE id=?")
    .get(req.params.id)

  if(!live) return res.sendStatus(404)
  if(req.user.blue < live.price)
    return res.json({ error:"Blue insuficiente" })

  db.prepare("UPDATE users SET blue=blue-? WHERE id=?")
    .run(live.price,req.user.id)

  db.prepare("UPDATE users SET balance=balance+? WHERE id=?")
    .run(live.price,live.creator_id)

  res.json({ ok:true })
})

/* ================= ADMIN ================= */

app.post("/admin/block/:id",auth,(req,res)=>{
  if(req.user.role==="master" || req.user.role==="supermod"){
    db.prepare("UPDATE users SET is_blocked=1 WHERE id=?")
      .run(req.params.id)
    return res.json({ ok:true })
  }
  res.sendStatus(403)
})

/* ================= WITHDRAW ================= */

app.post("/withdraw",auth,(req,res)=>{
  const { amount } = req.body
  if(amount < 20) return res.json({ error:"Mínimo 20" })
  if(req.user.balance < amount)
    return res.json({ error:"Saldo insuficiente" })

  db.prepare("UPDATE users SET balance=balance-? WHERE id=?")
    .run(amount,req.user.id)

  res.json({ ok:true })
})

/* ================= START ================= */

app.listen(3000,()=>console.log("🚀 Rodando 3000"))
