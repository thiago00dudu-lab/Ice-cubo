require("dotenv").config();
const express = require("express");
const Database = require("better-sqlite3");
const axios = require("axios");
const bcrypt = require("bcrypt");
const app = express();
const db = new Database("ice.db");

const ASAAS_KEY = process.env.ASAAS_KEY;
const ASAAS_URL = "https://api.asaas.com"; // Adicionado /v3 que é o padrão da API

app.use(express.json());

// Força o navegador a NÃO usar cache
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

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

const hashMaster = bcrypt.hashSync("ice123", 10);
db.prepare("INSERT OR IGNORE INTO users (id, username, password, role) VALUES (1, 'admin', ?, 'master')").run(hashMaster);

// --- FRONT-END ---
const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ICE PLATFORM - LIVE</title>
    <style>
        body { background: radial-gradient(circle, #1e293b 0%, #0f172a 100%); color: white; font-family: 'Segoe UI', sans-serif; padding: 10px; margin: 0; }
        .card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); padding: 15px; border-radius: 20px; margin-bottom: 15px; border: 1px solid rgba(255, 255, 255, 0.1); }
        .blue-coin { background: #001f3f; color: #FFD700; border: 2px solid #FFD700; padding: 5px 10px; border-radius: 50px; font-weight: bold; display: inline-block; }
        .btn { width: 100%; padding: 14px; border: none; border-radius: 12px; background: #0077b6; color: white; font-weight: bold; cursor: pointer; margin: 5px 0; }
        .btn-live { background: #d00000; box-shadow: 0 0 15px #d00000; }
        video { width: 100%; height: 250px; border-radius: 15px; background: #000; object-fit: cover; border: 2px solid #00d4ff; }
        input { width: 95%; padding: 12px; margin: 8px 0; border-radius: 10px; background: rgba(0,0,0,0.3); color: white; border: 1px solid #00d4ff; box-sizing: border-box; }
    </style>
</head>
<body>
    <div id="login-box">
        <h2 align="center" style="color:#00d4ff;">ICE LOGIN</h2>
        <div class="card">
            <input type="text" id="u" placeholder="Usuário">
            <input type="password" id="p" placeholder="Senha">
            <button class="btn" onclick="logar()">CONGELAR (ENTRAR)</button>
        </div>
    </div>

    <div id="app" style="display:none">
        <div id="perfil" class="card"></div>
        <div class="card" align="center">
            <h3>🎥 LIVE AO VIVO</h3>
            <video id="vLocal" autoplay playsinline></video>
            <button class="btn btn-live" id="bLive" onclick="startLive()">INICIAR LIVE</button>
        </div>
        <div class="card">
            <h3>💰 DEPÓSITO PIX</h3>
            <input type="number" id="val" placeholder="Valor em R$">
            <button class="btn" style="background:#22c55e" onclick="buyPix()">GERAR QR CODE</button>
            <div id="pix-res" style="margin-top:10px"></div>
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
                document.getElementById('perfil').innerHTML = "<b>" + data.user.toUpperCase() + "</b> | <span class='blue-coin'>" + data.blues.toFixed(2) + " BLUES</span>";
            } else { alert("Erro de Login!"); }
        }

        async function startLive() {
            const video = document.getElementById('vLocal');
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                video.srcObject = stream;
            } catch (err) { alert("Permita Câmera e Microfone!"); }
        }

        async function buyPix() {
            const v = document.getElementById('val').value;
            const res = await fetch('/pix', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({valor: v})
            });
            const data = await res.json();
            if(data.encodedImage) {
                document.getElementById('pix-res').innerHTML = \`
                    <p>Escaneie o PIX:</p>
                    <img src="data:image/png;base64,\${data.encodedImage}" width="200">
                    <br><small>Copia e Cola: \${data.payload}</small>
                \`;
            } else { alert("Erro ao gerar PIX"); }
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

app.post('/pix', async (req, res) => {
    try {
        // CORREÇÃO: Removidas as barras invertidas extras que vieram do WhatsApp
        const pay = await axios.post(`${ASAAS_URL}/payments`, {
            billingType: "PIX", 
            value: req.body.valor,
            dueDate: new Date().toISOString().split('T')[0],
            customer: "cus_000005933924" 
        }, { headers: { access_token: ASAAS_KEY } });
        
        const qr = await axios.get(`${ASAAS_URL}/payments/${pay.data.id}/pixQrCode`, {
            headers: { access_token: ASAAS_KEY }
        });
        res.json(qr.data);
    } catch (e) { 
        console.error(e.response ? e.response.data : e.message);
        res.status(500).json({e: e.message}); 
    }
});

app.listen(process.env.PORT || 3000, () => console.log("ICE PRONTO"));
