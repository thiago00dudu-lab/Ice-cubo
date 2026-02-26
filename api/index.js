// api/index.js (Vercel) - ICE-CUBO (UI + "DB" localStorage + PIX MP)
// Requer: api/mp_create.js e api/mp_status.js + ENV: MP_ACCESS_TOKEN

const ADM_LOGIN = "ADM";
const ADM_SENHA = "1533";

function sendHTML(res, html) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(html);
}
function sendJSON(res, code, obj) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
}

module.exports = async (req, res) => {
  try {
    // health básico
    const url = new URL(req.url, "https://localhost");
    const op = url.searchParams.get("op") || "";
    if (op === "health") return sendJSON(res, 200, { ok: true, msg: "ICE-CUBO API online" });

    // UI
    return sendHTML(
      res,
      `<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
<title>ICE-CUBO</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
<style>
:root{
  --bg:#071a2f; --card:#0b2645; --card2:#0d315a;
  --line:rgba(255,255,255,.10); --txt:#e9f5ff; --mut:#9cc9ea;
  --a:#38bdf8; --good:#16a34a; --warn:#f59e0b; --bad:#ef4444;
  --gold:#ffd700; --blue:#60a5fa;
}
*{box-sizing:border-box}
body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;background:radial-gradient(900px 700px at 20% -10%, rgba(56,189,248,.18), transparent 60%), linear-gradient(180deg,#061427,var(--bg));color:var(--txt);height:100vh;overflow:hidden}
a{color:inherit}
#app{height:100vh;display:flex;flex-direction:column}
.topbar{
  height:64px;display:flex;align-items:center;justify-content:space-between;
  padding:10px 12px;gap:10px;border-bottom:1px solid var(--line);
  background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
}
.brand{display:flex;align-items:center;gap:10px;min-width:0}
.badge{
  width:42px;height:42px;border-radius:14px;display:grid;place-items:center;
  background:linear-gradient(145deg, rgba(56,189,248,.30), rgba(56,189,248,.10));
  border:1px solid rgba(56,189,248,.25);
  font-weight:900;letter-spacing:1px;
}
.brand b{display:block;letter-spacing:1px}
.brand small{display:block;color:var(--mut);font-size:12px}
.rightpill{
  display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:16px;
  background:rgba(255,255,255,.06);border:1px solid var(--line);
}
.coin{
  width:26px;height:26px;border-radius:50%;display:grid;place-items:center;
  background:radial-gradient(circle at 30% 30%, #38bdf8, #0b2a6a);
  border:1px solid rgba(255,215,0,.55);
  box-shadow:0 0 0 2px rgba(255,215,0,.16) inset;
}
.coin span{color:var(--gold);font-weight:1000}
.main{flex:1;overflow:auto;padding:12px 12px 92px}
.card{
  background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
  border:1px solid var(--line);
  border-radius:18px;padding:14px;
  box-shadow:0 18px 45px rgba(0,0,0,.25);
}
.hr{height:1px;background:var(--line);margin:12px 0}
.row{display:flex;gap:10px;align-items:center}
.row.between{justify-content:space-between}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.btn{
  border:0;border-radius:14px;padding:12px 12px;font-weight:900;
  background:rgba(56,189,248,.18);color:var(--txt);
  border:1px solid rgba(56,189,248,.25);
  cursor:pointer;
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
}
.btn:active{transform:translateY(1px)}
.btn.good{background:rgba(22,163,74,.20);border-color:rgba(22,163,74,.35)}
.btn.warn{background:rgba(245,158,11,.18);border-color:rgba(245,158,11,.35)}
.btn.bad{background:rgba(239,68,68,.18);border-color:rgba(239,68,68,.35)}
.inp, textarea{
  width:100%;background:rgba(255,255,255,.06);
  border:1px solid var(--line);color:var(--txt);
  border-radius:14px;padding:12px;outline:none
}
textarea{min-height:84px;resize:none}
.muted{color:var(--mut);font-size:12px}
.tag{font-size:12px;color:var(--mut)}
.pill{
  display:inline-flex;gap:8px;align-items:center;
  padding:6px 10px;border-radius:999px;
  border:1px solid var(--line);background:rgba(255,255,255,.05)
}
.star-gold{color:var(--gold);filter:drop-shadow(0 0 6px rgba(255,215,0,.35))}
.star-blue{color:var(--blue);filter:drop-shadow(0 0 6px rgba(96,165,250,.35))}
.hide{display:none}

/* stage / reels */
.stage{
  height:220px;border-radius:18px;border:1px solid var(--line);
  background:radial-gradient(700px 280px at 30% -20%, rgba(56,189,248,.22), transparent 60%),
             linear-gradient(180deg, rgba(0,0,0,.25), rgba(0,0,0,.05));
  position:relative;overflow:hidden;
}
.stageInner{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:12px}
#stageMain{width:100%;height:100%;object-fit:cover;border-radius:16px;display:none;background:#000}
#stageHint{color:rgba(255,255,255,.85);text-align:center}
#stageHint b{display:block;font-size:18px;letter-spacing:1px}
#stageHint small{color:rgba(255,255,255,.65)}
.stageBar{
  position:absolute;left:12px;right:12px;bottom:12px;
  display:flex;gap:8px;align-items:center;justify-content:space-between
}
.bigBtn{padding:12px 14px;border-radius:14px;border:1px solid var(--line);background:rgba(0,0,0,.25);color:var(--txt);font-weight:1000}
.bigBtn i{color:var(--a)}
.smallcards{display:flex;gap:10px;overflow:auto;padding-bottom:4px}
.small{min-width:190px}
.small .media{width:100%;height:140px;border-radius:16px;overflow:hidden;border:1px solid var(--line);background:rgba(0,0,0,.25)}
.small .media video,.small .media img{width:100%;height:100%;object-fit:cover;display:block}

/* nav */
.nav{
  position:fixed;left:10px;right:10px;bottom:10px;height:72px;
  border-radius:22px;border:1px solid var(--line);
  background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03));
  display:flex;align-items:center;justify-content:space-around;
  box-shadow:0 18px 45px rgba(0,0,0,.35);
}
.nav button{
  width:20%;height:60px;background:transparent;border:0;color:var(--mut);
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
  font-weight:900;cursor:pointer
}
.nav button i{font-size:18px}
.nav button.active{color:var(--a)}
.kpi{display:flex;gap:10px;flex-wrap:wrap}
.kpi .pill{background:rgba(56,189,248,.10);border-color:rgba(56,189,248,.22)}
.notice{padding:10px 12px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.05)}
</style>
</head>

<body>
<div id="app">
  <div class="topbar">
    <div class="brand">
      <div class="badge"><b>IC</b></div>
      <div style="min-width:0">
        <b>ICE-CUBO</b>
        <small id="subtitle">Timeline · Perfil · Carteira</small>
      </div>
    </div>

    <div class="rightpill">
      <div class="coin"><span>฿</span></div>
      <div style="display:flex;flex-direction:column;line-height:1.05">
        <b><span id="blueBal"></span> BLUE</b>
        <small class="tag" id="who">deslogado</small>
      </div>
    </div>
  </div>

  <div class="main">

    <!-- TIMELINE -->
    <div class="card" id="panelTimeline">
      <div class="stage">
        <div class="stageInner">
          <video id="stageMain" playsinline controls></video>
          <div id="stageHint">
            <b>Toque 2x em um vídeo</b>
            <small>ele sobe aqui pra tela grande</small>
          </div>
        </div>
        <div class="stageBar">
          <div class="pill"><i class="fa-solid fa-wand-magic-sparkles" style="color:var(--a)"></i><span class="tag">Reels/Tinder: arrasta pro lado</span></div>
          <button class="bigBtn" id="camBtn"><i class="fa-solid fa-camera"></i> Câmera</button>
        </div>
      </div>

      <div class="hr"></div>
      <div class="row between">
        <div><b><i class="fa-solid fa-timeline" style="color:var(--a)"></i> Timeline</b> <span class="muted" id="feedNote">Camada 1: seguindo/filhos · Camada 2: todos</span></div>
        <div class="pill"><span class="tag">posts</span> <b id="postCount">0</b></div>
      </div>

      <div class="hr"></div>
      <div class="row between">
        <b>Reels</b>
        <span class="muted">toque 2x para subir</span>
      </div>
      <div class="smallcards" id="reelRow"></div>

      <div class="hr"></div>
      <div class="grid" id="feed"></div>
    </div>

    <!-- PERFIL -->
    <div class="card hide" id="panelPerfil">
      <div class="row between">
        <div><b><i class="fa-solid fa-user" style="color:var(--a)"></i> Seu perfil</b><div class="muted">poste foto/vídeo</div></div>
        <button class="btn bad hide" id="btnLogout"><i class="fa-solid fa-power-off"></i> Sair</button>
      </div>

      <div class="hr"></div>

      <div class="notice" id="loginBox">
        <div class="row between">
          <b>Entrar / Criar conta</b>
          <span class="muted">ADM é intocável</span>
        </div>

        <div class="row" style="margin-top:10px">
          <input class="inp" id="lgUser" placeholder="Usuário" />
          <input class="inp" id="lgPass" type="password" placeholder="Senha" />
        </div>

        <div class="row" style="margin-top:10px">
          <button class="btn" id="btnLogin"><i class="fa-solid fa-right-to-bracket"></i> Entrar</button>
          <button class="btn good" id="btnReg"><i class="fa-solid fa-user-plus"></i> Criar</button>
        </div>

        <div class="muted" style="margin-top:8px">
          Login ADM: <b>${ADM_LOGIN}</b> · Senha: <b>${ADM_SENHA}</b>
        </div>
      </div>

      <div class="hr"></div>

      <div class="row" style="margin-bottom:10px">
        <label class="btn" style="display:inline-flex;align-items:center;gap:8px">
          <i class="fa-solid fa-image"></i> Abrir galeria
          <input id="filePick" type="file" accept="image/*,video/*" style="display:none">
        </label>
        <button class="btn good" id="postBtn"><i class="fa-solid fa-upload"></i> Postar</button>
      </div>

      <div class="muted" id="pickInfo">Nenhum arquivo</div>

      <div class="hr"></div>

      <div class="kpi">
        <span class="pill"><i class="fa-solid fa-users" style="color:var(--a)"></i><b>Seguindo</b> <span class="muted" id="followCount">0</span></span>
        <span class="pill"><i class="fa-solid fa-sitemap" style="color:var(--a)"></i><b>Filhos</b> <span class="muted" id="childCount">0</span></span>
        <span class="pill"><i class="fa-solid fa-clone" style="color:var(--a)"></i><b>Seus posts</b> <span class="muted" id="myCount">0</span></span>
      </div>

      <div class="hr"></div>
      <div class="grid" id="myPosts"></div>
    </div>

    <!-- CARTEIRA -->
    <div class="card hide" id="panelCarteira">
      <div class="row between">
        <div>
          <b><i class="fa-solid fa-wallet" style="color:var(--a)"></i> Carteira</b>
          <div class="muted">Depósito / Saque (protótipo)</div>
        </div>
        <div class="pill"><span class="tag">BLUE</span> <b id="blueBal2">0</b></div>
      </div>

      <div class="hr"></div>

      <div class="notice">
        <div class="row">
          <b>⚠️ Importante</b> <span class="muted">protótipo</span>
        </div>
        <div class="muted" style="margin-top:6px">
          Depósito real (Mercado Pago) exige <b>MP_ACCESS_TOKEN</b> no Vercel.
          Saque real automático exige backend + compliance. Aqui é só demo (BLUE interno).
        </div>
      </div>

      <div class="hr"></div>

      <div class="card" style="background:rgba(0,0,0,.18)">
        <div class="row between">
          <b>Depósito</b>
          <span class="pill"><span class="tag">BRL → BLUE</span></span>
        </div>
        <div class="muted" style="margin-top:6px">BRL = 1 BLUE (ajuste depois)</div>

        <div class="row" style="margin-top:10px">
          <input class="inp" id="depVal" placeholder="Valor (ex: 10)" inputmode="decimal"/>
          <button class="btn good" id="depMock"><i class="fa-solid fa-bolt"></i> Depósito rápido</button>
        </div>

        <div class="row" style="margin-top:10px">
          <button class="btn" id="depMP"><i class="fa-brands fa-pix"></i> Depósito real (Mercado Pago)</button>
        </div>

        <div class="muted" id="depMsg" style="margin-top:10px"></div>
      </div>

      <div class="hr"></div>

      <div class="card" style="background:rgba(0,0,0,.18)">
        <div class="row between">
          <b>Saque</b>
          <span class="pill"><span class="tag">BLUE → pedido</span></span>
        </div>
        <div class="row" style="margin-top:10px">
          <input class="inp" id="saqVal" placeholder="Valor para sacar" inputmode="decimal"/>
          <button class="btn warn" id="saqReq"><i class="fa-solid fa-paper-plane"></i> Solicitar</button>
        </div>
        <div class="muted" id="saqMsg" style="margin-top:10px"></div>
      </div>

      <div class="hr"></div>

      <div class="row between">
        <b>Histórico</b>
        <span class="pill"><span class="tag">itens</span> <b id="histCount">0</b></span>
      </div>
      <div id="hist" style="display:flex;flex-direction:column;gap:10px;margin-top:10px"></div>
    </div>

    <!-- TROCAS -->
    <div class="card hide" id="panelTrocas">
      <div class="row between">
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

    <!-- ADM -->
    <div class="card hide" id="panelADM">
      <div class="row between">
        <div>
          <b><i class="fa-solid fa-shield-halved" style="color:var(--a)"></i> Painel ADM</b>
          <div class="muted">somente ADM</div>
        </div>
        <span class="pill"><span class="tag">usuários</span> <b id="uCount">0</b></span>
      </div>

      <div class="hr"></div>

      <div class="notice">
        <div class="row"><b>⛏️ “Minerar” BLUE (jogo)</b> <span class="muted">local</span></div>
        <div class="muted" style="margin-top:6px">Clique para “quebrar gelo” e ganhar BLUE (demo).</div>
        <div class="row" style="margin-top:10px;align-items:center;gap:10px">
          <div class="pill"><span class="tag">ganho</span> <b id="mineInfo">0</b></div>
          <button class="btn good" id="mineBtn"><i class="fa-solid fa-hammer"></i> Minerar</button>
        </div>
      </div>

      <div class="hr"></div>

      <div class="row between">
        <b>Usuários</b>
        <span class="muted">ban / virar MOD</span>
      </div>
      <div id="uList" style="display:flex;flex-direction:column;gap:10px;margin-top:10px"></div>

      <div class="hr"></div>

      <div class="row between">
        <b>Pedidos de Saque</b>
        <span class="pill"><span class="tag">itens</span> <b id="wCount">0</b></span>
      </div>
      <div id="wList" style="display:flex;flex-direction:column;gap:10px;margin-top:10px"></div>
    </div>

  </div>

  <div class="nav">
    <button data-tab="timeline" class="active"><i class="fa-solid fa-house"></i><div>HOME</div></button>
    <button data-tab="perfil"><i class="fa-solid fa-user"></i><div>PERFIL</div></button>
    <button data-tab="carteira"><i class="fa-solid fa-wallet"></i><div>CARTEIRA</div></button>
    <button data-tab="trocas"><i class="fa-solid fa-repeat"></i><div>TROCAS</div></button>
    <button data-tab="adm"><i class="fa-solid fa-star"></i><div>ADM</div></button>
  </div>
</div>

<script>
/* ---------------- STORAGE ---------------- */
const LS = {
  get(k,d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d }catch{return d} },
  set(k,v){ localStorage.setItem(k, JSON.stringify(v)) }
};
const state = {
  users: LS.get("ice_users", null),
  session: LS.get("ice_session", null),
  posts: LS.get("ice_posts", []),
  swaps: LS.get("ice_swaps", []),
  hist: LS.get("ice_hist", []),
  withdrawals: LS.get("ice_withdrawals", []),
};

function uid(){ return Math.random().toString(16).slice(2)+Date.now().toString(16) }
function now(){ return new Date().toLocaleString() }

function persist(){
  LS.set("ice_users", state.users);
  LS.set("ice_session", state.session);
  LS.set("ice_posts", state.posts);
  LS.set("ice_swaps", state.swaps);
  LS.set("ice_hist", state.hist);
  LS.set("ice_withdrawals", state.withdrawals);
}

function bootDefaults(){
  if(!state.users){
    state.users = [
      { user:"${ADM_LOGIN}", pass:"${ADM_SENHA}", role:"adm", banned:false, follows:[], childs:[] },
    ];
  }
  if(!state.posts.length){
    // 2 posts exemplo (img)
    state.posts = [
      { id:uid(), by:"${ADM_LOGIN}", type:"img", data: sampleImg1(), text:"Bem-vindo ao ICE-CUBO!", ts: Date.now()-600000 },
      { id:uid(), by:"${ADM_LOGIN}", type:"img", data: sampleImg2(), text:"Toque 2x nos vídeos pra subir!", ts: Date.now()-300000 },
    ];
  }
  if(LS.get("ice_blue", null) === null) LS.set("ice_blue", 0);
  persist();
}
bootDefaults();

/* ---------------- AUTH / ROLES ---------------- */
function me(){
  if(!state.session) return null;
  return state.users.find(u => u.user === state.session.user) || null;
}
function isADM(){ const u=me(); return u && u.role==="adm" }
function isMOD(){ const u=me(); return u && u.role==="mod" }
function canModerate(targetUser){
  const u=me();
  if(!u) return false;
  if(targetUser === "${ADM_LOGIN}") return false; // ADM intocável
  return u.role==="adm" || u.role==="mod";
}

/* ---------------- TOP / BLUE ---------------- */
const blueBal = document.getElementById("blueBal");
const blueBal2 = document.getElementById("blueBal2");
const who = document.getElementById("who");
const subtitle = document.getElementById("subtitle");

function getBlue(){ return Number(LS.get("ice_blue",0))||0 }
function setBlue(v){
  LS.set("ice_blue", Number(v)||0);
  blueBal.textContent = String(getBlue());
  blueBal2.textContent = String(getBlue());
}
setBlue(getBlue());

function badgeName(u){
  if(!u) return "deslogado";
  const icon = u.role==="adm" ? "⭐" : (u.role==="mod" ? "🔷" : "");
  return icon ? (u.user+" "+icon) : u.user;
}
function renderTop(){
  const u = me();
  who.textContent = u ? badgeName(u) : "deslogado";
  subtitle.textContent = u
    ? (u.role==="adm" ? "Master · intocável · Timeline · Perfil · Carteira"
      : u.role==="mod" ? "Moderador · ações limitadas · Perfil · Timeline"
      : "Timeline · Perfil · Carteira")
    : "Timeline · Perfil · Carteira";
}

/* ---------------- UI NAV ---------------- */
const panels = {
  timeline: document.getElementById("panelTimeline"),
  perfil: document.getElementById("panelPerfil"),
  carteira: document.getElementById("panelCarteira"),
  trocas: document.getElementById("panelTrocas"),
  adm: document.getElementById("panelADM"),
};
document.querySelectorAll(".nav button").forEach(b=>{
  b.onclick = ()=> setTab(b.dataset.tab);
});
function setTab(tab){
  Object.keys(panels).forEach(k=> panels[k].classList.toggle("hide", k!==tab));
  document.querySelectorAll(".nav button").forEach(b=> b.classList.toggle("active", b.dataset.tab===tab));
  // ADM bloqueado
  if(tab==="adm" && !isADM()){
    alert("Somente ADM.");
    return setTab("perfil");
  }
  renderAll();
}

/* ---------------- MEDIA HELPERS ---------------- */
function roleIcon(username){
  const u = state.users.find(x=>x.user===username);
  if(!u) return "";
  if(u.role==="adm") return '<i class="fa-solid fa-star star-gold"></i>';
  if(u.role==="mod") return '<i class="fa-solid fa-star star-blue"></i>';
  return '<i class="fa-solid fa-user" style="color:var(--mut)"></i>';
}
function escapeHtml(s){
  return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

/* cria card post (small=false timeline grid; small=true reels row) */
function mediaEl(p, small=false){
  const wrap = document.createElement("div");
  wrap.className = "card" + (small ? " small" : "");
  wrap.style.padding = "10px";
  wrap.style.background = "rgba(0,0,0,.18)";

  const head = document.createElement("div");
  head.className = "row between";
  head.innerHTML = \`
    <div class="row" style="gap:8px">
      <span class="pill">\${roleIcon(p.by)} <b>\${escapeHtml(p.by)}</b></span>
      <span class="muted">\${new Date(p.ts).toLocaleString()}</span>
    </div>
  \`;
  wrap.appendChild(head);

  const m = document.createElement("div");
  m.className = "media";
  m.style.marginTop = "8px";

  if(p.type==="video"){
    const v = document.createElement("video");
    v.src = p.data;
    v.playsInline = true;
    v.muted = true;
    v.loop = true;
    v.controls = false;
    v.addEventListener("click", ()=>{ try{ v.play() }catch(e){} });

    // double tap -> stage
    let t=0;
    v.addEventListener("touchend",(e)=>{
      const now=Date.now();
      if(now-t<280){ stageVideo(p.data); }
      t=now;
    },{passive:true});
    v.addEventListener("dblclick", ()=> stageVideo(p.data));

    m.appendChild(v);
  }else{
    const img = document.createElement("img");
    img.src = p.data;
    img.alt = "";
    m.appendChild(img);
  }
  wrap.appendChild(m);

  const tx = document.createElement("div");
  tx.className = "muted";
  tx.style.marginTop = "8px";
  tx.textContent = p.text || "";
  wrap.appendChild(tx);

  // ações
  const u = me();
  const act = document.createElement("div");
  act.className = "row between";
  act.style.marginTop = "10px";

  const left = document.createElement("div");
  left.className = "row";

  const followBtn = document.createElement("button");
  followBtn.className = "btn";
  followBtn.style.padding = "10px 10px";
  followBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Seguir';
  followBtn.onclick = ()=>{
    if(!u) return alert("Entre primeiro.");
    if(u.user===p.by) return;
    if(!u.follows.includes(p.by)) u.follows.push(p.by);
    persist(); renderAll();
  };
  left.appendChild(followBtn);

  const childBtn = document.createElement("button");
  childBtn.className = "btn";
  childBtn.style.padding = "10px 10px";
  childBtn.innerHTML = '<i class="fa-solid fa-link"></i> Filho';
  childBtn.onclick = ()=>{
    if(!u) return alert("Entre primeiro.");
    // simples demo: vira "filho" se adicionar
    if(!u.childs.includes(p.by) && p.by!==u.user) u.childs.push(p.by);
    persist(); renderAll();
  };
  left.appendChild(childBtn);

  const right = document.createElement("div");
  right.className = "row";

  const banBtn = document.createElement("button");
  banBtn.className = "btn bad";
  banBtn.style.padding = "10px 10px";
  banBtn.innerHTML = '<i class="fa-solid fa-ban"></i>';
  banBtn.title = "Banir usuário (ADM/MOD)";
  banBtn.onclick = ()=>{
    if(!canModerate(p.by)) return alert("Sem permissão.");
    const target = state.users.find(x=>x.user===p.by);
    if(!target) return;
    target.banned = true;
    pushHist("mod", \`Usuário \${p.by} banido.\`);
    persist(); renderAll();
  };
  if(!canModerate(p.by)) banBtn.classList.add("hide");
  right.appendChild(banBtn);

  act.appendChild(left);
  act.appendChild(right);
  wrap.appendChild(act);

  return wrap;
}

/* ---------------- TIMELINE RENDER ---------------- */
function renderTimeline(){
  const feed = document.getElementById("feed");
  const reelRow = document.getElementById("reelRow");
  const postCount = document.getElementById("postCount");
  feed.innerHTML = "";
  reelRow.innerHTML = "";

  const u = me();

  // Camada 1: seguindo/filhos/own, Camada 2: todos
  const layer1 = u ? state.posts.filter(p =>
    (u.follows.includes(p.by) || u.childs.includes(p.by) || p.by===u.user)
  ) : [];

  const all = state.posts.slice().sort((a,b)=>b.ts-a.ts);
  const show = (layer1.length ? layer1.concat(all) : all).filter((p,idx,arr)=> idx===arr.findIndex(x=>x.id===p.id));

  postCount.textContent = String(show.length);

  // reels: só vídeo
  const vids = show.filter(p=>p.type==="video").slice(0,8);
  vids.forEach(p=> reelRow.appendChild(mediaEl(p,true)));

  // feed grid
  show.forEach(p=> feed.appendChild(mediaEl(p,false)));
}

/* ---------------- PERFIL RENDER ---------------- */
function renderPerfil(){
  const u = me();
  const btnLogout = document.getElementById("btnLogout");
  btnLogout.classList.toggle("hide", !u);

  document.getElementById("followCount").textContent = u ? String(u.follows.length) : "0";
  document.getElementById("childCount").textContent = u ? String(u.childs.length) : "0";

  const my = u ? state.posts.filter(p=>p.by===u.user).sort((a,b)=>b.ts-a.ts) : [];
  document.getElementById("myCount").textContent = String(my.length);

  const grid = document.getElementById("myPosts");
  grid.innerHTML = "";
  my.forEach(p=> grid.appendChild(mediaEl(p,true)));
}

/* ---------------- CARTEIRA RENDER ---------------- */
function pushHist(type,msg){
  state.hist.unshift({id:uid(), ts:Date.now(), type, msg});
  if(state.hist.length>80) state.hist.pop();
  persist();
}
function renderCarteira(){
  // histórico
  const hist = document.getElementById("hist");
  const histCount = document.getElementById("histCount");
  hist.innerHTML = "";
  histCount.textContent = String(state.hist.length);

  state.hist.slice(0,30).forEach(h=>{
    const d = document.createElement("div");
    d.className = "notice";
    d.innerHTML = \`
      <div class="row between">
        <b>\${escapeHtml(h.type).toUpperCase()}</b>
        <span class="muted">\${new Date(h.ts).toLocaleString()}</span>
      </div>
      <div class="muted" style="margin-top:6px">\${escapeHtml(h.msg)}</div>
    \`;
    hist.appendChild(d);
  });

  // msg limpa
  const depMsg = document.getElementById("depMsg");
  if(depMsg && !depMsg.dataset.keep) depMsg.textContent = "";
}

/* ---------------- TROCAS RENDER ---------------- */
function renderTrocas(){
  const swapCount = document.getElementById("swapCount");
  const swapGrid = document.getElementById("swapGrid");
  swapGrid.innerHTML = "";
  swapCount.textContent = String(state.swaps.length);

  state.swaps.slice().sort((a,b)=>b.ts-a.ts).forEach(s=>{
    const c = document.createElement("div");
    c.className = "card";
    c.style.padding = "10px";
    c.style.background = "rgba(0,0,0,.18)";
    c.innerHTML = \`
      <div class="row between">
        <span class="pill">\${roleIcon(s.by)} <b>\${escapeHtml(s.by)}</b></span>
        <span class="muted">\${new Date(s.ts).toLocaleString()}</span>
      </div>
      <div class="muted" style="margin-top:8px"><b>\${escapeHtml(s.title)}</b> · quero: \${escapeHtml(s.want)}</div>
      <div class="muted" style="margin-top:6px">\${escapeHtml(s.desc||"")}</div>
    \`;
    if(s.data){
      const m = document.createElement("div");
      m.className = "media";
      m.style.marginTop = "8px";
      if(s.type==="video"){
        const v=document.createElement("video");
        v.src=s.data; v.controls=true; v.playsInline=true;
        m.appendChild(v);
      }else{
        const img=document.createElement("img");
        img.src=s.data;
        m.appendChild(img);
      }
      c.appendChild(m);
    }
    swapGrid.appendChild(c);
  });
}

/* ---------------- ADM RENDER ---------------- */
function renderADM(){
  if(!isADM()) return;

  // mine
  const mineInfo = document.getElementById("mineInfo");
  mineInfo.textContent = "1 BLUE";

  const uList = document.getElementById("uList");
  const uCount = document.getElementById("uCount");
  uList.innerHTML = "";
  uCount.textContent = String(state.users.length);

  state.users.slice().sort((a,b)=>a.user.localeCompare(b.user)).forEach(u=>{
    const box = document.createElement("div");
    box.className = "notice";
    const roleTxt = u.role==="adm" ? "ADM" : (u.role==="mod" ? "MOD" : "USER");
    box.innerHTML = \`
      <div class="row between">
        <div class="row" style="gap:10px">
          <b>\${roleIcon(u.user)} \${escapeHtml(u.user)}</b>
          <span class="muted">(\${roleTxt})</span>
          <span class="muted">\${u.banned ? "BANIDO" : "OK"}</span>
        </div>
      </div>
      <div class="row between" style="margin-top:10px">
        <button class="btn" data-act="mod">\${u.role==="mod" ? "Rebaixar" : "Virar MOD"}</button>
        <button class="btn bad" data-act="ban">\${u.banned ? "Desbanir" : "Banir"}</button>
      </div>
    \`;

    const [bMod, bBan] = box.querySelectorAll("button");

    bMod.onclick = ()=>{
      if(u.user==="${ADM_LOGIN}") return alert("ADM é intocável.");
      u.role = (u.role==="mod") ? "user" : "mod";
      pushHist("adm", \`Role de \${u.user} -> \${u.role}\`);
      persist(); renderAll();
    };
    bBan.onclick = ()=>{
      if(u.user==="${ADM_LOGIN}") return alert("ADM é intocável.");
      u.banned = !u.banned;
      pushHist("adm", \`\${u.banned ? "Banido" : "Desbanido"}: \${u.user}\`);
      persist(); renderAll();
    };

    uList.appendChild(box);
  });

  // withdrawals (demo)
  const wList = document.getElementById("wList");
  const wCount = document.getElementById("wCount");
  wList.innerHTML = "";
  wCount.textContent = String(state.withdrawals.length);

  state.withdrawals.slice().sort((a,b)=>b.ts-a.ts).forEach(w=>{
    const box=document.createElement("div");
    box.className="notice";
    box.innerHTML=\`
      <div class="row between">
        <b>\${escapeHtml(w.user)}</b>
        <span class="muted">\${new Date(w.ts).toLocaleString()}</span>
      </div>
      <div class="muted" style="margin-top:6px">Valor: <b>\${escapeHtml(w.amount)}</b> BLUE · Status: <b>\${escapeHtml(w.status)}</b></div>
      <div class="row between" style="margin-top:10px">
        <button class="btn good">Aprovar</button>
        <button class="btn bad">Recusar</button>
      </div>
    \`;
    const [ap,re] = box.querySelectorAll("button");
    ap.onclick=()=>{
      if(w.status!=="pendente") return;
      w.status="aprovado";
      pushHist("saque", \`Saque aprovado para \${w.user}: \${w.amount} BLUE\`);
      persist(); renderAll();
    };
    re.onclick=()=>{
      if(w.status!=="pendente") return;
      w.status="recusado";
      // devolve saldo
      setBlue(getBlue() + Number(w.amount||0));
      pushHist("saque", \`Saque recusado. Devolvido: \${w.amount} BLUE\`);
      persist(); renderAll();
    };
    wList.appendChild(box);
  });
}

/* ---------------- RENDER ALL ---------------- */
function renderAll(){
  renderTop();
  setBlue(getBlue());
  renderTimeline();
  renderPerfil();
  renderCarteira();
  renderTrocas();
  renderADM();
}
renderAll();

/* ---------------- STAGE / CAMERA ---------------- */
const stageMain = document.getElementById("stageMain");
const stageHint = document.getElementById("stageHint");

function stageVideo(src){
  stageHint.style.display="none";
  stageMain.style.display="block";
  stageMain.srcObject = null;
  stageMain.src = src;
  stageMain.currentTime = 0;
  stageMain.muted = false;
  stageMain.play().catch(()=>{});
}

document.getElementById("camBtn").onclick = async ()=>{
  try{
    const stream = await navigator.mediaDevices.getUserMedia({video:true,audio:false});
    stageHint.style.display="none";
    stageMain.style.display="block";
    stageMain.src = "";
    stageMain.srcObject = stream;
    stageMain.controls = false;
    stageMain.muted = true;
    stageMain.play().catch(()=>{});
  }catch(e){
    alert("Não deu permissão da câmera.");
  }
};

/* ---------------- LOGIN / REGISTER ---------------- */
document.getElementById("btnLogin").onclick = ()=>{
  const user = (document.getElementById("lgUser").value||"").trim();
  const pass = (document.getElementById("lgPass").value||"").trim();
  const u = state.users.find(x=>x.user===user);
  if(!u || u.pass!==pass) return alert("Login ou senha errados.");
  if(u.banned) return alert("Você está banido.");
  state.session = { user, ts: Date.now() };
  persist(); renderAll(); alert("Logado!");
};
document.getElementById("btnReg").onclick = ()=>{
  const user = (document.getElementById("lgUser").value||"").trim();
  const pass = (document.getElementById("lgPass").value||"").trim();
  if(user.length<3 || pass.length<3) return alert("Usuário e senha mínimo 3 letras.");
  if(state.users.some(x=>x.user===user)) return alert("Já existe.");
  state.users.push({ user, pass, role:"user", banned:false, follows:[], childs:[] });
  persist(); renderAll(); alert("Conta criada!");
};
document.getElementById("btnLogout").onclick = ()=>{
  state.session = null;
  persist(); renderAll(); alert("Saiu!");
};

/* ---------------- POST (perfil) ---------------- */
let picked = null;
const filePick = document.getElementById("filePick");
const pickInfo = document.getElementById("pickInfo");

filePick.onchange = ()=>{
  const f = filePick.files && filePick.files[0];
  if(!f){ picked=null; pickInfo.textContent="Nenhum arquivo"; return; }
  pickInfo.textContent = f.name;
  const reader = new FileReader();
  reader.onload = ()=>{ picked = { name:f.name, type:f.type, data: reader.result }; };
  reader.readAsDataURL(f);
};
document.getElementById("postBtn").onclick = ()=>{
  const u = me();
  if(!u) return alert("Entre primeiro.");
  if(!picked) return alert("Selecione um arquivo.");
  const isVid = picked.type.startsWith("video/");
  state.posts.unshift({
    id:uid(), by:u.user, type: isVid ? "video" : "img",
    data: picked.data, text: "", ts: Date.now()
  });
  picked=null; pickInfo.textContent="Nenhum arquivo"; filePick.value="";
  pushHist("post", \`Novo post de \${u.user}\`);
  persist(); renderAll();
};

/* ---------------- TROCAS (swap) ---------------- */
let swapPicked = null;
const swapFile = document.getElementById("swapFile");
const swapPickInfo = document.getElementById("swapPickInfo");
swapFile.onchange = ()=>{
  const f = swapFile.files && swapFile.files[0];
  if(!f){ swapPicked=null; swapPickInfo.textContent="Nenhum arquivo"; return; }
  swapPickInfo.textContent = f.name;
  const r = new FileReader();
  r.onload = ()=> swapPicked = { type:f.type, data:r.result };
  r.readAsDataURL(f);
};
document.getElementById("swapPost").onclick = ()=>{
  const u = me();
  if(!u) return alert("Entre primeiro.");
  const title = (document.getElementById("swapTitle").value||"").trim();
  const want = (document.getElementById("swapWant").value||"").trim();
  const desc = (document.getElementById("swapDesc").value||"").trim();
  if(!title || !want) return alert("Preencha produto e o que quer.");
  state.swaps.unshift({
    id:uid(), by:u.user, title, want, desc, ts:Date.now(),
    type: swapPicked ? (swapPicked.type.startsWith("video/")?"video":"img") : "",
    data: swapPicked ? swapPicked.data : ""
  });
  document.getElementById("swapTitle").value="";
  document.getElementById("swapWant").value="";
  document.getElementById("swapDesc").value="";
  swapPicked=null; swapPickInfo.textContent="Nenhum arquivo"; swapFile.value="";
  pushHist("troca", \`Troca publicada: \${title}\`);
  persist(); renderAll();
};

/* ---------------- CARTEIRA: depósito rápido + saque demo ---------------- */
document.getElementById("depMock").onclick = ()=>{
  const v = Number(document.getElementById("depVal").value||0);
  if(!v || v<1) return alert("Valor inválido.");
  setBlue(getBlue() + Math.round(v));
  pushHist("dep", \`Depósito rápido: +\${Math.round(v)} BLUE\`);
  persist(); renderAll();
};

document.getElementById("saqReq").onclick = ()=>{
  const u = me();
  if(!u) return alert("Entre primeiro.");
  const v = Number(document.getElementById("saqVal").value||0);
  if(!v || v<1) return alert("Valor inválido.");
  if(getBlue() < v) return alert("Saldo insuficiente.");
  // tira saldo e cria pedido
  setBlue(getBlue() - Math.round(v));
  state.withdrawals.unshift({ id:uid(), user:u.user, amount: Math.round(v), status:"pendente", ts: Date.now() });
  pushHist("saque", \`Pedido de saque: \${u.user} - \${Math.round(v)} BLUE\`);
  persist(); renderAll();
  document.getElementById("saqMsg").textContent = "Pedido enviado (demo).";
};

/* ---------------- PIX REAL (Mercado Pago) ----------------
   Usa /api/mp_create e /api/mp_status (arquivos separados).
   Credita BLUE quando status virar 'approved' (1 vez só).
*/
function fmtErr(e){ try{return typeof e==="string"?e:JSON.stringify(e)}catch{return String(e)} }

async function mpCreatePix(email, amount){
  const r = await fetch("/api/mp_create", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ email, amount })
  });
  return await r.json();
}
async function mpStatus(paymentId){
  const r = await fetch("/api/mp_status?paymentId=" + encodeURIComponent(paymentId));
  return await r.json();
}
function markPaidOnce(paymentId){
  const k="ice_paid_"+paymentId;
  if(localStorage.getItem(k)) return false;
  localStorage.setItem(k,"1");
  return true;
}
function showPixUI(qrBase64, qrCode){
  const depMsg = document.getElementById("depMsg");
  depMsg.dataset.keep="1";
  depMsg.innerHTML = \`
    <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px">
      <b>PIX gerado ✅</b>
      \${qrBase64 ? \`<img style="max-width:240px;border-radius:14px;border:1px solid rgba(255,255,255,.12)" src="data:image/png;base64,\${qrBase64}">\` : ""}
      <textarea id="pixCopy" style="width:100%;min-height:90px;border-radius:14px;padding:10px;background:rgba(0,0,0,.25);color:#fff;border:1px solid rgba(255,255,255,.12)">\${qrCode||""}</textarea>
      <button class="btn good" id="copyPixBtn">Copiar código PIX</button>
      <div class="muted" id="pixStatus">Aguardando pagamento...</div>
    </div>
  \`;
  const copyBtn = document.getElementById("copyPixBtn");
  copyBtn.onclick = async ()=>{
    const t=document.getElementById("pixCopy");
    t.select(); t.setSelectionRange(0,999999);
    try{ await navigator.clipboard.writeText(t.value) }catch(e){}
    copyBtn.textContent="Copiado ✅";
    setTimeout(()=>copyBtn.textContent="Copiar código PIX",1200);
  };
}

document.getElementById("depMP").onclick = async ()=>{
  try{
    const amount = Number(document.getElementById("depVal").value||0);
    if(!amount || amount<1) return alert("Valor inválido.");

    const email = prompt("Digite seu e-mail (Mercado Pago):","");
    if(!email) return;

    const depMsg = document.getElementById("depMsg");
    depMsg.dataset.keep="1";
    depMsg.textContent = "Gerando PIX...";

    const created = await mpCreatePix(email, amount);
    if(!created.ok){
      depMsg.textContent = "Erro ao gerar PIX: " + fmtErr(created.error || created);
      return;
    }

    showPixUI(created.qr_code_base64, created.qr_code);

    const statusEl = document.getElementById("pixStatus");
    const start = Date.now();

    const timer = setInterval(async ()=>{
      try{
        const st = await mpStatus(created.paymentId);
        if(!st.ok){
          statusEl.textContent = "Aguardando... (status indisponível)";
          return;
        }

        statusEl.textContent = "Status: " + st.status;

        if(st.status === "approved"){
          clearInterval(timer);

          if(markPaidOnce(created.paymentId)){
            const add = Math.round(Number(st.amount || amount));
            setBlue(getBlue() + add);
            pushHist("dep", "PIX aprovado: +" + add + " BLUE");
            persist(); renderAll();
          }

          statusEl.innerHTML = "<b style='color:#22c55e'>Pagamento aprovado ✅ BLUE creditado!</b>";
        }

        if(["cancelled","rejected","expired"].includes(st.status)){
          clearInterval(timer);
          statusEl.innerHTML = "<b style='color:#ef4444'>Pagamento não concluído.</b>";
        }

        if(Date.now() - start > 10*60*1000){
          clearInterval(timer);
          statusEl.textContent = "Tempo esgotado. Gere um novo PIX.";
        }
      }catch(e){
        statusEl.textContent = "Aguardando pagamento...";
      }
    }, 3000);

  }catch(e){
    document.getElementById("depMsg").textContent = "Erro: " + e.message;
  }
};

/* ---------------- ADM: minerar ---------------- */
document.getElementById("mineBtn").onclick = ()=>{
  if(!isADM()) return alert("Somente ADM.");
  setBlue(getBlue()+1);
  pushHist("adm", "Minerou: +1 BLUE");
  persist(); renderAll();
};

/* ---------------- SAMPLES ---------------- */
function sampleImg1(){
  return "data:image/svg+xml;base64,"+btoa(\`
    <svg xmlns='http://www.w3.org/2000/svg' width='900' height='600'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stop-color='#0ea5e9'/><stop offset='1' stop-color='#071a2f'/>
        </linearGradient>
      </defs>
      <rect width='100%' height='100%' fill='url(#g)'/>
      <circle cx='120' cy='120' r='70' fill='rgba(255,255,255,.18)'/>
      <circle cx='820' cy='480' r='140' fill='rgba(255,255,255,.10)'/>
      <text x='60' y='320' font-size='72' fill='white' font-family='Arial' font-weight='700'>ICE-CUBO</text>
      <text x='60' y='390' font-size='28' fill='rgba(255,255,255,.75)' font-family='Arial'>Timeline / Perfil / Carteira</text>
    </svg>\`);
}
function sampleImg2(){
  return "data:image/svg+xml;base64,"+btoa(\`
    <svg xmlns='http://www.w3.org/2000/svg' width='900' height='600'>
      <defs>
        <linearGradient id='g2' x1='0' y1='1' x2='1' y2='0'>
          <stop offset='0' stop-color='#1e293b'/><stop offset='1' stop-color='#0b2645'/>
        </linearGradient>
      </defs>
      <rect width='100%' height='100%' fill='url(#g2)'/>
      <text x='60' y='290' font-size='44' fill='white' font-family='Arial' font-weight='700'>Toque 2x em vídeos</text>
      <text x='60' y='350' font-size='26' fill='rgba(255,255,255,.75)' font-family='Arial'>e eles sobem pra tela grande.</text>
      <circle cx='720' cy='220' r='110' fill='rgba(56,189,248,.22)'/>
      <circle cx='760' cy='240' r='70' fill='rgba(255,215,0,.14)'/>
    </svg>\`);
}
</script>
</body>
</html>`
    );
  } catch (e) {
    // se der erro, retorna texto pra você ver no log
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Erro no api/index.js: " + e.message);
  }
};
