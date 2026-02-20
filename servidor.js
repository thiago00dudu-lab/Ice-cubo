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
