const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// CONFIGURAÇÃO DO ASAAS
const ASAAS_API_KEY = 'SUA_CHAVE_AQUI'; // <--- COLOQUE SUA CHAVE AQUI
const BASE_URL = 'https://sandbox.asaas.com';

// 1. ESSA PARTE É O VISUAL (INTERFACE CUBO DE GELO)
const htmlPagina = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <style>
        body { margin: 0; height: 100vh; display: flex; justify-content: center; align-items: center; background: linear-gradient(45deg, #001f3f, #0074D9); font-family: sans-serif; }
        .ice-cube { width: 320px; padding: 40px; background: rgba(255, 255, 255, 0.1); border-radius: 20px; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3); text-align: center; color: white; }
        input { width: 100%; padding: 10px; margin: 10px 0; background: rgba(255, 255, 255, 0.2); border: none; border-radius: 5px; color: white; box-sizing: border-box; }
        button { width: 100%; padding: 10px; cursor: pointer; background: #00d4ff; border: none; border-radius: 5px; color: #001f3f; font-weight: bold; }
    </style>
</head>
<body>
    <div class="ice-cube">
        <h2>Entrar no Cubo</h2>
        <input type="email" id="email" placeholder="Seu e-mail">
        <input type="password" placeholder="Sua senha">
        <button onclick="pagar()">Pagar e Entrar</button>
    </div>
    <script>
        async function pagar() {
            const email = document.getElementById('email').value;
            if(!email) return alert('Digite seu e-mail');
            const res = await fetch('/pagar', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if(data.url) window.location.href = data.url;
            else alert('Erro ao gerar pagamento');
        }
    </script>
</body>
</html>
`;

// 2. ESSA PARTE É A AUTOMAÇÃO DO ASAAS
app.get('/', (req, res) => res.send(htmlPagina));

app.post('/pagar', async (req, res) => {
    try {
        // Cria o pagamento (usando um ID de cliente fixo para teste)
        const response = await axios.post(`${BASE_URL}/payments`, {
            customer: "cus_000006042120", // <--- Você precisa de um ID de cliente real do seu Asaas
            billingType: "PIX",
            value: 10.00,
            dueDate: "2025-12-31"
        }, { headers: { 'access_token': ASAAS_API_KEY } });

        res.json({ url: response.data.invoiceUrl });
    } catch (e) {
        res.status(500).json({ erro: 'Erro no Asaas' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('Rodando!'));
