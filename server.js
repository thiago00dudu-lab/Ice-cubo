const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Ice-Cubo Profile</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com">
        <style>
            body {
                margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(180deg, #e0f2fe 0%, #bae6fd 100%);
                height: 100vh; display: flex; flex-direction: column; overflow: hidden;
            }

            /* Container de Telas (Scroll Horizontal Tipo iPhone) */
            .screen-slider {
                display: flex; overflow-x: auto; scroll-snap-type: x mandatory;
                width: 100%; height: 75vh; scrollbar-width: none;
            }
            .screen-slider::-webkit-scrollbar { display: none; }

            .screen {
                min-width: 100%; height: 100%; scroll-snap-align: start;
                display: flex; align-items: center; justify-content: center; position: relative;
            }

            /* Design Cubo de Gelo */
            .ice-card {
                background: rgba(255, 255, 255, 0.25); backdrop-filter: blur(20px);
                border: 2px solid rgba(255, 255, 255, 0.4); border-radius: 40px;
                width: 85%; height: 90%; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            }

            /* Live Principal (Meio) */
            .live-video {
                width: 100%; height: 100%; border-radius: 38px; overflow: hidden; background: #000;
            }
            video { width: 100%; height: 100%; object-fit: cover; }

            /* Telas Laterais (Fotos/Passado) */
            .photo-grid {
                display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding: 20px; height: 100%;
            }
            .photo-box {
                background: rgba(255,255,255,0.3); border-radius: 20px; border: 1px solid white;
                display: flex; align-items: center; justify-content: center; color: #0369a1; font-size: 24px;
            }

            /* Info do Criador e Interação (Fixo embaixo) */
            .footer-info {
                padding: 20px; text-align: center; background: rgba(255,255,255,0.4);
                backdrop-filter: blur(10px); border-radius: 30px 30px 0 0;
            }
            .creator-name { font-weight: 800; font-size: 20px; color: #1e3a8a; margin: 0; }
            
            .interaction-bar {
                display: flex; justify-content: center; gap: 20px; margin-top: 15px;
            }
            .btn-action {
                background: white; border: none; padding: 12px 25px; border-radius: 20px;
                color: #0369a1; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            .btn-action.like.active { color: #ef4444; }

            /* Indicador de Telas (Pontinhos) */
            .pagination {
                display: flex; justify-content: center; gap: 8px; margin-bottom: 10px;
            }
            .dot { width: 8px; height: 8px; background: rgba(255,255,255,0.5); border-radius: 50%; }
            .dot.active { background: #1e3a8a; width: 20px; border-radius: 4px; }
        </style>
    </head>
    <body>

        <!-- Slidder de Telas -->
        <div class="screen-slider" id="slider">
            <!-- Tela 1: Passado (4 Fotos) -->
            <div class="screen">
                <div class="ice-card">
                    <div class="photo-grid">
                        <div class="photo-box"><i class="fas fa-history"></i></div>
                        <div class="photo-box"><i class="fas fa-image"></i></div>
                        <div class="photo-box"><i class="fas fa-play-circle"></i></div>
                        <div class="photo-box"><i class="fas fa-camera"></i></div>
                    </div>
                </div>
            </div>

            <!-- Tela 2: LIVE (Centro) -->
            <div class="screen">
                <div class="ice-card">
                    <div class="live-video">
                        <video id="webcam" autoplay playsinline muted></video>
                    </div>
                </div>
            </div>

            <!-- Tela 3: Perfil/Mais Fotos -->
            <div class="screen">
                <div class="ice-card">
                    <div class="photo-grid">
                        <div class="photo-box"><i class="fas fa-plus"></i></div>
                        <div class="photo-box"><i class="fas fa-plus"></i></div>
                        <div class="photo-box"><i class="fas fa-plus"></i></div>
                        <div class="photo-box"><i class="fas fa-plus"></i></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Rodapé de Controle -->
        <div class="footer-info">
            <div class="pagination">
                <div class="dot"></div>
                <div class="dot active"></div>
                <div class="dot"></div>
            </div>
            
            <h3 class="creator-name">@Thiago_Master <i class="fas fa-check-circle" style="color:#0ea5e9; font-size:14px;"></i></h3>
            
            <div class="interaction-bar">
                <button class="btn-action like" onclick="this.classList.toggle('active')">
                    <i class="fas fa-heart"></i> Curtir
                </button>
                <button class="btn-action" onclick="abrirChat()">
                    <i class="fas fa-comment"></i> Conversar
                </button>
            </div>
        </div>

        <script>
            // Ativa Câmera na tela central
            navigator.mediaDevices.getUserMedia({video: true})
                .then(s => document.getElementById('webcam').srcObject = s);

            // Inicia o slider no meio (Live)
            const slider = document.getElementById('slider');
            window.onload = () => {
                slider.scrollLeft = window.innerWidth;
            };

            function abrirChat() {
                const msg = prompt("Mande uma mensagem para o criador:");
                if(msg) alert("Mensagem enviada para a Live!");
            }

            // Atualiza os pontinhos conforme o scroll
            slider.onscroll = () => {
                const index = Math.round(slider.scrollLeft / window.innerWidth);
                document.querySelectorAll('.dot').forEach((d, i) => {
                    d.classList.toggle('active', i === index);
                });
            };
        </script>
    </body>
    </html>
    `);
});

app.listen(process.env.PORT || 3000);
