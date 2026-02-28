<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ICE CUBO</title>
    <style>
        /* RESET E CORES PRINCIPAIS */
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { background-color: #000; color: #fff; display: flex; flex-direction: column; min-height: 100vh; padding: 20px; }

        /* CABEÇALHO */
        header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 1px solid #222; margin-bottom: 20px; }
        .logo { font-size: 18px; font-weight: bold; color: #0070f3; }
        .badge { background: #111; border: 1px solid #e3b341; color: #e3b341; padding: 4px 8px; border-radius: 5px; font-size: 11px; }

        /* CARDS */
        .card { background: #111; border: 1px solid #333; border-radius: 12px; padding: 20px; margin-bottom: 15px; }
        .card-title { color: #0070f3; font-size: 14px; font-weight: bold; margin-bottom: 15px; display: block; }
        
        /* FORMULÁRIO */
        input { width: 100%; padding: 12px; margin-bottom: 10px; border-radius: 8px; border: 1px solid #444; background: #000; color: #fff; }
        button { width: 100%; padding: 14px; background: #0070f3; color: #fff; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; transition: 0.2s; }
        button:active { transform: scale(0.98); }

        /* TABELA DE HISTÓRICO */
        .hist-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #222; font-size: 13px; }
        .hist-info span { display: block; color: #888; font-size: 10px; }
        .val-pos { color: #00ff00; font-weight: bold; }

        /* MENU INFERIOR FIXO */
        .footer-nav { position: fixed; bottom: 0; left: 0; width: 100%; background: #080808; border-top: 1px solid #222; display: flex; justify-content: space-around; padding: 15px 0; }
        .nav-item { text-align: center; color: #888; font-size: 10px; text-decoration: none; }
        .nav-item.active { color: #0070f3; }
        .nav-icon { font-size: 20px; display: block; margin-bottom: 3px; }
    </style>
</head>
<body>

    <header>
        <div class="logo">ICE CUBO</div>
        <div class="badge">0 BLUE ADM ★</div>
    </header>

    <!-- DEPÓSITO -->
    <div class="card">
        <span class="card-title">📥 DEPÓSITO RÁPIDO</span>
        <input type="number" id="valor" placeholder="Valor em R$ (ex: 10)">
        <button onclick="gerar()">GERAR PIX</button>
        <div id="res" style="margin-top:15px; text-align:center; font-size:12px;"></div>
    </div>

    <!-- HISTÓRICO -->
    <div class="card">
        <span class="card-title">📜 HISTÓRICO RECENTE</span>
        <div class="hist-row">
            <div class="hist-info">DEPÓSITO <span>28/02/2026</span></div>
            <div class="val-pos">+10 BLUE</div>
        </div>
        <div class="hist-row">
            <div class="hist-info">POST ADM <span>27/02/2026</span></div>
            <div>INFO</div>
        </div>
    </div>

    <!-- BARRA DE NAVEGAÇÃO -->
    <nav class="footer-nav">
        <a href="#" class="nav-item"> <span class="nav-icon">🏠</span> CASA </a>
        <a href="#" class="nav-item"> <span class="nav-icon">📷</span> CÂMERA </a>
        <a href="#" class="nav-item active"> <span class="nav-icon">💳</span> CARTEIRA </a>
        <a href="#" class="nav-item"> <span class="nav-icon">⚠️</span> PERIGO </a>
    </nav>

    <script>
        async function gerar() {
            const valor = document.getElementById('valor').value;
            const resDiv = document.getElementById('res');
            if(!valor) return alert("Digite um valor!");

            resDiv.innerHTML = "Gerando Pix...";

            try {
                const response = await fetch('/api/mp_create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantia: valor })
                });

                if (!response.ok) throw new Error();
                const dados = await response.json();

                resDiv.innerHTML = `
                    <p style="color:#00ff00; margin-bottom:5px;">Pix Gerado com Sucesso!</p>
                    <input value="${dados.codigo_qr}" readonly onclick="this.select()" style="border-color:#0070f3">
                `;
            } catch (e) {
                resDiv.innerHTML = "<span style='color:red'>Erro na API. Verifique os logs.</span>";
            }
        }
    </script>

</body>
</html>
