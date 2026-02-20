require("dotenv").config()
const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Database = require("better-sqlite3")
const axios = require("axios")

const app = express()
app.use(express.json())
app.use(express.static("publico"))

const db = new Database("db.db")

// ===== TABELAS =====
db.exec(`
CREATE TABLE IF NOT EXISTS users(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 username TEXT UNIQUE,
 password TEXT,
 saldo INTEGER DEFAULT 0,
 parent_id INTEGER
);

CREATE TABLE IF NOT EXISTS pagamentos(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER,
 valor INTEGER,
 status TEXT
);
`)

// ===== REGISTRO =====
app.post("/api/register", async (req,res)=>{
 const {username,password,parent} = req.body
 const hash = await bcrypt.hash(password,10)
 const pai = parent ? db.prepare("SELECT id FROM users WHERE username=?").get(parent) : null

 db.prepare("INSERT INTO users(username,password,parent_id) VALUES(?,?,?)")
   .run(username,hash,pai?.id || null)

 res.json({ok:true})
})

// ===== LOGIN =====
app.post("/api/login",(req,res)=>{
 const {username,password} = req.body
 const user = db.prepare("SELECT * FROM users WHERE username=?").get(username)
 if(!user) return res.status(401).json({erro:"Usuário não existe"})

 if(!bcrypt.compareSync(password,user.password))
   return res.status(401).json
