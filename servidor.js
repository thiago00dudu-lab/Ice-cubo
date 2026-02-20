require("dotenv").config();
const express = require("express");
const Database = require("better-sqlite3");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const db = new Database("ice_cubo.db");
const PORT = process.env.PORT || 3000;

// Configurações (Vão estar escondidas no Render)
const ASAAS_KEY = process.env.ASAAS_KEY; 
const ASAAS_URL = "https://api.asaas.com";

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// --- CRIAÇÃO DO BANCO DE DADOS ---
db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    blue REAL DEFAULT 0,
    asaas_customer_id TEXT,
    referred_by INTEGER, -- ID de quem indicou
    role TEXT DEFAULT 'user'
);
`);

// --- ROTA: DIVISÃO 85% / 10% / 5% ---
app.post("/api/enviar-presente", (req, res) => {
    const { doadorId, criadorId, valorBlue } = req.body;

    const doador = db.prepare("SELECT blue FROM users WHERE id = ?").get(doadorId);
    if (!doador || doador.blue < valorBlue) return res.status(400).json({ error: "Saldo insuficiente" });

    const criador = db.prepare("SELECT * FROM users WHERE id = ?").get(criadorId);

    // Cálculos da sua regra
    const paraCriador = valorBlue * 0.85;
    const paraSite = valorBlue * 0.10;
    const paraIndicador = valorBlue * 0.05;

    // 1. Tira do doador
    db.prepare("UPDATE users SET blue = blue - ? WHERE id = ?").run(valorBlue, doadorId);
    
    // 2. Dá 85% para o Criador
    db.prepare("UPDATE users SET blue = blue + ? WHERE id = ?").run(paraCriador, criadorId);
    
    // 3. Dá 10% para o Site (Master)
    db.prepare("UPDATE users SET blue = blue + ? WHERE role = 'master'").run(paraSite);

    // 4. Dá 5% para o Indicador (ou para o site se não houver indicador)
    if (criador && criador.referred_by) {
        db.prepare("UPDATE users SET blue = blue + ? WHERE id = ?").run(paraIndicador, criador.referred_by);
    } else {
        db.prepare("UPDATE users SET blue = blue + ? WHERE role = 'master'").run(paraIndicador);
    }

    res.json({ success: true, message: "Valor dividido com sucesso!" });
});

// Entrega a página visual
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => console.log(`🚀 Servidor Ice-Cubo Online na porta ${PORT}`));
