const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable-no">
    <title>Ice-Cubo Master Edition</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com">
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, sans-serif; background: linear-gradient(180deg, #e0f2fe 0%, #bae6fd 100%); height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
        .screen-slider { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; width: 100%; height: 75vh; scrollbar-width: none; }
        .screen-slider::-webkit-scrollbar { display: none; }
        .screen { min-width: 100%; height: 100%; scroll-snap-align: start; display: flex; align-items: center; justify-content: center; }
        
        /* Card e Vídeo */
        .ice-card { background: rgba(255, 255, 255, 0.25); backdrop-filter: blur(25px); border: 2px solid rgba(255, 255, 255, 0.4); border-radius: 40px; width: 90%; height: 95%; position: relative; overflow: hidden; }
        .video-container { width: 100%; height: 100%; background: #000; position: relative; }
        video { width: 100%; height: 100%; object-fit: cover; }

        /* Estrela Master Gigante */
        .master-header { display: flex; flex-direction: column; align-items: center; margin-bottom: 10px; }
        .star-master { font-size: 32px; color: #fbbf24; text-shadow: 0 0 15px rgba(251, 190, 36, 0.8); margin-bottom: -5px; cursor: pointer; }
        .creator-name { font-weight: 900; font-size: 22px; color: #1e3a8a; margin: 0; text-transform: uppercase; letter-spacing: 1px; }

        /* Painel ADM Botão */
        .btn-adm-panel { position: absolute; top: 20px; left: 20px; background: rgba(255,255,255,0.3); border: none; color: white; padding: 10px; border-radius: 50%; cursor: pointer; z-index: 100; }

        /* Grid e Mods */
        .photo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding: 20px; height: 100%; box-sizing: border-box; }
        .photo-box { background: rgba(255,255,255,0.3); border-radius: 20px; border: 1px solid white; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; }
        .star-user { color: rgba(255,255,255,0.5); font-size: 18px; }
        .is-mod { color: #1e3a8a !important; text-shadow: 0 0 5px rgba(30, 58, 138, 0.5); }

        /* Chat e Footer */
        #chat-overlay { position: absolute; bottom: 20px; left: 15px; right: 15px; max-height: 150px; overflow-y: hidden; pointer-events: none; display: flex; flex-direction: column; gap: 5px; }
        .msg { background: rgba(0, 0, 0, 0.3); color: white; padding: 5px 12px; border-radius: 15px; font-size: 13px; align-self: flex-start; }
        footer { padding: 20px; text-align: center; background: rgba(255,255,255,0.5); backdrop-filter: blur(10px); }
        .input-area { display: flex; gap: 10px; margin-top: 15px; }
        input { flex: 1; border-radius: 20px; border: none; padding: 12px; outline: none; }
        .btn-send { background: #0ea5e9; color: white; border: none; padding: 0 25px; border-radius: 20px; font-weight: bold; }

        /* Modal ADM */
        #adm-modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 999; color: white; padding: 40px; box-sizing: border-box; }
    </style>
</head>
<body>

    <div id="adm-modal">
        <h2>🛡️ PAINEL MASTER ADM</h2>
        <p>Acesso total ao sistema Ice-Cubo.</p>
        <hr>
        <button onclick="document.getElementById('adm-modal').style.display='none'" style="background: red; color: white; border: none; padding: 10px;">FECHAR PAINEL</button>
    </div>

    <div class="screen-slider" id="slider">
        <div class="screen">
            <div class="ice-card">
                <div class="photo-grid">
                    <div class="photo-box" onclick="toggleMod(this)">
                        <span class="star-user">★</span>
                        <i class="fas fa-user"></i>
                        <small>Usuário 1</small>
                    </div>
                    <div class="photo-box" onclick="toggleMod(this)">
                        <span class="star-user">★</span>
                        <i class="fas fa-user"></i>
                        <small>Usuário 2</small>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="screen">
            <div class="ice-card">
                <button class="btn-adm-panel" onclick="openAdmin()"><i class="fas fa-cog"></i></button>
                <div class="video-container">
                    <video id="webcam" autoplay playsinline muted></video>
                    <div id="chat-overlay"></div>
                </div>
            </div>
        </div>
    </div>

    <footer>
        <div class="master-header">
            <span class="star-master">🌟</span>
            <p class="creator-name">THIAGO MASTER ADM</p>
        </div>
        <div class="input-area">
            <input type="text" id="chatInput" placeholder="Sua palavra é lei...">
            <button class="btn-send" onclick="sendMsg()">ENVIAR</button>
        </div>
    </footer>

    <script>
        const slider = document.getElementById('slider');
        window.onload = () => { slider.scrollLeft = window.innerWidth; };

        // Câmera
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(s => { document.getElementById('webcam').srcObject = s; });

        // Função para tornar Moderador
        function toggleMod(el) {
            const star = el.querySelector('.star-user');
            star.classList.toggle('is-mod');
            if(star.classList.contains('is-mod')) {
                alert("Usuário promovido a Moderador! Agora ele tem poder de Kick/Ban em outros.");
            }
        }

        // Sistema de Login Master
        function openAdmin() {
            const user = prompt("Usuário ADM:");
            const pass = prompt("Senha:");
            if(user === "admin" && pass === "123") {
                document.getElementById('adm-modal').style.display = 'block';
            } else {
                alert("Acesso negado! Você não tem poder aqui.");
            }
        }

        function sendMsg() {
            const input = document.getElementById('chatInput');
            if(input.value.trim()) {
                const msg = document.createElement('div');
                msg.className = 'msg';
                msg.innerHTML = "<b>[MASTER]:</b> " + input.value;
                document.getElementById('chat-overlay').appendChild(msg);
                input.value = "";
                setTimeout(() => msg.remove(), 7000);
            }
        }
    </script>
</body>
</html>
    `);
});

app.listen(3000, () => console.log('Ice-Cubo Master ON na porta 3000'));
