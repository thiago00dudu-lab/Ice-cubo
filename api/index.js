module.exports = async (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>
<title>ICE-CUBO</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
<style>
:root{
  --bg:#071a2f; --card:#0b2645; --card2:#0d315a;
  --line:rgba(255,255,255,.10);
  --txt:#e9f5ff; --mut:rgba(255,255,255,.60);
  --a:#38bdf8; --good:#16a34a; --warn:#f59e0b; --bad:#ef4444;
  --gold:#ffd700; --blue:#60a5fa;
}
*{box-sizing:border-box}
body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;background:radial-gradient(900px 700px at 20% -10%, rgba(56,189,248,.18), transparent 60%), linear-gradient(180deg,#061427,#071a2f); color:var(--txt); height:100vh; overflow:hidden}
a{color:inherit}
#app{height:100vh; display:flex; flex-direction:column}
.topbar{
  height:64px; display:flex; align-items:center; justify-content:space-between;
  padding:10px 12px; border-bottom:1px solid var(--line);
  background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
}
.brand{display:flex; align-items:center; gap:10px; min-width:0}
.badge{
  width:42px; height:42px; border-radius:14px; display:grid; place-items:center;
  background:linear-gradient(145deg, rgba(56,189,248,.30), rgba(56,189,248,.10));
  border:1px solid rgba(56,189,248,.25);
  font-weight:900; letter-spacing:.5px
}
.brand b{display:block; letter-spacing:1px}
.brand small{display:block; color:var(--mut); font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:48vw}
.rightpill{display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:16px; background:rgba(255,255,255,.06); border:1px solid var(--line)}
.coin{
  width:26px; height:26px; border-radius:50%;
  display:grid; place-items:center;
  background:radial-gradient(circle at 30% 30%, #38bdf8, #0b2a6a);
  border:1px solid rgba(255,215,0,.55);
  box-shadow:0 0 0 2px rgba(255,215,0,.16) inset;
}
.coin span{color:var(--gold); font-weight:1000; font-size:12px}
.main{flex:1; overflow:auto; padding:12px 12px 92px}
.card{
  background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
  border:1px solid var(--line);
  border-radius:18px;
  padding:14px;
  box-shadow:0 18px 45px rgba(0,0,0,.25);
  margin-bottom:12px;
}
.row{display:flex; gap:10px; align-items:center}
.row.between{justify-content:space-between}
.hr{height:1px; background:var(--line); margin:12px 0}
.tag{font-size:12px; color:var(--mut)}
.pill{
  display:inline-flex; gap:8px; align-items:center;
  padding:6px 10px; border-radius:999px; border:1px solid var(--line);
  background:rgba(255,255,255,.05); color:var(--mut); font-size:12px;
}
.star-gold{color:var(--gold); filter:drop-shadow(0 0 6px rgba(255,215,0,.35))}
.star-blue{color:var(--blue); filter:drop-shadow(0 0 6px rgba(96,165,250,.35))}
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
  width:100%; background:rgba(255,255,255,.06); border:1px solid var(--line);
  color:var(--txt); border-radius:14px; padding:12px 12px; outline:none;
}
textarea{min-height:88px; resize:none}
.grid{display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:10px}

.stage{
  height:220px; border-radius:18px; border:1px solid var(--line);
  background:radial-gradient(700px 280px at 30% -20%, rgba(56,189,248,.22), transparent 60%), linear-gradient(180deg, rgba(0,0,0,.25), rgba(0,0,0,.05));
  position:relative; overflow:hidden;
}
.stageInner{position:absolute; inset:0; display:flex; align-items:center; justify-content:center; padding:12px}
#stageMain{width:100%; height:100%; object-fit:cover; border-radius:16px; display:none; background:#000}
#stageHint{color:rgba(255,255,255,.85); text-align:center}
#stageHint b{display:block; font-size:18px; letter-spacing:1px}
#stageHint small{color:rgba(255,255,255,.65)}
.stageBar{
  position:absolute; left:12px; right:12px; bottom:12px;
  display:flex; gap:8px; align-items:center; justify-content:space-between;
}
.bigBtn{
  padding:12px 14px; border-radius:14px; border:1px solid rgba(56,189,248,.25);
  background:rgba(0,0,0,.25); color:var(--txt); font-weight:1000; cursor:pointer;
}
.bigBtn i{color:var(--a)}

.smallcards{display:flex; gap:10px; overflow:auto; padding-bottom:4px}
.small{min-width:190px}
.media{width:100%; border-radius:16px; overflow:hidden; border:1px solid var(--line); background:rgba(0,0,0,.25)}
.media video,.media img{width:100%; height:180px; display:block; object-fit:cover}
.small .media video,.small .media img{height:120px}

.hide{display:none}

.nav{
  position:fixed; left:10px; right:10px; bottom:10px;
  height:72px; border-radius:22px; border:1px solid var(--line);
  background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03));
  display:flex; align-items:center; justify-content:space-around;
  box-shadow:0 18px 45px rgba(0,0,0,.35);
}
.nav button{
  width:20%; height:60px; border:0; background:transparent; color:var(--mut);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px;
  font-weight:900; cursor:pointer;
}
.nav button i{font-size:18px}
.nav button.active{color:var(--a)}
.muted{color:var(--mut); font-size:12px}
.kpi{display:flex; gap:10px; flex-wrap:wrap}
.kpi .pill{background:rgba(56,189,248,.10); color:rgba(230,250,255,.9); border-color:rgba(56,189,248,.22)}

