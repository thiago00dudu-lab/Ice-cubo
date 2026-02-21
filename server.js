const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

// CONFIGURAÇÃO - Certifique-se de que a ASAAS_KEY está na Vercel!
const ASAAS_KEY = process.env.ASAAS_KEY;
const ASAAS_URL = "https://api.asaas.com";

// TELA DO SITE (LOGIN, CÂMERA E PIX)
const html = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ICE LIVE</title>
    <style>
        body { background: #0f172a; color: white; font-family: sans-serif; text-align: center; padding: 20px; }
        .card { background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; border: 1px solid #00d4ff; max-width: 400px; margin: auto; }
        input { width: 90%; padding: 12px; margin: 10px 0; border-radius: 8px; border: none; }
        button { width: 95%; padding: 15px; border-radius: 8px; border: none; background: #00d4ff; font-weight: bold; cursor: pointer; margin-top: 10px; }
        video { width: 100%; border-radius: 10px; margin-top: 15px; background: #000; display: none; }
        #pix-area { background: white; color: black; padding: 15px; border-radius: 10px; margin-top: 15px; display: none; }
        #pix-area img { width: 200px; }
    </style>
</head>
<body>
    <div class="card">
        <div id="login-area">
            <h2>ICE LOGIN</h2>
            <input type="text" id="u" placeholder="Usuário">
            <input type="password" id="p" placeholder="Senha">
            <button onclick="entrar()">ENTRAR</button>
        </div>

        <div id="app" style="display:none">
            <h2>AO VIVO</h2>
            <video id="v" autoplay playsinline muted></video>
            <hr>
            <h3>APOIAR COM PIX</h3>
            <input type="number" id="val" value="10">
            <button style="background:#22c55e; color:white" onclick="gerar()">GERAR PIX</button>
            <div id="pix-area">
                <div id="qr"></div>
                <p id="pay" style="font-size:10px; word-break:break-all"></p>
            </div>
        </div>
    </div>

    <script>
        function entrar() {
            if(document.getElementById('u').value === "admin" && document.getElementById('p').value === "123") {
                document.getElementById('login-area').style.display = 'none';
                document.getElementById('app').style.display = 'block';
                navigator.mediaDevices.getUserMedia({video:true}).then(s => {
                    let v = document.getElementById('v'); v.srcObject = s; v.style.display = 'block';
                });
            } else { alert("Erro!"); }
        }

        async function gerar() {
            const res = await fetch('/gerar-pix', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ valor: document.getElementById('val').value })
            });
            const data = await res.json();
            if(data.encodedImage) {
                document.getElementById('pix-area').style.display = 'block';
                document.getElementById('qr').innerHTML = '<img src="data:image/png;base64,' + data.encodedImage + '">';
                document.getElementById('pay').innerText = data.payload;
            } else { alert("Erro no Pix. Verifique sua chave Asaas."); }
        }
    </script>
</body>
</html>
`;

// ROTA DO PIX
app.post('/gerar-pix', async (req, res) => {
    try {
        const { valor } = req.body;
        const payment = await axios.post(`${ASAAS_URL}/payments`, {
            billingType: "PIX",
            value: valor,
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            description: "Apoio Live"
        }, { headers: { 'access_token': ASAAS_KEY } });

        const pixData = await axios.get(`${ASAAS_URL}/payments/${payment.data.id}/pixQrCode`, {
            headers: { 'access_token': ASAAS_KEY }
        });
        res.json(pixData.data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/', (req, res) => res.send(html));
module.exports = app;
