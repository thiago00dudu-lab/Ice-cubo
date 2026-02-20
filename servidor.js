const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express(); // ← ESSA LINHA estava faltando

app.use(cors());
app.use(express.json());

// ROTA TESTE
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

// SUA ROTA
app.post("/cadastro", async (req, res) => {
  res.json({ mensagem: "Cadastro funcionando!" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
