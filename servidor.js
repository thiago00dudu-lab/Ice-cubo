require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const Database = require("better-sqlite3");
const axios = require("axios");
const bcrypt = require("bcrypt");
const app = express();
const db = new Database("ice.db");

const JWT_SECRET = process.env.JWT_SECRET || "chave_mestra_ice";
const ASAAS_KEY = process.env.ASAAS_KEY;
const ASAAS_URL = "https://api.asaas.com";

app.use(express.json());

// --- BANCO DE DADOS PROFISSIONAL ---
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'filho', -- master, super, filho
    blues REAL DEFAULT 0,
    pai_id INTEGER,
    asaas_id TEXT,
    is_blocked INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS lives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    price REAL,
    is_adult INTEGER DEFAULT 0,
    creator_id INTEGER,
    active INTEGER DEFAULT 1
  );
`);

// --- LÓGICA DE DIVISÃO (85% / 10% / 5%) ---
const processarDivisao = (valorTotal, usuarioId) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(usuarioId);
    const vFilho = valorTotal * 0.85;
    const vApp = valorTotal * 0.10;
    const vPai = valorTotal * 0.05;

    db.prepare("UPDATE users SET blues = blues + ? WHERE id = ?").run(vFilho, usuarioId);
    db.prepare("UPDATE users SET blues = blues + ? WHERE id = 1").run(vApp); // 10% Master
    if (user.pai_id) {
        db.prepare("UPDATE users SET blues = blues + ? WHERE id = ?").run(vPai, user.pai_id);
    }
};

// --- FRONT-END UNIFICADO ---
const html = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ICE PLATFORM - LIVE</title>
    <style>
        body { background: #0f172a; color: white; font-family: Arial; padding: 10px; margin: 0; }
        .card { background: #1e293b; padding: 15px; border-radius: 12px; margin-bottom: 10px; border: 1px solid #334155; position: relative; }
        .gold-star::before { content: '⭐'; color: gold; position: absolute; top: 5px; right: 10px; }
        .blue-star::before { content: '⭐'; color: #3b82f6; position: absolute; top: 5px; right: 10px; }
        .btn { width: 100%; padding: 12px; border: none; border-radius: 8px; background: #3b82f6; color: white; font-weight: bold; cursor: pointer; margin: 5px 0; }
        .btn-red { background: #ef4444; }
        .live-cam { width: 100%; height: 200px; background: black; border-radius: 8px; border: 2px solid #ef4444; display: flex; align-items: center; justify-content: center; position: relative; }
        .pimenta { position: absolute; bottom: 10px; right: 10px; font-size: 24px; }
        input { width: 90%; padding: 10px; margin: 5px 0; border-radius: 5px; border: none; background: #334155; color: white; }
    </style>
</head>
<body>
    <div id="auth">
        <h2 align="center">ICE LOGIN</h2>
        <div class="card">
            <input type="text" id="user" placeholder="Usuário">
            <input type="password" id="pass" placeholder="Senha">
            <button class="btn" onclick="login()">Entrar</button>
        </div>
    </div>

    <div id="main" style="display:none">
        <div class="card" id="perfil-info">
            <!-- Info do perfil via JS -->
        </div>

        <h3>🎥 LIVES AO VIVO</h3>
        <div id="lista-lives"></div>
        
        <div id="adm-panel" style="display:none" class="card">
            <h4 style="color:#fbbf24">PAINEL MASTER</h4>
            <button class="btn btn-red" onclick="blockUser()">Bloquear Usuário</button>
            <button class="btn" onclick="checkSaques()">Ver Pedidos de Saque (Min R$ 20)</button>
        </div>
    </div>

    <script>
        let currentUser = null;

        function login() {
            // Mock de login para teste - Integra com API real
            document.getElementById('auth').style.display = 'none';
            document.getElementById('main').style.display = 'block';
            showProfile();
        }

        function showProfile() {
            const info = document.getElementById('perfil-info');
            info.className = "card gold-star";
            info.innerHTML = "<b>MASTER ONLINE</b><br>Saldo: 1.250 BLUES<br><small>Indicações: 12 Filhos</small>";
            document.getElementById('adm-panel').style.display = 'block';
            
            // Exemplo de Live
            document.getElementById('lista-lives').innerHTML = \`
                <div class="live-cam">
                    🔴 AO VIVO - CHAT ATIVO
                    <span class="pimenta">🌶️</span>
                </div>
                <button class="btn" onclick="payLive(10)">Entrar na Live (10 Blues)</button>
            \`;
        }
    </script>
</body>
</html>
`;

// --- ROTAS DO SERVIDOR ---
app.get('/', (req, res) => res.send(html));

// Rota de Saque
app.post("/api/saque", (req, res) => {
    const { valor, userId } = req.body;
    if (valor < 20) return res.status(400).send("Mínimo R$ 20");
    // Lógica de débito de blues
    res.json({ status: "Solicitado" });
});

// Automação Master Login 1
db.prepare("INSERT OR IGNORE INTO users (id, username, role) VALUES (1, 'master', 'master')").run();

app.listen(process.env.PORT || 3000, () => {
    console.log("🚀 ICE PLATFORM ONLINE");
});
