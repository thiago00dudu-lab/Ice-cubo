require("dotenv").config(); // Carrega as variáveis escondidas
const express = require("express");
const axios = require("axios");
const Database = require("better-sqlite3");

const app = express();
const db = new Database("ice_cubo.db");

// Puxando a chave escondida
const ASAAS_KEY = process.env.ASAAS_KEY;
const ASAAS_URL = "https://api.asaas.com";

app.use(express.json());

// --- LÓGICA DE PAGAMENTO E DIVISÃO ---

app.post("/api/presentear", (req, res) => {
    const { doadorId, criadorId, valorBlue } = req.body;

    // 1. Verifica saldo do doador
    const doador = db.prepare("SELECT blue FROM users WHERE id = ?").get(doadorId);
    if (doador.blue < valorBlue) return res.status(400).json({ error: "Saldo insuficiente" });

    // 2. Busca quem indicou o criador
    const criador = db.prepare("SELECT * FROM users WHERE id = ?").get(criadorId);

    // 3. CÁLCULO DA DIVISÃO (85% / 10% / 5%)
    const paraCriador = valorBlue * 0.85;
    const paraSite = valorBlue * 0.10;
    const paraIndicador = valorBlue * 0.05;

    // EXECUÇÃO NO BANCO DE DADOS
    // Tira do doador
    db.prepare("UPDATE users SET blue = blue - ? WHERE id = ?").run(valorBlue, doadorId);
    
    // Dá 85% para o Criador
    db.prepare("UPDATE users SET blue = blue + ? WHERE id = ?").run(paraCriador, criadorId);
    
    // Dá 10% para o Site (Você/Admin)
    db.prepare("UPDATE users SET blue = blue + ? WHERE role = 'master'").run(paraSite);

    // Dá 5% para quem indicou
    if (criador.referred_by) {
        db.prepare("UPDATE users SET blue = blue + ? WHERE id = ?").run(paraIndicador, criador.referred_by);
    } else {
        // Se não houver indicador, os 5% vão para o site também
        db.prepare("UPDATE users SET blue = blue + ? WHERE role = 'master'").run(paraIndicador);
    }

    res.json({ status: "Sucesso", msg: "BLUEs divididos conforme a regra!" });
});

app.listen(3000, () => console.log("🚀 Servidor Protegido e Rodando"));
