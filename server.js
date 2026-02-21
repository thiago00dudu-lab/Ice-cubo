require("dotenv").config();
const express = require("express"), bcrypt = require("bcrypt"), jwt = require("jsonwebtoken"), 
      Database = require("better-sqlite3"), axios = require("axios"), app = express();
const db = new Database("db.db"), JWT_SECRET = process.env.JWT_SECRET || "ICE_SECRET";
const ASAAS_KEY = process.env.ASAAS_KEY, PORT = process.env.PORT || 3000;

app.use(express.json());

// 🗄️ BANCO DE DADOS (Estrutura Completa)
db.exec(`
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, role TEXT DEFAULT 'user', blue REAL DEFAULT 0, asaas_id TEXT, pai_id INTEGER, is_blocked INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS lives(id INTEGER PRIMARY KEY, title TEXT, price REAL, adult INTEGER, creator_id INTEGER, active INTEGER DEFAULT 1);
`);

// 🧊 INTERFACE "CUBO DE GELO" (Frontend Unificado)
const UI = `
<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
    body{background:#e0f7fa;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;font-family:sans-serif}
    .ice-card{background:rgba(255,255,255,0.4);backdrop-filter:blur(15px);padding:30px;border-radius:20px;border:1px solid #fff;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.1);width:90%;max-width:400px}
    button{background:#00acc1;color:#fff;border:none;padding:12px;border-radius:10px;cursor:pointer;width:100%;font-weight:bold;margin-top:10px}
    .video-box{width:100%;border-radius:10px;margin-top:15px;display:none;background:#000}
    .badge{font-size:20px;display:block}
</style></head>
<body>
    <div class="ice-card" id="app">
        <h2 style="color:#007c91">Cubo de Gelo 🧊</h2>
        <div id="login-area">
            <input id="user" placeholder="Usuário" style="width:90%;padding:10px;margin-bottom:10px">
            <button onclick="login()">ENTRAR NO SITE</button>
        </div>
        <div id="main-area" style="display:none">
            <span id="rank" class="badge"></span>
            <p>Saldo: <span id="saldo">0</span> Blues</p>
            <button onclick="abrirLive()">ABRIR LIVE (CÂMERA/ÁUDIO)</button>
            <video id="vid" class="video-box" autoplay playsinline muted></video>
        </div>
    </div>
    <script>
        let token = '';
        async function login(){
            // Simulação de Login (Para não travar no Render)
            document.getElementById('login-area').style.display='none';
            document.getElementById('main-area').style.display='block';
            document.getElementById('rank').innerHTML = "⭐ (Master)";
        }
        async function abrirLive(){
            try {
                const s = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
                const v = document.getElementById('vid');
                v.srcObject = s; v.style.display='block';
                alert("Live Iniciada! 🌶️ (Modo Adulto Ativado)");
            } catch(e) { alert("Permita Câmera/Áudio!"); }
        }
    </script>
</body></html>`;

// 🚀 ROTAS BACKEND
app.get('/', (req, res) => res.send(UI));

// Lógica de Divisão (85% Criador / 10% App / 5% Pai)
app.post("/api/webhook/asaas", (req, res) => {
    if (req.body.event === "PAYMENT_RECEIVED") {
        const valor = req.body.payment.value;
        const asaasId = req.body.payment.customer;
        
        const user = db.prepare("SELECT * FROM users WHERE asaas_id=?").get(asaasId);
        if(user){
            db.prepare("UPDATE users SET blue=blue+? WHERE id=?").run(valor * 0.85, user.id); // Filho recebe 85%
            if(user.pai_id) db.prepare("UPDATE users SET blue=blue+? WHERE id=?").run(valor * 0.05, user.pai_id); // Pai recebe 5%
        }
    }
    res.sendStatus(200);
});

// Master Automático (Login 1)
db.prepare("UPDATE users SET role='master' WHERE id=1").run();

app.listen(PORT, '0.0.0.0', () => console.log('🚀 Sistema Ice-Cube Online'));
