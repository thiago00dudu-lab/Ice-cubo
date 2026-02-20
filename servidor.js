require("dotenv").config();
const express = require("express");
const Database = require("better-sqlite3");
const axios = require("axios");
const bcrypt = require("bcrypt");
const app = express();
const db = new Database("ice.db");

const ASAAS_KEY = process.env.ASAAS_KEY;
const ASAAS_URL = "https://api.asaas.com";
const MAX_BLUES = 21000000; // Limite estilo Bitcoin

app.use(express.json());

// --- BANCO DE DADOS (COM SISTEMA DE PAI E ESTOQUE) ---
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'filho',
    blues REAL DEFAULT 0,
    pai_id INTEGER
  );
  
  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value REAL
  );

  INSERT OR IGNORE INTO config (key, value) VALUES ('total_emitido', 0);
`);

// --- FRONT-END CUBO DE GELO ---
const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ICE PLATFORM - LIVE</title>
    <style>
        body { 
            background: radial-gradient(circle at center, #1e293b 0%, #020617 100%); 
            color: white; font-family: 'Segoe UI', sans-serif; margin: 0; padding: 15px; 
        }
        /* Efeito Cubo de Gelo */
        .ice-card { 
            background: rgba(255, 255, 255, 0.03); 
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 25px; padding: 20px; margin-bottom: 20px;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }
        .blue-coin { color: #00d4ff; font-weight: bold; text-shadow: 0 0 10px #00d4ff; }
        .btn { width: 100%; padding: 15px; border: none; border-radius: 15px; font-weight: bold; cursor: pointer; margin: 5px 0; transition: 0.3s; }
        .btn-live { background: #d00000; color: white; box-shadow: 0 0 15px rgba(208, 0, 0, 0.4); }
        .btn-stop { background: #334155; color: white; display: none; }
        .btn-pix { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; }
        video { width: 100%; border-radius: 20px; background: #000; border: 1px solid #00d4ff; margin-bottom: 10px; }
        input { width: 100%; padding: 12px; margin: 10px 0; border-radius: 12px; background: rgba(0,0,0,0.2); color: white; border: 1px solid #00d4ff; box-sizing: border-box; }
        .ref-box { font-size: 0.8em; background: rgba(0,212,255,0.05); padding: 10px; border-radius: 10px; border: 1px dashed #00d4ff; }
    </style>
</head>
<body>
    <div id="login-box">
        <h2 align="center" style="color:#00d4ff; text-shadow: 0 0 10px #00d4ff">ICE CUBO</h2>
        <div class="ice-card">
            <input type="text" id="u" placeholder="Usuário">
            <input type="password" id="p" placeholder="Senha">
            <button class="btn" style="background:#0077b6; color:white" onclick="entrar('login')">ENTRAR</button>
            <button class="btn" style="background:transparent; color:#aaa; font-size:0.8em" onclick="entrar('register')">NÃO TEM CONTA? REGISTRE-SE</button>
        </div>
    </div>

    <div id="app" style="display:none">
        <div id="perfil" class="ice-card"></div>

        <div class="ice-card">
            <h3>🔗 SISTEMA DE FILHOS</h3>
            <div class="ref-box">
                Ganhe <b>5%</b> de cada depósito dos seus filhos para sempre! <br><br>
                <b>Link de Convite:</b><br>
                <code id="link-convite"></code>
            </div>
        </div>
        
        <div class="ice-card" align="center">
            <h3>🎥 LIFE AO VIVO</h3>
            <video id="vLocal" autoplay playsinline muted></video>
            <button class="btn btn-live" id="bStart" onclick="startLive()">INICIAR LIFE</button>
            <button class="btn btn-stop" id="bStop" onclick="stopLive()">FINALIZAR LIFE</button>
        </div>

        <div class="ice-card">
            <h3>💰 COMPRAR BLUES</h3>
            <p style="font-size:0.7em; color:#aaa">Estoque limitado estilo Bitcoin. Garanta os seus!</p>
            <input type="number" id="val" placeholder="Valor em R$">
            <button class="btn btn-pix" onclick="buyPix()">GERAR PIX</button>
            <div id="pix-res" style="margin-top:15px; text-align:center"></div>
        </div>
    </div>

    <script>
        let stream = null;
        const refPai = new URLSearchParams(window.location.search).get('ref');

        async function entrar(tipo) {
            const u = document.getElementById('u').value;
            const p = document.getElementById('p').value;
            const res = await fetch('/' + tipo, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({u, p, ref: refPai})
            });
            const data = await res.json();
            if(res.ok) {
                document.getElementById('login-box').style.display = 'none';
                document.getElementById('app').style.display = 'block';
                document.getElementById('perfil').innerHTML = "<b>" + data.user.toUpperCase() + "</b> | <span class='blue-coin'>" + data.blues.toFixed(2) + " BLUES</span>";
                document.getElementById('link-convite').innerText = window.location.origin + "?ref=" + data.id;
            } else { alert(data.error || "Erro no acesso"); }
        }

        async function startLive() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
                document.getElementById('vLocal').srcObject = stream;
                document.getElementById('bStart').style.display = 'none';
                document.getElementById('bStop').style.display = 'block';
            } catch(e) { alert("Ligue a câmera!"); }
        }

        function stopLive() {
            if(stream) {
                stream.getTracks().forEach(t => t.stop());
                document.getElementById('vLocal').srcObject = null;
                document.getElementById('bStart').style.display = 'block';
                document.getElementById('bStop').style.display = 'none';
            }
        }

        async function buyPix() {
            const v = document.getElementById('val').value;
            if(!v) return alert("Digite o valor");
            document.getElementById('pix-res').innerText = "Gerando...";
            const res = await fetch('/pix', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({valor: v})
            });
            const data = await res.json();
            if(data.encodedImage) {
                document.getElementById('pix-res').innerHTML = '<img src="data:image/png;base64,'+data.encodedImage+'" width="180"><br><small style="word-break:break-all">'+data.payload+'</small>';
            } else { alert("Erro ao gerar PIX"); }
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(html));

// --- REGISTRO COM SISTEMA DE PAI ---
app.post('/register', (req, res) => {
    const { u, p, ref } = req.body;
    try {
        const hash = bcrypt.hashSync(p, 10);
        const paiId = ref ? parseInt(ref) : null;
        const result = db.prepare("INSERT INTO users (username, password, pai_id) VALUES (?, ?, ?)").run(u, hash, paiId);
        res.json({ id: result.lastInsertRowid, user: u, blues: 0 });
    } catch (e) { res.status(400).json({error: "Nome de usuário já existe!"}); }
});

app.post('/login', (req, res) => {
    const { u, p } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(u);
    if (user && bcrypt.compareSync(p, user.password)) {
        res.json({ id: user.id, user: user.username, blues: user.blues });
    } else { res.status(401).json({error: "Login incorreto!"}); }
});

// --- PIX COM CRIAÇÃO DE CLIENTE ---
app.post('/pix', async (req, res) => {
    try {
        const cli = await axios.post(`${ASAAS_URL}/customers`, { name: "User Ice" }, { headers: { access_token: ASAAS_KEY } });
        const pay = await axios.post(`${ASAAS_URL}/payments`, {
            billingType: "PIX", value: req.body.valor, customer: cli.data.id,
            dueDate: new Date().toISOString().split('T')[0]
        }, { headers: { access_token: ASAAS_KEY } });
        
        const qr = await axios.get(`${ASAAS_URL}/payments/${pay.data.id}/pixQrCode`, { headers: { access_token: ASAAS_KEY } });
        res.json(qr.data);
    } catch (e) { res.status(500).json({error: "Erro no Asaas"}); }
});

app.listen(process.env.PORT || 3000, () => console.log("SISTEMA ICE ONLINE"));
