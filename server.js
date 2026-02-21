const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Banco temporário (memória)
let usuarios = [];

// ===== TELA INICIAL =====
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
                background:linear-gradient(135deg,#0f2027,#203a43,#2c5364);
                font-family:Arial;
                color:white;
            }
            .box {
                text-align:center;
            }
            button {
                padding:15px 30px;
                margin:10px;
                border:none;
                border-radius:8px;
                font-size:18px;
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

// ===== CADASTRO =====
app.get("/cadastro", (req, res) => {
    res.send(`
    <body style="background:#0f2027;color:white;text-align:center;padding-top:100px;font-family:Arial;">
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

// ===== LOGIN =====
app.get("/login", (req, res) => {
    res.send(`
    <body style="background:#203a43;color:white;text-align:center;padding-top:100px;font-family:Arial;">
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

// ===== PAINEL FUTURÍSTICO =====
app.get("/painel", (req, res) => {
    res.send(`
    <html>
    <head>
        <style>
            body {
                margin:0;
                background:#0f0c29;
                background:linear-gradient(to right,#24243e,#302b63,#0f0c29);
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
            input {
                padding:8px;
            }
        </style>
    </head>
    <body>
        <h1>Área do Criador</h1>

        <div class="card">
            <h3>Definir valor da sua Live</h3>
            <input id="valor" placeholder="Valor em R$">
            <br>
            <button onclick="salvarValor()">Salvar Valor</button>

            <h3 style="margin-top:30px;">Abrir Câmera</h3>
            <button onclick="abrirCamera()">Iniciar Live</button>
            <br><br>
