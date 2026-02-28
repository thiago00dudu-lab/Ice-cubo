<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ICE CUBO</title>
    <style>
        /* Estilo para deixar o site preto e moderno */
        body { background-color: #000; color: #fff; font-family: sans-serif; margin: 0; display: flex; flex-direction: column; align-items: center; height: 100vh; justify-content: center; }
        .card { background: #111; border: 1px solid #333; padding: 25px; border-radius: 20px; width: 85%; max-width: 350px; text-align: center; }
        h1 { font-size: 22px; margin-bottom: 20px; color: #0070f3; }
        input { width: 100%; padding: 12px; margin: 10px 0; border-radius: 8px; border: 1px solid #444; background: #222; color: #fff; box-sizing: border-box; }
        button { width: 100%; padding: 15px; background: #0070f3; color: #fff; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; font-size: 16px; }
        #res { margin-top: 20px; font-size: 14px; word-break: break-all; }
        
        /* Botões de baixo do seu print */
        .menu-footer { position: fixed; bottom: 0; width: 100%; display: flex; justify-content: space-around; padding: 20px; background: #080808; border-top: 1px solid #222; }
        .menu-item { color: #888; font-size: 12px; text-decoration: none; cursor: pointer; }
    </style>
</head>
<body>

    <div class="card">
        <h1>ICE CUBO</h1>
        <p>Preencha para gerar seu Pix</p>
        <input type="email" id="email" placeholder="Seu e-mail">
        <input type="number" id="valor" placeholder="Valor R$ (ex: 5.00)">
        <button onclick="gerar()">GERAR PAGAMENTO</button>
        <div id="res"></div>
    </div>

    <div class="menu-footer">
        <div class="menu-item">Casa</div>
        <div class="menu-item">Câmera</div>
        <div class="menu-item">Perigo</div>
    </div>

    <script>
        async function gerar() {
            const email = document.getElementById('email').value;
            const valor = document.getElementById('valor').value;
            const resDiv = document.getElementById('res');

            if(!email || !valor) return alert("Preencha tudo!");

            resDiv.innerHTML = "Gerando Pix... aguarde.";

            try {
                const response = await fetch('/api/mp_create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, quantia: valor })
                });

                const dados = await response.json();

                if (dados.OK) {
                    resDiv.innerHTML = `
                        <b style="color:#00ff00">Pix Gerado!</b><br><br>
                        <small>Copia o código abaixo:</small><br>
                        <input value="${dados.codigo_qr}" readonly onclick="this.select()">
                        <p style="font-size:10px">Pague no seu banco e o acesso será liberado.</p>
                    `;
                } else {
                    resDiv.innerHTML = "<span style='color:red'>Erro: " + (dados.error?.message || "Falha no servidor") + "</span>";
                }
            } catch (e) {
                resDiv.innerHTML = "Erro de conexão.";
            }
        }
    </script>
</body>
</html>
