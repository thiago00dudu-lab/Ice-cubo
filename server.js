require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Database = require("better-sqlite3");
const axios = require("axios");

const app = express();
const db = new Database("db.db");

// 🔐 Configurações via Variáveis de Ambiente (.env)
const JWT_SECRET = process.env.JWT_SECRET;
const ASAAS_KEY = process.env.ASAAS_KEY;
const IS_PROD = process.env.NODE_ENV === "production";

if (!JWT_SECRET || !ASAAS_KEY) {
    console.error("❌ ERRO: Configure JWT_SECRET e ASAAS_KEY no arquivo .env");
    process.exit(1);
}

const ASAAS_URL = IS_PROD ? "https://api.asaas.com" : "https://sandbox.asaas.com";

app.use(express.json());

// 🗄️ Estrutura do Banco de Dados
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user', -- 'user', 'super_mod', 'master'
    blue INTEGER DEFAULT 0,
    asaas_id TEXT,
    pai_id INTEGER, -- Referência ao ID do indicador (Afiliados)
    is_blocked INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS lives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    price INTEGER DEFAULT 0,
    is_adult INTEGER DEFAULT 0, -- 0 = Normal, 1 = Pimenta (Adulta)
    creator_id INTEGER,
    active INTEGER DEFAULT 1
  );
`);

// 🛡️ Middlewares de Segurança
function auth(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ error: "Token não fornecido" });

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = db.prepare("SELECT * FROM users WHERE id=?").get(decoded.id);

        if (!user || user.is_blocked) return res.status(403).json({ error: "Usuário bloqueado ou inexistente" });

        req.user = user;
        next();
    } catch {
        res.status(401).json({ error: "Token inválido" });
    }
}

// Middleware para verificar se é Master ou Super Mod
function isStaff(req, res, next) {
    if (req.user.role === 'master' || req.user.role === 'super_mod') return next();
    res.status(403).json({ error: "Acesso restrito à moderação" });
}

// 👤 Registro com Sistema de Afiliados (Pai/Filho)
app.post("/api/register", async (req, res) => {
    try {
        const { username, password, convite_id } = req.body;
        const hash = await bcrypt.hash(password, 10);

        // Criar cliente no Asaas
        const customer = await axios.post(`${ASAAS_URL}/customers`, 
            { name: username }, 
            { headers: { access_token: ASAAS_KEY } }
        );

        db.prepare(
            "INSERT INTO users (username, password, asaas_id, pai_id) VALUES (?, ?, ?, ?)"
        ).run(username, hash, customer.data.id, convite_id || null);

        res.json({ ok: true });
    } catch (err) {
        res.status(400).json({ error: "Erro ao registrar usuário" });
    }
});

// 🔑 Login
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username=?").get(username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ 
        token, 
        role: user.role, 
        blue: user.blue,
        id: user.id 
    });
});

// 💰 Webhook Asaas: Divisão 85% / 10% / 5%
app.post("/api/webhook/asaas", (req, res) => {
    const { event, payment } = req.body;

    if (event === "PAYMENT_RECEIVED") {
        const valorTotal = payment.value;
        const asaasId = payment.customer;

        const user = db.prepare("SELECT id, pai_id FROM users WHERE asaas_id=?").get(asaasId);

        if (user) {
            const bluesUsuario = Math.floor(valorTotal * 0.85);
            const bluesPai = Math.floor(valorTotal * 0.05);

            // Adiciona 85% ao usuário
            db.prepare("UPDATE users SET blue = blue + ? WHERE id = ?").run(bluesUsuario, user.id);

            // Adiciona 5% ao "Pai" se existir
            if (user.pai_id) {
                db.prepare("UPDATE users SET blue = blue + ? WHERE id = ?").run(bluesPai, user.pai_id);
            }
        }
    }
    res.sendStatus(200);
});

// 🎥 Gerenciar Lives (Criar com opção Adulta/Pimenta)
app.post("/api/lives/start", auth, (req, res) => {
    const { title, price, is_adult } = req.body;
    db.prepare(
        "INSERT INTO lives (title, price, is_adult, creator_id) VALUES (?, ?, ?, ?)"
    ).run(title || "Live", price || 0, is_adult ? 1 : 0, req.user.id);

    res.json({ ok: true });
});

// 💸 Saque (Mínimo R$ 20)
app.post("/api/withdraw", auth, async (req, res) => {
    const { amount, pixKey } = req.body;

    if (amount < 20) return res.status(400).json({ error: "Valor mínimo para saque é R$ 20" });
    if (req.user.blue < amount) return res.status(400).json({ error: "Saldo de Blues insuficiente" });

    // Lógica: Remove os Blues e iniciaria a transferência via API Asaas
    db.prepare("UPDATE users SET blue = blue - ? WHERE id = ?").run(amount, req.user.id);
    
    // Aqui entraria o axios.post para o Asaas realizar o PIX
    res.json({ ok: true, message: "Saque em processamento" });
});

// 👑 Painel ADM: Controle Total
app.post("/api/admin/promote", auth, isStaff, (req, res) => {
    if (req.user.role !== 'master') return res.status(403).json({ error: "Apenas o Master pode promover" });
    
    const { userId, newRole } = req.body; // newRole: 'super_mod' ou 'user'
    db.prepare("UPDATE users SET role = ? WHERE id = ?").run(newRole, userId);
    res.json({ ok: true });
});

app.post("/api/admin/block", auth, isStaff, (req, res) => {
    const { userId } = req.body;
    db.prepare("UPDATE users SET is_blocked = 1 WHERE id = ?").run(userId);
    res.json({ ok: true });
});

// 🚀 Garante que o ID 1 seja Master automaticamente
db.prepare("UPDATE users SET role='master' WHERE id=1").run();

app.listen(3000, () => console.log("🚀 Servidor rodando na porta 3000"));
