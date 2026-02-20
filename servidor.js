const express = require('express');
const app = express();

// O HTML que você enviou, agora dentro de uma variável
const html = `
<!DOCTYPE html>
<html>
<head>
  <title>ICE Platform</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial; background:#0f172a; color:white; padding:20px; font-size: 14px; }
    .card { background:#1e293b; padding:15px; margin:10px 0; border-radius:10px; border: 1px solid #334155; }
    button { padding:8px 15px; border:none; border-radius:5px; cursor:pointer; background: #3b82f6; color: white; }
    input { padding:8px; border-radius:5px; border:none; margin:5px 0; width:90%; display:block; }
    .gold { color:#FFD700; }
    table { width:100%; border-collapse: collapse; margin-top:10px; font-size: 12px; }
    th, td { border:1px solid #334155; padding:5px; text-align:center; }
  </style>
</head>
<body>
  <h2 align="center">ICE Platform - ADM</h2>
  <div class="card"><h3 class="gold">OWNER ⭐</h3><p>Fundo: R$ <span id="fund">0.00</span> | App: R$ <span id="appB">0.00</span></p></div>
  <div class="card">
    <input id="un" placeholder="Nome do filiado">
    <input type="number" id="da" placeholder="Valor R$">
    <button onclick="dep()">Depositar</button>
    <button onclick="clr()" style="background:red; float:right">Limpar</button>
  </div>
  <div class="card" style="overflow-x:auto">
    <table>
      <thead><tr><th>Nome</th><th>IPA</th><th>Valor</th><th>B(81%)</th><th>P(4%)</th><th>A(10%)</th><th>E(5%)</th></tr></thead>
      <tbody id="list"></tbody>
    </table>
  </div>
  <script>
    let fld = [], fd = 0, ab = 0;
    const save = () => localStorage.setItem('ice_data', JSON.stringify(fld));
    const upd = () => {
      fd = fld.reduce((s, x) => s + x.e, 0); ab = fld.reduce((s, x) => s + x.a, 0);
      document.getElementById('fund').innerText = fd.toFixed(2);
      document.getElementById('appB').innerText = ab.toFixed(2);
      document.getElementById('list').innerHTML = fld.map(f => \`<tr><td>\${f.n}</td><td style="font-size:8px">\${f.id}</td><td>\${f.v}</td><td>\${f.b}</td><td>\${f.p}</td><td>\${f.a}</td><td>\${f.e}</td></tr>\`).join('');
    };
    function dep() {
      let v = parseFloat(document.getElementById('da').value), n = document.getElementById('un').value;
      if(!n || !v) return alert('Preencha tudo');
      fld.push({n, id: crypto.randomUUID().slice(0,8), v, b:(v*.81).toFixed(2), p:(v*.04).toFixed(2), a:(v*.1).toFixed(2), e:(v*.05).toFixed(2)});
      save(); upd();
    }
    function clr() { if(confirm('Limpar?')) { fld=[]; save(); upd(); } }
    fld = JSON.parse(localStorage.getItem('ice_data')) || []; upd();
  </script>
</body>
</html>
`;

// Rota principal que entrega o HTML acima
app.get('/', (req, res) => res.send(html));

// Porta configurada para o Render ou localhost
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Sistema Online na porta ' + PORT));
