require("dotenv").config();
const express = require("express");
const Database = require("better-sqlite3");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const db = new Database("ice_cubo.db");
const PORT = process.env.PORT || 3000;

// Puxa a chave do Asaas das configurações do Render
const ASAAS_KEY = process.env.ASAAS_KEY; 
const ASAAS_URL = "https://api.asaas.com";

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// --- CRIAÇÃO DAS TABELAS (MEMÓRIA DO APP) ---
db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    blue REAL DEFAULT 0,
    role TEXT DEFAULT 'user',
    referred_by INTEGER
);
`);

// --- ROTA DE DIVISÃO (85% CRIADOR / 10% SITE / 5% INDICADOR) ---
app.post("/api/enviar-presente", (req, res) => {
    const { doadorId, criadorId, valorBlue } = req.body;

    const doador = db.prepare("SELECT blue FROM users WHERE id = ?").get(doadorId);
    if (!doador || doador.blue < valorBlue) return res.status(400).json({ error: "Saldo insuficiente" });

    const criador = db.prepare("SELECT * FROM users WHERE id = ?").get(criadorId);

    // Cálculos
    const paraCriador = valorBlue * 0.85;
    const paraSite = valorBlue * 0.10;
    const paraIndicador = valorBlue * 0.05;

    // 1. Tira do doador
    db.prepare("UPDATE users SET blue = blue - ? WHERE id = ?").run(valorBlue, doadorId);
    
    // 2. Dá 85% para o Criador
    db.prepare("UPDATE users SET blue = blue + ? WHERE id = ?").run(paraCriador, criadorId);
    
    // 3. Dá 10% para o Site (Master)
    db.prepare("UPDATE users SET blue = blue + ? WHERE role = 'master'").run(paraSite);

    // 4. Dá 5% para o Indicador (ou site se não tiver)
    if (criador && criador.referred_by) {
        db.prepare("UPDATE users SET blue = blue + ? WHERE id = ?").run(paraIndicador, criador.referred_by);
    } else {
        db.prepare("UPDATE users SET blue = blue + ? WHERE role = 'master'").run(paraIndicador);
    }

    res.json({ success: true, message: "Valor dividido com sucesso!" });
});

// Entrega a página visual (index.html)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => console.log(`🚀 Servidor Ice-Cubo Online!`));
