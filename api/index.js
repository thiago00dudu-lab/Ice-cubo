export default async function handler(req, res) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
<title>ICE-CUBO</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>

<style>
:root{
  --bg:#071a2f; --card:#0b2645; --card2:#0d315a;
  --line:rgba(255,255,255,.10);
  --txt:#e9f5ff; --mut:rgba(255,255,255,.65);
  --a:#38bdf8; --good:#16a34a; --warn:#f59e0b; --bad:#ef4444;
  --gold:#ffd700; --blue:#60a5fa;
}
*{box-sizing:border-box}
body{
  margin:0; font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;
  background:radial-gradient(900px 700px at 20% -10%, rgba(56,189,248,.18), transparent 60%),
             linear-gradient(180deg,#061427,var(--bg));
  color:var(--txt); height:100vh; overflow:hidden;
}
a{color:inherit}
#app{height:100vh; display:flex; flex-direction:column}
.topbar{
  height:64px; display:flex; align-items:center; justify-content:space-between;
  padding:10px 12px; border-bottom:1px solid var(--line);
  background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));
}
.brand{display:flex; align-items:center; gap:10px; min-width:0}
.badge{
  width:42px; height:42px; border-radius:14px; display:grid; place-items:center;
  background:linear-gradient(145deg, rgba(56,189,248,.30), rgba(56,189,248,.10));
  border:1px solid rgba(56,189,248,.25);
}
.brand b{display:block; letter-spacing:1px}
.brand small{display:block; color:var(--mut); font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis}
.rightpill{
  display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:16px;
  border:1px solid var(--line); background:rgba(255,255,255,.06);
}
.coin{
  width:26px; height:26px; border-radius:50%; display:grid; place-items:center;
  background:radial-gradient(circle at 30% 30%, #38bdf8, #0b2a6a);
  border:1px solid rgba(255,215,0,.55);
  box-shadow:0 0 2px rgba(255,215,0,.16) inset;
}
.coin span{color:var(--gold); font-weight:1000; font-size:12px}
.main{flex:1; overflow:auto; padding:12px 12px 92px}
.card{
  background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
  border:1px solid var(--line); border-radius:18px; padding:14px;
  box-shadow:0 18px 45px rgba(0,0,0,.25);
  margin-bottom:12px;
}
.row{display:flex; gap:10px; align-items:center}
.row.between{justify-content:space-between}
.hr{height:1px; background:var(--line); margin:12px 0}
.muted{color:var(--mut); font-size:12px}
.tag{font-size:12px; color:var(--mut)}
.pill{
  display:inline-flex; gap:8px; align-items:center; padding:6px 10px;
  border-radius:999px; border:1px solid var(--line); background:rgba(255,255,255,.05)
}
.star-gold{color:var(--gold); filter:drop-shadow(0 0 6px rgba(255,215,0,.35))}
.star-blue{color:var(--blue); filter:drop-shadow(0 0 6px rgba(96,165,250,.35))}
.hide{display:none !important}

.btn{
  border:0; border-radius:14px; padding:12px 12px; font-weight:900; cursor:pointer;
  background:rgba(56,189,248,.18); color:var(--txt);
  border:1px solid rgba(56,189,248,.25);
}
.btn:active{transform:translateY(1px)}
.btn.good{background:rgba(22,163,74,.20); border-color:rgba(22,163,74,.35)}
.btn.warn{background:rgba(245,158,11,.18); border-color:rgba(245,158,11,.35)}
.btn.bad{background:rgba(239,68,68,.18); border-color:rgba(239,68,68,.35)}

.inp, textarea{
  width:100%; background:rgba(255,255,255,.06);
  border:1px solid var(--line); color:var(--txt);
  border-radius:14px; padding:12px; outline:none;
}
textarea{min-height:90px; resize:none}

.grid{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px}
.smallcards{display:flex; gap:10px; overflow:auto; padding-bottom:4px}
.small{min-width:190px}

.media{width:100%; border-radius:16px; overflow:hidden; border:1px solid var(--line); background:rgba(0,0,0,.25)}
.media video,.media img{display:block; width:100%; height:180px; object-fit:cover}
.small .media video,.small .media img{height:120px}

.stage{
  height:220px; border-radius:18px; border:1px solid var(--line);
  background:radial-gradient(700px 280px at 30% -20%, rgba(56,189,248,.22), transparent 60%),
             linear-gradient(180deg, rgba(0,0,0,.25), rgba(0,0,0,.05));
  position:relative; overflow:hidden;
}
.bubbles:before,.bubbles:after{
  content:""; position:absolute; inset:-40%;
  background:
    radial-gradient(circle, rgba(255,255,255,.20) 0 2px, transparent 3px) 0 0/120px 160px,
    radial-gradient(circle, rgba(255,255,255,.12) 0 1px, transparent 2px) 40px 20px/160px 160px;
  animation:float 16s linear infinite; opacity:.55;
}
.bubbles:after{animation-duration:22s; opacity:.35; transform:scale(1.2)}
@keyframes float{to{transform:translateY(-140px)}}
.stageInner{position:absolute; inset:0; display:flex; align-items:center; justify-content:center; padding:12px}
#stageMain{
  width:100%; height:100%; object-fit:cover; border-radius:16px; display:none;
}
#stageHint{color:rgba(255,255,255,.85); text-align:center}
#stageHint b{display:block; font-size:18px; letter-spacing:1px}
#stageHint small{color:rgba(255,255,255,.65)}
.stageBar{
  position:absolute; left:12px; right:12px; bottom:12px;
  display:flex; gap:8px; justify-content:space-between; align-items:center;
}
.bigBtn{
  padding:12px 14px; border-radius:14px; border:1px solid var(--line);
  background:rgba(0,0,0,.25); color:var(--txt); font-weight:1000; cursor:pointer;
}
.bigBtn i{color:var(--a)}
.notice{
  padding:10px 12px; border-radius:14px; border:1px solid var(--line);
  background:rgba(255,255,255,.05);
}

