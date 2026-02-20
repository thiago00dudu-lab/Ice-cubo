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
    pai_id INTEGER
  );
`);

// Criar Admin inicial
const hashAdmin = bcrypt.hashSync("ice123", 10);
db.prepare("INSERT OR IGNORE INTO users (username, password, role) VALUES ('admin', ?, 'master')").run(hashAdmin);

// --- FRONT-END AZUL BEBÊ (ESTILO CUBO DE GELO) ---
const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ICE PLATFORM</title>
    <style>
        body { 
            background: #e0f2fe; color: #1e293b; font-family: 'Segoe UI', sans-serif; 
            margin: 0; padding: 15px; 
        }
        /* Estilo Cubo de Gelo Azul Bebê */
        .card { 
            background: rgba(255, 255, 255, 0.7); 
            backdrop-filter: blur(10px);
            border: 2px solid #bae6fd; border-radius: 20px;
            padding: 20px; margin-bottom: 20px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
            transition: 0.3s; cursor: pointer;
        }
        .fullscreen { 
            position: fixed !important; top: 0; left: 0; width: 100vw; height: 100vh; 
            z-index: 999; background: #e0f2fe; padding: 40px; box-sizing: border-box; 
        }
        .btn { 
            width: 100%; padding: 15px; border: none; border-radius: 12px; 
            background: #0ea5e9; color: white; font-weight: bold; cursor: pointer; margin-top: 10px;
        }
        .btn-adm { background: #6366f1; }
        .btn-live { background: #f43f5e; }
        input { 
            width: 100%; padding: 12px; margin: 10px 0; border-radius: 10px; 
            border: 1px solid #bae6fd; background: white; box-sizing: border-box;
        }
        video { width: 100%; border-radius: 15px; background: #000; border: 3px solid #7dd3fc; }
        .info { font-weight: bold; color: #0369a1; margin-bottom: 10px; }
        #nodes-list { font-size: 0.8em; background: white; padding: 10px; border-radius: 10px; margin-top: 10px; display:none; }
    </style>
</head>
<body>

    <div id="login-box" style="max-width:400px; margin: 50px auto; text-align:center;">
        <h1 style="color: #0369a1;">ICE LOGIN</h1>
        <div class="card">
            <input type="text" id="u" placeholder="Nome de Usuário">
            <input type="password" id="p" placeholder="Sua Senha">
            <button class="btn" onclick="auth('login')">ENTRAR</button>
            <button class="btn" style="background:#cbd5e1; color:#475569" onclick="auth('register')">CRIAR NOVA CONTA</button>
        </div>
    </div>

    <div id="app" style="display:none">
        <div class="info" id="perfil-txt">Carregando...</div>
        
        <div class="grid">
            <!-- MONITOR 1: LIVE -->
            <div class="card" ondblclick="full(this)">
                <h3>🎥 MINHA LIVE</h3>
                <video id="vLocal" autoplay playsinline muted></video>
                <button class="btn btn-live" id="btnOn" onclick="start()">INICIAR CÂMERA</button>
                <button class="btn" id="btnOff" style="display:none; background:#64748b" onclick="stop()">DESLIGAR</button>
                <p style="font-size:0.7em; color:#64748b">Clique duas vezes para ampliar</p>
            </div>

            <!-- MONITOR 2: COMPRAR BLUES -->
            <div class="card" ondblclick="full(this)">
                <h3>💰 COMPRAR BLUES (PIX)</h3>
                <input type="number" id="val" placeholder="Valor em R$">
                <button class="btn" style="background:#10b981" onclick="gerarPix()">GERAR QR CODE PIX</button>
                <div id="pix-res" style="margin-top:15px; text-align:center"></div>
            </div>

            <!-- MONITOR 3: PAINEL MASTER (SÓ PARA ADMIN) -->
            <div id="adm-card" class="card" style="display:none; border-color:#6366f1">
                <h3 style="color:#4f46e5">⚙️ PAINEL DO MASTER</h3>
                <button class="btn btn-adm" onclick="listarNodes()">LISTAR TODOS OS USUÁRIOS</button>
                <div id="nodes-list"></div>
            </div>
        </div>
    </div>

    <script>
        let stream;
        const refPai = new URLSearchParams(window.location.search).get('ref');

        function full(el) { el.classList.toggle('fullscreen'); }

        async function auth(tipo) {
            const u = document.getElementById('u').value;
            const p = document.getElementById('p').value;
            const res = await fetch('/'+tipo, {
                method:'POST', headers:{'Content-Type':'application/json'},
                body: JSON.stringify({u, p, ref: refPai})
            });
            const d = await res.json();
            if(res.ok) {
                document.getElementById('login-box').style.display = 'none';
                document.getElementById('app').style.display = 'block';
                document.getElementById('perfil-txt').innerText = "USUÁRIO: " + d.user.toUpperCase() + " | SALDO: " + d.blues.toFixed(2) + " BLUES";
                
                if(d.role === 'master') {
                    document.getElementById('adm-card').style.display = 'block';
                }
            } else { alert(d.error); }
        }

        async function start() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
                document.getElementById('vLocal').srcObject = stream;
                document.getElementById('btnOn').style.display='none'; 
                document.getElementById('btnOff').style.display='block';
            } catch(e) { alert("Erro ao ligar câmera!"); }
        }

        function stop() {
            if(stream) stream.getTracks().forEach(t => t.stop());
            document.getElementById('vLocal').srcObject = null;
            document.getElementById('btnOn').style.display='block'; 
            document.getElementById('btnOff').style.display='none';
        }

        async function gerarPix() {
            const v = document.getElementById('val').value;
            if(!v) return alert("Digite um valor!");
            document.getElementById('pix-res').innerText = "Gerando cobrança...";
            
            const res = await fetch('/pix', {
                method:'POST', headers:{'Content-Type':'application/json'},
                body: JSON.stringify({valor: v})
            });
            const d = await res.json();
            if(d.encodedImage) {
                document.getElementById('pix-res').innerHTML = '<b>Escaneie o QR Code:</b><br><img src="data:image/png;base64,'+d.encodedImage+'" width="180"><br><small style="word-break:break-all">Copia e Cola: <br>'+d.payload+'</small>';
            } else { alert("Erro na API do Asaas!"); }
        }

        async function listarNodes() {
            const res = await fetch('/admin/nodes');
            const nodes = await res.json();
            const div = document.getElementById('nodes-list');
            div.style.display = 'block';
            div.innerHTML = "<b>USUÁRIOS CADASTRADOS:</b><br>" + nodes.map(n => n.username + " (" + n.role + ") - " + n.blues.toFixed(2) + " Blues").join("<br>");
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(html));

app.post('/register', (req, res) => {
    const { u, p, ref } = req.body;
    try {
        const hash = bcrypt.hashSync(p, 10);
        db.prepare("INSERT INTO users (username, password, pai_id) VALUES (?, ?, ?)").run(u, hash, ref || null);
        res.json({ user: u, blues: 0, role: 'filho' });
    } catch (e) { res.status(400).json({error: "Este usuário já existe!"}); }
});

app.post('/login', (req, res) => {
    const { u, p } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(u);
    if (user && bcrypt.compareSync(p, user.password)) {
        res.json({ id: user.id, user: user.username, blues: user.blues, role: user.role });
    } else { res.status(401).json({error: "Usuário ou senha incorretos!"}); }
});

// --- ROTA DE ADMIN PARA LISTAR USUÁRIOS ---
app.get('/admin/nodes', (req, res) => {
    const users = db.prepare("SELECT username, blues, role FROM users").all();
    res.json(users);
});

// --- ROTA DO PIX CORRIGIDA (CRIA CLIENTE NOVO CADA VEZ) ---
app.post('/pix', async (req, res) => {
    try {
        // 1. Cria um cliente temporário no Asaas
        const cli = await axios.post(`${ASAAS_URL}/customers`, { name: "Cliente Ice" }, { headers: { access_token: ASAAS_KEY } });
        
        // 2. Cria a cobrança PIX
        const pay = await axios.post(`${ASAAS_URL}/payments`, {
            billingType: "PIX", 
            value: req.body.valor, 
            customer: cli.data.id,
            dueDate: new Date().toISOString().split('T')[0]
        }, { headers: { access_token: ASAAS_KEY } });
        
        // 3. Pega o QR Code e o Copia e Cola
        const qr = await axios.get(`${ASAAS_URL}/payments/${pay.data.id}/pixQrCode`, { headers: { access_token: ASAAS_KEY } });
        res.json(qr.data);
    } catch (e) { 
        console.error(e.response ? e.response.data : e.message);
        res.status(500).json({error: "Erro ao gerar PIX"}); 
    }
});

app.listen(process.env.PORT || 3000, () => console.log("ICE ONLINE NO AZUL BEBÊ"));

app.listen(process.env.PORT || 3000, () => console.log("TERMINAL ICE READY"));
