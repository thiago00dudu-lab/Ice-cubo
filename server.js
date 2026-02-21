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
        body { margin: 0; padding: 0; font-family: -apple-system, sans-serif; background: #f0f9ff; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
        
        /* 1. Área de Destaque (Live ou Post Ampliado) */
        .main-stage { height: 45vh; background: #000; position: relative; display: flex; align-items: center; justify-content: center; color: white; border-radius: 0 0 40px 40px; overflow: hidden; }
        #webcam { width: 100%; height: 100%; object-fit: cover; display: none; }
        #expanded-content { width: 100%; height: 100%; background-size: cover; background-position: center; display: none; }
        .stage-placeholder { text-align: center; opacity: 0.6; }

        /* Botão de Live */
        .btn-live { position: absolute; bottom: 20px; right: 20px; background: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 30px; font-weight: bold; cursor: pointer; z-index: 10; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4); }

        /* 2. Timeline de Publicações Aleatórias */
        .feed-section { flex: 1; overflow-y: auto; padding: 20px; scrollbar-width: none; }
        .feed-section::-webkit-scrollbar { display: none; }
        .feed-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        
        .feed-item { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); cursor: pointer; transition: 0.3s; }
        .feed-item:active { transform: scale(0.95); }
        .thumb { width: 100%; height: 120px; background-size: cover; background-position: center; }
        .item-info { padding: 8px; font-size: 12px; color: #1e3a8a; font-weight: bold; }

        /* 3. Rodapé Master Thiago Soste */
        footer { padding: 15px; background: white; text-align: center; border-top: 1px solid #e0f2fe; }
        .master-star { font-size: 35px; color: #fbbf24; filter: drop-shadow(0 0 8px gold); }
        .master-name { font-weight: 900; color: #1e3a8a; margin: 0; font-size: 18px; }
        .badge-adm { background: #fbbf24; color: black; font-size: 10px; padding: 2px 6px; border-radius: 4px; vertical-align: middle; }
    </style>
</head>
<body>

    <!-- PALCO PRINCIPAL (Onde a mágica acontece) -->
    <div class="main-stage" id="stage">
        <div class="stage-placeholder" id="placeholder">
            <i class="fas fa-play-circle fa-3x"></i>
            <p>Clique em um post abaixo <br>ou inicie sua Live</p>
        </div>
        
        <!-- Conteúdo que aparece ao clicar -->
        <div id="expanded-content"></div>
        
        <!-- Câmera da Live -->
        <video id="webcam" autoplay playsinline></video>
        
        <button class="btn-live" onclick="startLive()" id="live-control">
            <i class="fas fa-broadcast-tower"></i> INICIAR LIVE
        </button>
    </div>

    <!-- TIMELINE ALEATÓRIA (IA Simulada) -->
    <div class="feed-section">
        <h4 style="color: #1e3a8a; margin-bottom: 15px;">✨ Sugestões para você</h4>
        <div class="feed-grid" id="feed">
            <!-- Gerado via Script -->
        </div>
    </div>

    <footer>
        <span class="master-star">🌟</span>
        <p class="master-name">Thiago Soste <span class="badge-adm">ADM</span></p>
    </footer>

    <script>
        const posts = [
            { id: 1, user: "@Carros_Top", category: "carros", img: "https://images.unsplash.com" },
            { id: 2, user: "@Tech_Master", category: "tech", img: "https://images.unsplash.com" },
            { id: 3, user: "@Viagem_X", category: "trip", img: "https://images.unsplash.com" },
            { id: 4, user: "@Gamer_Pro", category: "tech", img: "https://images.unsplash.com" },
            { id: 5, user: "@Natureza_Viva", category: "trip", img: "https://images.unsplash.com" },
            { id: 6, user: "@Super_Cars", category: "carros", img: "https://images.unsplash.com" }
        ];

        // 1. Gera a Timeline
        const feed = document.getElementById('feed');
        posts.forEach(post => {
            const div = document.createElement('div');
            div.className = 'feed-item';
            div.onclick = () => showInStage(post.img, post.category);
            div.innerHTML = \`
                <div class="thumb" style="background-image: url('\${post.img}')"></div>
                <div class="item-info">\${post.user}</div>
            \`;
            feed.appendChild(div);
        });

        // 2. Função para Ampliar Post (Sobe para o Stage)
        function showInStage(imgUrl, category) {
            // Desliga a câmera se estiver ligada
            stopLive();
            
            document.getElementById('placeholder').style.display = 'none';
            document.getElementById('webcam').style.display = 'none';
            
            const expanded = document.getElementById('expanded-content');
            expanded.style.display = 'block';
            expanded.style.backgroundImage = \`url('\${imgUrl}')\`;
            
            console.log("IA: Usuário interessado em " + category + ". Reordenando feed...");
        }

        // 3. Lógica da Live
        let liveStream = null;

        async function startLive() {
            const btn = document.getElementById('live-control');
            
            if (!liveStream) {
                try {
                    liveStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    document.getElementById('webcam').srcObject = liveStream;
                    
                    document.getElementById('placeholder').style.display = 'none';
                    document.getElementById('expanded-content').style.display = 'none';
                    document.getElementById('webcam').style.display = 'block';
                    
                    btn.innerHTML = '<i class="fas fa-stop"></i> ENCERRAR';
                    btn.style.background = '#374151';
                } catch (e) { alert("Câmera bloqueada!"); }
            } else {
                stopLive();
            }
        }

        function stopLive() {
            if (liveStream) {
                liveStream.getTracks().forEach(track => track.stop());
                liveStream = null;
                document.getElementById('webcam').style.display = 'none';
                document.getElementById('placeholder').style.display = 'block';
                const btn = document.getElementById('live-control');
                btn.innerHTML = '<i class="fas fa-broadcast-tower"></i> INICIAR LIVE';
                btn.style.background = '#ef4444';
            }
        }
    </script>
</body>
</html>
    `);
});

app.listen(3000, () => console.log('App Ice-Cubo Thiago Soste rodando!'));
