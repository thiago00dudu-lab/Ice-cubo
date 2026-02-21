const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable-no">
    <title>Ice-Cubo Premium - Thiago Soste</title>
    <!-- Vínculo Tecnológico: Font Awesome para os Ícones -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com">
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background: #f0f9ff; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
        
        .main-stage { height: 38vh; background: #000; position: relative; display: flex; align-items: center; justify-content: center; color: white; border-radius: 0 0 40px 40px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        #webcam, #video-preview, #expanded-content { width: 100%; height: 100%; object-fit: cover; position: absolute; display: none; background-size: cover; background-position: center; }
        .stage-placeholder { text-align: center; opacity: 0.7; z-index: 1; font-weight: bold; }

        #safety-alert { display: none; background: #ef4444; color: white; padding: 12px; text-align: center; font-weight: 900; z-index: 100; font-size: 14px; text-transform: uppercase; }

        .feed-section { flex: 1; overflow-y: auto; padding: 15px; }
        .feed-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding-bottom: 30px; }
        .feed-item { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); cursor: pointer; border: 1px solid #e0f2fe; }
        .thumb { width: 100%; height: 120px; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; }
        .item-info { padding: 10px; font-size: 12px; color: #1e3a8a; font-weight: 900; text-align: center; }

        footer { height: 100px; background: #ffffff; display: flex; justify-content: space-around; align-items: center; border-top: 3px solid #1e3a8a; padding-bottom: env(safe-area-inset-bottom); }
        .nav-btn { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; border: none; background: none; color: #1e3a8a; }
        .nav-btn i { font-size: 24px; margin-bottom: 5px; }
        .nav-btn span { font-size: 9px; font-weight: 900; }
        
        .btn-danger.active { color: #ef4444; animation: pulse 1s infinite; }
        .trade-active .feed-item { border: 2px solid #059669; }
        @keyframes pulse { 0% {transform: scale(1)} 50% {transform: scale(1.1)} 100% {transform: scale(1)} }
        #file-input { display: none; }
    </style>
</head>
<body>

    <div id="safety-alert">🚨 MODO PERIGO ATIVADO: <span id="location-text">Buscando GPS...</span></div>

    <div class="main-stage" id="stage">
        <div class="stage-placeholder" id="placeholder">
            <i class="fas fa-cube fa-3x" style="margin-bottom: 15px; color: #3b82f6;"></i>
            <p>ICE-CUBO SAFE ATIVO</p>
        </div>
        <div id="expanded-content"></div>
        <video id="video-preview" controls></video>
        <video id="webcam" autoplay playsinline muted></video>
    </div>

    <div class="feed-section" id="content-area">
        <h4 id="feed-title" style="color: #1e3a8a; margin-bottom: 15px; font-weight: 900;">✨ Sugestões para você</h4>
        <div class="feed-grid" id="feed"></div>
    </div>

    <footer>
        <label for="file-input" class="nav-btn">
            <i class="fas fa-images"></i>
            <span>ÁLBUM</span>
        </label>
        <input type="file" id="file-input" accept="image/*,video/*" onchange="handleUpload(event)">

        <button class="nav-btn" onclick="toggleLive()" id="live-btn">
            <i class="fas fa-video"></i>
            <span>LIVE</span>
        </button>

        <button class="nav-btn" onclick="toggleTrade()" id="trade-btn">
            <i class="fas fa-handshake"></i>
            <span>TROCAS</span>
        </button>

        <button class="nav-btn btn-danger" onclick="toggleDanger()" id="sos-btn">
            <i class="fas fa-skull-crossbones"></i>
            <span>PERIGO</span>
        </button>

        <div class="nav-btn">
            <i class="fas fa-star" style="color: #fbbf24;"></i>
            <span>THIAGO</span>
        </div>
    </footer>

    <script>
        const feed = document.getElementById('feed');
        let liveStream = null;
        let isEmergency = false;
        let isTradeMode = false;

        // Dados de Exemplo para não iniciar vazio
        const posts = [
            { user: "@Comunidade", url: "https://picsum.photos", type: 'image' },
            { user: "@Novidades", url: "https://picsum.photos", type: 'image' }
        ];

        posts.forEach(p => addPost(p));

        function toggleTrade() {
            isTradeMode = !isTradeMode;
            const title = document.getElementById('feed-title');
            document.getElementById('content-area').classList.toggle('trade-active');
            title.innerText = isTradeMode ? "🤝 O QUE TEM PRA MIM (TROCAS)" : "✨ Sugestões para você";
        }

        function toggleDanger() {
            isEmergency = !isEmergency;
            const alertBar = document.getElementById('safety-alert');
            const btn = document.getElementById('sos-btn');
            
            if (isEmergency) {
                document.body.style.background = "#fee2e2";
                alertBar.style.display = 'block';
                btn.classList.add('active');
                if(navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(p => {
                        document.getElementById('location-text').innerText = "Rua Identificada - Proteção Ativa";
                    });
                }
            } else {
                document.body.style.background = "#f0f9ff";
                alertBar.style.display = 'none';
                btn.classList.remove('active');
            }
        }

        function handleUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            const url = URL.createObjectURL(file);
            const isVid = file.type.startsWith('video');
            addPost({ user: "@Você", url: url, type: isVid ? 'video' : 'image' }, true);
        }

        function addPost(post, isNew = false) {
            const div = document.createElement('div');
            div.className = 'feed-item';
            div.onclick = () => showInStage(post);
            const thumbStyle = post.type === 'image' ? \`background-image: url('\${post.url}')\` : 'background: #000';
            div.innerHTML = \`
                <div class="thumb" style="\${thumbStyle}">\${post.type === 'video' ? '<i class="fas fa-play" style="color:white"></i>' : ''}</div>
                <div class="item-info">\${post.user}</div>
            \`;
            isNew ? feed.prepend(div) : feed.appendChild(div);
            if(isNew) showInStage(post);
        }

        function showInStage(post) {
            stopLive();
            document.getElementById('placeholder').style.display = 'none';
            const exp = document.getElementById('expanded-content');
            const vid = document.getElementById('video-preview');
            
            if (post.type === 'video') {
                exp.style.display = 'none'; vid.style.display = 'block';
                vid.src = post.url; vid.play();
            } else {
                vid.style.display = 'none'; exp.style.display = 'block';
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
                } catch (e) { alert("Acesso à câmera negado"); }
            } else { stopLive(); }
        }

        function stopLive() {
            if (liveStream) {
                liveStream.getTracks().forEach(t => t.stop());
                liveStream = null;
                document.getElementById('webcam').style.display = 'none';
                document.getElementById('placeholder').style.display = 'block';
            }
        }
    </script>
</body>
</html>
    `);
});

const PORT = 3000;
app.listen(PORT, () => console.log(\`Servidor Mobile Ativo em: http://localhost:\${PORT}\`));