.qrBox{
  display:grid; gap:10px;
  background:rgba(0,0,0,.18); border:1px solid var(--line); border-radius:18px; padding:12px;
}
.qrImg{width:100%; max-width:320px; margin:0 auto; border-radius:14px; border:1px solid var(--line); background:#fff}
.codeBox{font-family:ui-monospace, SFMono-Regular, Menlo, monospace; font-size:12px; color:rgba(255,255,255,.8); word-break:break-all; line-height:1.35}
</style>
</head>

<body>
<div id="app">
  <div class="topbar">
    <div class="brand">
      <div class="badge">IC</div>
      <div style="min-width:0">
        <b>ICE-CUBO</b>
        <small id="subtitle">Timeline · Perfil · Carteira</small>
      </div>
    </div>

    <div class="rightpill">
      <div class="coin"><span>฿</span></div>
      <div style="display:flex;flex-direction:column;line-height:1.05">
        <b><span id="blueBal">0</span> BLUE</b>
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
        <div class="row" style="min-width:0">
          <b><i class="fa-solid fa-timeline" style="color:var(--a)"></i> Timeline</b>
          <span class="pill">Camada 1: seguindo/filhos · Camada 2: todos</span>
        </div>
        <div class="pill">Posts: <b id="postCount">0</b></div>
      </div>

      <div class="smallcards" id="reelRow" style="margin-top:10px"></div>
      <div class="hr"></div>
      <div class="grid" id="feed"></div>
    </div>

    <!-- PERFIL -->
    <div class="card hide" id="panelPerfil">
      <div class="row between">
        <div class="row"><b><i class="fa-solid fa-user" style="color:var(--a)"></i> Seu perfil</b></div>
        <button class="btn bad hide" id="btnLogout"><i class="fa-solid fa-power-off"></i> Sair</button>
      </div>

      <div class="hr"></div>

      <div class="card" style="background:rgba(0,0,0,.18)">
        <div class="row between">
          <b>Entrar / Criar conta</b>
          <span class="pill">ADM intocável</span>
        </div>
        <div class="row" style="margin-top:10px">
          <input class="inp" id="lgUser" placeholder="Usuário"/>
          <input class="inp" id="lgPass" type="password" placeholder="Senha"/>
        </div>
        <div class="row" style="margin-top:10px">
          <button class="btn" id="btnLogin"><i class="fa-solid fa-right-to-bracket"></i> Entrar</button>
          <button class="btn good" id="btnReg"><i class="fa-solid fa-user-plus"></i> Criar</button>
        </div>
        <div class="muted" style="margin-top:8px">Login ADM: <b>ADM</b> · Senha: <b>1533</b></div>
      </div>

      <div class="hr"></div>

      <div class="kpi">
        <span class="pill"><i class="fa-solid fa-users" style="color:var(--a)"></i> Seguindo: <b id="followCount">0</b></span>
        <span class="pill"><i class="fa-solid fa-sitemap" style="color:var(--a)"></i> Filhos: <b id="childCount">0</b></span>
        <span class="pill"><i class="fa-solid fa-photo-film" style="color:var(--a)"></i> Meus posts: <b id="myCount">0</b></span>
      </div>

      <div class="hr"></div>
      <div class="grid" id="myPosts"></div>
    </div>

    <!-- CARTEIRA -->
    <div class="card hide" id="panelCarteira">
      <div class="row between">
        <div>
          <div class="row"><b><i class="fa-solid fa-wallet" style="color:var(--a)"></i> Carteira</b></div>
          <div class="muted">Depósito / Saque (protótipo)</div>
        </div>
        <div class="pill">BLUE <b id="blueBal2">0</b></div>
      </div>

      <div class="hr"></div>

      <div class="card" style="background:rgba(0,0,0,.18)">
        <div class="row"><b>⚠ Importante</b> <span class="pill">protótipo</span></div>
        <div class="muted" style="margin-top:6px">
          Depósito real (Mercado Pago) e saque real automático exigem backend + compliance.
          Aqui é só demo (BLUE interno).
        </div>
      </div>

      <div class="hr"></div>

      <div class="card" style="background:rgba(0,0,0,.18)">
        <div class="row between">
          <div>
            <b>Depósito</b>
            <div class="muted">BRL = 1 BLUE (ajuste depois)</div>
          </div>
          <span class="pill">BRL → BLUE</span>
        </div>

        <div class="row" style="margin-top:10px">
          <input class="inp" id="depVal" inputmode="decimal" placeholder="Valor (ex: 10)"/>
          <button class="btn good" id="depMock"><i class="fa-solid fa-bolt"></i> Depósito rápido</button>
        </div>
        <div class="muted" id="depMsg" style="margin-top:8px"></div>

        <div class="row" style="margin-top:10px">
          <input class="inp" id="depEmail" inputmode="email" placeholder="Seu e-mail (pra PIX)"/>
          <button class="btn" id="depMP"><i class="fa-brands fa-pix"></i> Depósito PIX (Mercado Pago)</button>
        </div>

        <div id="pixBox" class="qrBox hide" style="margin-top:12px">
          <div class="row between">
            <b>PIX gerado</b>
            <span class="pill">paymentId: <b id="pixId">-</b></span>
          </div>
          <img id="pixImg" class="qrImg" alt="QR Code PIX"/>
          <div class="codeBox" id="pixCode">---</div>
          <div class="row">
            <button class="btn" id="btnCopyPix"><i class="fa-solid fa-copy"></i> Copiar código</button>
            <button class="btn warn" id="btnCheckPix"><i class="fa-solid fa-circle-check"></i> Verificar pagamento</button>
          </div>
          <div class="muted" id="pixMsg"></div>
        </div>
      </div>

      <div class="hr"></div>

      <div class="card" style="background:rgba(0,0,0,.18)">
        <div class="row between">
          <div>
            <b>Saque</b>
            <div class="muted">Pedido (protótipo)</div>
          </div>
          <span class="pill">BLUE → pedido</span>
        </div>

        <div class="row" style="margin-top:10px">
          <input class="inp" id="saqVal" inputmode="decimal" placeholder="Valor para sacar"/>
          <button class="btn warn" id="saqReq"><i class="fa-solid fa-paper-plane"></i> Solicitar</button>
        </div>
        <div class="muted" id="saqMsg" style="margin-top:8px"></div>
      </div>

      <div class="hr"></div>

      <div class="row between">
        <b>Histórico</b>
        <span class="pill">itens <b id="histCount">0</b></span>
      </div>
      <div id="hist" style="display:flex; flex-direction:column; gap:10px; margin-top:10px"></div>
    </div>

    <!-- TROCAS -->
    <div class="card hide" id="panelTrocas">
      <div class="row between">
        <div class="row"><b><i class="fa-solid fa-repeat" style="color:var(--a)"></i> Trocas</b></div>
        <span class="pill">produto + oferta</span>
      </div>

      <div class="hr"></div>

      <input class="inp" id="swapTitle" placeholder="Nome do produto (ex: Tênis X)"/>
      <input class="inp" id="swapWant" style="margin-top:10px" placeholder="Quero em troca: (ex: Moletom / BLUE)"/>
      <textarea id="swapDesc" style="margin-top:10px" placeholder="Descrição rápida..."></textarea>

      <div class="row" style="margin-top:10px">
        <button class="btn good" id="swapPost"><i class="fa-solid fa-bolt"></i> Publicar troca</button>
      </div>

      <div class="hr"></div>

      <div class="row between">
        <b>Trocas publicadas</b>
        <span class="pill"><b id="swapCount">0</b></span>
      </div>
      <div class="grid" id="swapGrid" style="margin-top:10px"></div>
    </div>

    <!-- ADM -->
    <div class="card hide" id="panelADM">
      <div class="row between">
        <div class="row"><b><i class="fa-solid fa-shield-halved" style="color:var(--a)"></i> Painel ADM</b></div>
        <span class="pill">somente ADM</span>
      </div>

      <div class="hr"></div>

      <div class="row between">
        <b>Usuários</b>
        <span class="pill">total <b id="uCount">0</b></span>
      </div>
      <div id="uList" style="display:flex; flex-direction:column; gap:10px; margin-top:10px"></div>

      <div class="hr"></div>

      <div class="row between">
        <b>Pedidos de saque</b>
        <span class="pill"><b id="wCount">0</b></span>
      </div>
      <div id="wList" style="display:flex; flex-direction:column; gap:10px; margin-top:10px"></div>
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
  get(k,d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d }catch(e){ return d } },
  set(k,v){ localStorage.setItem(k, JSON.stringify(v)) }
};
const state = {
  users: LS.get('ice_users', null),
  session: LS.get('ice_session', null),
  posts: LS.get('ice_posts', []),
  swaps: LS.get('ice_swaps', []),
  hist: LS.get('ice_hist', []),
  withdrawals: LS.get('ice_withdrawals', []),
  blue: LS.get('ice_blue', 0)
};

