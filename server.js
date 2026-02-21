const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

// CONFIGURAÇÃO - Certifique-se de que o nome na Vercel é ASAAS_KEY
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
        body { background: #0f172a; color: white; font-family: sans-serif; text-align: center; padding: 20px; margin: 0; }
        .card { background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; border: 1px solid #00d4ff; max-width: 400px; margin: 20px auto; backdrop-filter: blur(10px); }
        input { width: 90%; padding: 12px; margin: 10px 0; border-radius: 8px; border: none; outline: none; }
        button { width: 95%; padding: 15px; border-radius: 8px; border: none; background: #00d4ff; color: #0f172a; font-weight: bold; cursor: pointer; margin-top: 10px; }
        video { width: 100%; border-radius: 10px; margin-top: 15px; background: #000; display: none; border: 1px solid #00d4ff; }
        #pix-area { background: white; color: black; padding: 15px; border-radius: 10px; margin-top: 15px; display: none; }
        #pix-area img { width: 200px; height: 200px; }
        .status-live { color: #22c55e; font-weight: bold; margin-top: 10px; display: none; }
    </style>
</head>
<body>
    <div class="card">
        <div id="login-area">
            <h2 style="color:#00d4ff">ICE LOGIN</h2>
            <input type="text" id="u" placeholder="Usuário">
            <input type="password" id="p" placeholder="Senha">
            <button onclick="entrar()">ENTRAR NA LIVE</button>
        </div>

        <div id="app" style="display:none">
            <h2 style="color:#00d4ff">AO VIVO</h2>
            <video id="v" autoplay playsinline muted></video>
            <div id="st" class="status-live">● TRANSMITINDO</div>
            <hr style="margin: 20px 0; border: 0; border-top: 1px solid rgba(255,255,255,0.1)">
            <h3>APOIAR COM PIX</h3>
            <input type="number" id="val" value="10" placeholder="Valor R$">
            <button style="background:#22c55e; color:white" onclick="gerar()">GERAR QR CODE PIX</button>
            
            <div id="pix-area">
                <p>Escaneie para pagar:</p>
                <div id="qr"></div>
                <p id="pay" style="font-size:10px; word-break:break-all; margin-top:10px; background:#eee; padding:5px; border-radius:5px"></p>
                <button onclick="document.getElementById('pix-area').style.display='none'" style="background:#666; color:white; width:auto; padding:8px 20px">FECHAR</button>
            </div>
        </div>
    </div>

    <script>
        function entrar() {
            if(document.getElementById('u').value === "admin" && document.getElementById('p').value === "123") {
                document.getElementById('login-area').style.display = 'none';
                document.getElementById('app').style.display = 'block';
                navigator.mediaDevices.getUserMedia({video:true, audio:true}).then(s => {
                    let v = document.getElementById('v'); 
                    v.srcObject = s; 
                    v.style.display = 'block';
                    document.getElementById('st').style.display = 'block';
                }).catch(err => alert("Ligue a câmera: " + err));
            } else { alert("Usuário ou senha incorretos!"); }
        }

        async function gerar() {
            const btn = event.target;
            btn.innerText = "GERANDO...";
            btn.disabled = true;

            try {
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
                } else { 
                    alert("Erro: " + (data.error || "Verifique sua chave Asaas na Vercel.")); 
                }
            } catch (e) {
                alert("Erro de conexão com o servidor.");
            } finally {
                btn.innerText = "GERAR QR CODE PIX";
                btn.disabled = false;
            }
        }
    </script>
</body>
</html>
`;

// ROTA DO PIX (ASAAS API V3)
app.post('/gerar-pix', async (req, res) => {
    try {
        const { valor } = req.body;
        
        // 1. Criar a cobrança
        const payment = await axios.post(`${ASAAS_URL}/payments`, {
            billingType: "PIX",
            value: valor,
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            description: "Apoio Live ICE"
        }, { 
            headers: { 'access_token': ASAAS_KEY || '' } 
        });

        // 2. Pegar o QR Code do Pix
        const pixData = await axios.get(`${ASAAS_URL}/payments/${payment.data.id}/pixQrCode`, {
            headers: { 'access_token': ASAAS_KEY || '' }
        });

        res.json(pixData.data);
    } catch (e) { 
        console.error(e.response ? e.response.data : e.message);
        res.status(500).json({ error: "Falha na API do Asaas. Verifique o Token." }); 
    }
});

app.get('/', (req, res) => res.send(html));

module.exports = app;
