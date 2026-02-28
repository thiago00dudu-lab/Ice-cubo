// api/index.js  (UM ARQUIVO SÓ)
export default async function handler(req, res) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>ICE-CUBO</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
<style>
:root{
  --bg1:#061424; --bg2:#071a2f; --card:rgba(255,255,255,.06);
  --line:rgba(255,255,255,.10); --txt:#eaf2ff; --mut:rgba(255,255,255,.65);
  --a:#38bdf8; --good:#22c55e; --bad:#ef4444; --warn:#f59e0b; --gold:#ffd700;
  --r:18px;
}
*{box-sizing:border-box;margin:0;padding:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial}
body{
  min-height:100vh; color:var(--txt);
  background:linear-gradient(180deg,var(--bg1),var(--bg2));
  overflow:hidden;
}
a{color:var(--a);text-decoration:none}
.hide{display:none !important}
.hr{height:1px;background:var(--line);margin:12px 0}
.row{display:flex;gap:10px;align-items:center}
.hrow{display:flex;align-items:center;justify-content:space-between;gap:10px}
.pill{display:inline-flex;gap:8px;align-items:center;padding:6px 10px;border:1px solid var(--line);border-radius:999px;background:rgba(0,0,0,.18)}
.muted{color:var(--mut)}
.badge{padding:2px 8px;border-radius:999px;border:1px solid var(--line);background:rgba(0,0,0,.18);font-size:12px;color:var(--mut)}
.btn{
  border:none;border-radius:14px;padding:10px 12px;cursor:pointer;font-weight:800;
  background:rgba(255,255,255,.08);color:var(--txt);border:1px solid var(--line);
  display:inline-flex;gap:8px;align-items:center;justify-content:center;
}
.btn:hover{filter:brightness(1.05)}
.btn.good{background:rgba(34,197,94,.18);border-color:rgba(34,197,94,.25)}
.btn.bad{background:rgba(239,68,68,.16);border-color:rgba(239,68,68,.25)}
.btn.a{background:rgba(56,189,248,.18);border-color:rgba(56,189,248,.25)}
.btn.gold{background:rgba(255,215,0,.12);border-color:rgba(255,215,0,.22)}
input,textarea{
  width:100%;padding:12px;border-radius:14px;border:1px solid var(--line);
  background:rgba(0,0,0,.22);color:var(--txt);outline:none;
}
textarea{min-height:90px;resize:none}
.card{
  background:var(--card); border:1px solid var(--line); border-radius:var(--r);
  padding:14px;
}
.wrap{height:100vh;display:flex;flex-direction:column}
.topbar{
  height:68px; padding:10px 12px; display:flex; align-items:center; justify-content:space-between;
  border-bottom:1px solid var(--line); background:rgba(0,0,0,.18);
}
.brand{display:flex;gap:10px;align-items:center}
.logo{
  width:40px;height:40px;border-radius:14px;display:grid;place-items:center;
  background:rgba(255,255,255,.06);border:1px solid var(--line);font-weight:900;
}
.brand .t{line-height:1.05}
.brand .t b{font-size:18px}
.brand .t div{color:var(--mut);font-size:12px}
.coin{
  display:flex;gap:10px;align-items:center; padding:10px 12px; border-radius:20px;
  background:rgba(255,255,255,.06); border:1px solid var(--line);
}
.coin .btc{
  width:34px;height:34px;border-radius:999px;display:grid;place-items:center;
  background:radial-gradient(circle at 30% 30%, #1b6cff, #0a2a54);
  border:1px solid rgba(255,255,255,.15);
}
.coin .btc i{color:var(--gold)}
.main{flex:1;overflow:auto;padding:12px}
.stage{
  height:260px;border-radius:22px;overflow:hidden;background:#000;position:relative;
  border:1px solid rgba(255,255,255,.12);
}
#stageMain{width:100%;height:100%;object-fit:cover;display:none}
#stageHint{
  position:absolute;inset:0;display:grid;place-items:center;text-align:center;
  color:rgba(255,255,255,.85);background:linear-gradient(180deg, rgba(0,0,0,.55), rgba(0,0,0,.25));
}
#stageHint h2{font-size:26px}
#stageHint p{color:rgba(255,255,255,.7);margin-top:6px}
.stageActions{
  position:absolute;left:12px;right:12px;bottom:12px;display:flex;gap:10px;justify-content:space-between;
}
.reelRow{
  display:flex;gap:10px;overflow-x:auto;padding:10px 4px 6px;
}
.reel{
  min-width:180px;max-width:180px;border-radius:18px;overflow:hidden;background:#000;
  border:1px solid rgba(255,255,255,.12); position:relative;
}
.reel video,.reel img{width:100%;height:220px;object-fit:cover;display:block}
.reelTop{
  position:absolute;left:8px;right:8px;top:8px;display:flex;justify-content:space-between;gap:8px;align-items:center
}
.tagRole{
  padding:6px 10px;border-radius:999px;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.16);
  display:flex;gap:8px;align-items:center;font-weight:900
}
.tagRole i{color:var(--gold)}
.feed{display:flex;flex-direction:column;gap:10px}
.post .media{border-radius:18px;overflow:hidden;background:#000;border:1px solid rgba(255,255,255,.12)}
.post video,.post img{width:100%;height:280px;object-fit:cover;display:block}
.nav{
  height:76px; border-top:1px solid var(--line); background:rgba(0,0,0,.26);
  display:flex;justify-content:space-around;align-items:center;padding:8px 4px;
}
.nav button{
  width:72px;border:none;background:transparent;color:var(--mut);cursor:pointer;
  display:flex;flex-direction:column;gap:6px;align-items:center;font-weight:900;
}
.nav button i{font-size:20px}
.nav button.active{color:var(--a)}
.notice{padding:12px;border-radius:18px;border:1px solid var(--line);background:rgba(0,0,0,.18)}
.kpi{display:flex;gap:10px;flex-wrap:wrap}
.kpi .pill{font-weight:900}
.smallGrid{display:flex;gap:10px;flex-wrap:wrap}
.smallGrid .mini{
  width:104px;height:104px;border-radius:16px;overflow:hidden;background:#000;border:1px solid rgba(255,255,255,.12)
}
.smallGrid .mini img,.smallGrid .mini video{width:100%;height:100%;object-fit:cover}
.floatBtn{
  position:fixed;right:12px;bottom:92px;width:52px;height:52px;border-radius:999px;
  border:1px solid rgba(255,255,255,.15); background:rgba(0,0,0,.28); color:#fff;
  display:grid;place-items:center;cursor:pointer;
}
.floatBtn i{font-size:18px}
</style>
</head>
<body>
<div class="wrap">
  <div class="topbar">
    <div class="brand">
      <div class="logo">IC</div>
      <div class="t">
        <b>ICE-CUBO</b>
        <div id="subtitle">Timeline · Perfil · Carteira</div>
      </div>
    </div>
    <div class="coin">
      <div class="btc"><i class="fa-brands fa-bitcoin"></i></div>
      <div>
        <div style="font-weight:900;font-size:16px"><span id="blueBal">0</span> BLUE</div>
        <div class="muted" id="who">deslogado</div>
      </div>
    </div>
  </div>

  <div class="main">
    <!-- TIMELINE -->
    <div id="panelTimeline">
      <div class="stage">
        <video id="stageMain" playsinline></video>
        <div id="stageHint">
          <div>
            <h2>Toque 2x em um vídeo</h2>
            <p>ele sobe aqui pra tela grande</p>
          </div>
        </div>
        <div class="stageActions">
          <button class="btn a" id="reelsHintBtn"><i class="fa-solid fa-wand-magic-sparkles"></i> Reels/Tinder: arrasta pro lado</button>
          <button class="btn good" id="camBtn"><i class="fa-solid fa-camera"></i> Câmera</button>
        </div>
      </div>

      <div class="card" style="margin-top:12px">
        <div class="hrow">
          <div>
            <div class="row" style="gap:8px">
              <i class="fa-solid fa-users-gear" style="color:var(--a)"></i>
              <b>Timeline</b>
              <span class="muted">Camada 1: seguindo/filhos · Camada 2: todos</span>
            </div>
          </div>
          <span class="pill"><span class="muted">posts</span> <b id="postCount">0</b></span>
        </div>

        <div class="hr"></div>

        <div class="hrow">
          <b>Reels</b>
          <span class="muted">toque 2x para subir</span>
        </div>
        <div class="reelRow" id="reelRow"></div>

        <div class="hr"></div>

        <div class="feed" id="feed"></div>
      </div>
    </div>

    <!-- PERFIL -->
    <div id="panelPerfil" class="hide">
      <div class="card">
        <div class="hrow">
          <b>Perfil</b>
          <button class="btn bad hide" id="btnLogout"><i class="fa-solid fa-right-from-bracket"></i> Sair</button>
        </div>
        <div class="hr"></div>
        <div class="kpi">
          <span class="pill"><i class="fa-solid fa-user"></i> <span class="muted">Seguindo</span> <b id="followCount">0</b></span>
          <span class="pill"><i class="fa-solid fa-link"></i> <span class="muted">Filhos</span> <b id="childCount">0</b></span>
          <span class="pill"><i class="fa-solid fa-film"></i> <span class="muted">Meus posts</span> <b id="myCount">0</b></span>
        </div>

        <div class="hr"></div>

        <div id="authBox">
          <div class="row">
            <div style="flex:1">
              <div class="muted">Usuário</div>
              <input id="lgUser" placeholder="ex: jessica"/>
            </div>
          </div>
          <div style="margin-top:10px">
            <div class="muted">Senha</div>
            <input id="lgPass" type="password" placeholder="mín. 3 letras"/>
          </div>
          <div class="row" style="margin-top:10px">
            <button class="btn a" id="btnLogin" style="flex:1"><i class="fa-solid fa-right-to-bracket"></i> Entrar</button>
            <button class="btn good" id="btnReg" style="flex:1"><i class="fa-solid fa-user-plus"></i> Criar</button>
          </div>
        </div>

        <div id="meBox" class="hide">
          <div class="notice">
            <div class="hrow">
              <div>
                <b id="meName">—</b>
                <div class="muted" id="meRole">—</div>
              </div>
              <span class="badge" id="meStatus">OK</span>
            </div>
          </div>

          <div class="hr"></div>

          <div class="muted" style="margin-bottom:8px">Meus posts (mini)</div>
          <div class="smallGrid" id="myPosts"></div>
        </div>
      </div>
    </div>

    <!-- CARTEIRA -->
    <div id="panelCarteira" class="hide">
      <div class="card">
        <div class="hrow">
          <div class="row" style="gap:8px">
            <i class="fa-solid fa-wallet" style="color:var(--a)"></i>
            <b>Carteira</b>
            <span class="muted">Depósito / Saque (protótipo)</span>
          </div>
          <span class="pill"><span class="muted">BLUE</span> <b id="blueBal2">0</b></span>
        </div>

        <div class="hr"></div>

        <div class="notice">
          <div class="row" style="gap:10px">
            <i class="fa-solid fa-triangle-exclamation" style="color:var(--warn)"></i>
            <div>
              <b>Importante</b> <span class="muted">protótipo</span>
              <div class="muted" style="margin-top:4px">
                Depósito real e saque real automático exigem backend + compliance. Aqui é só demo (BLUE interno).
              </div>
            </div>
          </div>
        </div>

        <div class="hr"></div>

        <div class="hrow">
          <div>
            <b>Depósito</b>
            <div class="muted" style="margin-top:4px">BRL = 1 BLUE (ajuste depois)</div>
          </div>
          <span class="pill"><span class="muted">BRL → BLUE</span></span>
        </div>

        <div class="row" style="margin-top:10px">
          <input id="depVal" inputmode="decimal" placeholder="10"/>
          <button class="btn good" id="depQuick"><i class="fa-solid fa-bolt"></i> Depósito rápido</button>
        </div>
        <div class="muted" id="depMsg" style="margin-top:8px">OK: +0 BLUE</div>

        <div class="hr"></div>

        <div class="hrow">
          <div>
            <b>Saque</b>
            <div class="muted" style="margin-top:4px">Pedido de saque (fila ADM)</div>
          </div>
          <span class="pill"><span class="muted">BLUE → pedido</span></span>
        </div>
        <div class="row" style="margin-top:10px">
          <input id="wdVal" inputmode="decimal" placeholder="Valor para sacar"/>
          <button class="btn gold" id="wdReq"><i class="fa-solid fa-paper-plane"></i> Solicitar</button>
        </div>
      </div>

      <div class="card" style="margin-top:12px">
        <div class="hrow">
          <b>Histórico</b>
          <span class="pill"><span class="muted">itens</span> <b id="histCount">0</b></span>
        </div>
        <div class="hr"></div>
        <div id="hist"></div>
      </div>
    </div>

    <!-- TROCAS -->
    <div id="panelTrocas" class="hide">
      <div class="card">
        <div class="hrow">
          <div class="row" style="gap:8px">
            <i class="fa-solid fa-right-left" style="color:var(--a)"></i>
            <b>Trocas</b>
            <span class="muted">poste foto/vídeo + texto</span>
          </div>
          <span class="pill"><span class="muted">trocas</span> <b id="swapCount">0</b></span>
        </div>

        <div class="hr"></div>

        <div class="muted">Título</div>
        <input id="swapTitle" placeholder="ex: Troco 100 BLUE por..." />

        <div style="margin-top:10px" class="muted">Quero</div>
        <input id="swapWant" placeholder="ex: PIX / item / serviço" />

        <div style="margin-top:10px" class="muted">Descrição</div>
        <textarea id="swapDesc" placeholder="detalhes..."></textarea>

        <div class="row" style="margin-top:10px;justify-content:space-between">
          <label class="btn" style="flex:1;justify-content:center">
            <i class="fa-solid fa-camera"></i> Foto/Vídeo
            <input id="swapFile" type="file" accept="image/*,video/*" style="display:none"/>
          </label>
          <button class="btn a" id="swapPost" style="flex:1"><i class="fa-solid fa-bolt"></i> Publicar troca</button>
        </div>

        <div class="muted" id="swapPickInfo" style="margin-top:8px">Nenhum arquivo</div>

        <div class="hr"></div>

        <div class="muted"><b>Trocas publicadas</b></div>
        <div style="margin-top:10px;display:flex;flex-direction:column;gap:10px" id="swapGrid"></div>
      </div>
    </div>

    <!-- ADM/MOD -->
    <div id="panelADM" class="hide">
      <div class="card">
        <div class="hrow">
          <div class="row" style="gap:8px">
            <i class="fa-solid fa-shield-halved" style="color:var(--a)"></i>
            <b>Painel ADM/MOD</b>
            <span class="muted">moderação + revisão “IA”</span>
          </div>
          <span class="badge" id="admOnly">somente ADM/MOD</span>
        </div>

        <div class="hr"></div>

        <div class="notice">
          <b>Revisão guiada por IA (simples)</b>
          <div class="muted" style="margin-top:6px">
            Essa “IA” aqui é um score automático que marca posts suspeitos por texto/links/palavras.
            Você (MOD/ADM) revisa: aprovar / remover / banir.
          </div>
        </div>

        <div class="hr"></div>

        <div class="hrow">
          <b>Fila de revisão</b>
          <span class="pill"><span class="muted">suspeitos</span> <b id="flagCount">0</b></span>
        </div>
        <div style="margin-top:10px;display:flex;flex-direction:column;gap:10px" id="flagList"></div>

        <div class="hr"></div>

        <div class="hrow">
          <b>Usuários</b>
          <span class="pill"><span class="muted">total</span> <b id="uCount">0</b></span>
        </div>
        <div style="margin-top:10px;display:flex;flex-direction:column;gap:10px" id="uList"></div>

        <div class="hr"></div>

        <div class="hrow">
          <b>Pedidos de Saque</b>
          <span class="pill"><span class="muted">pendentes</span> <b id="wCount">0</b></span>
        </div>
        <div style="margin-top:10px;display:flex;flex-direction:column;gap:10px" id="wList"></div>
      </div>
    </div>

  </div>

  <div class="nav">
    <button class="active navbtn" data-tab="timeline"><i class="fa-solid fa-house"></i><div>HOME</div></button>
    <button class="navbtn" data-tab="perfil"><i class="fa-solid fa-user"></i><div>PERFIL</div></button>
    <button class="navbtn" data-tab="carteira"><i class="fa-solid fa-wallet"></i><div>CARTEIRA</div></button>
    <button class="navbtn" data-tab="trocas"><i class="fa-solid fa-right-left"></i><div>TROCAS</div></button>
    <button class="navbtn" data-tab="adm"><i class="fa-solid fa-star"></i><div>ADM</div></button>
  </div>
</div>

<button class="floatBtn" id="floatHelp" title="Ajuda"><i class="fa-solid fa-bars"></i></button>

<script>
/* ==================== STORAGE ==================== */
const LS = {
  get(k, d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d }catch{ return d } },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)) }
};

