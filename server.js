const express = require('express');
const app = express();
const path = require('path');

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable-no">
    <title>Ice-Cubo Premium</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com">
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, sans-serif; background: #e0f2fe; height: 100vh; overflow: hidden; }
        
        /* Tela de Cadastro/Login */
        #auth-screen { position: fixed; inset: 0; background: white; z-index: 2000; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; }
        .auth-card { background: #f0f9ff; padding: 30px; border-radius: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: 85%; max-width: 400px; }
        .input-auth { width: 100%; padding: 15px; margin: 10px 0; border-radius: 15px; border: 1px solid #bae6fd; box-sizing: border-box; }
        .btn-auth { width: 100%; padding: 15px; background: #0ea5e9; color: white; border: none; border-radius: 15px; font-weight: bold; cursor: pointer; }

        /* App Principal */
        #app-interface { display: none; height: 100vh; flex-direction: column; }
        .screen-slider { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; width: 100%; height: 75vh; scrollbar-width: none; }
        .screen-slider::-webkit-scrollbar { display: none; }
        .screen { min-width: 100%; height: 100%; scroll-snap-align: start; display: flex; align-items: center; justify-content: center; }
        
        .ice-card { background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(20px); border: 2px solid white; border-radius: 40px; width: 92%; height: 95%; position: relative; overflow: hidden; }
        
        /* Câmera e Controles */
        .video-container { width: 100%; height: 100%; background: #000; position: relative; }
        video { width: 100%; height: 100%; object-fit: cover; }
        .cam-controls { position: absolute; bottom: 20px; right: 20px; display: flex; gap: 10px; z-index: 100; }
        .btn-ctrl { background: rgba(0,0,0,0.5); color: white; border: none; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; }
        .btn-ctrl.off { background: #ef4444; }

        /* Estilo Master Thiago Soste */
        .master-star { font-size: 55px; color: #fbbf24; filter: drop-shadow(0 0 15px gold); animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        .badge { font-size: 11px; padding: 2px 8px; border-radius: 5px; margin-left: 5px; font-weight: bold; }
        .badge-adm { background: #fbbf24; color: black; }
        .badge-user { background: #1e3a8a; color: white; }

        footer { padding: 15px; text-align: center; background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); border-radius: 35px 35px 0 0; }
        #chat-overlay { position: absolute; bottom: 80px; left: 15px; right: 15px; pointer-events: none; display: flex; flex-direction: column; gap: 5px; }
        .msg { background: rgba(0,0,0,0.5); color: white; padding: 8px 15px; border-radius: 15px; font-size: 13px; align-self: flex-start; }
    </style>
</head>
<body>

    <!-- TELA DE ACESSO -->
    <div id="auth-screen">
        <div class="auth-card">
            <h2 style="color: #0369a1;">❄️ Ice-Cubo Premium</h2>
            <p>Faça seu cadastro para entrar</p>
            <input type="text" id="login-user" class="input-auth" placeholder="Seu Nome ou 'admin'">
            <input type="password" id="login-pass" class="input-auth" placeholder="Senha (use 123 para admin)">
            <button class="btn-auth" onclick="handleAuth()">ENTRAR NO APP</button>
        </div>
    </div>

    <!-- INTERFACE DO APP -->
    <div id="app-interface">
        <div class="screen-slider" id="slider">
            <div class="screen">
                <div class="ice-card">
                    <div style="padding: 20px; text-align: center; font-weight: bold;">👤 Sua Rede de Filhos</div>
                    <div id="user-info" style="padding: 20px; text-align: center;"></div>
                </div>
            </div>
            
            <div class="screen">
                <div class="ice-card">
                    <div class="video-container">
                        <video id="webcam" autoplay playsinline muted></video>
                        <div id="chat-overlay"></div>
                        <div class="cam-controls">
                            <button class="btn-ctrl" id="btn-video" onclick="toggleVideo()"><i class="fas fa-video"></i></button>
                            <button class="btn-ctrl" id="btn-audio" onclick="toggleAudio()"><i class="fas fa-microphone"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <footer>
            <div id="profile-display"></div>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <input type="text" id="msg-input" style="flex:1; padding:12px; border-radius:20px; border:none;" placeholder="Enviar mensagem...">
                <button onclick="send()" style="background:#0ea5e9; border:none; color:white; padding:0 20px; border-radius:20px;"><i class="fas fa-paper-plane"></i></button>
            </div>
        </footer>
    </div>

    <script>
        let currentUser = "";
        let isMaster = false;
        let stream;

        async function handleAuth() {
            const user = document.getElementById('login-user').value;
            const pass = document.getElementById('login-pass').value;

            if(!user) return alert("Digite seu nome!");

            if(user === "admin" && pass === "123") {
                currentUser = "Thiago Soste";
                isMaster = true;
            } else {
                currentUser = user;
                isMaster = false;
            }

            document.getElementById('auth-screen').style.display = 'none';
            document.getElementById('app-interface').style.display = 'flex';
            
            setupProfile();
            startCamera();
            
            const slider = document.getElementById('slider');
            setTimeout(() => { slider.scrollLeft = window.innerWidth; }, 100);
        }

        function setupProfile() {
            const display = document.getElementById('profile-display');
            const userInfo = document.getElementById('user-info');
            
            if(isMaster) {
                display.innerHTML = \`<span class="master-star">🌟</span><br><b>\${currentUser}</b> <span class="badge badge-adm">ADM</span>\`;
                userInfo.innerHTML = "<p>Você é o Administrador Master</p>";
            } else {
                display.innerHTML = \`<i class="fas fa-user-circle fa-3x" style="color:#1e3a8a"></i><br><b>\${currentUser}</b> <span class="badge badge-user">USUÁRIO</span>\`;
                userInfo.innerHTML = \`<div style="font-size: 24px; margin-top: 20px;"><i class="fas fa-tree"></i> 0 Filhos</div><p>Indique pessoas para ganhar pontos!</p>\`;
            }
        }

        async function startCamera() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                document.getElementById('webcam').srcObject = stream;
            } catch (err) {
                alert("Erro ao acessar câmera/áudio: " + err);
            }
        }

        function toggleVideo() {
            const track = stream.getVideoTracks()[0];
            track.enabled = !track.enabled;
            document.getElementById('btn-video').classList.toggle('off', !track.enabled);
        }

        function toggleAudio() {
            const track = stream.getAudioTracks()[0];
            track.enabled = !track.enabled;
            document.getElementById('btn-audio').classList.toggle('off', !track.enabled);
        }

        function send() {
            const input = document.getElementById('msg-input');
            if(input.value) {
                const chat = document.getElementById('chat-overlay');
                const div = document.createElement('div');
                div.className = 'msg';
                div.innerHTML = \`<b>\${isMaster ? '🌟 ' : ''}\${currentUser}:</b> \${input.value}\`;
                chat.appendChild(div);
                input.value = "";
                setTimeout(() => div.remove(), 5000);
            }
        }
    </script>
</body>
</html>
    `);
});

app.listen(3000, () => console.log('Ice-Cubo Público e Master Online!'));