.nav{
  position:fixed; left:10px; right:10px; bottom:10px;
  height:72px; border-radius:22px; border:1px solid var(--line);
  background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03));
  display:flex; align-items:center; justify-content:space-around;
  box-shadow:0 18px 45px rgba(0,0,0,.35);
}
.nav button{
  width:20%; height:60px; background:transparent; border:0; color:var(--mut);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  font-weight:900; gap:6px; cursor:pointer;
}
.nav button i{font-size:18px}
.nav button.active{color:var(--a)}
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
      <div class="coin"><span>₿</span></div>
      <div style="display:flex; flex-direction:column; line-height:1.05">
        <b><span id="blueBal"></span> BLUE</b>
        <small class="tag" id="who">deslogado</small>
      </div>
    </div>
  </div>

  <div class="main">

    <!-- TIMELINE -->
    <div class="card" id="panelTimeline">
      <div class="stage bubbles">
        <div class="stageInner">
          <video id="stageMain" playsinline controls></video>
          <div id="stageHint">
            <b>Toque 2x em um vídeo</b>
            <small>ele sobe aqui pra tela grande</small>
          </div>
        </div>
        <div class="stageBar">
          <div class="pill">
            <i class="fa-solid fa-wand-magic-sparkles" style="color:var(--a)"></i>
            <span class="tag">Reels/Tinder: arrasta pro lado</span>
          </div>
          <button class="bigBtn" id="camBtn"><i class="fa-solid fa-camera"></i> Câmera</button>
        </div>
      </div>

      <div class="hr"></div>

      <div class="row between">
        <div class="row" style="gap:8px">
          <b><i class="fa-solid fa-timeline" style="color:var(--a)"></i> Timeline</b>
          <span class="muted" id="feedNote">Camada 1: seguindo/filhos · Camada 2: todos</span>
        </div>
        <span class="pill"><span class="tag">Todos</span> <b id="postCount">0</b></span>
      </div>

      <div style="margin-top:10px">
        <div class="row between">
          <b>Reels</b>
          <span class="muted">só vídeos</span>
        </div>
        <div class="smallcards" id="reelRow" style="margin-top:8px"></div>
      </div>

      <div class="hr"></div>

      <div class="row between">
        <b>Feed</b>
        <span class="muted">posts em cards</span>
      </div>
      <div id="feed" style="margin-top:10px"></div>
    </div>

    <!-- PERFIL -->
    <div class="card hide" id="panelPerfil">
      <div class="row between">
        <div>
          <b><i class="fa-solid fa-user" style="color:var(--a)"></i> Seu perfil</b>
          <div class="muted">poste foto/vídeo e gerencie sua conta</div>
        </div>
        <span class="pill"><span class="tag">meus posts</span> <b id="myCount">0</b></span>
      </div>

      <div class="notice" id="loginBox" style="margin-top:12px">
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
          <button class="btn bad hide" id="btnLogout"><i class="fa-solid fa-power-off"></i> Sair</button>
        </div>
        <div class="muted" style="margin-top:8px">
          Login ADM: <b id="admLoginLabel"></b> · Senha: <b id="admPassLabel"></b>
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

      <div class="row"><b><i class="fa-solid fa-users" style="color:var(--a)"></i> Seguindo</b> <span class="muted" id="followCount">0</span></div>
      <div class="muted" id="followList" style="margin-top:6px"></div>

      <div class="hr"></div>

      <div class="row"><b><i class="fa-solid fa-sitemap" style="color:var(--a)"></i> Filhos</b> <span class="muted" id="childCount">0</span></div>
      <div class="muted" id="childList" style="margin-top:6px"></div>

      <div class="hr"></div>

      <b>Meus posts</b>
      <div class="grid" id="myPosts" style="margin-top:10px"></div>
    </div>

    <!-- CARTEIRA -->
    <div class="card hide" id="panelCarteira">
      <div class="row between">
        <div>
          <b><i class="fa-solid fa-wallet" style="color:var(--a)"></i> Carteira</b>
          <div class="muted">Depósito / Saque (protótipo)</div>
        </div>
        <span class="pill"><span class="tag">BLUE</span> <b id="bal2">0</b></span>
      </div>

      <div class="hr"></div>

      <div class="notice">
        <div class="row"><b>⚠ Importante</b><span class="muted">protótipo</span></div>
        <div class="muted" style="margin-top:6px">
          Depósito real (Mercado Pago) e saque real automático exigem backend + compliance.  
          Aqui é só <b>demo</b> (BLUE interno).
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
        <div class="muted" id="depMsg" style="margin-top:10px"></div>
      </div>

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
      <div id="hist" style="margin-top:10px; display:flex; flex-direction:column; gap:10px"></div>
    </div>

    <!-- TROCAS -->
    <div class="card hide" id="panelTrocas">
      <div class="row between">
        <div>
          <b><i class="fa-solid fa-repeat" style="color:var(--a)"></i> Trocas</b>
          <div class="muted">publique produto + o que quer em troca</div>
        </div>
        <span class="pill"><span class="tag">publicadas</span> <b id="swapCount">0</b></span>
      </div>

      <div class="hr"></div>

      <div class="row" style="gap:10px">
        <input class="inp" id="swapTitle" placeholder="Nome do produto (ex: Tênis X)" />
        <input class="inp" id="swapWant" placeholder="Quero em troca (ex: Moletom / BLUE)" />
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

      <div class="grid" id="swapGrid" style="grid-template-columns:1fr; gap:12px"></div>
    </div>

    <!-- ADM -->
    <div class="card hide" id="panelADM">
      <div class="row between">
        <div>
          <b><i class="fa-solid fa-shield-halved" style="color:var(--a)"></i> Painel ADM</b>
          <div class="muted">somente ADM/MOD</div>
        </div>
        <span class="pill"><span class="tag">Usuários</span> <b id="uCount">0</b></span>
      </div>

      <div class="hr"></div>

      <div class="notice">
        <div class="row"><b>⛏ "Minerar" BLUE (jogo)</b><span class="muted">local</span></div>
        <div class="muted" style="margin-top:6px">Clique pra ganhar BLUE (protótipo, não é BTC real).</div>
        <div class="row" style="margin-top:10px; gap:12px">
          <div class="pill"><i class="fa-solid fa-snowflake" style="color:var(--a)"></i><b id="iceText">Gelo</b></div>
          <button class="btn good" id="mineBtn"><i class="fa-solid fa-hammer"></i> Minerar</button>
        </div>
        <div class="muted" id="mineMsg" style="margin-top:8px"></div>
      </div>

      <div class="hr"></div>

      <b>Lista de usuários</b>
      <div id="uList" style="margin-top:10px; display:flex; flex-direction:column; gap:10px"></div>

      <div class="hr"></div>

      <div class="row between">
        <b>Pedidos de saque</b>
        <span class="pill"><span class="tag">itens</span> <b id="wCount">0</b></span>
      </div>
      <div id="wList" style="margin-top:10px; display:flex; flex-direction:column; gap:10px"></div>
    </div>

  </div>

  <div class="nav">
    <button data-tab="timeline" class="active"><i class="fa-solid fa-house"></i><div class="muted">HOME</div></button>
    <button data-tab="perfil"><i class="fa-solid fa-user"></i><div class="muted">PERFIL</div></button>
    <button data-tab="carteira"><i class="fa-solid fa-wallet"></i><div class="muted">CARTEIRA</div></button>
    <button data-tab="trocas"><i class="fa-solid fa-repeat"></i><div class="muted">TROCAS</div></button>
    <button data-tab="adm"><i class="fa-solid fa-star"></i><div class="muted">ADM</div></button>
  </div>

