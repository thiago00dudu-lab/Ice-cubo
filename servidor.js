require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Database = require("better-sqlite3");
const axios = require("axios");

const app = express();
const db = new Database("ice.db");

const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_padrao";
const ASAAS_KEY = process.env.ASAAS_KEY;
const ASAAS_URL = "https://api.asaas.com"; // Forçando produção conforme sua chave

app.use(express.json());

// 🗄️ Banco de Dados com Hierarquia e Afiliados
db.exec(`
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'user', -- user, mod, master
  blue REAL DEFAULT 0,
  asaas_id TEXT,
  pai_id INTEGER,
  is_blocked INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lives(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  price REAL DEFAULT 0,
  is_adult INTEGER DEFAULT 0,
  creator_id INTEGER,
  active INTEGER DEFAULT 0
);
`);

// 🛡️ Middleware de Autenticação
function auth(req, res, next) {
    const token = req.headers.authorization;
    if (!token) return res.sendStatus(401);
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = db.prepare("SELECT * FROM users WHERE id=?").get(decoded.id);
        if (!req.user || req.user.is_blocked) return res.sendStatus(403);
        next();
    } catch { res.sendStatus(401); }
}

// 👤 Registro com Sistema de "Pai" (Afiliado)
app.post("/api/register", async (req, res) => {
    try {
        const { username, password, ref } = req.body;
        const hash = bcrypt.hashSync(password, 10);
        
        // Cria cliente no Asaas
        const customer = await axios.post(`${ASAAS_URL}/customers`, { name: username }, { headers: { access_token: ASAAS_KEY } });
        
        const result = db.prepare("INSERT INTO users(username, password, asaas_id, pai_id) VALUES(?,?,?,?)")
                         .run(username, hash, customer.data.id, ref || null);
        
        res.json({ ok: true, id: result.lastInsertRowid });
    } catch (err) { res.status(400).json({ error: "Erro no registro ou usuário já existe" }); }
});

// 🔑 Login
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username=?").get(username);
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({error: "Senha incorreta"});

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, blue: user.blue } });
});

// 💰 PRIORIDADE: COMPRAR BLUE (PIX)
app.post("/api/buy", auth, async (req, res) => {
    try {
        const { amount } = req.body; // 1 real = 1 blue
        
        // 1. Gera a Cobrança
        const payment = await axios.post(`${ASAAS_URL}/payments`, {
            customer: req.user.asaas_id,
            billingType: "PIX",
            value: amount,
            dueDate: new Date().toISOString().split("T")[0],
            externalReference: req.user.id.toString()
        }, { headers: { access_token: ASAAS_KEY } });

        // 2. BUSCA O QR CODE (O que faltava para o cliente pagar)
        const qrCode = await axios.get(`${ASAAS_URL}/payments/${payment.data.id}/pixQrCode`, { 
            headers: { access_token: ASAAS_KEY } 
        });

        res.json({ 
            invoiceUrl: payment.data.invoiceUrl, 
            payload: qrCode.data.payload, 
            qrCode: qrCode.data.encodedImage 
        });
    } catch (err) {
        res.status(500).json({ error: "Erro ao gerar PIX. Verifique sua chave Asaas." });
    }
});

// 🔔 Webhook: Automação 85% / 10% / 5%
app.post("/api/webhook/asaas", (req, res) => {
    const { event, payment } = req.body;
    if (event === "PAYMENT_RECEIVED") {
        const userId = parseInt(payment.externalReference);
        const valorTotal = payment.value;

        const shareUser = valorTotal * 0.85;
        const sharePai = valorTotal * 0.05;

        // Credita 85% para o usuário
        db.prepare("UPDATE users SET blue = blue + ? WHERE id = ?").run(shareUser, userId);

        // Credita 5% para o Pai
        const user = db.prepare("SELECT pai_id FROM users WHERE id = ?").get(userId);
        if (user && user.pai_id) {
            db.prepare("UPDATE users SET blue = blue + ? WHERE id = ?").run(sharePai, user.pai_id);
        }
    }
    res.sendStatus(200);
});

// 🎥 Sistema de Live com Câmera e Preço
app.post("/api/lives/manage", auth, (req, res) => {
    const { title, price, is_adult, active } = req.body;
    const exists = db.prepare("SELECT * FROM lives WHERE creator_id = ?").get(req.user.id);
    
    if (exists) {
        db.prepare("UPDATE lives SET title=?, price=?, is_adult=?, active=? WHERE creator_id=?")
          .run(title, price, is_adult, active, req.user.id);
    } else {
        db.prepare("INSERT INTO lives(title, price, is_adult, creator_id, active) VALUES(?,?,?,?,?)")
          .run(title, price, is_adult, req.user.id, active);
    }
    res.json({ ok: true });
});

