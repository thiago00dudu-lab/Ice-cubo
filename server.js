const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Interface HTML com Design "Cubo de Gelo"
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { background: #e0f7fa; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial; }
        .ice-card { 
            background: rgba(255, 255, 255, 0.4); 
            backdrop-filter: blur(10px); 
            border: 1px solid rgba(255, 255, 255, 0.6); 
            padding: 30px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: center;
        }
        button { 
            background: #00bcd4; color: white; border: none; padding: 12px 25px; 
            border-radius: 8px; cursor: pointer; margin: 10px; font-weight: bold; transition: 0.3s;
        }
        button:disabled { background: #b2ebf2; cursor: not-allowed; }
    </style>
</head>
<body>
    <div class="ice-card">
        <h2 style="color: #00838f;">Cubo de Gelo 🧊</h2>
        <button onclick="login()">Fazer Login</button>
        <hr>
        <button class="menu-btn" onclick="acessar()" disabled>Entrar na Interface</button>
    </div>

    <script>
        let logado = false;
        function login() {
            logado = true;
            document.querySelector('.menu-btn').disabled = false;
            alert("Login OK! Acesso liberado.");
        }
        function acessar() {
            if(logado) alert("Bem-vindo à interface!");
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(htmlContent));
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