</div>

<script>
/* ================= STORAGE ================= */
const LS = {
  get(k,d){ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):d }catch{return d} },
  set(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
};

const ADM_LOGIN = "ADM";
const ADM_SENHA = "1533";
document.getElementById("admLoginLabel").textContent = ADM_LOGIN;
document.getElementById("admPassLabel").textContent = ADM_SENHA;

const state = {
  users: LS.get("ice_users", null),
  session: LS.get("ice_session", null),
  posts: LS.get("ice_posts", []),
  swaps: LS.get("ice_swaps", []),
  hist: LS.get("ice_hist", []),
  withdrawals: LS.get("ice_withdrawals", []),
};

function persist(){
  LS.set("ice_users", state.users);
  LS.set("ice_session", state.session);
  LS.set("ice_posts", state.posts);
  LS.set("ice_swaps", state.swaps);
  LS.set("ice_hist", state.hist);
  LS.set("ice_withdrawals", state.withdrawals);
}

function uid(){ return Math.random().toString(16).slice(2)+Date.now().toString(16) }
function now(){ return new Date().toLocaleString() }

function bootDefaults(){
  if(!state.users){
    state.users = [
      { user: ADM_LOGIN, pass: ADM_SENHA, role:"adm", banned:false, follows:[], childs:[] },
    ];
  }
  if(!state.posts.length){
    // 2 vídeos demo + 1 imagem demo
    state.posts = [
      { id:uid(), by:ADM_LOGIN, type:"video", data:"https://www.w3schools.com/html/mov_bbb.mp4", text:"Toque 2x no vídeo pra subir", ts:Date.now()-600000 },
      { id:uid(), by:ADM_LOGIN, type:"video", data:"https://www.w3schools.com/html/movie.mp4", text:"Reels: arrasta pro lado", ts:Date.now()-300000 },
      { id:uid(), by:ADM_LOGIN, type:"img", data:"https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=60", text:"Bem-vindo ao ICE-CUBO", ts:Date.now()-120000 },
    ];
  }
  persist();
}
bootDefaults();

