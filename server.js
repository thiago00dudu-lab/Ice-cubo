const express = require('express');
const app = express();

app.use(express.json());

// --- ÁREA DA API (MODO DE ESPERA / NULO) ---
app.post('/gerar-pix', async (req, res) => {
    try {
        console.log("Solicitação de PIX recebida, mas API está em modo de espera.");
        
        // Simulação de resposta da API Asaas (NULO)
        // Quando quiser ativar, você substituirá isso pela chamada real do axios
        const fakePixResponse = {
            status: "AGUARDANDO_PAGAMENTO",
            encodedImage: "iVBORw0KGgoAAAANSUhEUgAA...", // Exemplo de QR Code em branco
            payload: "://pix.exemplo.com",
            message: "Sistema em manutenção (Chave de API não configurada)."
        };

        // Retornamos 200 (Sucesso) para o frontend não dar erro 500
        res.status(200).json(fakePixResponse);
        
    } catch (error) {
        res.status(500).json({ error: "Erro interno no Ice-Cubo" });
    }
});

// --- INTERFACE ICE CUBO (HTML/CSS/JS) ---
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
                margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif;
                background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
                display: flex; justify-content: center; align-items: center; min-height: 100vh;
            }
            /* Efeito Cubo de Gelo (Glassmorphism) */
            .ice-box {
                background: rgba(255, 255, 255, 0.3);
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                border: 2px solid rgba(255, 255, 255, 0.5);
                border-radius: 30px;
                padding: 25px; width: 85%; max-width: 380px;
                box-shadow: 0 10px 40px rgba(0, 119, 182, 0.1);
                text-align: center; color: #0369a1;
            }
            .video-stream {
                width: 100%; height: 250px; background: #000;
                border-radius: 20px; margin: 15px 0; overflow: hidden;
                border: 4px solid rgba(255, 255, 255, 0.7);
            }
            video { width: 100%; height: 100%; object-fit: cover; }
            .btn-container { display: flex; gap: 10px; margin-top: 20px; }
            .action-btn {
                background: rgba(255, 255, 255, 0.6); border: none;
                padding: 15px; border-radius: 15px; cursor: pointer;
                flex: 1; transition: 0.3s; color: #0369a1; font-weight: bold;
                font-size: 14px;
            }
            .action-btn:hover { background: rgba(255, 255, 255, 0.9); transform: translateY(-2px); }
            .action-btn i { font-size: 18px; display: block; margin-bottom: 5px; }
            .liked { color: #ef4444 !important; background: white !important; }
        </style>
    </head>
    <body>
        <div class="ice-box">
            <h2 style="margin:0; font-weight: 800;"><i class="fas fa-snowflake"></i> ICE-CUBO</h2>
            <p style="font-size: 12px; opacity: 0.8;">AO VIVO</p>
            
            <div class="video-stream">
                <video id="liveCam" autoplay playsinline></video>
            </div>

            <div class="btn-container">
                <button class="action-btn" id="likeBtn" onclick="toggleLike()">
                    <i class="fas fa-heart"></i> <span id="likeText">0</span>
                </button>
                <button class="action-btn" onclick="shareLive()">
                    <i class="fas fa-paper-plane"></i> Compartilhar
                </button>
                <button class="action-btn" onclick="alert('PIX em manutenção!')">
                    <i class="fas fa-qrcode"></i> Apoiar
                </button>
            </div>
        </div>

        <script>
            // Ativar Câmera
            navigator.mediaDevices.getUserMedia({video: true})
                .then(s => document.getElementById('liveCam').srcObject = s);

            // Curtir funcional
            let count = 0;
            function toggleLike() {
                count++;
                document.getElementById('likeText').innerText = count;
                document.getElementById('likeBtn').classList.toggle('liked');
            }

            // Compartilhar funcional
            function shareLive() {
                if(navigator.share) {
                    navigator.share({ title: 'Minha Live no Ice-Cubo', url: location.href });
                } else {
                    alert("Link copiado para a área de transferência!");
                }
            }
        </script>
    </body>
    </html>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor Ice-Cubo rodando!'));
