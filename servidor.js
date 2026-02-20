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

// --- BANCO DE DADOS (ESTRUTURA SIMPLIFICADA E SEGURA) ---
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'filho',
    blues REAL DEFAULT 0
  );
`);

// Cria o Admin se não existir
const hashMaster = bcrypt.hashSync("ice123", 10);
db.prepare("INSERT OR IGNORE INTO users (username, password, role) VALUES ('admin', ?, 'master')").run(hashMaster);

// --- FRONT-END CORRIGIDO ---
const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ICE PLATFORM</title>
    <style>
        body { background: #0f172a; color: white; font-family: sans-serif; padding: 10px; margin: 0; }
        .card { background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 20px; margin-bottom: 15px; border: 1px solid rgba(255, 255, 255, 0.1); }
        .blue-coin { color: #FFD700; font-weight: bold; border: 1px solid #FFD700; padding: 2px 8px; border-radius: 10px; }
        .btn { width: 100%; padding: 14px; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; margin: 5px 0; transition: 0.3s; }
        .btn-live { background: #d00000; color: white; }
        .btn-stop { background: #475569; color: white; display: none; }
        video { width: 100%; height: 250px; border-radius: 15px; background: #000; object-fit: cover; border: 2px solid #00d4ff; }
        input { width: 100%; padding: 12px; margin: 8px 0; border-radius: 10px; background: #1e293b; color: white; border: 1px solid #00d4ff; box-sizing: border-box; }
    </style>
</head>
<body>
    <div id="login-box" style="padding: 20px;">
        <h2 align="center" style="color:#00d4ff">ICE LOGIN</h2>
        <div class="card">
            <input type="text" id="u" placeholder="Usuário">
            <input type="password" id="p" placeholder="Senha">
            <button class="btn" style="background:#0077b6; color:white" onclick="logar()">ENTRAR</button>
        </div>
    </div>

    <div id="app" style="display:none; padding: 10px;">
        <div id="perfil" class="card"></div>
        
        <div class="card" align="center">
            <h3>🎥 LIVE AO VIVO</h3>
            <video id="vLocal" autoplay playsinline muted></video>
            <button class="btn btn-live" id="btnStart" onclick="startLive()">INICIAR LIVE</button>
            <button class="btn btn-stop" id="btnStop" onclick="stopLive()">DESLIGAR LIVE</button>
        </div>

        <div class="card">
            <h3>💰 DEPÓSITO PIX</h3>
            <input type="number" id="val" placeholder="Valor em R$">
            <button class="btn" style="background:#22c55e; color:white" onclick="buyPix()">GERAR QR CODE</button>
            <div id="pix-res" style="margin-top:10px; text-align:center;"></div>
        </div>
    </div>

    <script>
        let stream = null;

        async function logar() {
            const u = document.getElementById('u').value;
            const p = document.getElementById('p').value;
            const res = await fetch('/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({u, p})
            });
            
            if(res.ok) {
                const data = await res.json();
                document.getElementById('login-box').style.display = 'none';
                document.getElementById('app').style.display = 'block';
                document.getElementById('perfil').innerHTML = "<b>" + data.user.toUpperCase() + "</b> | <span class='blue-coin'>" + data.blues.toFixed(2) + " BLUES</span>";
            } else { 
                alert("Usuário ou Senha incorretos!"); 
            }
        }

        async function startLive() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                document.getElementById('vLocal').srcObject = stream;
                document.getElementById('btnStart').style.display = 'none';
                document.getElementById('btnStop').style.display = 'block';
            } catch (err) { alert("Permita o acesso à câmera!"); }
        }

        function stopLive() {
            if(stream) {
                stream.getTracks().forEach(track => track.stop());
                document.getElementById('vLocal').srcObject = null;
                document.getElementById('btnStart').style.display = 'block';
                document.getElementById('btnStop').style.display = 'none';
            }
        }

        async function buyPix() {
            const v = document.getElementById('val').value;
            if(!v) return alert("Digite o valor!");
            document.getElementById('pix-res').innerHTML = "Gerando PIX...";
            
            const res = await fetch('/pix', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({valor: v})
            });
            const data = await res.json();
            if(data.encodedImage) {
                document.getElementById('pix-res').innerHTML = \`
                    <img src="data:image/png;base64,\${data.encodedImage}" width="180">
                    <p><small style="word-break:break-all"><b>Copia e Cola:</b><br>\${data.payload}</small></p>
                \`;
            } else { alert("Erro ao gerar PIX. Verifique a chave Asaas."); }
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(html));

// --- ROTA DE LOGIN CORRIGIDA ---
app.post('/login', (req, res) => {
    const { u, p } = req.body;
    try {
        const user = db.prepare("SELECT * FROM users WHERE username = ?").get(u);
        if (user && bcrypt.compareSync(p, user.password)) {
            // Retorna apenas o que é necessário, garantindo que usuários comuns entrem
            res.json({ user: user.username, role: user.role, blues: user.blues || 0 });
        } else { 
            res.status(401).json({ error: "Credenciais inválidas" }); 
        }
    } catch (e) {
        res.status(500).json({ error: "Erro no servidor" });
    }
});

// --- ROTA PIX CORRIGIDA ---
app.post('/pix', async (req, res) => {
    try {
        // Passo 1: Criar um cliente no Asaas (obrigatório para gerar cobrança)
        const cliente = await axios.post(`${ASAAS_URL}/customers`, { name: "Cliente ICE" }, { headers: { access_token: ASAAS_KEY } });
        
        // Passo 2: Gerar a cobrança PIX
        const pay = await axios.post(`${ASAAS_URL}/payments`, {
            billingType: "PIX", 
            value: req.body.valor,
            dueDate: new Date().toISOString().split('T')[0],
            customer: cliente.data.id
        }, { headers: { access_token: ASAAS_KEY } });
        
        // Passo 3: Pegar o QR Code
        const qr = await axios.get(`${ASAAS_URL}/payments/${pay.data.id}/pixQrCode`, {
            headers: { access_token: ASAAS_KEY }
        });
        res.json(qr.data);
    } catch (e) { 
        console.error(e.response ? e.response.data : e.message);
        res.status(500).json({error: "Falha na API Asaas"}); 
    }
});

app.listen(process.env.PORT || 3000, () => console.log("ICE ONLINE"));
