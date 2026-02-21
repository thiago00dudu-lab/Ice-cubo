const express = require("express");
const axios = require("axios");
const bcrypt = require("bcrypt");
const Database = require("better-sqlite3"); // Assumindo que usa better-sqlite3 pela sintaxe
const app = express();
const db = new Database("ice.db");

const ASAAS_KEY = process.env.ASAAS_KEY;
const ASAAS_URL = "https://api.asaas.com";

app.use(express.json());

// Força o navegador a NÃO usar cache (sempre carrega a nova)
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// BANCO DE DADOS
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'filho',
    blues REAL DEFAULT 0,
    pai_id INTEGER,
    asaas_id TEXT
  );
`);

const hashMaster = bcrypt.hashSync("ice123", 10);
db.prepare("INSERT OR IGNORE INTO users (id, username, password, role) VALUES (1, 'admin', ?, 'admin')").run(hashMaster);

// FRONT-END ESTILO CUBO DE GELO
const html = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ICE PLATFORM LIVE</title>
  <style>
    body {
      background: radial-gradient(circle, #1e293b 0%, #0f172a 100%);
      color: white; 
      font-family: 'Segoe UI', sans-serif; 
      padding: 15px;
    }
    /* Efeito de Cubo de Gelo (Glassmorphism) */
    .card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      padding: 15px; 
      border-radius: 20px; 
      margin-bottom: 15px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0px 8px 32px 0 rgba(0, 0, 0, 0.37);
    }
    .blue-coin {
      background: #001f3f; 
      color: #FFD700;
      border: 2px solid #FFD700; 
      padding: 5px 10px;
      border-radius: 50px; 
      font-weight: bold;
      display: inline-block; 
      box-shadow: 0 4px #FFD700;
    }
    .btn { 
      width: 100%; 
      padding: 14px; 
      border: none; 
      border-radius: 12px;
      cursor: pointer;
      font-weight: bold;
    }
    .btn-live { background: #000000; box-shadow: 0 0 15px #000000; color: white; }
    video { width: 100%; height: 250px; border-radius: 15px; background: #000; }
    input { 
      width: 90%; 
      padding: 12px; 
      margin: 8px 0; 
      border-radius: 10px; 
      border: 1px solid #ccc;
    }
  </style>
</head>
<body>
  <div id="login-box">
    <h2 align="center" style="color:#00d4ff; text-shadow: 0 0 10px #00d4ff;">ICE PLATFORM</h2>
    <div class="card">
      <input type="text" id="u" placeholder="Usuário">
      <input type="password" id="p" placeholder="Senha">
      <button class="btn" style="background:#00d4ff" onclick="logar()">CONGELAR (ENTRAR)</button>
    </div>
  </div>

  <div id="app" style="display:none">
    <div id="perfil" class="card"></div>
    <div class="card" align="center">
      <h3>LIFE AO VIVO</h3>
      <video id="vlocal" autoplay playsinline></video>
      <button class="btn btn-live" id="blive" onclick="startLive()">INICIAR LIVE</button>
    </div>
    <div class="card">
      <h3>DEPÓSITO PIX</h3>
      <input type="number" id="val" placeholder="Valor em R$">
      <button class="btn" style="background: #22c55e; color: white;" onclick="buyPix()">GERAR PIX</button>
      <div id="pix-res" style="margin-top: 10px"></div>
    </div>
  </div>

  <script>
    function logar() {
      // Lógica de login aqui
      document.getElementById('login-box').style.display = 'none';
      document.getElementById('app').style.display = 'block';
    }
    function startLive() { alert('Iniciando Live...'); }
    function buyPix() { alert('Gerando PIX...'); }
  </script>
</body>
</html>
`;

app.get('/', (req, res) => {
  res.send(html);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
