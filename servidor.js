require("dotenv").config()
const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Database = require("better-sqlite3")
const axios = require("axios")
const path = require("path") // Adicionado

const app = express()
const db = new Database("db.db")

// 🚀 CONFIGURAÇÃO PARA A INTERFACE (Aba branca sumirá)
app.use(express.static('public')) 
app.use(express.json())

const JWT_SECRET = process.env.JWT_SECRET || "mudar_isso"
const ASAAS_KEY = process.env.ASAAS_KEY
const IS_PROD = process.env.NODE_ENV === "production"

const ASAAS_URL = IS_PROD ? "https://api.asaas.com" : "https://sandbox.asaas.com"

// ... (Mantenha suas tabelas e rotas de API iguaizinhas aqui) ...

// 🚀 AJUSTE DA PORTA (Para o Render bater certo)
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Servidor Ice-cubo ON na porta ${PORT}`)
})
