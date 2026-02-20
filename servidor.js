require("dotenv").config();
const express = require("express");
const Database = require("better-sqlite3");
const axios = require("axios");
const bcrypt = require("bcrypt");
const app = express();
const db = new Database("ice.db");

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

// Master Inicial (admin | ice123)
const hashMaster = bcrypt.hashSync("ice123", 10);
db.prepare("INSERT OR IGNORE INTO users (id, username, password, role) VALUES (1, 'admin', ?, 'master')").run(hashMaster);

// --- FRONT-END COM CÂMERA E ÁUDIO ---
const html = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ICE PLATFORM - LIVE</title>
    <style>
        body { background: #0f172a; color: white; font-family: sans-serif; padding: 10px; margin: 0; }
        .card { background: #1e293b; padding: 15px; border-radius: 12px; margin-bottom: 10px; border: 1px solid #334155; position: relative; }
        .gold-star::after { content: '⭐'; color: gold; position: absolute; top: 10px; right: 15px; font-size: 20px; }
        .btn { width: 100%; padding: 12px; border: none; border-radius: 8px; background: #3b82f6; color: white; font-weight: bold; cursor: pointer; margin: 5px 0; }
        .btn-live { background: #ef4444; }
        #video-container { width: 100%; height: 250px; background: #000; border-radius: 10px; overflow: hidden; border: 2px solid #ef4444; position: relative; display: flex; align-items: center; justify-content: center; }
        video { width: 100%; height: 100%; object-fit: cover; }
        input { width: 95%; padding: 12px; margin: 5px 0; border-radius: 8px; background: #334155; color: white; border: none; box-sizing: border-box; }
        .pimenta { position: absolute; top: 10px; left: 10px; font-size: 20px; background: rgba(0,0,0,0.5); border-radius: 5px; padding: 2px; }
        #chat { height: 100px; overflow-y: auto; background: rgba(0,0,0,0.2); padding: 5px; font-size: 12px; margin-top: 5px; border-radius: 5px; }
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
            <div id="video-container">
                <video id="localVideo" autoplay playsinline muted></video>
                <div class="pimenta">🌶️</div>
                <div style="position:absolute; bottom:10px; width:90%">
                    <button class="btn btn-live" id="btnStream" onclick="toggleStream()">INICIAR LIVE</button>
                </div>
            </div>
            <div id="chat"><i>Sistema: Bem-vindo ao chat da Life...</i></div>
            <input type="text" placeholder="Enviar mensagem na live...">
        </div>

        <div class="card">
            <h3>💰 SALDO & DEPÓSITO</h3>
            <button class="btn" style="background:#22c55e" onclick="alert('Gerando PIX...')">COMPRAR BLUES (ASAAS)</button>
        </div>

        <div id="adm" style="display:none" class="card">
            <h3 style="color:gold">PAINEL MASTER ⭐</h3>
            <button class="btn" style="background:#ef4444">BANIR USUÁRIO</button>
            <button class="btn">SAQUES (MÍN R$ 20)</button>
        </div>
    </div>

    <script>
        let stream = null;

        async function toggleStream() {
            const btn = document.getElementById('btnStream');
            const video = document.getElementById('localVideo');

            if (!stream) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    video.srcObject = stream;
                    btn.innerText = "PARAR TRANSMISSÃO";
                    btn.style.background = "#64748b";
                    console.log("Câmera e Microfone ativos!");
                } catch (err) {
                    alert("Erro ao acessar câmera: " + err.message);
                }
            } else {
                stream.getTracks().forEach(track => track.stop());
                video.srcObject = null;
                stream = null;
                btn.innerText = "INICIAR LIVE";
                btn.style.background = "#ef4444";
            }
        }

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
                perf.innerHTML = "<b>" + data.user.toUpperCase() + "</b> | Saldo: " + data.blues.toFixed(2) + " Blues";
                if(data.role === 'master') {
                    perf.classList.add('gold-star');
                    document.getElementById('adm').style.display = 'block';
                }
            } else { alert("Login falhou!"); }
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(html));

app.post('/login', (req, res) => {
    const { u, p } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(u);
    if (user && bcrypt.compareSync(p, user.password)) {
        res.json({ user: user.username, role: user.role, blues: user.blues });
    } else { res.sendStatus(401); }
});

app.listen(process.env.PORT || 3000, () => console.log("ICE ONLINE COM CÂMERA"));
