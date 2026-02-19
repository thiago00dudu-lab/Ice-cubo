require('dotenv').config(); // Carrega as variáveis de ambiente
const express = require("express"), 
      Database = require("better-sqlite3"), 
      axios = require("axios"),
      app = express(), 
      db = new Database("db.db"), 
      PORT = process.env.PORT || 3000;

// 🔒 CHAVE SEGURA: O código busca a chave escondida no sistema
const ASAAS_API_KEY = process.env.ASAAS_API_KEY; 
const ASAAS_URL = 'https://www.asaas.com';

app.use(express.json()); 
app.use(express.static("public")); // Abre os arquivos da pasta 'public'

// 🗄️ Estrutura do Banco de Dados
db.exec(`
CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    username TEXT, 
    blue REAL DEFAULT 0, 
    asaas_id TEXT, 
    referred_by INTEGER
);
`);

// 📊 Rota para o site buscar o saldo do usuário (ex: id 1)
app.get("/api/user/:id", (req, res) => {
    const user = db.prepare("SELECT username, blue FROM users WHERE id = ?").get(req.params.id);
    if (user) res.json(user);
    else res.status(404).json({ error: "Usuário não encontrado" });
});

// 💰 Webhook: Recebe avisos de pagamento do Asaas
app.post("/api/webhook", (req, res) => {
    const { event, payment } = req.body;
    if (event === "PAYMENT_RECEIVED") {
        const u = db.prepare("SELECT id, referred_by FROM users WHERE asaas_id=?").get(payment.customer);
        if (u) {
            // 85% para o Usuário
            const parteUsuario = payment.value * 0.85;
            db.prepare("UPDATE users SET blue = blue + ? WHERE id = ?").run(parteUsuario, u.id);
            
            // 5% para o Indicador (se houver)
            if (u.referred_by) {
                const parteIndicador = payment.value * 0.05;
                db.prepare("UPDATE users SET blue = blue + ? WHERE id = ?").run(parteIndicador, u.referred_by);
            }
            // Os 10% do App ficam automaticamente no seu saldo real do Asaas
        }
    }
    res.sendStatus(200);
});

// 💸 Saque Automático (PIX sem humanos)
app.post("/api/saque", async (req, res) => {
    const { userId, valor, pixKey } = req.body;
    const user = db.prepare("SELECT blue FROM users WHERE id = ?").get(userId);

    if (!user || user.blue < valor) {
        return res.status(400).json({ error: "Saldo insuficiente no App" });
    }

    try {
        // Envia o PIX direto pela API do Asaas
        const response = await axios.post(`${ASAAS_URL}/transfers`, {
            value: valor,
            pixAddressKey: pixKey,
            pixAddressKeyType: 'EVP' // Ajuste conforme o tipo de chave (CPF, EMAIL, etc)
        }, { 
            headers: { 'access_token': ASAAS_API_KEY } 
        });

        if (response.data) {
            // Se o PIX foi enviado, desconta do saldo virtual do usuário
            db.prepare("UPDATE users SET blue = blue - ? WHERE id = ?").run(valor, userId);
            res.json({ success: true, message: "PIX enviado com sucesso!" });
        }
    } catch (error) {
        console.error("Erro no PIX:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Falha ao processar transferência automática" });
    }
});

app.listen(PORT, () => console.log(`🚀 Sistema Online na porta ${PORT}`));
