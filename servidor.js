const express=require("express")
const jwt=require("jsonwebtoken")
const Database=require("better-sqlite3")

const app=express()
app.use(express.json())

const db=new Database("db.sqlite")
const SECRET="123456"

// 🔥 criar tabelas automaticamente
db.exec(`
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT
);

CREATE TABLE IF NOT EXISTS lives(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT
);

CREATE TABLE IF NOT EXISTS transactions(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount REAL,
  type TEXT
);
`)

// 🔥 criar usuário master padrão
const master=db.prepare("SELECT * FROM users WHERE username=?").get("admin")
if(!master){
  db.prepare("INSERT INTO users(username,password,role) VALUES(?,?,?)")
    .run("admin","123","master")
  console.log("Usuário master criado -> admin / 123")
}

// 🔐 middleware auth
const auth=(req,res,next)=>{
  const token=req.headers.authorization?.split(" ")[1]
  if(!token) return res.sendStatus(401)
  try{
    req.user=jwt.verify(token,SECRET)
    next()
  }catch{
    res.sendStatus(403)
  }
}

// 🔑 login
app.post("/login",(req,res)=>{
  const {username,password}=req.body
  const user=db.prepare("SELECT * FROM users WHERE username=? AND password=?")
    .get(username,password)

  if(!user) return res.sendStatus(401)

  const token=jwt.sign(
    {id:user.id,role:user.role},
    SECRET,
    {expiresIn:"1h"}
  )

  res.json({token})
})

// 📊 rota admin
app.get("/admin/stats",auth,(req,res)=>{
  if(req.user.role!=="master") return res.sendStatus(403)

  const users=db.prepare("SELECT COUNT(*) total FROM users").get()
  const lives=db.prepare("SELECT COUNT(*) total FROM lives").get()
  const money=db.prepare("SELECT SUM(amount) total FROM transactions WHERE type='deposit'").get()

  res.json({
    totalUsers:users.total,
    totalLives:lives.total,
    totalDeposits:money.total||0
  })
})

// 🚀 servidor
app.listen(3000,()=>console.log("Rodando na porta 3000"))