// 📺 HTML Front-end Integrado (Azul Bebê / Cubo de Gelo)
app.get("/", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ICE PLATFORM</title>
    <style>
        body { background: #e0f2fe; font-family: 'Segoe UI', sans-serif; margin: 0; color: #1e293b; }
        .glass { background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(10px); border-radius: 20px; border: 1px solid #bae6fd; padding: 20px; margin: 15px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
        .master-star { color: #fbbf24; font-size: 20px; text-shadow: 0 0 5px #fbbf24; }
        .mod-star { color: #3b82f6; font-size: 20px; }
        .pimenta { color: #ef4444; margin-left: 5px; }
        .btn { background: #0ea5e9; color: white; border: none; padding: 12px; border-radius: 10px; cursor: pointer; width: 100%; font-weight: bold; margin-top: 10px; }
        video { width: 100%; border-radius: 15px; background: #000; height: 300px; }
        input { width: 100%; padding: 10px; margin-top: 5px; border-radius: 8px; border: 1px solid #7dd3fc; box-sizing: border-box; }
        #pix-area img { width: 200px; margin-top: 10px; }
    </style>
</head>
<body>
    <div id="auth" class="glass">
        <h2>🧊 ICE LOGIN</h2>
        <input id="user" placeholder="Usuário">
        <input id="pass" type="password" placeholder="Senha">
        <button class="btn" onclick="login()">ENTRAR</button>
        <button class="btn" style="background:#94a3b8" onclick="register()">CADASTRAR</button>
    </div>

    <div id="app" style="display:none">
        <div class="glass">
            <div id="perfil-header"></div>
            <p>Saldo: <b id="saldo-txt">0</b> BLUES</p>
        </div>

        <div class="glass" id="cam-area">
            <h3>🎥 MINHA LIVE</h3>
            <video id="preview" autoplay playsinline muted></video>
            <input id="live-titulo" placeholder="Título da Live">
            <input id="live-preco" type="number" placeholder="Preço (Blues)">
            <label><input type="checkbox" id="live-adulto"> Conteúdo Pimenta (18+)</label>
            <button class="btn" onclick="toggleLive(1)">INICIAR LIVE</button>
            <button class="btn" style="background:#ef4444" onclick="toggleLive(0)">DESLIGAR</button>
        </div>

        <div class="glass">
            <h3>💰 RECARREGAR BLUES</h3>
            <input id="buy-amount" type="number" placeholder="Valor em Reais (R$)">
            <button class="btn" style="background:#10b981" onclick="buyBlues()">GERAR PIX AGORA</button>
            <div id="pix-area" style="text-align:center"></div>
        </div>
    </div>

    <script>
        let TOKEN = "";
        let MY_ID = null;

        async function login() {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username: document.getElementById('user').value, password: document.getElementById('pass').value})
            });
            const data = await res.json();
            if(res.ok) {
                TOKEN = data.token; MY_ID = data.user.id;
                document.getElementById('auth').style.display = 'none';
                document.getElementById('app').style.display = 'block';
                renderPerfil(data.user);
            } else { alert("Falha no login"); }
        }

        function renderPerfil(user) {
            let estrela = "";
            if(user.role === 'master') estrela = "<span class='master-star'>⭐ MASTER</span>";
            if(user.role === 'mod') estrela = "<span class='mod-star'>⭐ MODERADOR</span>";
            document.getElementById('perfil-header').innerHTML = estrela + "<h3>" + user.username.toUpperCase() + "</h3>";
            document.getElementById('saldo-txt').innerText = user.blue.toFixed(2);
        }

        async function buyBlues() {
            const amount = document.getElementById('buy-amount').value;
            const res = await fetch('/api/buy', {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'Authorization': TOKEN},
                body: JSON.stringify({amount})
            });
            const data = await res.json();
            if(data.qrCode) {
                document.getElementById('pix-area').innerHTML = \`
                    <p><b>Escaneie para pagar:</b></p>
                    <img src="data:image/png;base64,\${data.qrCode}">
                    <p><small style="word-break:break-all"><b>Copia e Cola:</b><br>\${data.payload}</small></p>
                \`;
            } else { alert("Erro ao gerar PIX"); }
        }

        async function toggleLive(status) {
            const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
            document.getElementById('preview').srcObject = status ? stream : null;
            
            await fetch('/api/lives/manage', {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'Authorization': TOKEN},
                body: JSON.stringify({
                    title: document.getElementById('live-titulo').value,
                    price: document.getElementById('live-preco').value,
                    is_adult: document.getElementById('live-adulto').checked ? 1 : 0,
                    active: status
                })
            });
            if(!status) stream.getTracks().forEach(t => t.stop());
        }
    </script>
</body>
</html>
    `);
});

// 🚀 Start e Master Automático
db.prepare("UPDATE users SET role='master' WHERE id=1").run();
app.listen(process.env.PORT || 3000, () => console.log("ICE ONLINE"));