function persist(){
  LS.set('ice_users', state.users);
  LS.set('ice_session', state.session);
  LS.set('ice_posts', state.posts);
  LS.set('ice_swaps', state.swaps);
  LS.set('ice_hist', state.hist);
  LS.set('ice_withdrawals', state.withdrawals);
  LS.set('ice_blue', state.blue);
}
function uid(){ return Math.random().toString(16).slice(2) + Date.now().toString(16) }
function nowStr(){ return new Date().toLocaleString() }

const ADM_LOGIN = 'ADM';
const ADM_SENHA = '1533';

function bootDefaults(){
  if(!state.users){
    state.users = [{ user: ADM_LOGIN, pass: ADM_SENHA, role:'adm', banned:false, follows:[], childs:[] }];
  }
  if(!state.posts.length){
    // 2 videos exemplo
    state.posts = [
      {id:uid(), by:ADM_LOGIN, type:'video', data:'https://www.w3schools.com/html/mov_bbb.mp4', text:'Toque 2x no vídeo pra subir', ts: Date.now()-600000},
      {id:uid(), by:ADM_LOGIN, type:'video', data:'https://www.w3schools.com/html/movie.mp4', text:'Arraste pro lado pra ignorar', ts: Date.now()-300000}
    ];
  }
  persist();
}
bootDefaults();