/* ================= AUTH / ROLES ================= */
function me(){
  if(!state.session) return null;
  return state.users.find(u=>u.user===state.session.user) || null;
}
function isADM(){ const u=me(); return !!(u && u.role==="adm"); }
function isMOD(){ const u=me(); return !!(u && u.role==="mod"); }
function canModerate(targetUser){
  const u=me(); if(!u) return false;
  if(targetUser===ADM_LOGIN) return false; // ADM intocável
  return u.role==="adm" || u.role==="mod";
}
function roleIcon(username){
  const u = state.users.find(x=>x.user===username);
  if(!u) return "";
  if(u.role==="adm") return '<i class="fa-solid fa-star star-gold"></i>';
  if(u.role==="mod") return '<i class="fa-solid fa-star star-blue"></i>';
  return '<i class="fa-solid fa-user" style="color:var(--mut)"></i>';
}
function escapeHtml(s){
  return String(s||"").replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
}

/* ================= BLUE (saldo) ================= */
function getBlue(){ return Number(LS.get("ice_blue",0))||0; }
function setBlue(v){
  LS.set("ice_blue", Number(v)||0);
  document.getElementById("blueBal").textContent = String(getBlue());
  document.getElementById("bal2").textContent = String(getBlue());
}
setBlue(getBlue());

function pushHist(type,msg){
  state.hist.unshift({ id:uid(), ts:Date.now(), type, msg });
  if(state.hist.length>80) state.hist.pop();
  persist();
}

/* ================= UI NAV ================= */
const panels = {
  timeline: document.getElementById("panelTimeline"),
  perfil: document.getElementById("panelPerfil"),
  carteira: document.getElementById("panelCarteira"),
  trocas: document.getElementById("panelTrocas"),
  adm: document.getElementById("panelADM"),
};
document.querySelectorAll(".nav button").forEach(b=>{
  b.onclick = ()=>setTab(b.dataset.tab);
});
function badgeName(u){
  if(!u) return "deslogado";
  const icon = (u.role==="adm") ? "⭐" : (u.role==="mod") ? "🔷" : "";
  return icon ? (u.user+" "+icon) : u.user;
}
function renderTop(){
  const u = me();
  document.getElementById("who").textContent = badgeName(u);
  document.getElementById("subtitle").textContent =
    !u ? "Timeline · Perfil · Carteira"
       : (u.role==="adm" ? "Master · intocável · ADM"
       : u.role==="mod" ? "Moderador · ações limitadas"
       : "Timeline · Perfil · Carteira");
  setBlue(getBlue());
}
function setTab(tab){
  Object.keys(panels).forEach(k=>panels[k].classList.toggle("hide", k!==tab));
  document.querySelectorAll(".nav button").forEach(b=>b.classList.toggle("active", b.dataset.tab===tab));
  if(tab==="adm" && !(isADM()||isMOD())){
    alert("Somente ADM/MOD.");
    return setTab("perfil");
  }
  renderAll();
}

