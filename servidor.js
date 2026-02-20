require("dotenv").config();
const express = require("express");
const Database = require("better-sqlite3");
const axios = require("axios");
const bcrypt = require("bcrypt");
const app = express();
const db = new Database("ice.db");

const ASAAS_KEY = process.env.ASAAS_KEY;
const ASAAS_URL = "https://api.asaas.com";

app.use(express.json({ limit: '10mb' })); // Permite fotos maiores

// --- BANCO DE DADOS ---
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'filho',
    blues REAL DEFAULT 0,
    live_price REAL DEFAULT 0,
    foto_perfil TEXT,
    pai_id INTEGER
  );
`);

// Criar Admin
const hashAdmin = bcrypt.hashSync("ice123", 10);
db.prepare("INSERT OR IGNORE INTO users (username, password, role) VALUES ('admin', ?, 'master')").run(hashAdmin);

// --- FRONT-END AZUL BEBÊ ---
const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ICE PLATFORM</title>
    <style>
        body { background: #e0f2fe; color: #1e293b; font-family: sans-serif; margin: 0; padding: 15px; }
        .card { background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); border: 2px solid #bae6fd; border-radius: 20px; padding: 15px; margin-bottom: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
        .btn { width: 100%; padding: 12px; border: none; border-radius: 12px; background: #0ea5e9; color: white; font-weight: bold; cursor: pointer; margin-top: 8px; }
        input { width: 100%; padding: 10px; margin: 5px 0; border-radius: 10px; border: 1px solid #bae6fd; box-sizing: border-box; }
        img.perfil { width: 100%; border-radius: 15px; margin-bottom: 10px; background: #cbd5e1; }
        .grid-fotos { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    </style>
</head>
<body>
    <div id="login-box" style="max-width:400px; margin: auto;">
        <h1 align="center" style="color:#0369a1">ICE LOGIN</h1>
        <div class="card">
            <input type="text" id="u" placeholder="Usuário">
            <input type="password" id="p" placeholder="Senha">
            <button class="btn" onclick="auth('login')">ENTRAR</button>
            <button class="btn" style="background:#94a3b8" onclick="auth('register')">CRIAR CONTA</button>
        </div>
    </div>

    <div id="app" style="display:none">
        <div class="card">
            <h3 id="txt-user">Olá</h3>
            <p>Saldo: <b id="txt-blues">0.00</b> BLUES</p>
        </div>

        <div class="card">
            <h3>📸 MEU PERFIL (FOTO)</h3>
            <input type="file" id="input-foto" accept="image/*" onchange="uploadFoto()">
            <div id="minha-foto-div"></div>
            <input type="number" id="valor-live" placeholder="Preço da sua Live (Blues)">
            <button class="btn" onclick="salvarPreco()">SALVAR PREÇO</button>
        </div>

        <div id="area-adm" class="card" style="display:none; border-color:red">
            <h3 style="color:red">⚙️ MASTER PAINEL</h3>
            <button class="btn" style="background:red" onclick="listarUsuarios()">LISTAR TODOS OS NODES</button>
            <div id="lista-nodes" style="font-size:0.8em; margin-top:10px"></div>
        </div>

        <div class="card">
            <h3>💰 COMPRAR BLUES</h3>
            <input type="number" id="val-pix" placeholder="Valor em R$">
            <button class="btn" style="background:#10b981" onclick="gerarPix()">GERAR QR CODE</button>
            <div id="pix-res" style="text-align:center; margin-top:10px"></div>
        </div>
    </div>

    <script>
        let currentUser = null;

        async function auth(rota) {
            const u = document.getElementById('u').value, p = document.getElementById('p').value;
            const res = await fetch('/'+rota, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({u, p}) });
            const d = await res.json();
            if(res.ok) {
                currentUser = d;
                document.getElementById('login-box').style.display = 'none';
                document.getElementById('app').style.display = 'block';
                document.getElementById('txt-user').innerText = "Olá, " + d.user.toUpperCase();
                document.getElementById('txt-blues').innerText = d.blues.toFixed(2);
                if(d.role === 'master') document.getElementById('area-adm').style.display = 'block';
            } else { alert(d.error); }
        }

        async function uploadFoto() {
            const file = document.getElementById('input-foto').files[0];
            const reader = new FileReader();
            reader.onloadend = async () => {
                await fetch('/upload', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user: currentUser.user, foto: reader.result}) });
                alert("Foto atualizada!");
            };
            reader.readAsDataURL(file);
        }

        async function gerarPix() {
            const v = document.getElementById('val-pix').value;
            const res = await fetch('/pix', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({valor: v}) });
            const d = await res.json();
            if(d.encodedImage) {
                document.getElementById('pix-res').innerHTML = '<img src="data:image/png;base64,'+d.encodedImage+'" width="150"><br><small>Pague para cair seus Blues!</small>';
            }
        }

        async function listarUsuarios() {
            const res = await fetch('/admin/nodes');
            const nodes = await res.json();
            document.getElementById('lista-nodes').innerHTML = nodes.map(n => n.username + " | Blues: " + n.blues).join("<br>");
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(html));

app.post('/register', (req, res) => {
    const { u, p } = req.body;
    try {
        const hash = bcrypt.hashSync(p, 10);
        db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(u, hash);
        res.json({ user: u, blues: 0, role: 'filho' });
    } catch (e) { res.status(400).json({error: "Usuário já existe!"}); }
});

app.post('/login', (req, res) => {
    const { u, p } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(u);
    if (user && bcrypt.compareSync(p, user.password)) {
        res.json({ user: user.username, blues: user.blues, role: user.role });
    } else { res.status(401).json({error: "Senha incorreta!"}); }
});

app.post('/upload', (req, res) => {
    db.prepare("UPDATE users SET foto_perfil = ? WHERE username = ?").run(req.body.foto, req.body.user);
    res.sendStatus(200);
});

app.get('/admin/nodes', (req, res) => {
    res.json(db.prepare("SELECT username, blues FROM users").all());
});

app.post('/pix', async (req, res) => {
    try {
        const cli = await axios.post(`${ASAAS_URL}/customers`, { name: "User Ice" }, { headers: { access_token: ASAAS_KEY } });
        const pay = await axios.post(`${ASAAS_URL}/payments`, {
            billingType: "PIX", value: req.body.valor, customer: cli.data.id,
            dueDate: new Date().toISOString().split('T')
        }, { headers: { access_token: ASAAS_KEY } });
        const qr = await axios.get(`${ASAAS_URL}/payments/${pay.data.id}/pixQrCode`, { headers: { access_token: ASAAS_KEY } });
        res.json(qr.data);
    } catch (e) { res.status(500).json({error: "Erro no Asaas"}); }
});

app.listen(process.env.PORT || 3000, () => console.log("SISTEMA ON"));
