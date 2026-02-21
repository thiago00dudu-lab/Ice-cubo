const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let usuarios = [];

// HOME
app.get("/", (req, res) => {
  res.send(`
    <h1>ICE LIVE</h1>
    <a href="/login">Entrar</a><br><br>
    <a href="/cadastro">Cadastrar</a>
  `);
});

// CADASTRO
app.get("/cadastro", (req, res) => {
  res.send(`
    <h2>Cadastrar</h2>
    <form method="POST" action="/cadastro">
      <input name="email" placeholder="Email" required><br><br>
      <input name="senha" type="password" placeholder="Senha" required><br><br>
      <button type="submit">Criar Conta</button>
    </form>
  `);
});

app.post("/cadastro", (req, res) => {
  const { email, senha } = req.body;
  usuarios.push({ email, senha });
  res.redirect("/login");
});

// LOGIN
app.get("/login", (req, res) => {
  res.send(`
    <h2>Login</h2>
    <form method="POST" action="/login">
      <input name="email" placeholder="Email" required><br><br>
      <input name="senha" type="password" placeholder="Senha" required><br><br>
      <button type="submit">Entrar</button>
    </form>
  `);
});

app.post("/login", (req, res) => {
  const { email, senha } = req.body;
  const user = usuarios.find(u => u.email === email && u.senha === senha);

  if (user) {
    res.redirect("/painel");
  } else {
    res.send("Login inválido");
  }
});

// PAINEL
app.get("/painel", (req, res) => {
  res.send(`
    <h1>Painel</h1>
    <input id="valor" placeholder="Valor da Live"><br><br>
    <button onclick="alert('Valor salvo')">Salvar Valor</button><br><br>
    <button onclick="abrirCamera()">Abrir Câmera</button><br><br>
    <video id="video" autoplay width="300"></video>

    <script>
      function abrirCamera() {
        navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          document.getElementById("video").srcObject = stream;
        })
        .catch(() => alert("Permita acesso à câmera"));
      }
    </script>
  `);
});

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
