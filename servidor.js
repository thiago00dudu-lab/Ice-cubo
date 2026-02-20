require("dotenv").config()
const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Database = require("better-sqlite3")
const axios = require("axios")

const app = express()
const db = new Database("db.db")

// 🚀 ESSENCIAL: Isso resolve a tela branca e o erro de rota
app.use(express.json())

// Interface básica direto no servidor para teste rápido
app.get('/', (req, res) => {
  res.send(`
    <body style="background:#0f172a;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif">
      <h1 style="color:#3b82f6">🧊 Ice-Cubo Online</h1>
      <p>O sistema sincronizou com sucesso!</p>
      <div style="background:#1e293b;padding:20px;border-radius:10px;text-align:center">
        <input id="u" placeholder="Usuário" style="display:block;margin:10px;padding:8px">
        <input id="p" type="password" placeholder="Senha" style="display:block;margin:10px;padding:8px">
        <button style="background:#3b82f6;color:white;border:none;padding:10px 20px;border-radius:5px">Entrar</button>
      </div>
    </body>
  `)
})

// 🔐 Variáveis (O Render PRECISA que você cadastre essas 2 no painel Environment)
const JWT_SECRET = process.env.JWT_SECRET || "chave_padrao_teste"
const ASAAS_KEY = process.env.ASAAS_KEY 

// Se não tiver a chave do Asaas, o código vai avisar no log mas NÃO vai desligar
if (!ASAAS_KEY) {
  console.log("⚠️ ATENÇÃO: Cadastre a ASAAS_KEY no painel do Render para o PIX funcionar!");
}

// ... (Suas rotas de API continuam aqui embaixo) ...

// 🚀 AJUSTE FINAL DA PORTA
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
})