/* ---------------- AUTH / ROLES ---------------- */
function me(){
  if(!state.session) return null;
  return state.users.find(u=>u.user===state.session.user) || null;
}
function isADM(){ const u=me(); return !!u && u.role==='adm' }
function isMOD(){ const u=me(); return !!u && u.role==='mod' }
function canModerate(targetUser){
  const u=me(); if(!u) return false;
  if(targetUser===ADM_LOGIN) return false;
  return u.role==='adm' || u.role==='mod';
}

/* ---------------- UI NAV ---------------- */
const panels = {
  timeline: document.getElementById('panelTimeline'),
  perfil: document.getElementById('panelPerfil'),
  carteira: document.getElementById('panelCarteira'),
  trocas: document.getElementById('panelTrocas'),
  adm: document.getElementById('panelADM')
};
document.querySelectorAll('.nav button').forEach(b=>{
  b.onclick = ()=> setTab(b.dataset.tab);
});
function setTab(tab){
  Object.keys(panels).forEach(k=>{
    panels[k].classList.toggle('hide', k!==tab);
  });
  document.querySelectorAll('.nav button').forEach(b=>{
    b.classList.toggle('active', b.dataset.tab===tab);
  });
  if(tab==='adm' && !isADM()){
    alert('Somente ADM.');
    return setTab('perfil');
  }
  renderAll();
}

/* ---------------- TOP RENDER ---------------- */
const blueBal = document.getElementById('blueBal');
const blueBal2 = document.getElementById('blueBal2');
const who = document.getElementById('who');
const subtitle = document.getElementById('subtitle');

function roleIcon(username){
  const u = state.users.find(x=>x.user===username);
  if(!u) return '';
  if(u.role==='adm') return '<i class="fa-solid fa-star star-gold"></i>';
  if(u.role==='mod') return '<i class="fa-solid fa-star star-blue"></i>';
  return '<i class="fa-solid fa-user" style="color:var(--mut)"></i>';
}
function esc(s){
  return String(s||'').replace(/[&<>"]/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[m]));
}
function pushHist(type,msg){
  state.hist.unshift({id:uid(), ts:Date.now(), type, msg});
  if(state.hist.length>80) state.hist.pop();
  persist();
}
function setBlue(v){
  state.blue = Number(v||0);
  persist();
}
function getBlue(){ return Number(state.blue||0); }

function renderTop(){
  const u = me();
  blueBal.textContent = String(getBlue());
  blueBal2.textContent = String(getBlue());
  who.textContent = u ? (u.user + (u.role==='adm'?' ⭐':(u.role==='mod'?' ✦':''))) : 'deslogado';
  subtitle.textContent = u ? (u.role==='adm' ? 'Master · intocável · Timeline · Perfil · Carteira' : 'Timeline · Perfil · Carteira') : 'Timeline · Perfil · Carteira';
}

/* ---------------- TIMELINE / MEDIA ---------------- */
const stageMain = document.getElementById('stageMain');
const stageHint = document.getElementById('stageHint');
const reelRow = document.getElementById('reelRow');
const feed = document.getElementById('feed');
const postCount = document.getElementById('postCount');

function stageVideo(src){
  stageHint.style.display='none';
  stageMain.style.display='block';
  stageMain.src = src;
  stageMain.currentTime = 0;
  stageMain.muted = f
