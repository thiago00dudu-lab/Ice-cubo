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
    <!-- BIBLIOTECA DE ÍCONES (Essencial para aparecerem no rodapé) -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com">
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f9ff; height: 100vh; display: flex; flex-direction: column; overflow: hidden; transition: 0.5s; }
        
        /* Palco Principal */
        .main-stage { height: 38vh; background: #000; position: relative; display: flex; align-items: center; justify-content: center; color: white; border-radius: 0 0 40px 40px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        #webcam, #video-preview, #expanded-content { width: 100%; height: 100%; object-fit: cover; position: absolute; display: none; background-size: cover; background-position: center; }
        .stage-placeholder { text-align: center; opacity: 0.7; z-index: 1; font-weight: bold; }

        /* Feed */
        .feed-section { flex: 1; overflow-y: auto; padding: 15px; }
        .feed-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding-bottom: 30px; }
        .feed-item { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e0f2fe; }
        .thumb { width: 100%; height: 120px; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; }
        .item-info { padding: 10px; font-size: 11px; color: #1e3a8a; font-weight: 900; text-align: center; }

        /* Rodapé Master com Ícones */
        footer { height: 100px; background: #ffffff; display: flex; justify-content: space-around; align-items: center; border-top: 3px solid #1e3a8a; padding-bottom: env(safe-area-inset-bottom); }
        
        .nav-btn { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; border: none; background: none; cursor: pointer; color: #1e3a8a; transition: 0.2s; text-decoration: none; }
        .nav-btn i { font-size: 28px; margin-bottom: 5px; }
        .nav-btn span { font-size: 9px; font-weight: 900; text-transform: uppercase; }
        
        /* Destaque para o "O QUE TEM PRA MIM" (Trocas) */
        .btn-trade { color: #059669; transform: scale(1.1); } 
        .btn-trade i { font-size: 32px; color: #10b981; }
        
        /* Botão de Perigo */
        .btn-danger { color: #ef4444; }

        #file-input { display: none; }
    </style>
</head>
<body>

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
        <div class="feed-grid" id="feed">
             <!-- Itens aparecem aqui -->
        </div>
    </div>

    <footer>
        <!-- Botão GALERIA (Álbum) -->
        <label for="file-input" class="nav-btn">
            <i class="fas fa-images"></i>
            <span>ÁLBUM</span>
        </label>
        <input type="file" id="file-input" accept="image/*,video/*" onchange="handleUpload(event)">

        <!-- Botão CÂMERA (Live) -->
        <button class="nav-btn" onclick="toggleLive()">
            <i class="fas fa-camera"></i>
            <span>CÂMERA</span>
        </button>

        <!-- DESTAQUE: O QUE TEM PRA MIM (Trocas/Marketplace) -->
        <button class="nav-btn btn-trade" onclick="alert('Buscando trocas próximas...')">
            <i class="fas fa-handshake"></i>
            <span style="color: #059669;">O QUE TEM PRA MIM</span>
        </button>

        <!-- Botão SOS (Perigo) -->
        <button class="nav-btn btn-danger" onclick="toggleDanger()">
            <i class="fas fa-skull-crossbones"></i>
            <span>PERIGO</span>
        </button>

        <!-- Perfil Master -->
        <div class="nav-btn">
            <i class="fas fa-star" style="color: #fbbf24;"></i>
            <span>THIAGO</span>
        </div>
    </footer>

    <script>
        const feed = document.getElementById('feed');
        let liveStream = null;

        // Função para Upload (Galeria)
        function handleUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            const url = URL.createObjectURL(file);
            const isVid = file.type.startsWith('video');
            addPost({ user: "@Você", url: url, type: isVid ? 'video' : 'image' });
        }

        function addPost(post) {
            const div = document.createElement('div');
            div.className = 'feed-item';
            const thumbStyle = post.type === 'image' ? \`background-image: url('\${post.url}')\` : 'background: #000';
            div.innerHTML = \`
                <div class="thumb" style="\${thumbStyle}">\${post.type === 'video' ? '<i class="fas fa-play" style="color:white"></i>' : ''}</div>
                <div class="item-info">\${post.user}</div>
            \`;
            feed.prepend(div);
        }

        // Função Câmera (Live)
        async function toggleLive() {
            if (!liveStream) {
                try {
                    liveStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    document.getElementById('webcam').srcObject = liveStream;
                    document.getElementById('webcam').style.display = 'block';
                    document.getElementById('placeholder').style.display = 'none';
                } catch (e) { alert("Câmera bloqueada"); }
            } else {
                liveStream.getTracks().forEach(t => t.stop());
                liveStream = null;
                document.getElementById('webcam').style.display = 'none';
                document.getElementById('placeholder').style.display = 'block';
            }
        }

        function toggleDanger() {
            document.body.style.background = document.body.style.background === 'rgb(254, 226, 226)' ? '#f0f9ff' : '#fee2e2';
        }
    </script>
</body>
</html>
    `);
});

app.listen(3000, () => console.log('Ice-Cubo Safe Master Online!'));
