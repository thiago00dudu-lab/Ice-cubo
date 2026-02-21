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
        
        /* 1. Câmera Compacta (Preview Superior) */
        .camera-header { height: 28vh; background: #000; position: relative; border-radius: 0 0 30px 30px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
        video { width: 100%; height: 100%; object-fit: cover; }
        .master-badge { position: absolute; top: 15px; left: 15px; background: rgba(251, 191, 36, 0.9); color: #000; padding: 5px 12px; border-radius: 15px; font-weight: bold; font-size: 12px; display: flex; align-items: center; gap: 5px; }

        /* 2. Timeline Inteligente */
        .timeline-container { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 20px; scrollbar-width: none; }
        .timeline-container::-webkit-scrollbar { display: none; }
        
        .post-card { background: white; border-radius: 25px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .post-img { width: 100%; height: 250px; background-size: cover; background-position: center; cursor: pointer; }
        .post-info { padding: 15px; display: flex; align-items: center; justify-content: space-between; }
        .user-tag { display: flex; align-items: center; gap: 10px; font-weight: bold; color: #1e3a8a; }

        /* 3. Rodapé Thiago Soste Master */
        footer { padding: 15px; background: white; border-radius: 30px 30px 0 0; box-shadow: 0 -5px 15px rgba(0,0,0,0.05); text-align: center; }
        .star-main { font-size: 35px; color: #fbbf24; filter: drop-shadow(0 0 10px gold); margin-bottom: -5px; display: block; }
        .name-main { font-weight: 900; font-size: 18px; color: #1e3a8a; margin: 0; }
    </style>
</head>
<body>

    <!-- Cabeçalho com Câmera -->
    <div class="camera-header">
        <div class="master-badge"><i class="fas fa-crown"></i> Thiago Soste [ADM]</div>
        <video id="webcam" autoplay playsinline muted></video>
    </div>

    <!-- Timeline Inteligente com IA de Recomendação -->
    <div class="timeline-container" id="timeline">
        <!-- Os posts serão gerados aqui pela IA simulada -->
    </div>

    <footer>
        <span class="star-main">🌟</span>
        <p class="name-main">Thiago Soste</p>
        <div style="display: flex; gap: 10px; margin-top: 10px; padding: 0 10px;">
            <input type="text" style="flex:1; padding:12px; border-radius:20px; border:none; background:#f0f9ff;" placeholder="O que você está pensando?">
            <button style="background:#0ea5e9; border:none; color:white; width:45px; border-radius:50%;"><i class="fas fa-paper-plane"></i></button>
        </div>
    </footer>

    <script>
        // Simulação de Dados de IA (Interesses do Usuário)
        let userInterests = ['tecnologia', 'carros', 'viagem'];
        const postsData = [
            { user: "Carlos_Dev", type: "tecnologia", img: "https://images.unsplash.com" },
            { user: "Ferrari_Fan", type: "carros", img: "https://images.unsplash.com" },
            { user: "Mundo_Viagens", type: "viagem", img: "https://images.unsplash.com" },
            { user: "Astro_Gamer", type: "tecnologia", img: "https://images.unsplash.com" }
        ];

        // 1. Ativa Câmera Preview
        navigator.mediaDevices.getUserMedia({ video: true }).then(s => {
            document.getElementById('webcam').srcObject = s;
        });

        // 2. IA de Recomendação: Ordena os posts pelo interesse do usuário
        function generateTimeline() {
            const timeline = document.getElementById('timeline');
            
            // Lógica de IA: Prioriza o que o usuário mais pesquisa
            const recommended = postsData.sort((a, b) => {
                return userInterests.indexOf(b.type) - userInterests.indexOf(a.type);
            });

            recommended.forEach(post => {
                const card = document.createElement('div');
                card.className = 'post-card';
                card.innerHTML = \`
                    <div class="post-img" style="background-image: url('\${post.img}')" onclick="trackInterest('\${post.type}')"></div>
                    <div class="post-info">
                        <div class="user-tag"><i class="fas fa-user-circle"></i> \${post.user}</div>
                        <div style="color: #64748b;"><i class="far fa-heart"></i> <i class="far fa-comment"></i></div>
                    </div>
                \`;
                timeline.appendChild(card);
            });
        }

        // 3. IA Aprendendo: Sempre que clicar em uma foto, a IA entende que você gosta daquele tema
        function trackInterest(type) {
            console.log("IA detectou interesse em:", type);
            userInterests.unshift(type); // Coloca o interesse no topo
            alert("IA ajustada: Agora traremos mais conteúdos de " + type + " para você!");
        }

        generateTimeline();
    </script>
</body>
</html>
    `);
});

app.listen(3000, () => console.log('Ice-Cubo AI Timeline Online!'));
