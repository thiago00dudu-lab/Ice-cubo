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

// --- DATABASE: ESTRUTURA DE COMANDO ---
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'filho',
    blues REAL DEFAULT 0,
    pai_id INTEGER
  );
`);

// Cria o Super Usuário (MASTER)
const hashAdmin = bcrypt.hashSync("ice123", 10);
db.prepare("INSERT OR IGNORE INTO users (username, password, role) VALUES ('admin', ?, 'master')").run(hashAdmin);

// --- FRONT-END: HACKER COMMAND CENTER ---
const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ICE COMMAND CENTER</title>
    <style>
        body { background: #000; color: #00ff41; font-family: 'Courier New', monospace; margin: 0; padding: 10px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; }
        
        /* Monitores de Estilo Hacker */
        .monitor { 
            border: 2px solid #00ff41; background: rgba(0, 30, 0, 0.2); 
            padding: 15px; border-radius: 5px; box-shadow: inset 0 0 10px #00ff41, 0 0 15px #00ff41;
            position: relative; cursor: pointer; transition: 0.3s;
        }
        .fullscreen { position: fixed !important; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 1000; background: #000; padding: 40px; box-sizing: border-box; }
        
        .btn { width: 100%; padding: 12px; border: 1px solid #00ff41; background: transparent; color: #00ff41; cursor: pointer; font-weight: bold; margin-top: 10px; text-transform: uppercase; }
        .btn:hover { background: #00ff41; color: #000; }
        .btn-danger { border-color: #ff0000; color: #ff0000; }
        .btn-danger:hover { background: #ff0000; color: #fff; }
        
        input { width: 100%; padding: 10px; margin: 10px 0; background: #000; border: 1px solid #00ff41; color: #00ff41; box-sizing: border-box; }
        video { width: 100%; border: 1px solid #00ff41; box-shadow: 0 0 10px #00ff41; }
        
        #terminal { font-size: 0.75em; height: 100px; overflow-y: auto; border: 1px solid #004400; padding: 5px; color: #008f11; margin-top: 10px; }
        .admin-only { border: 2px solid #ff0000 !important; box-shadow: 0 0 15px #ff0000 !important; display: none; }
    </style>
</head>
<body>

    <div id="auth-scr" style="max-width:450px; margin: 60px auto;">
        <h2 align="center"> [ ICE_NODE_LOGIN ] </h2>
        <div class="monitor">
            <input type="text" id="u" placeholder="NODE_ID">
            <input type="password" id="p" placeholder="SECRET_PASS">
            <button class="btn" onclick="auth('login')">INITIALIZE_SESSION</button>
            <button class="btn" style="border-color:#444; color:#444" onclick="auth('register')">CREATE_NEW_NODE</button>
        </div>
    </div>

    <div id="app" style="display:none">
        <h3 id="usr-header">> NODE: UNKNOWN | ROLE: GUEST</h3>
        
        <div class="grid">
            <!-- MONITOR: LIVE UPLINK -->
            <div class="monitor" ondblclick="full(this)">
                <h3>🎥 LIVE_UPLINK_01</h3>
                <video id="vLocal" autoplay playsinline muted></video>
                <button class="btn" id="on" onclick="start()">START_STREAM</button>
                <button class="btn btn-danger" id="off" style="display:none" onclick="stop()">KILL_STREAM</button>
                <div id="terminal">>_ SYSTEM_IDLE</div>
            </div>

            <!-- MONITOR: ECONOMY -->
            <div class="monitor" ondblclick="full(this)">
                <h3>💰 ASSET_STORAGE</h3>
                <p id="balance-display">BLUES: 0.00</p>
                <input type="number" id="val" placeholder="BRL_VALUE">
                <button class="btn" onclick="buy()">GENERATE_PIX_RECHARGE</button>
                <div id="pix-res" style="margin-top:15px; text-align:center"></div>
            </div>

            <!-- MONITOR: MASTER COMMAND (SÓ ADMIN VÊ) -->
            <div id="adm-monitor" class="monitor admin-only" ondblclick="full(this)">
                <h3 style="color:#ff0000">☢️ MASTER_CONTROL_UNIT</h3>
                <p style="font-size:0.8em">IMMUNITY STATUS: ACTIVE</p>
                <button class="btn" onclick="listNodes()">LIST_ALL_NODES</button>
                <button class="btn" onclick="alert('Injetando Blues...')">INJECT_BLUES_GLOBAL</button>
                <button class="btn btn-danger" onclick="alert('Sistema de Banimento...')">BAN_NODE_ID</button>
            </div>
        </div>
    </div>

    <script>
        let stream;
        const ref = new URLSearchParams(window.location.search).get('ref');

        function full(el) { el.classList.toggle('fullscreen'); }
        
        function log(msg) {
            const t = document.getElementById('terminal');
            t.innerHTML += '<br>> ' + msg;
            t.scrollTop = t.scrollHeight;
        }

        async function auth(type) {
            const u = document.getElementById('u').value, p = document.getElementById('p').value;
            const res = await fetch('/'+type, {
                method:'POST', headers:{'Content-Type':'application/json'},
                body: JSON.stringify({u, p, ref})
            });
            const d = await res.json();
            if(res.ok) {
                document.getElementById('auth-scr').style.display = 'none';
                document.getElementById('app').style.display = 'block';
                document.getElementById('usr-header').innerText = "> NODE: " + d.user.toUpperCase() + " | ROLE: " + d.role.toUpperCase();
                document.getElementById('balance-display').innerText = "BLUES: " + d.blues.toFixed(2);
                
                if(d.role === 'master') {
                    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
                    log("MASTER_IMMUNITY_CONFIRMED.");
                }
                log("SESSION_ESTABLISHED.");
            } else { alert(d.error); }
        }

        async function start() {
            stream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
            document.getElementById('vLocal').srcObject = stream;
            document.getElementById('on').style.display='none'; document.getElementById('off').style.display='block';
            log("BROADCASTING_ENCRYPTED_FEED...");
        }

        function stop() {
            stream.getTracks().forEach(t => t.stop());
            document.getElementById('vLocal').srcObject = null;
            document.getElementById('on').style.display='block'; document.getElementById('off').style.display='none';
            log("FEED_TERMINATED.");
        }

        async function buy() {
            log("GENERATING_PIX_PAYLOAD...");
            const res = await fetch('/pix', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({valor: document.getElementById('val').value}) });
            const d = await res.json();
            if(d.encodedImage) {
                document.getElementById('pix-res').innerHTML = '<img src="data:image/png;base64,'+d.encodedImage+'" width="160">';
                log("UPLINK_SUCCESSFUL: PIX_READY.");
            }
        }

        function listNodes() {
            log("SCANNING_NETWORK...");
            fetch('/admin/nodes').then(r => r.json()).then(nodes => {
                log("TOTAL_NODES_FOUND: " + nodes.length);
            });
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(html));

// --- COMANDOS DE ACESSO ---
app.post('/register', (req, res) => {
    const { u, p, ref } = req.body;
    try {
        const hash = bcrypt.hashSync(p, 10);
        db.prepare("INSERT INTO users (username, password, pai_id) VALUES (?, ?, ?)").run(u, hash, ref || null);
        res.json({ user: u, blues: 0, role: 'filho' });
    } catch (e) { res.status(400).json({error: "NODE_ALREADY_ACTIVE"}); }
});

app.post('/login', (req, res) => {
    const { u, p } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(u);
    if (user && bcrypt.compareSync(p, user.password)) {
        res.json({ id: user.id, user: user.username, blues: user.blues, role: user.role });
    } else { res.status(401).json({error: "INVALID_CREDENTIALS"}); }
});

// --- COMANDOS MASTER (ADMIN) ---
app.get('/admin/nodes', (req, res) => {
    const users = db.prepare("SELECT id, username, blues, role FROM users").all();
    res.json(users);
});

// --- COMANDO FINANCEIRO (PIX) ---
app.post('/pix', async (req, res) => {
    try {
        const cli = await axios.post(`${ASAAS_URL}/customers`, { name: "Ice User" }, { headers: { access_token: ASAAS_KEY } });
        const pay = await axios.post(`${ASAAS_URL}/payments`, {
            billingType: "PIX", value: req.body.valor, customer: cli.data.id,
            dueDate: new Date().toISOString().split('T')
        }, { headers: { access_token: ASAAS_KEY } });
        const qr = await axios.get(`${ASAAS_URL}/payments/${pay.data.id}/pixQrCode`, { headers: { access_token: ASAAS_KEY } });
        res.json(qr.data);
    } catch (e) { res.status(500).json({error: "GATEWAY_ERROR"}); }
});

app.listen(process.env.PORT || 3000, () => console.log("TERMINAL ICE READY"));
