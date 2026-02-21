const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable-no">
    <title>Ice-Cubo Safe Master - Thiago Soste</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com">
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background: #f0f9ff; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
        
        /* Sistema de Login */
        #login-screen { position: fixed; inset: 0; background: #1e3a8a; z-index: 1000; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; }
        .login-card { background: white; padding: 30px; border-radius: 30px; width: 80%; max-width: 300px; color: #1e3a8a; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        .login-card input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 10px; box-sizing: border-box; }
        .login-card button { width: 100%; padding: 12px; background: #1e3a8a; color: white; border: none; border-radius: 10px; font-weight: 900; }

        /* Estrelas de Poder */
        .badge { display: block; font-size: 14px; margin-bottom: -2px; }
        .star-master { color: #fbbf24; text-shadow: 0 0 5px rgba(251, 191, 36, 0.5); } /* Estrela Dourada */
        .star-mod { color: #3b82f6; } /* Estrela Azul */

        /* Interface */
        .main-stage { height: 35vh; background: #000; position: relative; display: flex; align-items: center; justify-content: center; color: white; border-radius: 0 0 40px 40px; overflow: hidden; }
        .feed-section { flex: 1; overflow-y: auto; padding: 15px; }
        .feed-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding-bottom: 30px; }
        .feed-item { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); position: relative; }
        
        /* Rodapé */
        footer { height: 100px; background: #fff; display: flex; justify-content: space-around; align-items: center; border-top: 3px solid #1e3a8a; padding-bottom: env(safe-area-inset-bottom); }
        .nav-btn { flex: 1; display: flex; flex-direction: column; align-items: center; border: none; background: none; color: #1e3a8a; }
        .nav-btn i { font-size: 26px; }
        .nav-btn span { font-size: 9px; font-weight: 900; margin-top: 4px; }
        
        .btn-trade { color: #059669; }
        .btn-danger { color: #ef4444; }
        #file-input { display: none; }
    </style>
</head>
<body>

    <!-- Tela de Login -->
    <div id="login-screen">
        <i class="fas fa-cube fa-4x" style="margin-bottom: 20px;"></i>
        <div class="login-card">
            <h3 style="text-align: center; margin-top: 0;">Acesso Ice-Cubo</h3>
            <input type="text" id="user" placeholder="Nome">
            <input type="password" id="pass" placeholder="Senha">
            <button onclick="login()">ENTRAR</button>
        </div>
    </div>

    <div class="main-stage">
        <div id="placeholder" style="text-align: center;">
            <i class="fas fa-shield-alt fa-3x" style="color: #3b82f6;"></i>
            <p>SISTEMA SEGURO ATIVO</p>
        </div>
        <video id="webcam" style="width: 100%; height: 100%; object-fit: cover; display: none;" autoplay playsinline></video>
    </div>

    <div class="feed-section">
        <h4 id="welcome-msg" style="color: #1e3a8a; margin-bottom: 15px; font-weight: 900;">Painel de Controle</h4>
        <div class="feed-grid" id="feed"></div>
    </div>

    <footer>
        <label for="file-input" class="nav-btn">
            <i class="fas fa-images"></i>
            <span>ÁLBUM</span>
        </label>
        <input type="file" id="file-input" accept="image/*" onchange="handleUpload(event)">

        <button class="nav-btn" onclick="toggleLive()">
            <i class="fas fa-camera"></i>
            <span>CÂMERA</span>
        </button>

        <button class="nav-btn btn-trade">
            <i class="fas fa-handshake"></i>
            <span>TROCAS</span>
        </button>

        <button class="nav-btn btn-danger">
            <i class="fas fa-skull-crossbones"></i>
            <span>PERIGO</span>
        </button>

        <div class="nav-btn" id="my-profile">
            <div id="my-star"></div>
            <span id="my-name">USUÁRIO</span>
        </div>
    </footer>

    <script>
        let currentUser = null;

        function login() {
            const u = document.getElementById('user').value;
            const p = document.getElementById('pass').value;

            if(u === 'admin' && p === '123') {
                currentUser = { name: 'Thiago Soste', role: 'master' };
            } else {
                currentUser = { name: u || 'Visitante', role: 'user' };
            }

            document.getElementById('login-screen').style.display = 'none';
            setupProfile();
            loadMockUsers();
        }

        function setupProfile() {
            const nameSpan = document.getElementById('my-name');
            const starDiv = document.getElementById('my-star');
            nameSpan.innerText = currentUser.name.toUpperCase();

            if(currentUser.role === 'master') {
                starDiv.innerHTML = '<i class="fas fa-star star-master badge"></i>';
                alert("Bem-vindo, Mestre. Você é imune e tem controle total.");
            }
        }

        function loadMockUsers() {
            const users = [
                { name: 'Carlos_User', role: 'user' },
                { name: 'Ana_Mod', role: 'mod' }
            ];
            users.forEach(u => addUserToFeed(u));
        }

        function addUserToFeed(user) {
            const feed = document.getElementById('feed');
            const div = document.createElement('div');
            div.className = 'feed-item';
            
            let star = '';
            if(user.role === 'mod') star = '<i class="fas fa-star star-mod badge"></i>';
            
            div.innerHTML = \`
                <div style="height: 80px; background: #ddd; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-user fa-2x" style="color: #999"></i>
                </div>
                <div style="padding: 10px; text-align: center;">
                    \${star}
                    <div style="font-size: 10px; font-weight: 900; color: #1e3a8a;">\${user.name}</div>
                    \${currentUser.role === 'master' ? '<button onclick="promote(this)" style="font-size: 8px; margin-top: 5px;">PROMOVER</button>' : ''}
                </div>
            \`;
            feed.appendChild(div);
        }

        function promote(btn) {
            const parent = btn.parentElement;
            if(!parent.querySelector('.star-mod')) {
                parent.insertAdjacentHTML('afterbegin', '<i class="fas fa-star star-mod badge"></i>');
                alert("Usuário elevado a MODERADOR (Estrela Azul)");
            }
        }

        async function toggleLive() {
            const video = document.getElementById('webcam');
            if(video.style.display === 'none') {
                const stream = await navigator.mediaDevices.getUserMedia({video: true});
                video.srcObject = stream;
                video.style.display = 'block';
                document.getElementById('placeholder').style.display = 'none';
            } else {
                video.style.display = 'none';
                document.getElementById('placeholder').style.display = 'block';
            }
        }
    </script>
</body>
</html>
    `);
});

app.listen(3000, () => console.log('Ice-Cubo Master System Online!'));
