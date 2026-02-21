const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ice-Cubo Master</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com">
        <style>
            body {
                margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif;
                background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
                display: flex; flex-direction: column; align-items: center; min-height: 100vh;
                overflow-x: hidden; color: #0369a1;
            }
            /* Layout de 3 Telas */
            .main-container {
                display: flex; align-items: center; justify-content: center;
                gap: 20px; width: 100%; max-width: 1200px; padding: 40px 20px;
                position: relative;
            }
            /* Telas Laterais de Fotos */
            .photo-screen {
                background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px);
                border: 2px solid rgba(255, 255, 255, 0.5); border-radius: 20px;
                width: 250px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 15px;
            }
            .photo-slot {
                aspect-ratio: 1; background: rgba(255,255,255,0.4); 
                border-radius: 10px; border: 1px dashed #0369a1;
                display: flex; align-items: center; justify-content: center; font-size: 20px;
            }
            /* Tela Central Live */
            .center-live {
                background: rgba(255, 255, 255, 0.3); backdrop-filter: blur(15px);
                border: 3px solid rgba(255, 255, 255, 0.6); border-radius: 30px;
                width: 380px; padding: 20px; text-align: center; position: relative; z-index: 2;
            }
            .video-box {
                width: 100%; height: 250px; background: #000; border-radius: 20px; 
                overflow: hidden; border: 4px solid white;
            }
            video { width: 100%; height: 100%; object-fit: cover; }

            /* Traçado de Estrela Azul Escuro */
            .star-path {
                position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                width: 100%; height: 100%; pointer-events: none; z-index: 1;
            }
            .star-svg { width: 100%; height: 100%; stroke: #1e3a8a; stroke-width: 2; fill: none; stroke-dasharray: 5; }

            /* Sistema de Moderação */
            .mod-panel {
                margin-top: 20px; background: #1e3a8a; color: white;
                padding: 15px; border-radius: 15px; width: 300px; text-align: center;
            }
            .btn-mod {
                background: #60a5fa; border: none; color: white; padding: 8px;
                border-radius: 5px; cursor: pointer; margin-top: 10px;
            }
        </style>
    </head>
    <body>
        <h1 style="margin-top:20px;"><i class="fas fa-snowflake"></i> ICE-CUBO MASTER</h1>

        <div class="main-container">
            <!-- Traçado da Estrela -->
            <div class="star-path">
                <svg class="star-svg" viewBox="0 0 1000 500">
                    <path d="M500 50 L600 450 L150 150 L850 150 L400 450 Z" />
                </svg>
            </div>

            <!-- Tela Esquerda (4 Fotos) -->
            <div class="photo-screen">
                <div class="photo-slot"><i class="fas fa-plus"></i></div>
                <div class="photo-slot"><i class="fas fa-plus"></i></div>
                <div class="photo-slot"><i class="fas fa-plus"></i></div>
                <div class="photo-slot"><i class="fas fa-plus"></i></div>
            </div>

            <!-- Tela Central -->
            <div class="center-live">
                <div class="video-box"><video id="v" autoplay playsinline></video></div>
                <p><b>LIVE DO MESTRE</b></p>
                <button class="btn-mod" onclick="tornarModerador()">Levantar Moderador <i class="fas fa-crown"></i></button>
            </div>

            <!-- Tela Direita (4 Fotos) -->
            <div class="photo-screen">
                <div class="photo-slot"><i class="fas fa-plus"></i></div>
                <div class="photo-slot"><i class="fas fa-plus"></i></div>
                <div class="photo-slot"><i class="fas fa-plus"></i></div>
                <div class="photo-slot"><i class="fas fa-plus"></i></div>
            </div>
        </div>

        <div class="mod-panel" id="panel">
            <b>Painel de Controle</b>
            <div id="status">Aguardando definição de papéis...</div>
        </div>

        <script>
            navigator.mediaDevices.getUserMedia({video:true}).then(s=>document.getElementById('v').srcObject=s);

            let souMestre = true; // Você é o ADM Master

            function tornarModerador() {
                const user = prompt("Nome do usuário para ser Moderador:");
                if(user) {
                    alert(user + " agora é Moderador e pode bloquear outros!");
                    document.getElementById('status').innerHTML = \`<b>Moderador Ativo:</b> \${user} <br> <button onclick="bloquear()" style="color:red">Bloquear Usuário</button>\`;
                }
            }

            function bloquear() {
                const alvo = prompt("Nome de quem deseja bloquear:");
                if(alvo === "Thiago" || alvo === "Mestre") {
                    alert("ERRO: Você não pode bloquear o ADM Master!");
                } else {
                    alert("Usuário " + alvo + " foi banido pelo Moderador.");
                }
            }
        </script>
    </body>
    </html>
    `);
});

app.listen(process.env.PORT || 3000);
