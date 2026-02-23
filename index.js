<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Ice-Cubo</title>
  <style>
    body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto; background:#0f172a;color:#fff}
    header{padding:18px 16px;border-bottom:1px solid #23324f}
    .wrap{max-width:900px;margin:0 auto;padding:16px}
    .card{background:#111c33;border:1px solid #223258;border-radius:16px;padding:14px;margin:12px 0}
    button{padding:12px 16px;border:0;border-radius:999px;background:#38bdf8;color:#00121a;font-weight:700;cursor:pointer}
    input{padding:12px 14px;border-radius:12px;border:1px solid #2a3b66;background:#0b1428;color:#fff;width:100%;box-sizing:border-box}
    .row{display:grid;gap:10px}
    .ok{color:#22c55e}
    .muted{opacity:.8}
  </style>
</head>
<body>
  <header>
    <div class="wrap">
      <div style="font-size:20px;font-weight:800">Ice-Cubo</div>
      <div class="muted">Site estático (sem API) — não crasha na Vercel</div>
    </div>
  </header>

  <main class="wrap">
    <div class="card">
      <div style="font-weight:800;margin-bottom:8px">Status</div>
      <div class="ok">✅ Rodando</div>
      <div class="muted" style="margin-top:6px">Se você está vendo isso, seu deploy está OK.</div>
    </div>

    <div class="card">
      <div style="font-weight:800;margin-bottom:8px">Login fake (só pra tela)</div>
      <div class="row">
        <input placeholder="Seu nome" id="nome" />
        <button onclick="entrar()">Entrar</button>
        <div id="msg" class="muted"></div>
      </div>
    </div>
  </main>

  <script>
    function entrar(){
      const nome = document.getElementById('nome').value.trim();
      document.getElementById('msg').textContent = nome ? `Bem-vindo, ${nome}!` : 'Digite um nome.';
    }
  </script>
</body>
</html>
