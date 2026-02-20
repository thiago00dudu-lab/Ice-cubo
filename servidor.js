require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Database = require("better-sqlite3");
const axios = require("axios");

const app = express();
// O Render exige que o banco seja num local persistente ou ele dá erro de escrita
const db = new Database("ice.db");

// 🔐 SEGURANÇA: Chaves invisíveis
const JWT_SECRET = process.env.JWT_SECRET || "ice_cubo_9988";
const ASAAS_KEY = process.env.ASAAS_KEY;
const ASAAS_URL = "https://api.asaas.com";

app.use(express.json());

// 🗄️ BANCO DE DADOS (Hierarquia e Afiliados)
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'filho',
  blues REAL DEFAULT 0,
  asaas_id TEXT,
  pai_id INTEGER,
  is_blocked INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS lives (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER,
  title TEXT,
  price REAL DEFAULT 0,
  is_adult INTEGER DEFAULT 0,
  active INTEGER DEFAULT 0
);
`);

// Forçar o primeiro ID a ser Master (Sua Estrela Dourada)
db.exec("UPDATE users SET role = 'master' WHERE id = 1");

// 🛡️ MIDDLEWARE DE LOGIN
const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.sendStatus(401);
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = db.prepare("SELECT * FROM users WHERE id = ?").get(decoded.id);
        if (!req.user || req.user.is_blocked) return res.sendStatus(403);
        next();
    } catch { res.sendStatus(401); }
};

// 👤 REGISTRO (Vira Filho de alguém pelo ID)
app.post("/register", async (req, res) => {
    const { u, p, ref } = req.body;
    try {
        const hash = bcrypt.hashSync(p, 10);
        // Cria cliente no Asaas para o PIX funcionar
        const cli = await axios.post(`${ASAAS_URL}/customers`, { name: u }, { headers: { access_token: ASAAS_KEY } });
        const result = db.prepare("INSERT INTO users (username, password, asaas_id, pai_id) VALUES (?, ?, ?, ?)")
                         .run(u, hash, cli.data.id, ref || null);
        res.json({ ok: true, id: result.lastInsertRowid });
    } catch (e) { 
        console.error(e);
        res.status(400).json({ error: "Usuário já existe ou erro no Asaas" }); 
    }
});

// 🔑 LOGIN (Master entra com Estrela)
app.post("/login", (req, res) => {
    const { u, p } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(u);
    if (!user || !bcrypt.compareSync(p, user.password)) return res.status(401).json({ error: "Dados incorretos" });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, username: user.username, blues: user.blues, role: user.role } });
});

// 💰 PIX PRIORIDADE (Gera QR CODE real)
app.post("/buy", auth, async (req, res) => {
    try {
        const { val } = req.body; // 1 real = 1 blue
        const pay = await axios.post(`${ASAAS_URL}/payments`, {
            customer: req.user.asaas_id,
            billingType: "PIX", value: val,
            dueDate: new Date().toISOString().split('T')[0],
            externalReference: req.user.id.toString()
        }, { headers: { access_token: ASAAS_KEY } });

        const qr = await axios.get(`${ASAAS_URL}/payments/${pay.data.id}/pixQrCode`, { headers: { access_token: ASAAS_KEY } });
        res.json({ payload: qr.data.payload, qrcode: qr.data.encodedImage });
    } catch (e) { res.status(500).json({ error: "Erro no Asaas" }); }
});

// 🔔 WEBHOOK: DIVISÃO 85% / 10% / 5%
app.post("/webhook", (req, res) => {
    if (req.body.event === "PAYMENT_RECEIVED") {
        const userId = parseInt(req.body.payment.externalReference);
        const valor = req.body.payment.value;
        // 85% pro usuário
        db.prepare("UPDATE users SET blues = blues + ? WHERE id = ?").run(valor * 0.85, userId);
        // 5% pro pai
        const user = db.prepare("SELECT pai_id FROM users WHERE id = ?").get(userId);
        if (user && user.pai_id) {
            db.prepare("UPDATE users SET blues = blues + ? WHERE id = ?").run(valor * 0.05, user.pai_id);
        }
    }
    res.sendStatus(200);
});

// 🎥 LIVE COM CÂMERA E ÁUDIO
app.get("/", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ICE CUBO</title>
    <style>
        body { background: #e0f2fe; font-family: sans-serif; margin: 0; padding: 15px; }
        .ice-card { background: rgba(255,255,255,0.6); backdrop-filter: blur(10px); border-radius: 20px; border: 2px solid #bae6fd; padding: 20px; margin-bottom: 15px; }
        .estrela-master { color: gold; font-weight: bold; }
        .btn { width: 100%; padding: 12px; border: none; border-radius: 12px; background: #0ea5e9; color: white; font-weight: bold; cursor: pointer; margin-top: 10px; }
        video { width: 100%; border-radius: 15px; background: #000; margin-top: 10px; }
        input { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #7dd3fc; box-sizing: border-box; margin-top: 5px; }
    </style>
</head>
<body>
    <div id="auth" class="ice-card">
        <h1 align="center">🧊 ICE LOGIN</h1>
        <input id="u" placeholder="Usuário">
        <input id="p" type="password" placeholder="Senha">
        <button class="btn" onclick="entrar('login')">ENTRAR</button>
        <button class="btn" style="background:#94a3b8" onclick="entrar('register')">CRIAR CONTA</button>
    </div>

    <div id="app" style="display:none">
        <div class="ice-card" id="header"></div>
        
        <div class="ice-card">
            <h3>💰 COMPRAR BLUES (PIX)</h3>
            <input id="val-pix" type="number" placeholder="Valor em R$">
            <button class="btn" style="background:#10b981" onclick="comprar()">GERAR QR CODE</button>
            <div id="pix-area" align="center"></div>
        </div>

        <div class="ice-card">
            <h3>🎥 MINHA LIFE AO VIVO</h3>
            <video id="vid" autoplay playsinline muted></video>
            <button class="btn" onclick="life(true)">LIGAR CÂMERA/ÁUDIO</button>
            <button class="btn" style="background:#ef4444" onclick="life(false)">DESLIGAR</button>
        </div>
    </div>

    <script>
        let TOKEN = "";
        async function entrar(rota) {
            const u = document.getElementById('u').value, p = document.getElementById('p').value;
            const res = await fetch('/'+rota, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({u, p}) });
            const d = await res.json();
            if(res.ok) {
                if(rota === 'register') return alert("Conta criada! Agora faça login.");
                TOKEN = d.token;
                document.getElementById('auth').style.display = 'none';
                document.getElementById('app').style.display = 'block';
                document.getElementById('header').innerHTML = (d.user.role === 'master' ? '<span class="estrela-master">⭐ MASTER</span>' : '') + '<h2>Olá, ' + d.user.username + '</h2><p>Blues: ' + d.user.blues + '</p>';
            } else { alert(d.error); }
        }

        async function comprar() {
            const val = document.getElementById('val-pix').value;
            const res = await fetch('/buy', { method:'POST', headers:{'Content-Type':'application/json', 'Authorization': TOKEN}, body:JSON.stringify({val}) });
            const d = await res.json();
            if(d.qrcode) {
                document.getElementById('pix-area').innerHTML = '<img src="data:image/png;base64,'+d.qrcode+'" width="200"><br><small>'+d.payload+'</small>';
            }
        }

        async function life(on) {
            const v = document.getElementById('vid');
            if(on) {
                const s = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
                v.srcObject = s;
            } else {
                v.srcObject.getTracks().forEach(t => t.stop());
                v.srcObject = null;
            }
        }
    </script>
</body>
</html>
    `);
});

// ESCUTA A PORTA DO RENDER
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("ICE CUBO RODANDO"));
