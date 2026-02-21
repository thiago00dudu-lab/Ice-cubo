const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let usuarios = [];

// HOME
app.get("/", (req, res) => {
  res.send(`
  <html>
  <head>
    <title>ICE Live</title>
    <style>
      body {
        margin:0;
        height:100vh;
        display:flex;
        justify-content:center;
        align-items:center;
        background:linear-gradient(135deg,#141e30,#243b55);
        font-family:Arial;
        color:white;
      }
      .box { text-align:center; }
      button {
        padding:12px 25px;
        margin:10px;
        border:none;
        border-radius:8px;
        font-size:16px;
        cursor:pointer;
        background:#00c6ff;
        color:black;
        font-weight:bold;
      }
    </style>
  </head>
  <body>
    <div class="box">
      <h1>ICE LIVE</h1>
      <button onclick="location.href='/login'">Entrar</button>
      <button onclick="location.href='/cadastro'">Cadastrar</button>
    </div>
  </body>
  </html>
  `);
});

// CADASTRO
app.get("/cadastro", (req, res) => {
  res.send(`
  <body style="background:#1c1c1c;color:white;text-align:center;padding-top:100px;font-family:Arial;">
    <h2>Cadastrar</h2>
    <form method="POST" action="/cadastro">
      <input name="email" placeholder="Email" required><br><br>
      <input name="senha" type="password" placeholder="Senha" required><br><br>
      <button type="submit">Criar Conta</button>
    </form>
  </body>
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
  <body style="background:#243b55;color:white;text-align:center;padding-top:100px;font-family:Arial;">
    <h2>Entrar</h2>
    <form method="POST" action="/login">
      <input name="email" placeholder="Email" required><br><br>
      <input name="senha" type="password" placeholder="Senha" required><br><br>
      <button type="submit">Entrar</button>
    </form>
  </body>
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
  <html>
  <head>
    <style>
      body {
        margin:0;
        background:linear-gradient(to right,#0f0c29,#302b63,#24243e);
        color:white;
        font-family:Arial;
        text-align:center;
      }
      .card {
        margin-top:50px;
        padding:30px;
        background:rgba(255,255,255,0.1);
        border-radius:15px;
        display:inline-block;
        box-shadow:0 0 20px #00f2ff;
      }
      button {
        padding:10px 20px;
        margin-top:10px;
        border:none;
        border-radius:8px;
        cursor:pointer;
        background:#00f2ff;
        font-weight:bold;
      }
      input { padding:8px; }
    </style>
  </head>
  <body>
    <h1>Área do Criador</h1>
    <div class="card">
      <h3>Definir valor da Live</h3>
      <input id="valor" placeholder="Valor em R$">
      <br>
      <button onclick="salvarValor()">Salvar</button>

      <h3 style="margin-top:30px;">Iniciar Live</h3>
      <button onclick="abrirCamera()">Abrir Câmera</button>
      <br><br>
      <video id="video" autoplay width="300"></video>
    </div>

    <script>
      function salvarValor(){
        const valor = document.getElementById("valor").value;
        alert("Sua live custará R$ " + valor);
      }

      function abrirCamera(){
        navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          document.getElementById("video").srcObject = stream;
        })
        .catch(() => alert("Permita acesso à câmera"));
      }
    </script>
  </body>
  </html>
  `);
});

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
