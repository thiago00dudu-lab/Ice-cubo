const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());

// ROTA PRINCIPAL COM O DESIGN "ICE CUBO"
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ice-Cubo Live</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com">
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: 'Segoe UI', sans-serif;
                background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                overflow: hidden;
            }

            /* Efeito Cubo de Gelo (Glassmorphism) */
            .ice-container {
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 20px;
                box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
                width: 90%;
                max-width: 400px;
                padding: 20px;
                text-align: center;
                color: #2c3e50;
            }

            .live-preview {
                width: 100%;
                height: 250px;
                background: rgba(0, 0, 0, 0.1);
                border-radius: 15px;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid rgba(255, 255, 255, 0.5);
                overflow: hidden;
            }

            video { width: 100%; height: 100%; object-fit: cover; }

            .controls {
                display: flex;
                justify-content: space-around;
                margin-top: 20px;
            }

            .btn {
                background: rgba(255, 255, 255, 0.4);
                border: none;
                padding: 12px 20px;
                border-radius: 10px;
                cursor: pointer;
                transition: 0.3s;
                color: #0077b6;
                font-weight: bold;
            }

            .btn:hover { background: rgba(255, 255, 255, 0.6); transform: scale(1.05); }
            .btn.liked { color: #e63946; }

            .ice-title { font-size: 24px; margin-bottom: 10px; color: #0077b6; text-shadow: 1px 1px 2px white; }
        </style>
    </head>
    <body>
        <div class="ice-container">
            <h1 class="ice-title"><i class="fas fa-cube"></i> Ice-Cubo</h1>
            
            <div class="live-preview">
                <video id="video" autoplay playsinline muted></video>
            </div>

            <div class="controls">
                <button class="btn" id="btnLike" onclick="curtir()">
                    <i class="fas fa-heart"></i> <span id="likeCount">0</span>
                </button>
                
                <button class="btn" onclick="compartilhar()">
                    <i class="fas fa-share-nodes"></i> Compartilhar
                </button>
            </div>
        </div>

        <script>
            // Lógica da Câmera
            async function startCamera() {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    document.getElementById('video').srcObject = stream;
                } catch (err) {
                    console.error("Erro ao acessar câmera: ", err);
                }
            }

            // Botão Curtir
            let likes = 0;
            function curtir() {
                likes++;
                document.getElementById('likeCount').innerText = likes;
                document.getElementById('btnLike').classList.toggle('liked');
            }

            // Botão Compartilhar Funcional
            function compartilhar() {
                if (navigator.share) {
                    navigator.share({
                        title: 'Ice-Cubo Live',
                        text: 'Vem ver minha live no cubo de gelo!',
                        url: window.location.href
                    }).catch(console.error);
                } else {
                    alert("Link copiado: " + window.location.href);
                }
            }

            startCamera();
        </script>
    </body>
    </html>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor rodando na porta ' + PORT));
