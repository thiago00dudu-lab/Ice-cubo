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
        body { margin: 0; padding: 0; font-family: sans-serif; background: #f0f9ff; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
        .main-stage { height: 38vh; background: #000; position: relative; display: flex; align-items: center; justify-content: center; color: white; border-radius: 0 0 40px 40px; overflow: hidden; }
        #webcam { width: 100%; height: 100%; object-fit: cover; display: none; }
        
        /* Efeito de Perigo / Pânico */
        .panic-mode { animation: flash-red 0.5s infinite; border: 5px solid red !important; }
        @keyframes flash-red { 0% { background: #fff; } 50% { background: #ff0000; } 100% { background: #fff; } }
        #safety-bar { display: none; background: red; color: white; text-align: center; padding: 10px; font-weight: 900; z-index: 100; }

        .feed-section { flex: 1; overflow-y: auto; padding: 15px; }
        .feed-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .feed-item { background: white; border-radius: 20px; overflow: hidden; height: 150px; position: relative; border: 1px solid #e0f2fe; }

        footer { height: 100px; background: #fff; display: flex; justify-content: space-around; align-items: center; border-top: 3px solid #1e3a8a; }
        .nav-btn { flex: 1; display: flex; flex-direction: column; align-items: center; border: none; background: none; color: #1e3a8a; cursor: pointer; }
        .nav-btn i { font-size: 28px; }
        .nav-btn span { font-size: 9px; font-weight: 900; margin-top: 5px; }
        
        .btn-danger { color: #ef4444; }
        .star-master { color: #fbbf24; font-size: 18px; }
        #file-input { display: none; }
    </style>
</head>
<body>

    <div id="safety-bar">🚨 EM PERIGO: <span id="loc">Rastreando...</span></div>

    <div class="main-stage">
        <div id="placeholder">
            <i class="fas fa-cube fa-3x" style="color: #3b82f6;"></i>
            <p>ICE-CUBO SAFE</p>
        </div>
        <video id="webcam" autoplay playsinline></video>
    </div>

    <div class="feed-section">
        <h4 style="color: #1e3a8a;">✨ Sugestões</h4>
        <div class="feed-grid" id="feed"></div>
    </div>

    <footer>
        <label for="file-input" class="nav-btn">
            <i class="fas fa-images"></i><span>ÁLBUM</span>
        </label>
        <input type="file" id="file-input" accept="image/*,video/*" onchange="upload(event)">

        <button class="nav-btn" onclick="openCam()">
            <i class="fas fa-video"></i><span>LIVE</span>
        </button>

        <button class="nav-btn btn-danger" onclick="panic()">
            <i class="fas fa-skull-crossbones"></i><span>PERIGO</span>
        </button>

        <div class="nav-btn" id="my-profile">
            <i class="fas fa-star star-master"></i>
            <span>THIAGO</span>
        </div>
    </footer>

    <script>
        let stream = null;
        let isPanic = false;

        // 1. Câmera e Áudio (Pede autorização)
        async function openCam() {
            try {
                if(!stream) {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    const vid = document.getElementById('webcam');
                    vid.srcObject = stream;
                    vid.style.display = 'block';
                    document.getElementById('placeholder').style.display = 'none';
                } else {
                    stream.getTracks().forEach(t => t.stop());
                    stream = null;
                    document.getElementById('webcam').style.display = 'none';
                    document.getElementById('placeholder').style.display = 'block';
                }
            } catch (e) { alert("Permita câmera/áudio!"); }
        }

        // 2. Upload do Álbum
        function upload(e) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            const div = document.createElement('div');
            div.className = 'feed-item';
            div.style.backgroundImage = \`url('\${url}')\`;
            div.style.backgroundSize = 'cover';
            document.getElementById('feed').prepend(div);
        }

        // 3. Botão de Pânico (Piscar Vermelho + GPS)
        function panic() {
            isPanic = !isPanic;
            const profile = document.getElementById('my-profile');
            const bar = document.getElementById('safety-bar');
            
            if(isPanic) {
                profile.classList.add('panic-mode');
                bar.style.display = 'block';
                // Ativa GPS em tempo real
                navigator.geolocation.watchPosition(p => {
                    document.getElementById('loc').innerText = \`Lat: \${p.coords.latitude.toFixed(4)} | Lon: \${p.coords.longitude.toFixed(4)}\`;
                });
            } else {
                profile.classList.remove('panic-mode');
                bar.style.display = 'none';
            }
        }
    </script>
</body>
</html>
    `);
});

app.listen(3000, () => console.log('Ice-Cubo Safe Master Ativo!'));
