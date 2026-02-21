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
        
        /* Painel de Métricas ADM (Modal) */
        #adm-panel { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 2000; color: white; padding: 20px; overflow-y: auto; }
        .stat-card { background: #1e3a8a; padding: 15px; border-radius: 15px; margin-bottom: 10px; border-left: 5px solid #fbbf24; }

        /* Tela de Login */
        #login-screen { position: fixed; inset: 0; background: #1e3a8a; z-index: 3000; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .login-card { background: white; padding: 30px; border-radius: 30px; width: 80%; max-width: 300px; }
        .login-card input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 10px; }
        .login-card button { width: 100%; padding: 12px; background: #1e3a8a; color: white; border: none; border-radius: 10px; font-weight: 900; }

        /* Palco e Feed */
        .main-stage { height: 35vh; background: #000; position: relative; display: flex; align-items: center; justify-content: center; border-radius: 0 0 40px 40px; overflow: hidden; }
        .feed-section { flex: 1; overflow-y: auto; padding: 15px; }
        .feed-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding-bottom: 30px; }
        .feed-item { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); text-align: center; padding-bottom: 10px; }

        /* Estrelas */
        .star-master { color: #fbbf24; display: block; font-size: 18px; }
        .star-mod { color: #3b82f6; display: block; font-size: 16px; }

        /* Rodapé Restaurado */
        footer { height: 100px; background: #fff; display: flex; justify-content: space-around; align-items: center; border-top: 3px solid #1e3a8a; padding-bottom: env(safe-area-inset-bottom); }
        .nav-btn { flex: 1; display: flex; flex-direction: column; align-items: center; border: none; background: none; color: #1e3a8a; font-size: 24px; cursor: pointer; }
        .nav-btn span { font-size: 9px; font-weight: 900; margin-top: 4px; text-transform: uppercase; }
        
        .btn-trade { color: #059669; }
        .btn-danger { color: #ef4444; }
        .btn-adm { color: #fbbf24; font-weight: bold; display: none; } /* Botão ADM oculto por padrão */
        
        #file-input { display: none; }
    </style>
</head>
<body>

    <!-- Painel de Monitoramento ADM -->
    <div id="adm-panel">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2>📊 Relatório Master</h2>
            <button onclick="closeAdm()" style="background:red; color:white; border:none; border-radius:50%; width:30px; height:30px;">X</button>
        </div>
        <div class="stat-card">
            <h4>Moderadores Online</h4>
            <p>Frequência: 98% (Entram todo dia)</p>
            <p>Média: 6h/dia no site</p>
        </div>
        <div class="stat-card">
            <h4>Usuários Comuns</h4>
            <p>Tempo de Permanência: 45% do tempo total</p>
            <p>Atividade: Alta (Trocas ativas)</p>
        </div>
    </div>

    <!-- Login -->
    <div id="login-screen">
        <div class="login-card">
            <h3 style="text-align: center; color: #1e3a8a;">Acesso Ice-Cubo</h3>
            <input type="text" id="user" placeholder="Usuário">
            <input type="password" id="pass" placeholder="Senha">
            <button onclick="login()">ENTRAR</button>
        </div>
    </div>

    <div class="main-stage" id="stage">
        <div id="placeholder" style="color:white">
            <i class="fas fa-cube fa-3x" style="color: #3b82f6;"></i>
            <p>SISTEMA MASTER ATIVO</p>
        </div>
        <video id="webcam" style="width: 100%; height: 100%; object-fit: cover; display: none;" autoplay playsinline></video>
    </div>

    <div class="feed-section">
        <h4 id="feed-title" style="color: #1e3a8a;">✨ Sugestões para você</h4>
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

        <!-- BOTÃO ADM (VISÍVEL SÓ PARA VOCÊ) -->
        <button class="nav-btn btn-adm" id="btn-adm" onclick="openAdm()">
            <i class="fas fa-crown"></i>
            <span>ADM</span>
        </button>

        <button class="nav-btn btn-trade">
            <i class="fas fa-handshake"></i>
            <span>TROCAS</span>
        </button>

        <button class="nav-btn btn-danger">
            <i class="fas fa-skull-crossbones"></i>
            <span>PERIGO</span>
        </button>

        <div class="nav-btn">
            <div id="user-star"></div>
            <span id="user-name">THIAGO</span>
        </div>
    </footer>

    <script>
        let isAdmin = false;

        function login() {
            const u = document.getElementById('user').value;
            const p = document.getElementById('pass').value;

            if(u === 'admin' && p === '123') {
                isAdmin = true;
                document.getElementById('btn-adm').style.display = 'flex'; // Libera botão ADM
                document.getElementById('user-star').innerHTML = '<i class="fas fa-star star-master"></i>';
                alert("Mestre Thiago Detectado: Acesso Total Liberado.");
            }
            document.getElementById('login-screen').style.display = 'none';
            loadUsers();
        }

        function openAdm() { document.getElementById('adm-panel').style.display = 'block'; }
        function closeAdm() { document.getElementById('adm-panel').style.display = 'none'; }

        function loadUsers() {
            const users = [
                { name: 'Ana_Mod', role: 'mod' },
                { name: 'User_01', role: 'user' }
            ];
            const feed = document.getElementById('feed');
            users.forEach(u => {
                const div = document.createElement('div');
                div.className = 'feed-item';
                div.innerHTML = \`
                    <div style="height:80px; background:#eee; display:flex; align-items:center; justify-content:center;"><i class="fas fa-user"></i></div>
                    \${u.role === 'mod' ? '<i class="fas fa-star star-mod"></i>' : ''}
                    <div style="font-size:10px; font-weight:900;">\${u.name}</div>
                    \${isAdmin ? '<button onclick="promote(this)" style="font-size:8px;">PROMOVER</button>' : ''}
                \`;
                feed.appendChild(div);
            });
        }

        function promote(btn) {
            btn.parentElement.insertAdjacentHTML('afterbegin', '<i class="fas fa-star star-mod"></i>');
        }

        async function toggleLive() {
            const v = document.getElementById('webcam');
            if(v.style.display === 'none') {
                const s = await navigator.mediaDevices.getUserMedia({video:true});
                v.srcObject = s; v.style.display = 'block';
                document.getElementById('placeholder').style.display = 'none';
            } else {
                v.style.display = 'none'; document.getElementById('placeholder').style.display = 'block';
            }
        }
    </script>
</body>
</html>
    `);
});

app.listen(3000, () => console.log('Ice-Cubo Safe Master Ativado!'));