const state = {
  users: LS.get("ice_users", null),
  session: LS.get("ice_session", null),
  posts: LS.get("ice_posts", []),
  swaps: LS.get("ice_swaps", []),
  hist: LS.get("ice_hist", []),
  withdrawals: LS.get("ice_withdrawals", []),
  blue: LS.get("ice_blue", 0)
};

const ADM_LOGIN = "adm";
const ADM_SENHA = "adm";
const MOD_LOGIN = "mod";
const MOD_SENHA = "mod";

/* ==================== DEMO MEDIA ==================== */
const DEMO = {
  vids: [
    "https://www.w3schools.com/html/mov_bbb.mp4",
    "https://www.w3schools.com/html/movie.mp4",
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/beer.mp4"
  ],
  imgs: [
    "https://picsum.photos/seed/icecubo1/900/700",
    "https://picsum.photos/seed/icecubo2/900/700",
    "https://picsum.photos/seed/icecubo3/900/700",
    "https://picsum.photos/seed/icecubo4/900/700"
  ]
};

/* ==================== HELPERS ==================== */
function persist(){
  LS.set("ice_users", state.users);
  LS.set("ice_session", state.session);
  LS.set("ice_posts", state.posts);
  LS.set("ice_swaps", state.swaps);
  LS.set("ice_hist", state.hist);
  LS.set("ice_withdrawals", state.withdrawals);
  LS.set("ice_blue", state.blue);
}
function uid(){ return Math.random().toString(16).slice(2)+Date.now().toString(16) }
function now(){ return new Date().toLocaleString() }
function escapeHtml(s){
  return String(s||"").replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
}
function me(){
  if(!state.session) return null;
  return state.users?.find(u=>u.user===state.session.user) || null;
}
function isADM(){ const u=me(); return !!u && u.role==="adm" }
function isMOD(){ const u=me(); return !!u && (u.role==="mod" || u.role==="adm") }
function canModerate(targetUser){
  const u=me(); if(!u) return false;
  if(targetUser===ADM_LOGIN) return false; // ADM intocável
  return (u.role==="adm" || u.role==="mod");
}
function roleIcon(username){
  const u = state.users.find(x=>x.user===username);
  if(!u) return "";
  if(u.role==="adm") return '<i class="fa-solid fa-star" style="color:var(--gold)"></i>';
  if(u.role==="mod") return '<i class="fa-solid fa-star" style="color:var(--a)"></i>';
  return '<i class="fa-solid fa-user" style="color:var(--mut)"></i>';
}
function badgeName(u){
  if(!u) return "deslogado";
  const icon = u.role==="adm" ? "⭐" : (u.role==="mod" ? "🔹" : "");
  return icon ? (u.user+" "+icon) : u.user;
}
function pushHist(type, msg){
  state.hist.unshift({id:uid(), ts:Date.now(), type, msg});
  if(state.hist.length>80) state.hist.pop();
  persist();
}
function getBlue(){ return Number(state.blue||0) }
function setBlue(v){ state.blue = Number(v||0); persist(); }

/* ==================== DEMO SEED (4 USERS + POSTS) ==================== */
function bootDefaults(){
  if(!state.users){
    state.users = [
      {user:ADM_LOGIN, pass:ADM_SENHA, role:"adm", banned:false, follows:[], childs:[]},
      {user:MOD_LOGIN, pass:MOD_SENHA, role:"mod", banned:false, follows:[], childs:[]},
      {user:"nina", pass:"123", role:"user", banned:false, follows:[MOD_LOGIN], childs:[]},
      {user:"leo", pass:"123", role:"user", banned:false, follows:["nina"], childs:[]},
    ];
  }
  if(!state.posts?.length){
    state.posts = [
      {id:uid(), by:"nina", type:"video", data:DEMO.vids[0], text:"Toque 2x nos vídeos pra subir!", ts:Date.now
