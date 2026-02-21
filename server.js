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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com">
    <style>
        /* MANTENDO SEU DESIGN ORIGINAL DA IMAGEM */
        body { margin: 0; padding: 0; font-family: -apple-system, sans-serif; background: #f0f9ff; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
        
        .main-stage { height: 45vh; background: #000; position: relative; display: flex; align-items: center; justify-content: center; color: white; border-radius: 0 0 40px 40px; overflow: hidden; }
        #webcam, #video-preview { width: 100%; height: 100%; object-fit: cover; display: none; position: absolute; }
        #expanded-content { width: 100%; height: 100%; background-size: cover; background-position: center; display: none; position: absolute; }
        .stage-placeholder { text-align: center; opacity: 0.6; z-index: 1; }

        .btn-live { position: absolute; bottom: 20px; right: 20px; background: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 30px; font-weight: bold; cursor: pointer; z-index: 10; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4); }

        /* NOVO BOTÃO DE POSTAR (Discreto para não estragar o layout) */
        .btn-post-action { position: absolute; bottom: 20px; left: 20px; background: #1e3a8a; color: white; border: none; padding: 10px; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        #file-input { display: none; }

        .feed-section { flex: 1; overflow-y: auto; padding: 20px; scrollbar-width: none; }
        .feed-section::-webkit-scrollbar { display: none; }
        .feed-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        
        .feed-item { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); cursor: pointer; transition: 0.3s; }
        .thumb { width: 100%; height: 120px; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; }
        .item-info { padding: 8px; font-size: 12px; color: #1e3a8a; font-weight: bold; }

        footer { padding: 15px; background: white; text-align: center; border-top: 1px solid #e0f2fe; }
        .master-star { font-size: 35px; color: #fbbf24; filter: drop-shadow(0 0 8px gold); }
        .master-name { font-weight: 900; color: #1e3a8a; margin: 0; font-size: 18px; }
        .badge-adm { background: #fbbf24; color: black; font-size: 10px; padding: 2px 6px; border-radius: 4px; vertical-align: middle; }
    </style>
</head>
<body>

    <div class="main-stage" id="stage">
        <div class="stage-placeholder" id="placeholder">
            <i class="fas fa-play-circle fa-3x"></i>
            <p>Clique em um post abaixo <br>ou use o + para galeria</p>
        </div>
        
        <div id="expanded-content"></div>
        <video id="video-preview" controls></video>
        <video id="webcam" autoplay playsinline muted></video>
        
        <!-- Botão de Postar da Galeria (Novo) -->
        <label for="file-input" class="btn-post-action">
            <i class="fas fa-plus"></i>
        </label>
        <input type="file" id="file-input" accept="image/*,video/*" onchange="handleFileUpload(event)">

        <button class="btn-live" onclick="toggleLive()" id="live-control">
            <i class="fas fa-broadcast-tower"></i> LIVE
        </button>
    </div>

    <div class="feed-section">
        <h4 style="color: #1e3a8a; margin-bottom: 15px;">✨ Sugestões para você</h4>
        <div class="feed-grid" id="feed">
            <!-- Os posts iniciais e os novos entrarão aqui -->
        </div>
    </div>

    <footer>
        <span class="master-star">🌟</span>
        <p class="master-name">Thiago Soste <span class="badge-adm">ADM</span></p>
    </footer>

    <script>
        const feed = document.getElementById('feed');
        let liveStream = null;

        // Posts iniciais (Exemplos)
        const initialPosts =;

        function handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            const fileUrl = URL.createObjectURL(file);
            const isVideo = file.type.startsWith('video');

            const newPost = {
                user: "@Você",
                img: isVideo ? "" : fileUrl,
                video: isVideo ? fileUrl : null,
                type: isVideo ? 'video' : 'image'
            };

            addPostToFeed(newPost, true);
        }

        function addPostToFeed(post, isNew = false) {
            const div = document.createElement('div');
            div.className = 'feed-item';
            div.onclick = () => showInStage(post);
            
            const thumbStyle = post.type === 'image' ? \`background-image: url('\${post.img}')\` : 'background: #000';
            const icon = post.type === 'video' ? '<i class="fas fa-video" style="color:white"></i>' : '';

            div.innerHTML = \`
                <div class="thumb" style="\${thumbStyle}">\${icon}</div>
                <div class="item-info">\${post.user}</div>
            \`;

            if (isNew) {
                feed.prepend(div);
                showInStage(post);
            } else {
                feed.appendChild(div);
            }
        }

        function showInStage(post) {
            stopLive();
            document.getElementById('placeholder').style.display = 'none';
            const expanded = document.getElementById('expanded-content');
            const videoPrev = document.getElementById('video-preview');
            const webcam = document.getElementById('webcam');

            webcam.style.display = 'none';

            if (post.type === 'video') {
                expanded.style.display = 'none';
                videoPrev.style.display = 'block';
                videoPrev.src = post.video || post.img;
                videoPrev.play();
            } else {
                videoPrev.style.display = 'none';
                expanded.style.display = 'block';
                expanded.style.backgroundImage = \`url('\${post.img}')\`;
            }
        }

        async function toggleLive() {
            if (!liveStream) {
                try {
                    liveStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    const video = document.getElementById('webcam');
                    video.srcObject = liveStream;
                    document.getElementById('placeholder').style.display = 'none';
                    document.getElementById('expanded-content').style.display = 'none';
                    document.getElementById('video-preview').style.display = 'none';
                    video.style.display = 'block';
                } catch (e) { alert("Erro na câmera"); }
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

        // Carregar posts iniciais
        initialPosts.forEach(p => addPostToFeed(p));
    </script>
</body>
</html>
    `);
});

app.listen(3000, () => console.log('Ice-Cubo restaurado e atualizado!'));
