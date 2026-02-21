const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable-no">
    <title>Ice-Cubo Safe - Thiago Soste</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com">
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, sans-serif; background: #f0f9ff; height: 100vh; display: flex; flex-direction: column; overflow: hidden; transition: 0.5s; }
        
        /* Estado de Perigo */
        body.emergency-mode { background: #fee2e2 ! !important; }
        body.emergency-mode .main-stage { border: 5px solid #ef4444; box-shadow: 0 0 20px #ef4444; }

        .main-stage { height: 40vh; background: #000; position: relative; display: flex; align-items: center; justify-content: center; color: white; border-radius: 0 0 30px 30px; overflow: hidden; margin-bottom: 10px; }
        #webcam, #video-preview, #expanded-content { width: 100%; height: 100%; object-fit: cover; position: absolute; display: none; }
        .stage-placeholder { text-align: center; opacity: 0.5; z-index: 1; }

        /* Alerta de Localização */
        #safety-alert { display: none; background: #ef4444; color: white; padding: 10px; text-align: center; font-weight: bold; font-size: 14px; animation: blink 1s infinite; }
        @keyframes blink { 0% {opacity: 1} 50% {opacity: 0.7} 100% {opacity: 1} }

        .feed-section { flex: 1; overflow-y: auto; padding: 15px; scrollbar-width: none; }
        .feed-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .feed-item { background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .thumb { width: 100%; height: 100px; background-size: cover; background-position: center; }

        /* Novo Rodapé com Ícones Separados */
        footer { height: 80px; background: white; display: flex; justify-content: space-around; align-items: center; border-top: 2px solid #e0f2fe; padding: 0 10px; }
        .nav-btn { display: flex; flex-direction: column; align-items: center; border: none; background: none; cursor: pointer; color: #64748b; transition: 0.3s; }
        .nav-btn i { font-size: 24px; margin-bottom: 4px; }
        .nav-btn span { font-size: 10px; font-weight: bold; }
        
        .btn-post { color: #1e3a8a; }
        .btn-live.active { color: #ef4444; }
        .btn-danger { color: #94a3b8; }
        .btn-danger.active { color: #ef4444; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% {transform: scale(1)} 50% {transform: scale(1.1)} 100% {transform: scale(1)} }

        #file-input { display: none; }
    </style>
</head>
<body>

    <div id="safety-alert">🚨 EM EMERGÊNCIA: <span id="location-text">Obtendo localização...</span></div>

    <div class="main-stage" id="stage">
        <div class="stage-placeholder" id="placeholder">
            <i class="fas fa-shield-alt fa-3x"></i>
            <p>Ice-Cubo Safe Ativo</p>
        </div>
        <div id="expanded-content"></div>
        <video id="video-preview" controls></video>
        <video id="webcam" autoplay playsinline></video>
    </div>

    <div class="feed-section">
        <div class="feed-grid" id="feed"></div>
    </div>

    <footer>
        <!-- Botão Galeria -->
        <label for="file-input" class="nav-btn btn-post">
            <i class="fas fa-plus-circle"></i>
            <span>POSTAR</span>
        </label>
        <input type="file" id="file-input" accept="image/*,video/*" onchange="handleUpload(event)">

        <!-- Botão Live/Câmera -->
        <button class="nav-btn btn-live" id="live-btn" onclick="toggleLive()">
            <i class="fas fa-video"></i>
            <span>LIVE</span>
        </button>

        <!-- Botão de Perigo -->
        <button class="nav-btn btn-danger" id="danger-btn" onclick="toggleDanger()">
            <i class="fas fa-exclamation-triangle"></i>
            <span>PERIGO</span>
        </button>

        <!-- Perfil ADM -->
        <div class="nav-btn">
            <i class="fas fa-user-shield" style="color: #fbbf24;"></i>
            <span>THIAGO</span>
        </div>
    </footer>

    <script>
        let liveStream = null;
        let isEmergency = false;

        // 1. Função de Perigo e Localização
        function toggleDanger() {
            isEmergency = !isEmergency;
            const btn = document.getElementById('danger-btn');
            const alertBar = document.getElementById('safety-alert');
            
            if (isEmergency) {
                document.body.classList.add('emergency-mode');
                btn.classList.add('active');
                alertBar.style.display = 'block';
                
                // Pede permissão de localização
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(async (pos) => {
                        const { latitude, longitude } = pos.coords;
                        // Simulação de busca de endereço (reverso geocoding)
                        document.getElementById('location-text').innerText = \`Lat: \${latitude.toFixed(4)}, Long: \${longitude.toFixed(4)} (Rua Detectada)\`;
                    }, () => {
                        document.getElementById('location-text').innerText = "Localização Bloqueada!";
                    });
                }
            } else {
                document.body.classList.remove('emergency-mode');
                btn.classList.remove('active');
                alertBar.style.display = 'none';
            }
        }

        // 2. Postar da Galeria (Pede autorização automaticamente ao clicar)
        function handleUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            const url = URL.createObjectURL(file);
            const isVid = file.type.startsWith('video');
            
            const post = { type: isVid ? 'video' : 'image', url: url };
            
            // Adiciona ao feed
            const div = document.createElement('div');
            div.className = 'feed-item';
            div.onclick = () => showInStage(post);
            div.innerHTML = \`<div class="thumb" style="background-image: url('\${isVid ? '' : url}'); background-color: #000;">\${isVid ? '<i class="fas fa-play" style="color:white; margin: 40px"></i>' : ''}</div>\`;
            document.getElementById('feed').prepend(div);
            showInStage(post);
        }

        function showInStage(post) {
            stopLive();
            document.getElementById('placeholder').style.display = 'none';
            const exp = document.getElementById('expanded-content');
            const vid = document.getElementById('video-preview');
            
            if (post.type === 'video') {
                exp.style.display = 'none';
                vid.style.display = 'block';
                vid.src = post.url;
                vid.play();
            } else {
                vid.style.display = 'none';
                exp.style.display = 'block';
                exp.style.backgroundImage = \`url('\${post.url}')\`;
            }
        }

        // 3. Live com Áudio e Vídeo
        async function toggleLive() {
            const btn = document.getElementById('live-btn');
            if (!liveStream) {
                try {
                    liveStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    document.getElementById('webcam').srcObject = liveStream;
                    document.getElementById('webcam').style.display = 'block';
                    document.getElementById('placeholder').style.display = 'none';
                    btn.classList.add('active');
                } catch (e) { alert("Autorize a câmera e áudio!"); }
            } else { stopLive(); }
        }

        function stopLive() {
            if (liveStream) {
                liveStream.getTracks().forEach(t => t.stop());
                liveStream = null;
                document.getElementById('webcam').style.display = 'none';
                document.getElementById('placeholder').style.display = 'block';
                document.getElementById('live-btn').classList.remove('active');
            }
        }
    </script>
</body>
</html>
    `);
});

app.listen(3000, () => console.log('Ice-Cubo Safe rodando na porta 3000'));
