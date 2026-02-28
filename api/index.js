export default function handler(req, res) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>ICE CUBO</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <style>
    :root{--bg:#0b1220;--card:#0f1a2e;--mut:#91a4c7;--br:#223255;--a:#38bdf8;--good:#22c55e}
    *{box-sizing:border-box}
    body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;background:
      radial-gradient(1200px 700px at 20% -10%,rgba(56,189,248,.18),transparent 55%),
      radial-gradient(900px 600px at 110% 10%,rgba(34,197,94,.12),transparent 55%),
      var(--bg);color:#fff}
    .wrap{max-width:980px;margin:0 auto;padding:16px 14px 90px}
    .card{background:rgba(15,26,46,.92);border:1px solid var(--br);border-radius:18px;padding:14px 14px 16px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
    .linha{display:flex;gap:10px;align-items:center}
    .entre{justify-content:space-between}
    .muted{color:var(--mut);font-size:12px}
    .hr{height:1px;background:linear-gradient(90deg,transparent,var(--br),transparent);margin:12px 0}
    .row{display:flex;gap:10px;flex-wrap:wrap}
    .inp, textarea{width:100%;background:#0a1326;border:1px solid var(--br);color:#fff;border-radius:14px;padding:12px 12px;outline:none}
    .inp{min-width:240px;flex:1}
    textarea{min-height:92px;resize:vertical}
    .btn{border:1px solid var(--br);background:#0a1326;color:#fff;padding:10px 14px;border-radius:999px;cursor:pointer;display:inline-flex;gap:8px;align-items:center}
    .btn:hover{border-color:#2d4270}
    .btn.good{background:rgba(34,197,94,.15);border-color:rgba(34,197,94,.35)}
    .pill{border:1px solid var(--br);background:#0a1326;border-radius:999px;padding:6px 10px;font-size:12px;display:inline-flex;gap:8px;align-items:center}
    .tag{color:var(--mut)}
    .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    @media (max-width:720px){.grid{grid-template-columns:1fr}}
    .notice{border:1px dashed rgba(56,189,248,.45);background:rgba(56,189,248,.06);border-radius:16px;padding:12px}
    .item{border:1px solid var(--br);background:#0a1326;border-radius:16px;padding:12px}
    .mini{font-size:12px;color:var(--mut)}
  </style>
</head>

<body>
  <div class="wrap">

    <!-- HISTÓRICO -->
    <div class="card" id="panelHistorico">
      <div class="linha entre">
        <div>
          <b><i class="fa-solid fa-clock-rotate-left" style="color:var(--a)"></i> Histórico</b>
          <div class="muted">registros locais</div>
        </div>
        <span class="pill"><span class="tag">itens</span> <b id="histCount">0</b></span>
      </div>
      <div id="hist" style="display:flex;flex-direction:column;gap:10px;margin-top:10px"></div>
    </div>

    <div style="height:12px"></div>

    <!-- TROCAS -->
    <div class="card" id="panelTrocas">
      <div class="linha entre">
        <div>
          <b><i class="fa-solid fa-repeat" style="color:var(--a)"></i> Trocas</b>
          <div class="muted">produto + oferta</div>
        </div>
        <span class="pill"><span class="tag">posts</span> <b id="swapCount">0</b></span>
      </div>

      <div class="hr"></div>

      <div class="row" style="gap:10px">
        <input class="inp" id="swapTitle" placeholder="Nome do produto (ex: Tênis X)"/>
        <input class="inp" id="swapWant" placeholder="Quero em troca (ex: Moletom / BLUE)"/>
      </div>
      <div style="margin-top:10px">
        <textarea id="swapDesc" placeholder="Descrição rápida..."></textarea>
      </div>

      <div class="row" style="margin-top:10px">
        <label class="btn" style="display:inline-flex;align-items:center;gap:8px">
          <i class="fa-solid fa-camera"></i> Foto/Vídeo
          <input id="swapFile" type="file" accept="image/*,video/*" style="display:none">
        </label>
        <button class="btn good" id="swapPost"><i class="fa-solid fa-bolt"></i> Publicar troca</button>
      </div>
      <div class="muted" id="swapPickInfo" style="margin-top:8px">Nenhum arquivo</div>

      <div class="hr"></div>
      <div class="grid" id="swapGrid" style="margin-top:10px"></div>
    </div>

    <div style="height:12px"></div>

    <!-- ADM -->
    <div class="card" id="panelADM">
      <div class="linha entre">
        <div>
          <b><i class="fa-solid fa-shield-halved" style="color:var(--a)"></i> Painel ADM</b>
          <div class="muted">somente ADM</div>
        </div>
        <span class="pill"><span class="tag">usuários</span> <b id="uCount">0</b></span>
      </div>

      <div class="hr"></div>

      <div class="notice">
        <div class="row"><b>⛏️ “Minerar” BLUE (jogo)</b> <span class="muted">local</span></div>
        <div class="muted" style="margin-top:6px">Clique para “quebrar gelo” e ganhe BLUE (demo).</div>
        <div class="row" style="margin-top:10px;align-items:center;gap:10px">
          <div class="pill"><span class="tag">ganho</span> <b id="mineInfo">0</b></div>
          <button class="btn good" id="mineBtn"><i class="fa-solid fa-hammer"></i> Minerar</button>
        </div>
      </div>

      <div class="hr"></div>

      <div class="linha entre">
        <b>Usuários</b>
        <span class="muted">banir / virar MOD</span>
      </div>
      <div id="uList" style="display:flex;flex-direction:column;gap:10px;margin-top:10px"></div>

      <div class="hr"></div>

      <div class="linha entre">
        <b>Pedidos de Saque</b>
        <span class="pill"><span class="tag">itens</span> <b id="wCount">0</b></span>
      </div>
      <div id="wList" style="display:flex;flex-direction:column;gap:10px;margin-top:10px"></div>
    </div>

  </div>

<script>
(() => {
  const $ = (id) => document.getElementById(id);
  const setText = (id, v) => { const el = $(id); if (el) el.textContent = String(v); };

  const K_SWAPS = "ice_swaps_v1";
  const K_HIST  = "ice_hist_v1";

  let swaps = [];
  let hist  = [];
  let mine  = 0;

  try { swaps = JSON.parse(localStorage.getItem(K_SWAPS) || "[]") || []; } catch(e){ swaps = []; }
  try { hist  = JSON.parse(localStorage.getItem(K_HIST)  || "[]") || []; } catch(e){ hist  = []; }

  const swapFile = $("swapFile");
  const swapPickInfo = $("swapPickInfo");
  const swapPost = $("swapPost");
  const swapGrid = $("swapGrid");

  if (swapFile && swapPickInfo) {
    swapFile.addEventListener("change", () => {
      const f = swapFile.files && swapFile.files[0];
      swapPickInfo.textContent = f ? (f.name + " • " + Math.round(f.size/1024) + " KB") : "Nenhum arquivo";
    });
  }

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, (m)=>({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[m]));
  }

  const renderHist = () => {
    const box = $("hist");
    if (!box) return;
    box.innerHTML = hist.slice().reverse().map(h => `
      <div class="item">
        <div class="linha entre">
          <b>${escapeHtml(h.title || "Registro")}</b>
          <span class="mini">${new Date(h.ts||Date.now()).toLocaleString()}</span>
        </div>
        ${h.desc ? `<div class="mini" style="margin-top:6px">${escapeHtml(h.desc)}</div>` : ""}
      </div>
    `).join("");
    setText("histCount", hist.length);
  };

  const renderSwaps = () => {
    if (!swapGrid) return;
    swapGrid.innerHTML = swaps.slice().reverse().map(s => `
      <div class="item">
        <div class="linha entre">
          <b>${escapeHtml(s.title || "Sem título")}</b>
          <span class="mini">${new Date(s.ts||Date.now()).toLocaleDateString()}</span>
        </div>
        <div class="mini" style="margin-top:6px">Quero: <b>${escapeHtml(s.want || "-")}</b></div>
        ${s.desc ? `<div class="mini" style="margin-top:6px">${escapeHtml(s.desc)}</div>` : ""}
        ${s.fileName ? `<div class="mini" style="margin-top:8px"><i class="fa-solid fa-paperclip"></i> ${escapeHtml(s.fileName)}</div>` : ""}
      </div>
    `).join("");
    setText("swapCount", swaps.length);
  };

  if (swapPost) {
    swapPost.addEventListener("click", () => {
      const title = ($("swapTitle")?.value || "").trim();
      const want  = ($("swapWant")?.value  || "").trim();
      const desc  = ($("swapDesc")?.value  || "").trim();
      const file  = swapFile?.files?.[0];

      if (!title || !want) {
        alert("Preenche o Nome do produto e o Quero em troca 😉");
        return;
      }

      swaps.push({
        id: (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now())),
        ts: Date.now(),
        title, want, desc,
        fileName: file ? file.name : ""
      });

      localStorage.setItem(K_SWAPS, JSON.stringify(swaps));

      hist.push({ ts: Date.now(), title: "Troca publicada", desc: title + " → " + want });
      localStorage.setItem(K_HIST, JSON.stringify(hist));

      if ($("swapTitle")) $("swapTitle").value = "";
      if ($("swapWant"))  $("swapWant").value  = "";
      if ($("swapDesc"))  $("swapDesc").value  = "";
      if (swapFile) swapFile.value = "";
      if (swapPickInfo) swapPickInfo.textContent = "Nenhum arquivo";

      renderSwaps();
      renderHist();
    });
  }

  const mineBtn = $("mineBtn");
  if (mineBtn) {
    mineBtn.addEventListener("click", () => {
      const gain = 1 + Math.floor(Math.random() * 7);
      mine += gain;
      setText("mineInfo", gain);
    });
  }

  const setList = (id, html, countId, count) => {
    const el = $(id);
    if (el) el.innerHTML = html;
    if (countId) setText(countId, count);
  };

  setList("uList", [
    {name:"Jessica", role:"ADM"},
    {name:"IceUser_01", role:"USER"},
    {name:"IceUser_02", role:"MOD"}
  ].map(u => `
    <div class="item linha entre">
      <div><b>${escapeHtml(u.name)}</b><div class="mini">${escapeHtml(u.role)}</div></div>
      <div class="row" style="gap:8px">
        <button class="btn" onclick="alert('Demo: banir')"><i class="fa-solid fa-ban"></i></button>
        <button class="btn" onclick="alert('Demo: virar MOD')"><i class="fa-solid fa-star"></i></button>
      </div>
    </div>
  `).join(""), "uCount", 3);

  setList("wList", [
    {user:"IceUser_01", amount:"50 BLUE"},
    {user:"IceUser_02", amount:"20 BLUE"}
  ].map(w => `
    <div class="item linha entre">
      <div><b>${escapeHtml(w.user)}</b><div class="mini">${escapeHtml(w.amount)}</div></div>
      <button class="btn good" onclick="alert('Demo: aprovado')"><i class="fa-solid fa-check"></i> Aprovar</button>
    </div>
  `).join(""), "wCount", 2);

  renderSwaps();
  renderHist();
})();
</script>

</body>
</html>`);
}
