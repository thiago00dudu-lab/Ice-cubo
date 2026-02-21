const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable-no">
    <title>Ice-Cubo Premium - Master Console</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com">
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, sans-serif; background: linear-gradient(180deg, #e0f2fe 0%, #bae6fd 100%); height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
        .screen-slider { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; width: 100%; height: 75vh; scrollbar-width: none; }
        .screen-slider::-webkit-scrollbar { display: none; }
        .screen { min-width: 100%; height: 100%; scroll-snap-align: start; display: flex; align-items: center; justify-content: center; }
        .ice-card { background: rgba(255, 255, 255, 0.25); backdrop-filter: blur(25px); border: 2px solid rgba(255, 255, 255, 0.4); border-radius: 40px; width: 90%; height: 95%; position: relative; overflow: hidden; }
        
        /* Estrela Master Gigante com Brilho */
        .master-star { 
            font-size: 60px; 
            color: #fbbf24; 
            filter: drop-shadow(0 0 20px rgba(251, 190, 36, 0.8));
            animation: pulse 2s infinite;
            margin-bottom: -10px;
        }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }

        .name-tag { font-weight: 900; font-size: 22px; color: #1e3a8a; display: flex; align-items: center; gap: 8px; }
        .badge-adm { background: #fbbf24; color: #000; font-size: 12px; padding: 2px 8px; border-radius: 5px; }
        .badge-mod { background: #1e3a8a; color: #fff; font-size: 12px; padding: 2px 8px; border-radius: 5px; }

        /* Grid de Usuários e Filhos */
        .photo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding: 20px; box-sizing: border-box; }
        .user-box { background: rgba(255,255,255,0.3); border-radius: 25px; border: 1px solid white; padding: 15px; display: flex; flex-direction: column; align-items: center; color: #1e3a8a; }
        .filhos-count { font-weight: bold; font-size: 14px; margin-top: 5px; color: #0369a1; }

        /* Interface da Live */
        .video-container { width: 100%; height: 100%; background: #000; position: relative; }
        video { width: 100%; height: 100%; object-fit: cover; }
        #chat-overlay { position: absolute; bottom: 20px; left: 15px; right: 15px; max-height: 150px; overflow-y: hidden; pointer-events: none; display: flex; flex-direction: column; gap: 5px; }
        .msg { background: rgba(0, 0, 0, 0.4); color: white; padding: 8px 15px; border-radius: 20px; font-size: 13px; align-self: flex-start; }

        footer { padding: 20px; text-align: center; background: rgba(255,255,255,0.6); backdrop-filter: blur(15px); border-radius: 30px 30px 0 0; }
        .input-area { display: flex; gap: 10px; margin-top: 15px; }
        .input-style { flex: 1; border-radius: 25px; border: none; padding: 15px; outline: none; background: white; }
    </style>
</head>
<body>

    <div class="screen-slider" id="slider">
        <!-- TELA DE USUÁRIOS (Filhos e Indicações) -->
        <div class="screen">
            <div class="ice-card">
                <div style="padding: 20px; text-align: center;"><b>Comunidade Ice-Cubo</b></div>
                <div class="photo-grid">
                    <div class="user-box" onclick="makeMod(this)">
                        <span id="star-icon"></span>
                        <i class="fas fa-user-circle fa-2x"></i>
                        <span>Carlos Silva</span>
                        <div class="filhos-count"><i class="fas fa-tree"></i> 12 Filhos</div>
                    </div>
                    <div class="user-box">
                        <i class="fas fa-user-circle fa-2x"></i>
                        <span>Ana Souza</span>
                        <div class="filhos-count"><i class="fas fa-tree"></i> 5 Filhos</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- TELA DA LIVE -->
        <div class="screen">
            <div class="ice-card">
                <div class="video-container">
                    <video id="webcam" autoplay playsinline muted></video>
                    <div id="chat-overlay"></div>
                    <button onclick="openPanel()" style="position:absolute; top:20px; right:20px; background:none; border:none; color:white; font-size:20px;"><i class="fas fa-cog"></i></button>
                </div>
            </div>
        </div>
    </div>

    <footer>
        <div style="display: flex; flex-direction: column; align-items: center;">
            <span class="master-star">🌟</span>
            <div class="name-tag">
                Thiago Soste <span class="badge-adm">ADM</span>
            </div>
        </div>
        <div class="input-area">
            <input type="text" class="input-style" id="m" placeholder="Enviar comando Master...">
            <button onclick="send()" style="background:#0ea5e9; border:none; color:white; width:50px; border-radius:50%;"><i class="fas fa-paper-plane"></i></button>
        </div>
    </footer>

    <script>
        const slider = document.getElementById('slider');
        window.onload = () => { slider.scrollLeft = window.innerWidth; };

        navigator.mediaDevices.getUserMedia({ video: true }).then(s => {
            document.getElementById('webcam').srcObject = s;
        });

        function makeMod(el) {
            if(confirm("Tornar este usuário Moderador?")) {
                el.querySelector('#star-icon').innerHTML = "⭐ ";
                el.innerHTML += '<span class="badge-mod">MODERADOR</span>';
            }
        }

        function openPanel() {
            let u = prompt("Usuário:");
            let p = prompt("Senha:");
            if(u === "admin" && p === "123") {
                alert("Painel Master Thiago Soste liberado!");
            }
        }

        function send() {
            const i = document.getElementById('m');
            if(i.value) {
                const c = document.getElementById('chat-overlay');
                const d = document.createElement('div');
                d.className = 'msg';
                d.innerHTML = "<b>🌟 Thiago Soste:</b> " + i.value;
                c.appendChild(d);
                i.value = "";
                setTimeout(() => d.remove(), 6000);
            }
        }
    </script>
</body>
</html>
    `);
});

app.listen(3000, () => console.log('Servidor Ice-Cubo ON'));
