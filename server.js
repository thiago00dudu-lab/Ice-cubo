const express = require("express");
const app = express();

app.use(express.json());

// HTML com Login e Câmera
const html = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ICE LIVE</title>
    <style>
        body { background: #0f172a; color: white; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .card { background: rgba(255,255,255,0.05); padding: 30px; border-radius: 20px; border: 1px solid #00d4ff; text-align: center; width: 90%; max-width: 400px; backdrop-filter: blur(10px); }
        h2 { color: #00d4ff; margin-bottom: 20px; }
        input { width: 100%; padding: 12px; margin: 10px 0; border-radius: 10px; border: none; outline: none; box-sizing: border-box; }
        button { width: 100%; padding: 15px; border-radius: 10px; border: none; background: #00d4ff; color: #0f172a; font-weight: bold; cursor: pointer; font-size: 16px; }
        video { width: 100%; border-radius: 15px; margin-top: 20px; background: #000; display: none; border: 2px solid #00d4ff; }
        #status { margin-top: 10px; font-weight: bold; color: #22c55e; display: none; }
    </style>
</head>
<body>
    <div class="card">
        <div id="login-area">
            <h2>ICE LOGIN</h2>
            <input type="text" id="user" placeholder="Usuário">
            <input type="password" id="pass" placeholder="Senha">
            <button onclick="entrar()">ENTRAR NA LIVE</button>
        </div>

        <div id="live-area" style="display:none">
            <h2 id="msg-live">AO VIVO</h2>
            <video id="video" autoplay playsinline muted></video>
            <div id="status">TRANSMITINDO...</div>
            <button onclick="location.reload()" style="background:#ff4444; margin-top:15px; color:white">ENCERRAR</button>
        </div>
    </div>

    <script>
        async function entrar() {
            const user = document.getElementById('user').value;
            const pass = document.getElementById('pass').value;

            if(user === "admin" && pass === "123") {
                document.getElementById('login-area').style.display = 'none';
                document.getElementById('live-area').style.display = 'block';
                iniciarCamera();
            } else {
                alert("Usuário ou senha incorretos!");
            }
        }

        async function iniciarCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                const videoElement = document.getElementById('video');
                videoElement.srcObject = stream;
                videoElement.style.display = 'block';
                document.getElementById('status').style.display = 'block';
            } catch (err) {
                alert("Erro ao acessar câmera: " + err);
            }
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => {
    res.send(html);
});

module.exports = app;
