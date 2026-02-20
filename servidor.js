require("dotenv").config();
const express = require("express");
const Database = require("better-sqlite3");
const axios = require("axios");
const bcrypt = require("bcrypt");
const app = express();
const db = new Database("ice.db");

// Variáveis do Render (ASAAS_KEY e JWT_SECRET)
const ASAAS_KEY = process.env.ASAAS_KEY;
const ASAAS_URL = "https://api.asaas.com";

app.use(express.json());

// --- BANCO DE DADOS ---
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

// Criar Master Automático (Login: admin | Senha: ice123)
const hashMaster = bcrypt.hashSync("ice123", 10);
db.prepare("INSERT OR IGNORE INTO users (id, username, password, role) VALUES (1, 'admin', ?, 'master')").run(hashMaster);

// --- FRONT-END UNIFICADO ---
const html = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ICE PLATFORM</title>
    <style>
        body { background: #0f172a; color: white; font-family: sans-serif; padding: 10px; margin: 0; }
        .card { background: #1e293b; padding: 15px; border-radius: 12px; margin-bottom: 10px; border: 1px solid #334155; position: relative; }
        .gold-star::after { content: '⭐'; color: gold; position: absolute; top: 10px; right: 15px; font-size: 20px; }
        .btn { width: 100%; padding: 12px; border: none; border-radius: 8px; background: #3b82f6; color: white; font-weight: bold; cursor: pointer; margin: 5px 0; }
        .live-cam { width: 100%; height: 200px; background: black; border-radius: 8px; border: 2px solid red; display: flex; align-items: center; justify-content: center; position: relative; }
        input { width: 95%; padding: 12px; margin: 5px 0; border-radius: 8px; background: #334155; color: white; border: none; }
        .pimenta { position: absolute; bottom: 10px; right: 10px; font-size: 20px; }
    </style>
</head>
<body>
    <div id="login-box">
        <h2 align="center">ICE LOGIN</h2>
        <div class="card">
            <input type="text" id="u" placeholder="Usuário">
            <input type="password" id="p" placeholder="Senha">
            <button class="btn" onclick="logar()">ENTRAR</button>
        </div>
    </div>

    <div id="app" style="display:none">
        <div id="perfil" class="card"></div>
        
        <div class="card">
            <h3>💰 RECARREGAR (PIX AUTOMÁTICO)</h3>
            <input type="number" id="v" placeholder="Valor R$">
            <button class="btn" style="background:#22c55e" onclick="gerarPix()">COMPRAR BLUES</button>
        </div>

        <h3>🎥 LIVES ATIVAS</h3>
        <div class="card">
            <div class="live-cam">🔴 AO VIVO <span class="pimenta">🌶️</span></div>
            <button class="btn" onclick="alert('Iniciando áudio e vídeo...')">Entrar (10 Blues)</button>
        </div>

        <div id="adm" style="display:none" class="card">
            <h3 style="color:gold">PAINEL MASTER</h3>
            <button class="btn" style="background:#ef4444">Bloquear Usuário</button>
            <button class="btn">Saques Pendentes (Min R$ 20)</button>
        </div>
    </div>

    <script>
        async function logar() {
            const res = await fetch('/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({u: document.getElementById('u').value, p: document.getElementById('p').value})
            });
            if(res.ok) {
                const data = await res.json();
                document.getElementById('login-box').style.display = 'none';
                document.getElementById('app').style.display = 'block';
                const perf = document.getElementById('perfil');
                perf.innerHTML = "<b>" + data.user.toUpperCase() + "</b><br>Saldo: " + data.blues.toFixed(2) + " BLUES";
                if(data.role === 'master') {
                    perf.classList.add('gold-star');
                    document.getElementById('adm').style.display = 'block';
                }
            } else { alert("Usuário ou senha inválidos"); }
        }

        function gerarPix() {
            const val = document.getElementById('v').value;
            alert("Gerando QR Code PIX de R$ " + val + " via Asaas...");
            // Integração com a rota /pix do servidor
        }
    </script>
</body>
</html>
`;

// --- ROTAS DO SISTEMA ---
app.get('/', (req, res) => res.send(html));

app.post('/login', (req, res) => {
    const { u, p } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(u);
    if (user && bcrypt.compareSync(p, user.password)) {
        res.json({ user: user.username, role: user.role, blues: user.blues });
    } else { res.sendStatus(401); }
});

// Automação de porcentagens (85/10/5) no Webhook do Asaas
app.post('/webhook', (req, res) => {
    if (req.body.event === "PAYMENT_RECEIVED") {
        const val = req.body.payment.value;
        const asaasId = req.body.payment.customer;
        const user = db.prepare("SELECT * FROM users WHERE asaas_id = ?").get(asaasId);
        
        if (user) {
            db.prepare("UPDATE users SET blues = blues + ? WHERE id = ?").run(val * 0.85, user.id);
            db.prepare("UPDATE users SET blues = blues + ? WHERE id = 1").run(val * 0.10); // 10% pro Master
            if (user.pai_id) db.prepare("UPDATE users SET blues = blues + ? WHERE id = ?").run(val * 0.05, user.pai_id);
        }
    }
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000, () => console.log("ICE ONLINE"));
