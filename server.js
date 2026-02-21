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
        
        /* 1. Palco Principal */
        .main-stage { height: 40vh; background: #000; position: relative; display: flex; align-items: center; justify-content: center; color: white; border-radius: 0 0 35px 35px; overflow: hidden; margin-bottom: 5px; }
        #webcam, #video-preview, #expanded-content { width: 100%; height: 100%; object-fit: cover; position: absolute; display: none; }
        .stage-placeholder { text-align: center; opacity: 0.5; z-index: 1; font-size: 14px; }

        /* Barra de Emergência */
        #safety-alert { display: none; background: #ef4444; color: white; padding: 8px; text-align: center; font-weight: bold; font-size: 13px; z-index: 20; }

        /* 2. Feed (Voltando os Posts) */
        .feed-section { flex: 1; overflow-y: auto; padding: 15px; scrollbar-width: none; }
        .feed-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding-bottom: 20px; }
        .feed-item { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); cursor: pointer; transition: 0.2s; }
        .feed-item:active { transform: scale(0.95); }
        .thumb { width: 100%; height: 110px; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; }
        .item-info { padding: 8px; font-size: 11px; color: #1e3a8a; font-weight: bold; text-align: center; }

        /* 3. Rodapé com Ícones (Central de Controle) */
        footer { height: 90px; background: white; display: flex; justify-content: space-around; align-items: center; border-top: 1px solid #e0f2fe; padding-bottom: 10px; }
        .nav-btn { display: flex; flex-direction: column; align-items: center; border: none; background: none; cursor: pointer; color: #1e3a8a; transition: 0.3s; position: relative; }
        .nav-btn i { font-size: 26px; margin-bottom: 5px; }
        .nav-btn span { font-size: 10px; font-weight: 800; }
        
        /* Botão SOS Especial */
        .btn-sos.active { color: #ef4444; animation: pulse 1s infinite; }
        @keyframes pulse { 0% {transform: scale(1)} 50% {transform: scale(1.1)} 100% {transform: scale(1)} }
        
        .master-star { color: #fbbf24; font-size: 22px; filter: drop-shadow(0 0 5px gold); }
        #file-input { display: none; }
    </style>
</head>
<body>

    <div id="safety-alert">🚨 EM EMERGÊNCIA: <span id="location-text">Localizando...</span></div>

    <div class="main-stage" id="stage">
        <div class="stage-placeholder" id="placeholder">
            <i class="fas fa-cube fa-3x" style="margin-bottom: 10px;"></i>
            <p>Ice-Cubo Safe Ativo</p>
        </div>
        <div id="expanded-content"></div>
        <video id="video-preview" controls></video>
        <video id="webcam" autoplay playsinline muted></video>
    </div>

    <div class="feed-section">
        <div class="feed-grid" id="feed">
            <!-- Posts serão carregados via Script para não sumirem -->
        </div>
    </div>

    <footer>
        <!-- Botão Galeria -->
        <label for="file-input" class="nav-btn">
            <i class="fas fa-plus-square"></i>
            <span>POSTAR</span>
        </label>
        <input type="file" id="file-input" accept="image/*,video/*" onchange="handleUpload(event)">

        <!-- Botão Live -->
        <button class="nav-btn" onclick="toggleLive()" id="live-btn">
            <i class="fas fa-video"></i>
            <span>LIVE</span>
        </button>

        <!-- Botão SOS Perigo -->
        <button class="nav-btn btn-sos" onclick="toggleDanger()" id="sos-btn">
            <i class="fas fa-shield-virus"></i>
            <span>PERIGO</span>
        </button>

        <!-- Perfil Thiago -->
        <div class="nav-btn">
            <i class="fas fa-star master-star"></i>
            <span>THIAGO</span>
        </div>
    </footer>

    <script>
        const feed = document.getElementById('feed');
        let liveStream = null;
        let emergencyActive = false;

        // Posts Iniciais para o feed não ficar vazio
        const demoPosts =;

        function renderFeed() {
            demoPosts.forEach(post => addPostToUI(post));
        }

        function addPostToUI(post, isNew = false) {
            const div = document.createElement('div');
            div.className = 'feed-item';
            div.onclick = () => showInStage(post);
            const thumbStyle = post.type === 'image' ? \`background-image: url('\${post.url}')\` : 'background: #000';
            div.innerHTML = \`
                <div class="thumb" style="\${thumbStyle}">\${post.type === 'video' ? '<i class="fas fa-play" style="color:white"></i>' : ''}</div>
                <div class="item-info">\${post.user}</div>
            \`;
            isNew ? feed.prepend(div) : feed.appendChild(div);
        }

        // Função de Perigo
        function toggleDanger() {
            emergencyActive = !emergencyActive;
            const alertBar = document.getElementById('safety-alert');
            const sosBtn = document.getElementById('sos-btn');
            
            if (emergencyActive) {
                document.body.style.background = "#fee2e2";
                alertBar.style.display = 'block';
                sosBtn.classList.add('active');
                
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(pos => {
                        document.getElementById('location-text').innerText = "Rua Detectada (Proximidades)";
                    });
                }
            } else {
                document.body.style.background = "#f0f9ff";
                alertBar.style.display = 'none';
                sosBtn.classList.remove('active');
            }
        }

        // Galeria
        function handleUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            const url = URL.createObjectURL(file);
            const isVid = file.type.startsWith('video');
            const newPost = { user: "@Você", url: url, type: isVid ? 'video' : 'image' };
            addPostToUI(newPost, true);
            showInStage(newPost);
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

        async function toggleLive() {
            if (!liveStream) {
                try {
                    liveStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    document.getElementById('webcam').srcObject = liveStream;
                    document.getElementById('webcam').style.display = 'block';
                    document.getElementById('placeholder').style.display = 'none';
                    document.getElementById('live-btn').style.color = '#ef4444';
                } catch (e) { alert("Acesso negado"); }
            } else { stopLive(); }
        }

        function stopLive() {
            if (liveStream) {
                liveStream.getTracks().forEach(t => t.stop());
                liveStream = null;
                document.getElementById('webcam').style.display = 'none';
                document.getElementById('placeholder').style.display = 'block';
                document.getElementById('live-btn').style.color = '#1e3a8a';
            }
        }

        renderFeed();
    </script>
</body>
</html>
    `);
});

app.listen(3000, () => console.log('Ice-Cubo Safe Restaurado!'));
