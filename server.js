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
    <!-- Ícones para o Rodapé -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com">
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f9ff; height: 100vh; display: flex; flex-direction: column; overflow: hidden; transition: 0.5s; }
        
        /* 1. Palco Principal (SEU ORIGINAL) */
        .main-stage { height: 38vh; background: #000; position: relative; display: flex; align-items: center; justify-content: center; color: white; border-radius: 0 0 40px 40px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        #webcam, #video-preview, #expanded-content { width: 100%; height: 100%; object-fit: cover; position: absolute; display: none; }
        .stage-placeholder { text-align: center; opacity: 0.7; z-index: 1; font-weight: bold; }

        /* Barra de Alerta SOS */
        #safety-alert { display: none; background: #ef4444; color: white; padding: 12px; text-align: center; font-weight: 900; z-index: 100; font-size: 14px; text-transform: uppercase; }

        /* 2. Feed (SEU ORIGINAL) */
        .feed-section { flex: 1; overflow-y: auto; padding: 15px; scrollbar-width: none; }
        .feed-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding-bottom: 30px; }
        .feed-item { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); cursor: pointer; transition: 0.3s; border: 1px solid #e0f2fe; text-align: center; }
        .thumb { width: 100%; height: 120px; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; }
        .item-info { padding: 10px; font-size: 12px; color: #1e3a8a; font-weight: 900; text-align: center; background: #fff; }

        /* 3. Rodapé Master (SEU ORIGINAL) */
        footer { height: 100px; background: #ffffff; display: flex; justify-content: space-around; align-items: center; border-top: 3px solid #1e3a8a; padding-bottom: env(safe-area-inset-bottom); box-shadow: 0 -5px 20px rgba(0,0,0,0.05); }
        
        .nav-btn { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; border: none; background: none; cursor: pointer; color: #1e3a8a; transition: 0.2s; padding: 5px; }
        .nav-btn i { font-size: 30px; margin-bottom: 6px; }
        .nav-btn span { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
        
        /* Estrelas de Poder */
        .star-master { color: #fbbf24; font-size: 18px; display: block; }
        .star-mod { color: #3b82f6; font-size: 16px; display: block; }

        .btn-danger.active { color: #ef4444; animation: pulse 1s infinite; }
        .btn-trade { color: #059669; }
        .btn-adm { color: #8b5cf6; display: none; } /* Botão roxo para ADM */
        
        @keyframes pulse { 0% {transform: scale(1)} 50% {transform: scale(1.15)} 100% {transform: scale(1)} }
        #file-input { display: none; }
    </style>
</head>
<body>

    <div id="safety-alert">🚨 MODO PERIGO ATIVADO: <span id="location-text">Rua Detectada...</span></div>

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

        <button class="nav-btn" onclick="toggleLive()">
            <i class="fas fa-video"></i>
            <span>LIVE</span>
        </button>

        <!-- Botão Novo de ADM (Só aparece para você) -->
        <button class="nav-btn btn-adm" id="btn-adm" onclick="abrirPainelAdm()">
            <i class="fas fa-tools"></i>
            <span>ADM</span>
        </button>

        <button class="nav-btn btn-trade" onclick="toggleTrade()" id="trade-btn">
            <i class="fas fa-handshake"></i>
            <span>TROCAS</span>
        </button>

        <button class="nav-btn btn-danger" onclick="toggleDanger()" id="sos-btn">
            <i class="fas fa-skull-crossbones"></i>
            <span>PERIGO</span>
        </button>

        <div class="nav-btn" onclick="fazerLogin()">
            <div id="master-star"></div>
            <span id="label-nome">THIAGO</span>
        </div>
    </footer>

    <script>
        const feed = document.getElementById('feed');
        let liveStream = null;
        let isAdmin = false;

        // Login Master (admin / 123)
        function fazerLogin() {
            const user = prompt("Usuário:");
            const pass = prompt("Senha:");
            if(user === 'admin' && pass === '123') {
                isAdmin = true;
                document.getElementById('btn-adm').style.display = 'flex';
                document.getElementById('master-star').innerHTML = '<i class="fas fa-star star-master"></i>';
                alert("Nível MASTER Ativado! Imunidade Total.");
            }
        }

        function abrirPainelAdm() {
            alert("📊 MONITORAMENTO:\\n- Moderadores: 100% ativos\\n- Tempo no Site: 85%\\n- Frequência: Diária");
        }

        // Funções Originais (Mantidas)
        function toggleTrade() {
            const title = document.getElementById('feed-title');
            title.innerText = "🤝 O QUE TEM PRA MIM (SÓ TROCAS)";
            console.log("Modo Troca Ativado");
        }

        function toggleDanger() {
            const alertBar = document.getElementById('safety-alert');
            alertBar.style.display = alertBar.style.display === 'block' ? 'none' : 'block';
            document.body.style.background = alertBar.style.display === 'block' ? "#fee2e2" : "#f0f9ff";
        }

        function handleUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            const url = URL.createObjectURL(file);
            addPost({ user: "@Você", url: url, type: 'image' });
        }

        function addPost(post) {
            const div = document.createElement('div');
            div.className = 'feed-item';
            div.innerHTML = \`
                <div class="thumb" style="background-image: url('\${post.url}')"></div>
                <div class="item-info">\${post.user}</div>
            \`;
            feed.prepend(div);
        }

        async function toggleLive() {
            if (!liveStream) {
                liveStream = await navigator.mediaDevices.getUserMedia({ video: true });
                document.getElementById('webcam').srcObject = liveStream;
                document.getElementById('webcam').style.display = 'block';
                document.getElementById('placeholder').style.display = 'none';
            } else {
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

app.listen(3000, () => console.log('Ice-Cubo Original Restaurado!'));
