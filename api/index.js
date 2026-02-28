<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ICE CUBO</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
:root{--bg:#071022;--card:rgba(15,26,46,.92);--mut:#91a4c7;--br:#223255;--a:#38bdf8;--good:#22c55e}
*{box-sizing:border-box}
body{
  margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;color:#fff;
  background:
    radial-gradient(1200px 700px at 20% -10%,rgba(56,189,248,.18),transparent 55%),
    radial-gradient(900px 600px at 110% 10%,rgba(34,197,94,.12),transparent 55%),
    var(--bg);
}
.wrap{max-width:980px;margin:0 auto;padding:16px 14px 90px}
.card{background:var(--card);border:1px solid var(--br);border-radius:22px;padding:14px 14px 16px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
.linha{display:flex;gap:10px;align-items:center}
.entre{justify-content:space-between}
.muted{color:var(--mut);font-size:12px}
.hr{height:1px;background:linear-gradient(90deg,transparent,var(--br),transparent);margin:12px 0}
.row{display:flex;gap:10px;flex-wrap:wrap}
.inp, textarea{
  width:100%;background:#0a1326;border:1px solid var(--br);color:#fff;
  border-radius:16px;padding:12px 12px;outline:none
}
.inp{min-width:220px;flex:1}
textarea{min-height:92px;resize:vertical}
.btn{
  border:1px solid var(--br);background:#0a1326;color:#fff;
  padding:10px 14px;border-radius:999px;cursor:pointer;
  display:inline-flex;gap:8px;align-items:center
}
.btn:hover{border-color:#2d4270}
.btn.good{background:rgba(34,197,94,.15);border-color:rgba(34,197,94,.35)}
.pill{border:1px solid var(--br);background:#0a1326;border-radius:999px;padding:6px 10px;font-size:12px;display:inline-flex;gap:8px;align-items:center}
.tag{color:var(--mut)}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
@media (max-width:720px){.grid{grid-template-columns:1fr}}
.notice{border:1px dashed rgba(56,189,248,.45);background:rgba(56,189,248,.06);border-radius:18px;padding:12px}
.item{border:1px solid var(--br);background:#0a1326;border-radius:18px;padding:12px}
.mini{font-size:12px;color:var(--mut)}
.topTabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.tab{padding:10px 12px;border-radius:999px;border:1px solid var(--br);background:#0a1326;color:#fff;cursor:pointer}
.tab.active{border-color:rgba(56,189,248,.7);box-shadow:0 0 0 2px rgba(56,189,248,.12) inset}
.preview{margin-top:10px;border-radius:16px;overflow:hidden;border:1px solid var(--br)}
.preview img,.preview video{width:100%;display:block;max-height:260px;object-fit:cover;background:#000}
.smallBtn{padding:8px 10px;border-radius:999px}
</style>
</head>

<body>
<div class="wrap">

  <!-- Tabs -->
  <div class="topTabs">
    <button class="tab active" data-tab="trocas"><i class="fa-solid fa-repeat"></i> Trocas</button>
    <button class="tab" data-tab="historico"><i class="fa-solid fa-clock-rotate-left"></i> Histórico</button>
    <button class="tab" data-tab="adm"><i class="fa-solid fa-shield-halved"></i> ADM</button>
  </div>

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

    <div class="row">
      <input class="inp" id="swapTitle" placeholder="Nome do produto (ex: Tênis X)">
      <input class="inp" id="swapWant" placeholder="Quero em troca (ex: Moletom / BLUE)">
    </div>

    <div style="margin-top:10px">
      <textarea id="swapDesc" placeholder="Descrição rápida..."></textarea>
    </div>

    <div class="row" style="margin-top:10px;align-items:center">
      <label class="btn">
        <i class="fa-solid fa-camera"></i> Foto/Vídeo
        <input id="swapFile" type="file" accept="image/*,video/*" style="display:none">
      </label>
      <button class="btn good" id="swapPost"><i class="fa-solid fa-bolt"></i> Publicar</button>
      <button class="btn smallBtn" id="swapClear"><i class="fa-solid fa-trash"></i></button>
    </div>

    <div class="muted" id="swapPickInfo" style="margin-top:8px">Nenhum arquivo</div>
    <div id="swapPreview"></div>

    <div class="hr"></div>
    <div class="grid" id="swapGrid"></div>
  </div>

  <!-- HISTÓRICO -->
  <div class="card" id="panelHistorico" style="display:none;margin-top:12px">
    <div class="linha entre">
      <div>
        <b><i class="fa-solid fa-clock-rotate-left" style="color:var(--a)"></i> Histórico</b>
        <div class="muted">tudo que você fez</div>
      </div>
      <span class="pill"><span class="tag">itens</span> <b id="histCount">0</b></span>
    </div>
    <div class="hr"></div>
    <div id="hist" style="display:flex;flex-direction:column;gap:10px"></div>
    <div class="row" style="margin-top:10px">
      <button class="btn" id="histClear"><i class="fa-solid fa-trash"></i> Limpar histórico</button>
    </div>
  </div>

  <!-- ADM -->
  <div class="card" id="panelADM" style="display:none;margin-top:12px">
    <div class="linha entre">
      <div>
        <b><i class="fa-solid fa-shield-halved" style="color:var(--a)"></i> Painel ADM</b>
        <div class="muted">demo local (celular)</div>
      </div>
      <span class="pill"><span class="tag">usuários</span> <b id="uCount">3</b></span>
    </div>

    <div class="hr"></div>

    <div class="notice">
      <div class="row"><b>⛏️ “Minerar” BLUE</b> <span class="muted">local</span></div>
      <div class="muted" style="margin-top:6px">Clique para “quebrar gelo” e ganhar BLUE (demo).</div>
      <div class="row" style="margin-top:10px;align-items:center;gap:10px">
        <div class="pill"><span class="tag">ganho</span> <b id="mineInfo">0</b></div>
        <div class="pill"><span class="tag">saldo</span> <b id="mineTotal">0</b></div>
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
      <span class="pill"><span class="tag">itens</span> <b id="wCount">2</b></span>
    </div>
    <div id="wList" style="display:flex;flex-direction:column;gap:10px;margin-top:10px"></div>
  </div>

</div>

<script>
(() => {
  const $ = (id) => document.getElementById(id);
  const setText = (id, v) => { const el=$(id); if(el) el.textContent = String(v); };

  const K_SWAPS="ice_swaps_v2";
  const K_HIST ="ice_hist_v2";
  const K_MINE ="ice_mine_v1";

  let swaps=[], hist=[], mineTotal=0;

  try{swaps=JSON.parse(localStorage.getItem(K_SWAPS)||"[]")||[]}catch(e){swaps=[]}
  try{hist =JSON.parse(localStorage.getItem(K_HIST )||"[]")||[]}catch(e){hist=[]}
  try{mineTotal=Number(localStorage.getItem(K_MINE)||"0")||0}catch(e){mineTotal=0}

  const escapeHtml = (str)=>String(str).replace(/[&<>"']/g,(m)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

  // Tabs
  const panels = { trocas:$("panelTrocas"), historico:$("panelHistorico"), adm:$("panelADM") };
  document.querySelectorAll(".tab").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      const t = btn.dataset.tab;
      Object.keys(panels).forEach(k=>panels[k].style.display = (k===t ? "block" : "none"));
    });
  });

  // Histórico
  const addHist = (title, desc) => {
    hist.push({ts:Date.now(), title, desc});
    localStorage.setItem(K_HIST, JSON.stringify(hist));
    renderHist();
  };

  const renderHist = () => {
    const box = $("hist"); if(!box) return;
    box.innerHTML = hist.slice().reverse().map(h=>`
      <div class="item">
        <div class="linha entre">
          <b>${escapeHtml(h.title||"Registro")}</b>
          <span class="mini">${new Date(h.ts||Date.now()).toLocaleString()}</span>
        </div>
        ${h.desc ? `<div class="mini" style="margin-top:6px">${escapeHtml(h.desc)}</div>`:""}
      </div>
    `).join("");
    setText("histCount", hist.length);
  };

  $("histClear")?.addEventListener("click", ()=>{
    if(!confirm("Apagar histórico?")) return;
    hist=[]; localStorage.setItem(K_HIST,"[]"); renderHist();
  });

  // Trocas
  const swapFile=$("swapFile"), swapPick=$("swapPickInfo"), swapPrev=$("swapPreview");

  const clearPreview = () => { if(swapPrev) swapPrev.innerHTML=""; };

  if(swapFile){
    swapFile.addEventListener("change", ()=>{
      const f = swapFile.files && swapFile.files[0];
      if(swapPick) swapPick.textContent = f ? (f.name+" • "+Math.round(f.size/1024)+" KB") : "Nenhum arquivo";
      clearPreview();
      if(!f) return;
      const url = URL.createObjectURL(f);
      const isVid = f.type.startsWith("video/");
      swapPrev.innerHTML = `
        <div class="preview">
          ${isVid ? `<video controls playsinline src="${url}"></video>` : `<img src="${url}" alt="preview">`}
        </div>`;
    });
  }

  const renderSwaps = () => {
    const grid=$("swapGrid"); if(!grid) return;
    grid.innerHTML = swaps.slice().reverse().map(s=>`
      <div class="item">
        <div class="linha entre">
          <b>${escapeHtml(s.title||"Sem título")}</b>
          <span class="mini">${new Date(s.ts||Date.now()).toLocaleDateString()}</span>
        </div>
        <div class="mini" style="margin-top:6px">Quero: <b>${escapeHtml(s.want||"-")}</b></div>
        ${s.desc?`<div class="mini" style="margin-top:6px">${escapeHtml(s.desc)}</div>`:""}
        ${s.fileName?`<div class="mini" style="margin-top:8px"><i class="fa-solid fa-paperclip"></i> ${escapeHtml(s.fileName)}</div>`:""}
        <div class="row" style="margin-top:10px;justify-content:flex-end">
          <button class="btn smallBtn" data-del="${escapeHtml(s.id)}"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    `).join("");
    setText("swapCount", swaps.length);

    // bind delete
    grid.querySelectorAll("[data-del]").forEach(b=>{
      b.addEventListener("click", ()=>{
        const id = b.getAttribute("data-del");
        swaps = swaps.filter(x=>String(x.id)!==String(id));
        localStorage.setItem(K_SWAPS, JSON.stringify(swaps));
        addHist("Troca removida", "ID: "+id);
        renderSwaps();
      });
    });
  };

  $("swapPost")?.addEventListener("click", ()=>{
    const title = ($("swapTitle")?.value||"").trim();
    const want  = ($("swapWant")?.value||"").trim();
    const desc  = ($("swapDesc")?.value||"").trim();
    const file  = swapFile?.files?.[0];

    if(!title || !want){ alert("Preenche o Nome do produto e o Quero em troca 😉"); return; }

    const id = (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()));
    swaps.push({id, ts:Date.now(), title, want, desc, fileName: file?file.name:"" });
    localStorage.setItem(K_SWAPS, JSON.stringify(swaps));

    addHist("Troca publicada", title+" → "+want);

    if($("swapTitle")) $("swapTitle").value="";
    if($("swapWant"))  $("swapWant").value="";
    if($("swapDesc"))  $("swapDesc").value="";
    if(swapFile) swapFile.value="";
    if(swapPick) swapPick.textContent="Nenhum arquivo";
    clearPreview();

    renderSwaps();
  });

  $("swapClear")?.addEventListener("click", ()=>{
    if(!confirm("Apagar TODAS as trocas?")) return;
    swaps=[]; localStorage.setItem(K_SWAPS,"[]");
    addHist("Trocas apagadas", "Você limpou tudo");
    renderSwaps();
  });

  // ADM demo
  const mineBtn=$("mineBtn");
  const mineInfo=$("mineInfo");
  setText("mineTotal", mineTotal);

  mineBtn?.addEventListener("click", ()=>{
    const gain = 1 + Math.floor(Math.random()*7);
    mineTotal += gain;
    localStorage.setItem(K_MINE, String(mineTotal));
    if(mineInfo) mineInfo.textContent = gain;
    setText("mineTotal", mineTotal);
    addHist("Minerou BLUE", "+"+gain+" (saldo "+mineTotal+")");
  });

  // listas demo
  const setList=(id, html)=>{ const el=$(id); if(el) el.innerHTML=html; };

  setList("uList", [
    {name:"Jessica", role:"ADM"},
    {name:"IceUser_01", role:"USER"},
    {name:"IceUser_02", role:"MOD"}
  ].map(u=>`
    <div class="item linha entre">
      <div><b>${escapeHtml(u.name)}</b><div class="mini">${escapeHtml(u.role)}</div></div>
      <div class="row" style="gap:8px">
        <button class="btn smallBtn" onclick="alert('Demo: banir')"><i class="fa-solid fa-ban"></i></button>
        <button class="btn smallBtn" onclick="alert('Demo: virar MOD')"><i class="fa-solid fa-star"></i></button>
      </div>
    </div>
  `).join(""));

  setList("wList", [
    {user:"IceUser_01", amount:"50 BLUE"},
    {user:"IceUser_02", amount:"20 BLUE"}
  ].map(w=>`
    <div class="item linha entre">
      <div><b>${escapeHtml(w.user)}</b><div class="mini">${escapeHtml(w.amount)}</div></div>
      <button class="btn good smallBtn" onclick="alert('Demo: aprovado')"><i class="fa-solid fa-check"></i> Aprovar</button>
    </div>
  `).join(""));

  // start
  renderSwaps();
  renderHist();
})();
</script>

</body>
</html>
