const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// --- CONFIGURAÇÕES ---
const ASAAS_KEY = 'SUA_CHAVE_AQUI'; // Coloque sua chave do Asaas
const BASE_URL = 'https://sandbox.asaas.com';

// --- INTERFACE (LOGIN + PAINEL INTERNO) ---
const htmlPagina = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; height: 100vh; background: linear-gradient(135deg, #001f3f, #0074D9); font-family: 'Segoe UI', sans-serif; overflow: hidden; }
        .glass { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); color: white; }
        
        /* TELA DE LOGIN */
        #login-screen { height: 100vh; display: flex; justify-content: center; align-items: center; }
        .login-box { width: 320px; padding: 40px; text-align: center; }
        input { width: 100%; padding: 12px; margin: 10px 0; background: rgba(255,255,255,0.2); border: none; border-radius: 8px; color: white; box-sizing: border-box; }
        button { width: 100%; padding: 12px; cursor: pointer; background: #00d4ff; border: none; border-radius: 8px; color: #001f3f; font-weight: bold; margin-top: 10px; }
        
        /* PAINEL INTERNO (ICE CLUB) */
        #main-app { display: none; height: 100vh; padding: 20px; display: flex; gap: 20px; box-sizing: border-box; }
        .sidebar { width: 250px; height: 100%; overflow-y: auto; padding: 15px; }
        .profile-list { display: flex; flex-direction: column; gap: 10px; }
        .user-card { padding: 10px; background: rgba(255,255,255,0.1); border-radius: 10px; display: flex; align-items: center; gap: 10px; }
        .main-grid { flex: 1; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; overflow-y: auto; padding-right: 10px; }
        .avatar { width: 40px; height: 40px; border-radius: 50%; background: #00d4ff; }
    </style>
</head>
<body>

    <!-- TELA 1: LOGIN -->
    <div id="login-screen">
        <div class="login-box glass">
            <h1 style="color: #00d4ff;">ICE CLUB</h1>
            <p>Acesse a interface de gelo</p>
            <input type="text" id="nome" placeholder="Seu Nome Completo">
            <input type="email" id="email" placeholder="Seu e-mail">
            <button onclick="cadastrarEPagar()">Pagar e Entrar</button>
        </div>
    </div>

    <!-- TELA 2: INTERFACE INTERNA -->
    <div id="main-app">
        <div class="sidebar glass">
            <h3>Usuários Online</h3>
            <div class="profile-list" id="sidebar-users"></div>
        </div>
        <div class="main-grid" id="main-grid-users"></div>
    </div>

    <script>
        async function cadastrarEPagar() {
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            if(!nome || !email) return alert('Preencha tudo!');

            const res = await fetch('/gerar-acesso', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ nome, email })
            });
            const data = await res.json();
            
            if(data.url) {
                alert('Pague o Pix para liberar seu acesso!');
                window.location.href = data.url;
            } else {
                alert('Erro ao processar. Verifique os logs.');
            }
        }

        // Simulação de entrada (Para testes, chame entrarNoIceClub() no console)
        function entrarNoIceClub() {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('main-app').style.display = 'flex';
            carregarUsuarios();
        }

        function carregarUsuarios() {
            const containerSidebar = document.getElementById('sidebar-users');
            const containerGrid = document.getElementById('main-grid-users');
            for(let i=1; i<=12; i++) {
                const card = '<div class="user-card"><div class="avatar"></div> Usuário '+i+'</div>';
                const gridCard = '<div class="glass" style="height: 150px; display: flex; flex-direction: column; align-items: center; justify-content: center;"><div class="avatar" style="width:60px; height:60px;"></div>Perfil '+i+'</div>';
                containerSidebar.innerHTML += card;
                containerGrid.innerHTML += gridCard;
            }
        }
    </script>
</body>
</html>
`;

// --- ROTAS DO SERVIDOR ---
app.get('/', (req, res) => res.send(htmlPagina));

app.post('/gerar-acesso', async (req, res) => {
    const { nome, email } = req.body;
    try {
        // 1. CRIA O CLIENTE NO ASAAS
        const cliente = await axios.post(`${BASE_URL}/customers`, 
            { name: nome, email: email }, 
            { headers: { 'access_token': ASAAS_KEY } }
        );

        // 2. GERA O PAGAMENTO PIX
        const pagamento = await axios.post(`${BASE_URL}/payments`, {
            customer: cliente.data.id,
            billingType: "PIX",
            value: 15.00, // Valor do acesso
            dueDate: new Date().toISOString().split('T')[0]
        }, { headers: { 'access_token': ASAAS_KEY } });

        res.json({ url: pagamento.data.invoiceUrl });
    } catch (e) {
        console.error(e.response ? e.response.data : e.message);
        res.status(500).json({ erro: 'Falha na integração' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('Ice Club Rodando!'));