/* ================= STAGE / CAMERA ================= */
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
// câmera (preview local)
document.getElementById("camBtn").onclick = async ()=>{
  try{
    const stream = await navigator.mediaDevices.getUserMedia({ video:true, audio:false });
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

/* ================= POSTS / FEED ================= */
function mediaEl(p, small=false){
  const wrap = document.createElement("div");
  wrap.className = "card" + (small ? " small" : "");
  wrap.style.padding = "10px";
  wrap.style.background = "rgba(0,0,0,.18)";

  const head = document.createElement("div");
  head.className = "row between";
  head.innerHTML = \`
    <span class="pill">\${roleIcon(p.by)} <b>\${escapeHtml(p.by)}</b></span>
    <span class="muted">\${new Date(p.ts).toLocaleString()}</span>
  \`;
  wrap.appendChild(head);

  const m = document.createElement("div");
  m.className = "media";
  m.style.marginTop="10px";

  if(p.type==="video"){
    const v = document.createElement("video");
    v.src = p.data;
    v.playsInline = true;
    v.muted = true;
    v.loop = true;
    v.controls = false;
    v.addEventListener("click", ()=>{ try{ v.play() }catch{} });

    // double tap (touch) + dblclick
    let t=0;
    v.addEventListener("touchend", (e)=>{
      const now=Date.now(); if(now-t<280){ stageVideo(p.data) }
      t=now;
    }, { passive:true });
    v.addEventListener("dblclick", ()=>stageVideo(p.data));

    m.appendChild(v);
  } else {
    const img = document.createElement("img");
    img.src = p.data;
    m.appendChild(img);
  }
  wrap.appendChild(m);

  const tx = document.createElement("div");
  tx.className="muted";
  tx.style.marginTop="8px";
  tx.textContent = p.text || "";
  wrap.appendChild(tx);

  // ações
  const u = me();
  const act = document.createElement("div");
  act.className="row between";
  act.style.marginTop="10px";

  const left = document.createElement("div");
  left.className="row";

  const followBtn = document.createElement("button");
  followBtn.className="btn";
  followBtn.style.padding="10px 10px";
  followBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Seguir';
  followBtn.onclick = ()=>{
    const u=me();
    if(!u) return alert("Entre primeiro.");
    if(u.user===p.by) return;
    if(!u.follows.includes(p.by)) u.follows.push(p.by);
    persist(); renderAll();
  };

  const childBtn = document.createElement("button");
  childBtn.className="btn";
  childBtn.style.padding="10px 10px";
  childBtn.innerHTML = '<i class="fa-solid fa-link"></i> Filho';
  childBtn.onclick = ()=>{
    const u=me();
    if(!u) return alert("Entre primeiro.");
    if(u.user===p.by) return;
    if(!u.childs.includes(p.by)) u.childs.push(p.by);
    persist(); renderAll();
  };

  left.appendChild(followBtn);
  left.appendChild(childBtn);

  const right = document.createElement("div");
  right.className="row";
  const banBtn = document.createElement("button");
  banBtn.className="btn bad";
  banBtn.style.padding="10px 10px";
  banBtn.title="Banir usuário (ADM/MOD)";
  banBtn.innerHTML = '<i class="fa-solid fa-ban"></i>';
  banBtn.onclick = ()=>{
    if(!canModerate(p.by)) return alert("Sem permissão.");
    const target = state.users.find(x=>x.user===p.by);
    if(!target) return;
    target.banned = true;
    pushHist("mod", "Usuário "+p.by+" banido.");
    persist(); renderAll();
  };

  const unbanBtn = document.createElement("button");
  unbanBtn.className="btn good";
  unbanBtn.style.padding="10px 10px";
  unbanBtn.title="Desbanir (ADM/MOD)";
  unbanBtn.innerHTML = '<i class="fa-solid fa-unlock"></i>';
  unbanBtn.onclick = ()=>{
    if(!canModerate(p.by)) return alert("Sem permissão.");
    const target = state.users.find(x=>x.user===p.by);
    if(!target) return;
    target.banned = false;
    pushHist("mod", "Usuário "+p.by+" desbanido.");
    persist(); renderAll();
  };

  right.appendChild(banBtn);
  right.appendChild(unbanBtn);

  // só mostra botões de mod se tiver permissão
  right.style.display = (isADM()||isMOD()) ? "flex" : "none";

  act.appendChild(left);
  act.appendChild(right);
  wrap.appendChild(act);

  return wrap;
}

function renderTimeline(){
  const feed = document.getElementById("feed");
  const reelRow = document.getElementById("reelRow");
  const postCount = document.getElementById("postCount");

  feed.innerHTML = "";
  reelRow.innerHTML = "";

  const u = me();

  // camada 1: seguindo/filhos
  const layer1 = u ? state.posts.filter(p => (u.follows.includes(p.by) || u.childs.includes(p.by) || p.by===u.user)) : [];
  // camada 2: todos
  const all = state.posts.slice().sort((a,b)=>b.ts-a.ts);

  const show = (layer1.length ? layer1.concat(all) : all).filter((p,idx,arr)=>idx===arr.findIndex(x=>x.id===p.id));
  postCount.textContent = String(show.length);

  // Reels = só vídeos
  const vids = show.filter(p=>p.type==="video").slice(0,8);
  vids.forEach(p=>reelRow.appendChild(mediaEl(p,true)));

  show.forEach(p=>feed.appendChild(mediaEl(p,false)));
}

function renderPerfil(){
  const u = me();
  const btnLogout = document.getElementById("btnLogout");
  btnLogout.classList.toggle("hide", !u);

  const followCount = document.getElementById("followCount");
  const childCount  = document.getElementById("childCount");
  const followList  = document.getElementById("followList");
  const childList   = document.getElementById("childList");

  followCount.textContent = u ? String(u.follows.length) : "0";
  childCount.textContent  = u ? String(u.childs.length) : "0";
  followList.textContent  = u && u.follows.length ? u.follows.join(", ") : "-";
  childList.textContent   = u && u.childs.length ? u.childs.join(", ") : "-";

  const my = u ? state.posts.filter(p=>p.by===u.user).sort((a,b)=>b.ts-a.ts) : [];
  document.getElementById("myCount").textContent = String(my.length);

  const grid = document.getElementById("myPosts");
  grid.innerHTML = "";
  my.forEach(p=>grid.appendChild(mediaEl(p,true)));
}

function renderCarteira(){
  document.getElementById("bal2").textContent = String(getBlue());

  const hist = document.getElementById("hist");
  const histCount = document.getElementById("histCount");
  hist.innerHTML = "";
  histCount.textContent = String(state.hist.length);

  state.hist.slice(0,30).forEach(h=>{
    const d = document.createElement("div");
    d.className="notice";
    d.innerHTML = \`
      <div class="row between">
        <b>\${escapeHtml(h.type.toUpperCase())}</b>
        <span class="muted">\${new Date(h.ts).toLocaleString()}</span>
      </div>
      <div class="muted" style="margin-top:6px">\${escapeHtml(h.msg)}</div>
    \`;
    hist.appendChild(d);
  });
}

function renderTrocas(){
  const swapGrid = document.getElementById("swapGrid");
  const swapCount = document.getElementById("swapCount");
  swapGrid.innerHTML = "";
  swapCount.textContent = String(state.swaps.length);

  const list = state.swaps.slice().sort((a,b)=>b.ts-a.ts);
  list.forEach(s=>{
    const c = document.createElement("div");
    c.className="card";
    c.style.background="rgba(0,0,0,.18)";
    c.style.padding="12px";
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
      m.className="media";
      m.style.marginTop="10px";
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

function renderADM(){
  if(!(isADM()||isMOD())) return;

  // usuários
  const uList = document.getElementById("uList");
  const uCount = document.getElementById("uCount");
  uList.innerHTML="";
  uCount.textContent = String(state.users.length);

  state.users.slice().sort((a,b)=>a.user.localeCompare(b.user)).forEach(u=>{
    const box=document.createElement("div");
    box.className="notice";
    const roleTxt = (u.role==="adm")?"ADM":(u.role==="mod")?"MOD":"USER";
    box.innerHTML = \`
      <div class="row between">
        <div>
          <b>\${roleIcon(u.user)} \${escapeHtml(u.user)}</b>
          <div class="muted">\${roleTxt} · \${u.banned ? "BANIDO" : "OK"}</div>
        </div>
        <div class="row" style="gap:8px">
          <button class="btn" data-act="mod">\${u.role==="mod" ? "Rebaixar" : "Virar MOD"}</button>
          <button class="btn bad" data-act="ban">\${u.banned ? "Desbanir" : "Banir"}</button>
        </div>
      </div>
    \`;

    const [bMod,bBan] = box.querySelectorAll("button");
    bMod.onclick = ()=>{
      if(!isADM()) return alert("Somente ADM pode mudar cargos.");
      if(u.user===ADM_LOGIN) return alert("ADM é intocável.");
      u.role = (u.role==="mod") ? "user" : "mod";
      pushHist("adm", "Role de "+u.user+" -> "+u.role);
      persist(); renderAll();
    };
    bBan.onclick = ()=>{
      if(!canModerate(u.user)) return alert("Sem permissão.");
      if(u.user===ADM_LOGIN) return alert("ADM é intocável.");
      u.banned = !u.banned;
      pushHist("adm", (u.banned?"Banido: ":"Desbanido: ")+u.user);
      persist(); renderAll();
    };

    uList.appendChild(box);
  });

  // saques
  const wList = document.getElementById("wList");
  const wCount = document.getElementById("wCount");
  wList.innerHTML="";
  wCount.textContent = String(state.withdrawals.length);

  state.withdrawals.slice().sort((a,b)=>b.ts-a.ts).forEach(w=>{
    const box=document.createElement("div");
    box.className="notice";
    box.innerHTML = \`
      <div class="row between">
        <b>\${escapeHtml(w.user)}</b>
        <span class="muted">\${new Date(w.ts).toLocaleString()}</span>
      </div>
      <div class="muted" style="margin-top:6px">Valor: <b>\${escapeHtml(w.amount)}</b> BLUE · Status: <b>\${escapeHtml(w.status)}</b></div>
      <div class="row" style="margin-top:10px; justify-content:space-between">
        <button class="btn good">Aprovar</button>
        <button class="btn bad">Recusar</button>
      </div>
    \`;

    const [ap,re] = box.querySelectorAll("button");
    ap.onclick = ()=>{
      if(!isADM()) return alert("Somente ADM aprova.");
      if(w.status!=="pendente") return;
      w.status="aprovado";
      pushHist("saque", "Saque aprovado para "+w.user+": "+w.amount+" BLUE");
      persist(); renderAll();
    };
    re.onclick = ()=>{
      if(!isADM()) return alert("Somente ADM recusa.");
      if(w.status!=="pendente") return;
      w.status="recusado";
      // devolve saldo (protótipo)
      setBlue(getBlue() + Number(w.amount||0));
      pushHist("saque", "Saque recusado. Devolvido: "+w.amount+" BLUE");
      persist(); renderAll();
    };

    wList.appendChild(box);
  });
}

/* ================= LOGIN / REGISTER ================= */
document.getElementById("btnLogin").onclick = ()=>{
  const user = (document.getElementById("lgUser").value||"").trim();
  const pass = (document.getElementById("lgPass").value||"").trim();
  const u = state.users.find(x=>x.user===user);
  if(!u || u.pass!==pass) return alert("Login ou senha errados.");
  if(u.banned) return alert("Você está banido.");
  state.session = { user, ts:Date.now() };
  persist(); alert("Logado!");
  renderAll();
};

document.getElementById("btnReg").onclick = ()=>{
  const user = (document.getElementById("lgUser").value||"").trim();
  const pass = (document.getElementById("lgPass").value||"").trim();
  if(user.length<3 || pass.length<3) return alert("Usuário e senha mínimo 3 letras.");
  if(state.users.some(x=>x.user===user)) return alert("Já existe.");
  state.users.push({ user, pass, role:"user", banned:false, follows:[], childs:[] });
  persist();
  alert("Conta criada. Agora entre.");
  renderAll();
};

document.getElementById("btnLogout").onclick = ()=>{
  state.session = null;
  persist();
  alert("Saiu.");
  renderAll();
};

/* ================= POSTAR (perfil) ================= */
let pickedFile = null;
const filePick = document.getElementById("filePick");
const pickInfo = document.getElementById("pickInfo");

filePick.onchange = ()=>{
  pickedFile = filePick.files && filePick.files[0] ? filePick.files[0] : null;
  pickInfo.textContent = pickedFile ? (pickedFile.name+" ("+Math.round(pickedFile.size/1024)+"kb)") : "Nenhum arquivo";
};

document.getElementById("postBtn").onclick = async ()=>{
  const u = me(); if(!u) return alert("Entre primeiro.");
  if(u.banned) return alert("Banido.");
  if(!pickedFile) return alert("Escolha um arquivo.");
  const data = await toDataURL(pickedFile);
  const type = pickedFile.type.startsWith("video") ? "video" : "img";
  state.posts.unshift({ id:uid(), by:u.user, type, data, text:"", ts:Date.now() });
  pushHist("post", "Novo post de "+u.user);
  pickedFile=null; filePick.value=""; pickInfo.textContent="Nenhum arquivo";
  persist(); renderAll(); setTab("timeline");
};

function toDataURL(file){
  return new Promise((resolve,reject)=>{
    const r = new FileReader();
    r.onload = ()=>resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/* ================= CARTEIRA ================= */
document.getElementById("depMock").onclick = ()=>{
  const v = Number((document.getElementById("depVal").value||"").replace(",","."));
  if(!v || v<1) return alert("Valor inválido.");
  setBlue(getBlue()+v);
  pushHist("dep", "Depósito rápido: +"+v+" BLUE");
  document.getElementById("depMsg").textContent = "OK: +"+v+" BLUE";
  persist(); renderAll();
};

document.getElementById("saqReq").onclick = ()=>{
  const u = me(); if(!u) return alert("Entre primeiro.");
  const v = Number((document.getElementById("saqVal").value||"").replace(",","."));
  if(!v || v<1) return alert("Valor inválido.");
  if(getBlue() < v) return alert("Saldo insuficiente.");
  setBlue(getBlue()-v);
  state.withdrawals.unshift({ id:uid(), user:u.user, amount:v, status:"pendente", ts:Date.now() });
  pushHist("saque", "Pedido de saque: "+u.user+" ("+v+" BLUE) - pendente");
  document.getElementById("saqMsg").textContent = "Pedido enviado (pendente).";
  persist(); renderAll();
};

/* ================= TROCAS ================= */
let swapPicked=null;
const swapFile = document.getElementById("swapFile");
swapFile.onchange = ()=>{
  swapPicked = swapFile.files && swapFile.files[0] ? swapFile.files[0] : null;
  document.getElementById("swapPickInfo").textContent =
    swapPicked ? (swapPicked.name+" ("+Math.round(swapPicked.size/1024)+"kb)") : "Nenhum arquivo";
};

document.getElementById("swapPost").onclick = async ()=>{
  const u = me(); if(!u) return alert("Entre primeiro.");
  const title = (document.getElementById("swapTitle").value||"").trim();
  const want  = (document.getElementById("swapWant").value||"").trim();
  const desc  = (document.getElementById("swapDesc").value||"").trim();
  if(!title || !want) return alert("Preencha produto e o que quer.");
  let data="", type="";
  if(swapPicked){
    data = await toDataURL(swapPicked);
    type = swapPicked.type.startsWith("video") ? "video" : "img";
  }
  state.swaps.unshift({ id:uid(), by:u.user, title, want, desc, data, type, ts:Date.now() });
  pushHist("troca", "Troca publicada por "+u.user+": "+title);
  document.getElementById("swapTitle").value="";
  document.getElementById("swapWant").value="";
  document.getElementById("swapDesc").value="";
  swapPicked=null; swapFile.value="";
  document.getElementById("swapPickInfo").textContent="Nenhum arquivo";
  persist(); renderAll();
};

/* ================= MINERAR (ADM) ================= */
document.getElementById("mineBtn").onclick = ()=>{
  if(!isADM()) return alert("Somente ADM.");
  const gain = Math.floor(1 + Math.random()*5);
  setBlue(getBlue()+gain);
  document.getElementById("mineMsg").textContent = "Ganhou +"+gain+" BLUE (demo)";
  pushHist("mine", "ADM minerou +"+gain+" BLUE");
  persist(); renderAll();
};

/* ================= RENDER ALL ================= */
function renderAll(){
  renderTop();
  renderTimeline();
  renderPerfil();
  renderCarteira();
  renderTrocas();
  renderADM();
}
renderAll();

/* inicia em timeline */
setTab("timeline");
</script>
</body>
</html>`);
}
let pixTimer = null;
let lastPaymentId = null;

async function startPix(){
  const email = (document.getElementById("pixEmail").value || "").trim();
  const amount = Number((document.getElementById("pixVal").value || "").replace(",", "."));

  if(!email) return alert("Digite seu e-mail.");
  if(!amount || Number.isNaN(amount) || amount < 1) return alert("Valor inválido.");

  const box = document.getElementById("pixBox");
  const st  = document.getElementById("pixStatus");
  const msg = document.getElementById("pixMsg");
  const img = document.getElementById("pixImg");
  const code= document.getElementById("pixCode");

  box.classList.remove("hide");
  st.textContent = "gerando...";
  msg.textContent = "";

  const r = await fetch("/api/mp_create", {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ email, amount })
  });

  const data = await r.json();
  if(!r.ok || !data.ok){
    st.textContent = "erro";
    msg.textContent = (data && (data.error?.message || data.error || data.message)) || "Erro ao gerar PIX.";
    return;
  }

  lastPaymentId = data.paymentId;
  st.textContent = "aguardando pagamento";
  msg.textContent = "Abra o app do banco, pague o Pix e aguarde confirmar...";

  // QR base64
  if(data.qr_code_base64){
    img.src = `data:image/png;base64,${data.qr_code_base64}`;
  } else {
    img.removeAttribute("src");
  }

  // Copia e cola
  code.value = data.qr_code || "";

  // começa a checar status
  if(pixTimer) clearInterval(pixTimer);
  pixTimer = setInterval(checkPixStatus, 3500);
  checkPixStatus();
}

