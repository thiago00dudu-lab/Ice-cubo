const express = require("express");
const axios = require("axios");
const bcrypt = require("bcryptjs"); // Use bcryptjs para evitar erros na Vercel
const app = express();

// Configurações básicas
app.use(express.json());

// Removi o SQLite pois a Vercel não permite salvar arquivos .db no plano Hobby
// Se precisar salvar dados, use uma integração de banco de dados (ex: MongoDB ou Supabase)

const ASAAS_KEY = process.env.ASAAS_KEY;

// FRONT-END (HTML)
const html = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ICE PLATFORM</title>
    <style>
        body { background: #0f172a; color: white; font-family: sans-serif; text-align: center; padding: 50px; }
        .card { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px; border: 1px solid #00d4ff; }
        h1 { color: #00d4ff; }
    </style>
</head>
<body>
    <div class="card">
        <h1>ICE PLATFORM ONLINE</h1>
        <p>O servidor está rodando corretamente na Vercel!</p>
        <p>Status: <span style="color: #22c55e;">● Ativo</span></p>
    </div>
</body>
</html>
`;

app.get('/', (req, res) => {
    res.send(html);
});

// IMPORTANTE: Exportar o app para a Vercel reconhecer como uma função
module.exports = app;

// Inicia o servidor localmente (não afeta a Vercel)
if (process.env.NODE_ENV !== 'production') {
    const PORT = 3000;
    app.listen(PORT, () => console.log(`Rodando em http://localhost:${PORT}`));
}
