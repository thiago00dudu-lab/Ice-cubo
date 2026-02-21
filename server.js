const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Ice-Cubo Premium</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com">
        <style>
            body {
                margin: 0; padding: 0; font-family: -apple-system, sans-serif;
                background: linear-gradient(180deg, #e0f2fe 0%, #bae6fd 100%);
                height: 100vh; display: flex; flex-direction: column; overflow: hidden;
            }

            /* Container de Telas iPhone Style */
            .screen-slider {
                display: flex; overflow-x: auto; scroll-snap-type: x mandatory;
                width: 100%; height: 75vh; scrollbar-width: none;
            }
            .screen-slider::-webkit-scrollbar { display: none; }
            .screen { min-width: 100%; height: 100%; scroll-snap-align: start; display: flex; align-items: center; justify-content: center; position: relative; }

            /* Card Cubo de Gelo */
            .ice-card {
                background: rgba(255, 255, 255, 0.25); backdrop-filter: blur(25px);
                border: 2px solid rgba(255, 255, 255, 0.4); border-radius: 40px;
                width: 90%; height: 95%; position: relative; overflow: hidden;
            }

            /* Vídeo e Chat Flutuante */
            .video-container { width: 100%; height: 100%; background: #000; position: relative; }
            video { width: 100%; height: 100%; object-fit: cover; }
            
            #chat-overlay {
                position: absolute; bottom: 20px; left: 15px; right: 15px;
                max-height: 150px; overflow-y: hidden; pointer-events: none;
                display: flex; flex-direction: column; gap: 5px;
            }
            .msg { 
                background: rgba(0, 0, 0, 0.3); color: white; padding: 6px 12px; 
                border-radius: 15px; font-size: 13px; align-self: flex-start;
                animation: slideIn 0.3s ease;
            }
            @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }

            /* Grid de Fotos Laterais */
            .photo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding: 20px; height: 100%; box-sizing: border-box; }
            .photo-box { background: rgba(255,255,255,0.3); border-radius: 20px; border: 1px solid white; display: flex; align-items: center; justify-content: center; color: #0369a1; }

            /* Rodapé e Estrelas */
            .footer { padding: 15px; text-align: center; background: rgba(255,255,255,0.5); backdrop-filter: blur(10px); border-radius: 30px 30px 0 0; }
            
            /* Sistema de Estrelas */
            .star { font-size: 24px; margin-bottom: 5px; display: block; }
            .star-user { color: rgba(3, 105, 161, 0.2); } /* Azul quase sem cor */
            .star-mod { color: #1e3a8a; } /* Azul escuro */
            .star-master { color: #fbbf24; text-shadow: 0 0 10px rgba(251, 191, 36, 0.5); } /* Dourado */

            .creator-name { font-weight: 800; font-size: 18px; color: #1e3a8a; margin: 0; }
            
            .input-area { display: flex; gap: 10px; margin-top: 15px; padding: 0 10px; }
            input { flex: 1; border-radius: 20px; border: none; padding: 10px 15px; outline: none; }
            .btn-send { background: #0ea5e9; color: white; border: none; padding: 10px 20px; border-radius: 20px; font-weight: bold; }

            /* Botões de Ação do Mestre */
            .master-actions { position: absolute; top: 20px; right: 20px; display: flex; flex-direction: column; gap: 10px; }
            .btn-kick { background: rgba(239, 68, 68, 0.8); color: white; border: none; padding: 8px; border-radius: 10px; font-size: 12px; }
        </style>
    </head>
    <body>

        <div class="screen-slider" id="slider">
            <!-- Tela Esquerda: Passado -->
            <div class="screen">
                <div class="ice-card"><div class="photo-grid"><div class="photo-box"><i class="fas fa-history"></i></div><div class="photo-box"><i class="fas fa-image"></i></div><div class="photo-box"></div><div class="photo-box"></div></div></div>
            </div>

            <!-- Tela Central: LIVE -->
            <div class="screen">
                <div class="ice-card">
                    <div class="video-container">
                        <video id="webcam" autoplay playsinline muted></video>
                        <div id="chat-overlay"></div>
                        
                        <!-- Ações exclusivas do Criador -->
                        <div class="master-actions">
                            <button class="btn-kick" onclick="removerUsuario()">Remover da Live <i class="fas fa-user-slash"></i></button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tela Direita: Mais Fotos -->
            <div class="screen">
                <div class="ice-card"><div class="photo-grid"><div class="photo-box"></div><div class="photo-box"></div><div class="photo-box"></div><div class="photo-box"></div></div></div>
            </div>
        </div>

        <div class="footer">
            <!-- Estrela Dinâmica (Exemplo: MASTER) -->
            <i class="fas fa-star star star-master" id="user-star"></i>
            <h3 class="creator-name" id="name">@Thiago_Master</h3>
            
            <div class="input-area">
                <input type="text" id="msgInput" placeholder="Comentar na live...">
                <button class="btn-send" onclick="enviarComentario()">Enviar</button>
            </div>
        </div>

        <script>
            navigator.mediaDevices.getUserMedia({video: true}).then(s => document.getElementById('webcam').srcObject = s);
            
            const slider = document.getElementById('slider');
            window.onload = () => slider.scrollLeft = window.innerWidth;

            // Enviar comentário que flutua no vídeo
            function enviarComentario() {
                const input = document.getElementById('msgInput');
                if(!input.value) return;
                
                const msgDiv = document.createElement('div');
                msgDiv.className = 'msg';
                msgDiv.innerHTML = \`<b>Usuário:</b> \${input.value}\`;
                
                const chat = document.getElementById('chat-overlay');
                chat.appendChild(msgDiv);
                input.value = '';

                // Remove a mensagem depois de 5 segundos para não lotar a tela
                setTimeout(() => msgDiv.remove(), 5000);
            }

            // Função de expulsar usuário
            function removerUsuario() {
                const user = prompt("Quem você deseja retirar da Live?");
                if(user) {
                    alert(\`Usuário \${user} foi removido por não seguir os padrões.\`);
                }
            }

            // Exemplo de como mudar a estrela via código
            function definirPapel(papel) {
                const star = document.getElementById('user-star');
                star.className = 'fas fa-star star';
                if(papel === 'user') star.classList.add('star-user');
                if(papel === 'mod') star.classList.add('star-mod');
                if(papel === 'master') star.classList.add('star-master');
            }
        </script>
    </body>
    </html>
    `);
});

app.listen(process.env.PORT || 3000);