async function checkPixStatus(){
  if(!lastPaymentId) return;
  const st  = document.getElementById("pixStatus");
  const msg = document.getElementById("pixMsg");

  const r = await fetch(`/api/mp_status?paymentId=${encodeURIComponent(lastPaymentId)}`);
  const data = await r.json();

  if(!r.ok || !data.ok){
    st.textContent = "erro";
    msg.textContent = "Erro consultando status.";
    return;
  }

  st.textContent = data.status;

  if(data.status === "approved"){
    msg.textContent = "Pagamento aprovado ✅ Crédito liberado.";
    clearInterval(pixTimer); pixTimer = null;

    // Aqui é onde você credita BLUE de verdade.
    // Por enquanto: soma no saldo local (igual seu protótipo).
    setBlue(getBlue() + Number(data.amount || 0));
    pushHist("dep", `Pix aprovado: +${Number(data.amount||0)} BLUE`);
    renderAll();
  } else if(data.status === "rejected"){
    msg.textContent = "Pagamento recusado.";
    clearInterval(pixTimer); pixTimer = null;
  }
}

// botões
document.getElementById("pixBtn").onclick = startPix;

document.getElementById("pixCopy").onclick = async ()=>{
  const code = document.getElementById("pixCode").value || "";
  try{
    await navigator.clipboard.writeText(code);
    alert("Copiado!");
  }catch(e){
    alert("Não deu pra copiar automaticamente. Segura e copia manual.");
  }
};

document.getElementById("pixCancel").onclick = ()=>{
  document.getElementById("pixBox").classList.add("hide");
  if(pixTimer) clearInterval(pixTimer);
  pixTimer = null;
  lastPaymentId = null;
};
