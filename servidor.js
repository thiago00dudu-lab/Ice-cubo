require("dotenv").config();
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const axios = require("axios");
const bcrypt = require("bcrypt");
const app = express();

// Banco de dados compatível com o Render
const db = new sqlite3.Database("ice.db");

const ASAAS_KEY = process.env.ASAAS_KEY;
const ASAAS_URL = "https://api.asaas.com";

app.use(express.json());

// --- CRIAÇÃO DAS TABELAS ---
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, role TEXT DEFAULT 'filho', blues REAL DEFAULT 0, asaas_id TEXT)");
});

// --- FRONT-END AZUL BEBÊ / CUBO DE GELO ---
const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ICE PLATFORM</title>
    <style>
        body { background: #e0f2fe; color: #1e293b; font-family: sans-serif; padding: 15px; margin: 0; }
        .card { background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); border: 2px solid #bae6fd; border-radius: 20px; padding: 20px; margin-bottom: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .btn { width: 100%; padding: 15px; border: none; border-radius: 12px; background: #0ea5e9; color: white; font-weight: bold; cursor: pointer; margin-top: 10px; }
        video { width: 100%; border-radius: 15px; background: #000; margin-top: 10px; border: 3px solid #7dd3fc; height: 250px; object-fit: cover; }
        input { width: 100%; padding: 12px; margin: 10px 0; border-radius: 10px; border: 1px solid #bae6fd; box-sizing: border-box; }
        .estrela { color: #fbbf24; font-weight: bold; text-shadow: 0 0 5px gold; }
        #pix-area img { width: 180px; border-radius: 10px; margin-top: 10px; }
    </style>
</head>
<body>
    <div id="login-box" style="max-width:400px; margin: 50px auto; text-align:center;">
        <h1 style="color: #0369a1;">ICE LOGIN</h1>
        <div class="card">
            <input type="text" id="u" placeholder="Usuário">
            <input type="password" id="p" placeholder="Senha">
            <button class="btn" onclick="auth('login')">ENTRAR</button>
            <button class="btn" style="background:#cbd5e1; color:#475569" onclick="auth('register')">CRIAR CONTA</button>
        </div>
    </div>

    <div id="app" style="display:none">
        <div class="card" id="perfil-txt"></div>
        <div class="card">
            <h3>💰 COMPRAR BLUES (PIX)</h3>
            <input type="number" id="val-pix" placeholder="Valor R$">
            <button class="btn" style="background:#10b981" onclick="comprar()">GERAR PIX</button>
            <div id="pix-area" align="center"></div>
        </div>
        <div class="card">
            <h3>🎥 LIFE AO VIVO (CÂMERA/ÁUDIO)</h3>
            <video id="vid" autoplay playsinline muted></video>
            <button class="btn" onclick="life(true)">INICIAR LIFE</button>
            <button class="btn" style="background:#f43f5e" onclick="life(false)">DESLIGAR</button>
        </div>
    </div>

    <script>
        let USER = null;
        async function auth(rota) {
            const u = document.getElementById('u').value, p = document.getElementById('p').value;
            const res = await fetch('/'+rota, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({u, p}) });
            const d = await res.json();
            if(res.ok) {
                if(rota === 'register') return alert("Registrado! Faça login.");
                USER = d; document.getElementById('login-box').style.display = 'none'; document.getElementById('app').style.display = 'block';
                document.getElementById('perfil-txt').innerHTML = (d.role === 'master' ? '<span class="estrela">⭐ MASTER</span>' : '') + '<h2>Olá, ' + d.username.toUpperCase() + '</h2><p>Saldo: ' + (d.blues || 0).toFixed(2) + ' Blues</p>';
            } else { alert(d.error || "Erro no acesso!"); }
        }

        async function comprar() {
            const val = document.getElementById('val-pix').value;
            const res = await fetch('/pix', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({val, u: USER.username}) });
            const d = await res.json();
            if(d.qrcode) document.getElementById('pix-area').innerHTML = '<b>Pague para receber:</b><br><img src="data:image/png;base64,'+d.qrcode+'"><br><small>'+d.payload+'</small>';
        }

        async function life(on) {
            const v = document.getElementById('vid');
            if(on) {
                const s = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
                v.srcObject = s;
            } else {
                if(v.srcObject) v.srcObject.getTracks().forEach(t => t.stop());
                v.srcObject = null;
            }
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(html));

app.post('/register', async (req, res) => {
    try {
        const hash = bcrypt.hashSync(req.body.p, 10);
        const cli = await axios.post(`${ASAAS_URL}/customers`, { name: req.body.u }, { headers: { access_token: ASAAS_KEY } });
        db.run("INSERT INTO users (username, password, asaas_id) VALUES (?, ?, ?)", [req.body.u, hash, cli.data.id], function(err) {
            if (err) return res.status(400).json({ error: "Erro" });
            if (this.lastID === 1) db.run("UPDATE users SET role = 'master' WHERE id = 1");
            res.json({ ok: true });
        });
    } catch (e) { res.status(400).json({ error: "Erro no Asaas" }); }
});

app.post('/login', (req, res) => {
    db.get("SELECT * FROM users WHERE username = ?", [req.body.u], (err, user) => {
        if (user && bcrypt.compareSync(req.body.p, user.password)) res.json(user);
        else res.status(401).json({ error: "Dados incorretos" });
    });
});

app.post('/pix', (req, res) => {
    db.get("SELECT asaas_id FROM users WHERE username = ?", [req.body.u], async (err, user) => {
        try {
            const pay = await axios.post(`${ASAAS_URL}/payments`, { customer: user.asaas_id, billingType: "PIX", value: req.body.val, dueDate: new Date().toISOString().split('T') }, { headers: { access_token: ASAAS_KEY } });
            const qr = await axios.get(`${ASAAS_URL}/payments/${pay.data.id}/pixQrCode`, { headers: { access_token: ASAAS_KEY } });
            res.json({ payload: qr.data.payload, qrcode: qr.data.encodedImage });
        } catch (e) { res.status(500).json({ error: "Erro PIX" }); }
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("ICE ONLINE"));
