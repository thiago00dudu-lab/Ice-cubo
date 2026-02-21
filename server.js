const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

// CONFIGURAÇÃO ASAAS (Cadastre a ASAAS_KEY na Vercel!)
const ASAAS_KEY = process.env.ASAAS_KEY;
const ASAAS_URL = "https://api.asaas.com"; // Use 'https://sandbox.asaas.com' para testes

// HTML COM LOGIN, CÂMERA E PIX
const html = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ICE LIVE & PAY</title>
    <style>
        body { background: #0f172a; color: white; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
        .card { background: rgba(255,255,255,0.05); padding: 25px; border-radius: 20px; border: 1px solid #00d4ff; text-align: center; width: 100%; max-width: 400px; backdrop-filter: blur(10px); }
        h2 { color: #00d4ff; }
        input { width: 100%; padding: 12px; margin: 10px 0; border-radius: 10px; border: none; box-sizing: border-box; }
        button { width: 100%; padding: 15px; border-radius: 10px; border: none; background: #00d4ff; color: #0f172a; font-weight: bold; cursor: pointer; margin-top: 10px; }
        video { width: 100%; border-radius: 15px; margin-top: 20px; background: #000; border: 2px solid #00d4ff; display:none; }
        #pix-area { margin-top: 20px; padding: 15px; background: white; border-radius: 10px; color: black; display: none; }
        #pix-area img { width: 200px; height: 200px; }
    </style>
</head>
<body>
    <div class="card" id="main-card">
        <div id="login-area">
            <h2>ICE LOGIN</h2>
            <input type="text" id="user" placeholder="Usuário">
            <input type="password" id="pass" placeholder="Senha">
            <button onclick="entrar()">ENTRAR NA LIVE</button>
        </div>

        <div id="live-area" style="display:none">
            <h2>AO VIVO</h2>
            <video id="video" autoplay playsinline muted></video>
            
            <div style="margin-top: 20px;">
                <h3>APOIAR COM PIX</h3>
                <input type="number" id="valor" placeholder="Valor R$" value="10">
                <button style="background: #22c55e; color: white;" onclick="gerarPix()">GERAR PIX AGORA</button>
            </div>

            <div id="pix-area">
                <p>Escaneie para pagar:</p>
                <div id="qrcode"></div>
                <p style="font-size: 10px; word-break: break-all;" id="payload"></p>
                <button onclick="document.getElementById('pix-area').style.display='none'" style="background:#666; color:white">FECHAR</button>
            </div>
        </div>
    </div>

    <script>
        function entrar() {
            if(document.getElementById('user').value === "admin" && document.getElementById('pass').value === "123") {
                document.getElementById('login-area').style.display = 'none';
                document.getElementById('live-area').style.display = 'block';
                iniciarCamera();
            } else { alert("Erro!"); }
        }

        async function iniciarCamera() {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            document.getElementById('video').srcObject = stream;
            document.getElementById('video').style.display = 'block';
        }

        async function gerarPix() {
            const valor = document.getElementById('valor').value;
            const res = await fetch('/gerar-pix', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ valor })
            });
            const data = await res.json();
            if(data.encodedImage) {
                document.getElementById('pix-area').style.display = 'block';
                document.getElementById('qrcode').innerHTML = '<img src="data:image/png;base64,' + data.encodedImage + '">';
                document.getElementById('payload').innerText = data.payload;
            } else { alert("Erro ao gerar Pix. Verifique sua Chave Asaas."); }
        }
    </script>
</body>
</html>
`;

// ROTA PARA GERAR O PIX NO ASAAS
app.post('/gerar-pix', async (req, res) => {
    try {
        const { valor } = req.body;
        
        // 1. Criar a cobrança
        const payment = await axios.post(`${ASAAS_URL}/payments`, {
            billingType: "PIX",
            value: valor,
            dueDate: new Date().toISOString().split('T')[0],
            description: "Apoio Live ICE"
        }, { headers: { 'access_token': ASAAS_KEY } });

        // 2. Pegar o QR Code do Pix
        const pixData = await axios.get(`${ASAAS_URL}/payments/${payment.data.id}/pixQrCode`, {
            headers: { 'access_token': ASAAS_KEY }
        });

        res.json(pixData.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => res.send(html));
module.exports = app;
