const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cubo de Gelo 🧊</title>
        <style>
            body { background: #e0f7fa; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: sans-serif; }
            .ice-card { background: rgba(255, 255, 255, 0.3); backdrop-filter: blur(15px); padding: 40px; border-radius: 20px; border: 1px solid #fff; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.1); width: 300px; }
            h2 { color: #007c91; margin-bottom: 20px; }
            button { background: #00acc1; color: #fff; border: none; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: bold; width: 100%; transition: 0.3s; margin-top: 10px; }
            button:active { transform: scale(0.95); }
            #status { margin-top: 20px; color: #005662; font-size: 14px; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="ice-card">
            <h2>Cubo de Gelo 🧊</h2>
            <button onclick="ativarMidia()">LOGIN E ATIVAR VENDAS</button>
            <div id="status">Aguardando ativação...</div>
        </div>
        <script>
            async function ativarMidia() {
                const statusDiv = document.getElementById('status');
                statusDiv.innerHTML = "Solicitando permissões...";
                try {
                    // Solicita Câmera e Áudio para evitar travamentos
                    await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    statusDiv.innerHTML = "✅ CONECTADO!<br>Câmera e Áudio Ativos.";
                    statusDiv.style.color = "#00a152";
                    alert("Acesso liberado! Bem-vindo à interface de vendas.");
                } catch (e) {
                    statusDiv.innerHTML = "❌ ERRO: Permissão negada.";
                    statusDiv.style.color = "#d32f2f";
                    alert("Por favor, autorize o uso da câmera e áudio nas configurações do seu navegador.");
                }
            }
        </script>
    </body>
    </html>`);
});

app.listen(port, () => console.log('Servidor Online na porta ' + port));
