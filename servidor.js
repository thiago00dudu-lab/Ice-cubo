const express = require("express")
const cors = require("cors")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const axios = require("axios")
require("dotenv").config()

const app = express()
app.use(express.json())
app.use(cors())

// ===== VARIÁVEIS =====
const ASAAS_API_KEY = process.env.ASAAS_API_KEY
const JWT_SECRET = process.env.JWT_SECRET

// ===== TESTE SERVIDOR =====
app.get("/", (req, res) => {
  res.json({ status: "Servidor rodando 🚀" })
})


// ===== LOGIN =====
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body

  // Usuário fixo só pra teste
  if (username !== "admin") {
    return res.status(401).json({ error: "Usuário inválido" })
  }

  const senhaCorreta = await bcrypt.hash("123456", 10)

  if (!bcrypt.compareSync(password, senhaCorreta)) {
    return res.status(401).json({ error: "Senha inválida" })
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1d" })

  res.json({ token })
})


// ===== CRIAR COBRANÇA ASAAS =====
app.post("/api/cobranca", async (req, res) => {
  try {
    const { name, cpf, value } = req.body

    // Criar cliente
    const cliente = await axios.post(
      "https://api.asaas.com/v3/customers",
      {
        name,
        cpfCnpj: cpf
      },
      {
        headers: {
          access_token: ASAAS_API_KEY,
          "Content-Type": "application/json"
        }
      }
    )

    // Criar cobrança
    const cobranca = await axios.post(
      "https://api.asaas.com/v3/payments",
      {
        customer: cliente.data.id,
        billingType: "PIX",
        value: value,
        dueDate: new Date().toISOString().split("T")[0]
      },
      {
        headers: {
          access_token: ASAAS_API_KEY,
          "Content-Type": "application/json"
        }
      }
    )

    res.json(cobranca.data)

  } catch (err) {
    console.log(err.response?.data || err.message)
    res.status(500).json({ error: "Erro ao criar cobrança" })
  }
})


// ===== PORTA RENDER =====
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT)
})
