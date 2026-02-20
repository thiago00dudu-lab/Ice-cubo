require("dotenv").config()
const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Database = require("better-sqlite3")

const app = express()
app.use(express.json())

const db = new Database("db.db")

// ===== TABELAS =====
db.exec(`
CREATE TABLE IF NOT EXISTS users(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 username TEXT UNIQUE,
 password TEXT,
 role TEXT DEFAULT 'user',
 blue INTEGER DEFAULT 0,
 parent_id INTEGER
);

CREATE TABLE IF NOT EXISTS lives(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 title TEXT,
 price INTEGER,
 creator_id INTEGER
);

CREATE TABLE IF NOT EXISTS withdraws(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER,
 amount INTEGER
);
`)

// ===== MASTER AUTO =====
const master = db.prepare("SELECT * FROM users WHERE id=1").get()
if(!master){
 const hash = bcrypt.hashSync("master123",10)
 db.prepare("INSERT INTO users(id,username,password,role) VALUES(1,'master',?,'master')")
   .run(hash)
}

// ===== AUTH =====
function auth(req,res,next){
 try{
   const token = req.headers.authorization
   if(!token) return res.sendStatus(401)
   const decoded = jwt.verify(token,process.env.JWT_SECRET)
   req.user = db.prepare("SELECT * FROM users WHERE id=?").get(decoded.id)
   if(!req.user) return res.sendStatus(403)
   next()
 }catch{ res.sendStatus(401) }
}

// ===== REGISTER =====
app.post("/register", async (req,res)=>{
 const { username,password,parent } = req.body
 const hash = await bcrypt.hash(password,10)
 const parentUser = parent
   ? db.prepare("SELECT id FROM users WHERE username=?").get(parent)
   : null

 db.prepare("INSERT INTO users(username,password,parent_id) VALUES(?,?,?)")
   .run(username,hash,parentUser?.id || null)

 res.json({ok:true})
})

// ===== LOGIN =====
app.post("/login",(req,res)=>{
 const { username,password } = req.body
 const user = db.prepare("SELECT * FROM users WHERE username=?").get(username)
 if(!user || !bcrypt.compareSync(password,user.password))
   return res.sendStatus(401)

 const token = jwt.sign({id:user.id},process.env.JWT_SECRET)
 res.json({
