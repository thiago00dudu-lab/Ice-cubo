const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// CONFIGURAÇÃO SEGURA (Lê do Render)
const ASAAS_KEY = process.env.ASAAS_KEY; 
const BASE_URL = 'https://www.asaas.com'; // URL REAL

const htmlPagina = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <style>
        body { margin: 0; height: 100vh; background: linear-gradient(135deg, #001f3f, #0074D9); font-family: sans-serif; display: flex; justify-content: center; align-items: center; }
        .glass { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 20px; padding: 40px; text-align: center; color: white; width: 320px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
        input { width: 100%; padding: 12px; margin: 10px 0; background: rgba(255,255,255,0.2); border: none; border-radius: 8px; color: white; box-sizing: border-box; }
        button { width: 100%; padding: 12px; cursor: pointer; background: #00d4ff; border: none; border-radius: 8px; color: #001f3f; font-weight: bold; }
    </style>
</head>
<body>
    <div class="glass">
        <h1 style="color: #00d4ff;">ICE CLUB</h1>
        <input type="text" id="nome" placeholder="Nome Completo">
        <input type="email" id="email" placeholder="E-mail">
        <button onclick="entrar()">Pagar e Entrar</button>
    </div>
    <script>
        async function entrar() {
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const res = await fetch('/gerar-pix', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ nome, email })
            });
            const data = await res.json();
            if(data.url) window.location.href = data.url;
            else alert('Erro ao gerar acesso!');
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(htmlPagina));

app.post('/gerar-pix', async (req, res) => {
    const { nome, email } = req.body;
    try {
        // Cria cliente e gera Pix automático
        const cli = await axios.post(`${BASE_URL}/customers`, { name: nome, email: email }, { headers: { 'access_token': ASAAS_KEY } });
        const pag = await axios.post(`${BASE_URL}/payments`, {
            customer: cli.data.id,
            billingType: "PIX",
            value: 10.00, // Valor do acesso
            dueDate: new Date().toISOString().split('T')[0]
        }, { headers: { 'access_token': ASAAS_KEY } });

        res.json({ url: pag.data.invoiceUrl });
    } catch (e) {
        res.status(500).json({ erro: 'Falha' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('Ice Club Ativo!'));
try {
        // 1. CRIA O CLIENTE NO ASAAS
        const cliente = await axios.post(`${BASE_URL}/customers`, 
            { name: nome, email: email }, 
            { headers: { 'access_token': ASAAS_KEY } }
        );

        // 2. GERA O PAGAMENTO PIX
        const pagamento = await axios.post(`${BASE_URL}/payments`, {
            customer: cliente.data.id,
            billingType: "PIX",
            value: 15.00, // Valor do acesso
            dueDate: new Date().toISOString().split('T')[0]
        }, { headers: { 'access_token': ASAAS_KEY } });

        res.json({ url: pagamento.data.invoiceUrl });
    } catch (e) {
        console.error(e.response ? e.response.data : e.message);
        res.status(500).json({ erro: 'Falha na integração' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('Ice Club Rodando!'));
