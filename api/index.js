<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ICE-CUBO | Carteira</title>
    <style>
        :root {
            --bg: #0a0a0a;
            --card-bg: #111111;
            --border: #333333;
            --accent: #0070f3;
            --text-muted: #888;
        }

        body { 
            background-color: var(--bg); 
            color: #fff; 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
            margin: 0; padding: 20px;
            padding-bottom: 80px;
        }

        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .badge { background: #002d5e; color: #0070f3; padding: 4px 10px; border-radius: 5px; font-size: 12px; font-weight: bold; }

        .card { 
            background: var(--card-bg); 
            border: 1px solid var(--border); 
            border-radius: 8px; 
            padding: 20px; 
            margin-bottom: 20px; 
        }

        .alert { background: rgba(255, 165, 0, 0.1); border: 1px solid orange; color: orange; padding: 10px; border-radius: 5px; font-size: 13px; margin-bottom: 15px; }

        h2 { font-size: 16px; margin-top: 0; display: flex; align-items: center; gap: 8px; }
        
        input { 
            width: 100%; padding: 12px; margin: 10px 0; 
            border-radius: 6px; border: 1px solid var(--border); 
            background: #1a1a1a; color: #fff; box-sizing: border-box; 
        }

        .btn-primary { 
            width: 100%; padding: 12px; background: #0070f3; color: #fff; 
            border: none; border-radius: 6px; font-weight: bold; cursor: pointer; 
        }

        /* Tabela de Histórico */
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
        th { text-align: left; color: var(--text-muted); padding-bottom: 10px; border-bottom: 1px solid var(--border); }
        td { padding: 12px 0; border-bottom: 1px solid #222; }
        .type { font-weight: bold; display: block; }
        .date { color: var(--text-muted); font-size: 11px; }
        .val { text-align: right; font-weight: bold; }

        /* Menu Inferior */
        .footer-nav { 
            position: fixed; bottom: 0; left: 0; width: 100%; 
            background: #000; border-top: 1px solid var(--border); 
            display: flex; justify-content: space-around; padding: 15px 0; 
        }
        .nav-item { color: var(--text-muted); font-size: 10px; text-align: center; text-decoration: none; }
        .nav-item.active { color: var(--accent); }
    </style>
</head>
<body>

    <div class="header">
        <span>ICE-CUBO</span>
        <div class="badge">0 BLUE ADM ★</div>
    </div>

    <div class="card">
        <h2>💳 Carteira</h2>
        <div class="alert">
            <strong>⚠️ Importante</strong><br>
            Depósito real exige MP_ACCESS_TOKEN. Aqui é apenas o modo demo.
        </div>

        <label>Depósito</label>
        <input type="number" id="valor" placeholder="10">
        <button class="btn-primary" onclick="gerarPix()">⚡ Depósito rápido</button>
        <div id="status"></div>
    </div>

    <div class="card">
        <h2>📜 Histórico</h2>
        <table>
            <thead>
                <tr>
                    <th>ATIVIDADE</th>
                    <th style="text-align: right;">VALOR</th>
                </tr>
            </thead>
            <tbody id="historico">
                <tr>
                    <td><span class="type">DEP</span><span class="date">28/02/2026, 00:13</span></td>
                    <td class="val" style="color: #00ff00;">+10 BLUE</td>
                </tr>
                <tr>
                    <td><span class="type">SAQUE</span><span class="date">27/02/2026, 22:45</span></td>
                    <td class="val" style="color: #ff4444;">-10 BLUE</td>
                </tr>
            </tbody>
        </table>
    </div>

    <nav class="footer-nav">
        <a href="#" class="nav-item">🏠<br>HOME</a>
        <a href="#" class="nav-item">👤<br>PERFIL</a>
        <a href="#" class="nav-item active">👛<br>CARTEIRA</a>
        <a href="#" class="nav-item">🔄<br>TROCAS</a>
    </nav>

    <script>
        async function gerarPix() {
            const valor = document.getElementById('valor').value;
            const status = document.getElementById('status');
            
            if(!valor) return alert("Digite um valor");

            status.innerHTML = "<p style='font-size:12px; color:gray;'>Processando...</p>";

            try {
                const res = await fetch('/api/mp_create', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ quantia: valor })
                });

                // Verificação de erro para evitar o "Unexpected Token <"
                if (!res.ok) throw new Error("Erro no servidor (404 ou 500)");

                const data = await res.json();
                status.innerHTML = `<input value="${data.codigo_qr}" readonly onclick="this.select()" style="border-color: #00ff00">`;
            } catch (err) {
                status.innerHTML = `<p style="color:red; font-size:12px;">Erro: Verifique sua rota /api/mp_create</p>`;
            }
        }
    </script>
</body>
</html>
                
