const express = require("express");
const app = express();
const path = require("path");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  if (email === "admin" && senha === "1234") {
    res.sendFile(path.join(__dirname, "app.html"));
  } else {
    res.send("<script>alert('Erro no login'); window.location.href='/'</script>");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando"));
