const express = require("express");
const cors = require("cors");

const app = express(); // ESSA LINHA É OBRIGATÓRIA

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

app.post("/cadastro", (req, res) => {
  res.json({ mensagem: "Cadastro funcionando!" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
