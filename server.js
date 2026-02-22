const express = require("express");
const app = express();

app.get("/favicon.ico", (req, res) => res.status(204).end());
app.get("/favicon.png", (req, res) => res.status(204).end());

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<title>ICE-CUBO</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
:root{
  --bg1:#06122a;--bg2:#071a33;--card:#0b2447;--card2:#0a1f3d;
  --cyan:#38bdf8;--txt:#e6f3ff;--muted:#9bb4d0;--danger:#ff3b3b;
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,"Helvetica Neue",Arial;
  color:var(--txt);height:100vh;overflow:hidden;
  background:radial-gradient(1200px 700px at 30% 10%, #0c2b55 0%, var(--bg1) 40%, #040b18 100%);
}
a{color:inherit}
.hidden{display:none!important}
.wrap{height:100vh;display:flex;flex-direction:column}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:10px 12px}
.brand{display:flex;align-items:center;gap:10px}
.logo{
  width:44px;height:44px;border-radius:14px;position:relative;overflow:hidden;
  background:linear-gradient(135deg,#89d7ff,#1c66ff);
  box-shadow:0 10px 25px rgba(0,0,0,.35), inset 0 0 0 2px rgba(255,255,255,.12);
}
.logo:before{
  content:"";position:absolute;inset:-20px;background:
  radial-gradient(circle at 30% 30%, rgba(255,255,255,.6) 0 18%, transparent 19%),
  radial-gradient(circle at 65% 55%, rgba(255,255,255,.35) 0 14%, transparent 15%),
  radial-gradient(circle at 45% 75%, rgba(255,255,255,.25) 0 12%, transparent 13%);
  transform:rotate(18deg);
}
.brand h1{margin:0;font-size:18px;letter-spacing:.8px}
.brand small{display:block;color:var(--muted);font-size:11px;margin-top:2px}
.userchip{display:flex;align-items:center;gap:10px}
.badge{font-size:12px;color:var(--muted)}
.star{font-size:14px}
.star.gold{color:#ffd54a;text-shadow:0 0 12px rgba(255,213,74,.35)}
.star.blue{color:#68b6ff;text-shadow:0 0 12px rgba(104,182,255,.35)}
.pill{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.10);
  padding:7px 10px;border-radius:999px;font-size:12px;color:var(--txt)}
.stage{
  height:44vh;position:relative;border-radius:22px;margin:0 10px 8px;
  background:linear-gradient(180deg,rgba(0,0,0,.55),rgba(0,0,0,.75));
  overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,.35);
}
.stage video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.stage .hint{
  position:absolute;left:12px;top:12px;font-size:12px;color:rgba(255,255,255,.75);
  background:rgba(0,0,0,.35);padding:7px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.10)
}
.stage .dangerbar{
  position:absolute;left:0;right:0;bottom:0;padding:8px 12px;
  background:linear-gradient(90deg, rgba(255,59,59,.0), rgba(255,59,59,.35), rgba(255,59,59,.0));
  color:#fff;font-size:12px;text-align:center;display:none;
}
.stage.danger .dangerbar{display:block;animation:pulse 1s infinite}
@keyframes pulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.25)}}
.timeline{
  flex:1;display:flex;flex-direction:column;gap:8px;padding:0 10px 72px;overflow:hidden;
}
.railTitle{display:flex;align-items:center;justify-content:space-between;color:var(--muted);font-size:12px;padding:0 4px}
.hscroll{
  display:flex;gap:10px;overflow-x:auto;padding:8px 4px 12px;scroll-snap-type:x mandatory;
  -webkit-overflow-scrolling:touch
}
.hscroll::-webkit-scrollbar{height:0}
.card{
  flex:0 0 70vw;max-width:360px;height:150px;border-radius:18px;overflow:hidden;
  background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03));
  border:1px solid rgba(255,255,255,.10);
  scroll-snap-align:center;position:relative;box-shadow:0 12px 24px rgba(0,0,0,.25);
}
.card video{width:100%;height:100%;object-fit:cover}
.card .meta{
  position:absolute;left:10px;bottom:10px;right:10px;display:flex;justify-content:space-between;gap:10px;
  font-size:12px;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.7)
}
.card .meta span{background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12);padding:6px 8px;border-radius:999px}
.nav{
  position:fixed;left:0;right:0;bottom:0;padding:10px 10px 14px;
  background:linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,.55));
}
.navbar{
  display:flex;gap:8px;justify-content:space-between;
  background:rgba(8,18,38,.72);backdrop-filter:blur(10px);
  border:1px solid rgba(255,255,255,.10);border-radius:18px;padding:10px;
}
.navbtn{
  width:100%;display:flex;flex-direction:column;align-items:center;gap:6px;
  padding:8px 6px;border-radius:14px;border:1px solid transparent;
  color:rgba(230,243,255,.85);font-size:10px
}
.navbtn i{font-size:18px}
.navbtn.active{border-color:rgba(56,189,248,.35);background:rgba(56,189,248,.10);color:#fff}
.navbtn.dangerOn{background:rgba(255,59,59,.18);border-color:rgba(255,59,59,.35)}
.panel{
  position:fixed;inset:0;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;padding:16px;
}
.modal{
  width:min(520px, 100%);max-height:85vh;overflow:auto;
  background:rgba(8,18,38,.88);backdrop-filter:blur(10px);
  border:1px solid rgba(255,255,255,.12);border-radius:22px;padding:14px;
  box-shadow:0 30px 60px rgba(0,0,0,.45);
}
.modal h2{margin:6px 0 10px;font-size:16px}
.row{display:flex;gap:8px}
input,textarea,select{
  width:100%;padding:10px 12px;border-radius:14px;border:1px solid rgba(255,255,255,.14);
  background:rgba(255,255,255,.06);color:#fff;outline:none
}
textarea{min-height:90px;resize:none}
.btn{
  border:0;border-radius:14px;padding:10px 12px;font-weight:700;cursor:pointer;
  background:linear-gradient(135deg,#56d7ff,#2d7bff);color:#001428
}
.btn.ghost{background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.12)}
.list{display:flex;flex-direction:column;gap:10px}
.item{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);border-radius:16px;padding:10px}
.kv{display:flex;justify-content:space-between;gap:10px;color:var(--muted);font-size:12px}
.small{color:var(--muted);font-size:12px}
hr{border:0;border-top:1px solid rgba(255,255,255,.10);margin:12px 0}
</style>
</head>
<body>
<div class="wrap">
  <div class="topbar">
    <div class="brand">
      <div class="logo" aria-hidden="true"></div>
      <div>
        <h1>ICE-CUBO</h1>
        <small id="subtitle">Timeline de vídeos • estilo iPhone</small>
      </div>
    </div>
    <div class="userchip">
      <div class="badge" id="who">Visitante</div>
      <div class="pill" id="bluePill">BLUE: <b id="blueVal">0</b></div>
      <div class="star hidden" id="star">★</div>
    </div>
  </div>

  <div class="stage" id="stage">
    <div class="hint" id="hint">Toque 1 vez num vídeo embaixo para abrir • arraste na tela grande para trocar</div>
    <video id="player" playsinline muted autoplay loop></video>
    <div class="dangerbar" id="dangerbar">⚠️ PERIGO ATIVO • sua localização será compartilhada (simulação)</div>
  </div>

  <div class="timeline" id="screenTimeline">
    <div class="railTitle">
      <span><i class="fa-solid fa-wave-square"></i> Timeline</span>
      <span class="small">deslize →</span>
    </div>
    <div class="hscroll" id="rail"></div>
  </div>

  <div class="nav">
    <div class="navbar">
      <div class="navbtn active" data-tab="timeline"><i class="fa-solid fa-film"></i><div>Vídeos</div></div>
      <div class="navbtn" data-tab="home"><i class="fa-solid fa-house"></i><div>Casa</div></div>
      <div class="navbtn" data-tab="trade"><i class="fa-solid fa-right-left"></i><div>O que tem</div></div>
      <div class="navbtn" data-tab="chat"><i class="fa-solid fa-comments"></i><div>Chat</div></div>
      <div class="navbtn" data-tab="cam"><i class="fa-solid fa-camera"></i><div>Câmera</div></div>
      <div class="navbtn" id="panicBtn" data-tab="panic"><i class="fa-solid fa-triangle-exclamation"></i><div>Perigo</div></div>
      <div class="navbtn hidden" id="admBtn" data-tab="adm"><i class="fa-solid fa-shield-halved"></i><div>ADM</div></div>
      <div class="navbtn" id="loginBtn"><i class="fa-solid fa-user"></i><div>Entrar</div></div>
    </div>
  </div>
</div>

<!-- MODALS -->
<div class="panel" id="panel">
  <div class="modal" id="modal"></div>
</div>

<script>
/* =======================
   DADOS (sem banco, localStorage)
======================= */
const LS = {
  users: "ice_users_v1",
  session: "ice_session_v1",
  posts: "ice_posts_v1",
  trades: "ice_trades_v1",
  chats: "ice_chats_v1",
  danger: "ice_danger_v1"
};

function load(key, def){ try{ return JSON.parse(localStorage.getItem(key)) ?? def }catch{ return def } }
function save(key, val){ localStorage.setItem(key, JSON.stringify(val)) }

let users = load(LS.users, {});
let session = load(LS.session, null);
let posts = load(LS.posts, [
  {id:"p1", user:"@luna", url:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", title:"Luna • flowers"},
  {id:"p2", user:"@rio", url:"https://www.w3schools.com/html/mov_bbb.mp4", title:"Rio • bbb"},
  {id:"p3", user:"@maya", url:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", title:"Maya • loop"},
  {id:"p4", user:"@kadu", url:"https://www.w3schools.com/html/movie.mp4", title:"Kadu • movie"}
]);

// cria admin se não existir
if(!users["admin"]) users["admin"] = {pass:"1533", role:"master", blue:0, kids:0};
save(LS.users, users);

let dangerOn = load(LS.danger, false);

/* =======================
   UI helpers
======================= */
const rail = document.getElementById("rail");
const player = document.getElementById("player");
const who = document.getElementById("who");
const star = document.getElementById("star");
const blueVal = document.getElementById("blueVal");
const panel = document.getElementById("panel");
const modal = document.getElementById("modal");
const admBtn = document.getElementById("admBtn");
const loginBtn = document.getElementById("loginBtn");
const stage = document.getElementById("stage");
const panicBtn = document.getElementById("panicBtn");
const dangerbar = document.getElementById("dangerbar");

function openModal(html){ modal.innerHTML = html; panel.style.display="flex"; }
panel.addEventListener("click", (e)=>{ if(e.target===panel) panel.style.display="none"; });

function setActiveTab(tab){
  document.querySelectorAll(".navbtn").forEach(b=>b.classList.remove("active"));
  const btn = [...document.querySelectorAll(".navbtn")].find(b=>b.dataset.tab===tab);
  if(btn) btn.classList.add("active");
}

function currentUser(){
  if(!session) return null;
  return users[session.user] ? {id: session.user, ...users[session.user]} : null;
}

function refreshHeader(){
  const u = currentUser();
  if(!u){
    who.textContent = "Visitante";
    star.classList.add("hidden");
    blueVal.textContent = "0";
    admBtn.classList.add("hidden");
    loginBtn.querySelector("div").textContent = "Entrar";
  }else{
    who.textContent = u.id + (u.kids?(" • filhos: "+u.kids):"");
    blueVal.textContent = String(u.blue||0);
    loginBtn.querySelector("div").textContent = "Conta";
    if(u.role==="master"){
      star.classList.remove("hidden"); star.classList.add("gold"); star.classList.remove("blue"); star.textContent="★";
      admBtn.classList.remove("hidden");
    }else if(u.role==="mod"){
      star.classList.remove("hidden"); star.classList.add("blue"); star.classList.remove("gold"); star.textContent="★";
      admBtn.classList.add("hidden");
    }else{
      star.classList.add("hidden");
      admBtn.classList.add("hidden");
    }
  }
}

function applyDangerUI(){
  save(LS.danger, dangerOn);
  stage.classList.toggle("danger", dangerOn);
  panicBtn.classList.toggle("dangerOn", dangerOn);
  dangerbar.textContent = dangerOn
    ? "⚠️ PERIGO ATIVO • sua localização será compartilhada (simulação)"
    : "";
}

/* =======================
   Timeline / Player
======================= */
let index = 0;

function renderRail(){
  rail.innerHTML = "";
  posts.forEach((p, i)=>{
    const c = document.createElement("div");
    c.className = "card";
    c.innerHTML = \`
      <video src="\${p.url}" muted playsinline preload="metadata"></video>
      <div class="meta"><span>\${p.user}</span><span>\${p.title}</span></div>
    \`;
    c.addEventListener("click", ()=>openPost(i));
    rail.appendChild(c);
  });
}

function openPost(i){
  index = (i+posts.length)%posts.length;
  player.src = posts[index].url;
  player.play().catch(()=>{});
}

renderRail();
openPost(0);

/* swipe na tela grande para trocar */
let sx=0, sy=0;
stage.addEventListener("touchstart", (e)=>{
  const t=e.touches[0]; sx=t.clientX; sy=t.clientY;
},{passive:true});
stage.addEventListener("touchend", (e)=>{
  const t=e.changedTouches[0];
  const dx=t.clientX - sx, dy=t.clientY - sy;
  if(Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)){
    openPost(index + (dx<0 ? 1 : -1));
  }
},{passive:true});

/* =======================
   Abas
======================= */
function showHome(){
  setActiveTab("home");
  const u = currentUser();
  if(!u) return showLogin();
  const myPosts = load(LS.posts, posts).filter(p=>p.owner===u.id);
  openModal(\`
    <h2><i class="fa-solid fa-house"></i> Seu perfil</h2>
    <div class="small">Aqui vai sua timeline (postagens). Sem banco ainda, mas já dá pra postar e apagar.</div>
    <hr/>
    <div class="row">
      <input id="postUrl" placeholder="Cole um link de vídeo (mp4) ou imagem (não implementado)"/>
      <button class="btn" onclick="window.__addPost()">Postar</button>
    </div>
    <div class="small" style="margin-top:6px">Dica: use link mp4.</div>
    <hr/>
    <div class="list">
      \${myPosts.length? myPosts.map(p=>\`
        <div class="item">
          <div class="kv"><span>\${p.title||"Post"}</span><span>\${p.user}</span></div>
          <div style="margin-top:8px;display:flex;gap:8px">
            <button class="btn ghost" onclick="window.__openAny('\${p.url}')">Abrir</button>
            <button class="btn ghost" onclick="window.__delPost('\${p.id}')">Apagar</button>
          </div>
        </div>\`).join("") : \`<div class="small">Sem posts ainda.</div>\`}
    </div>
  \`);
  window.__openAny = (url)=>{ panel.style.display="none"; player.src=url; player.play().catch(()=>{}); setActiveTab("timeline"); };
  window.__addPost = ()=>{
    const url = document.getElementById("postUrl").value.trim();
    if(!url) return alert("Cole um link mp4");
    const all = load(LS.posts, posts);
    const id = "u"+Math.random().toString(16).slice(2);
    all.unshift({id, owner:u.id, user:"@"+u.id, url, title:"Post de "+u.id});
    save(LS.posts, all);
    posts = all; renderRail(); panel.style.display="none";
  };
  window.__delPost = (id)=>{
    let all = load(LS.posts, posts);
    all = all.filter(p=>p.id!==id);
    save(LS.posts, all);
    posts = all; renderRail(); panel.style.display="none";
  };
}

function showTrade(){
  setActiveTab("trade");
  const u = currentUser();
  if(!u) return showLogin();
  const trades = load(LS.trades, []);
  openModal(\`
    <h2><i class="fa-solid fa-right-left"></i> O que tem pra mim</h2>
    <div class="small">Trocas (simples). Você posta um item, outra pessoa pode propor troca com mensagem.</div>
    <hr/>
    <div class="row">
      <input id="tTitle" placeholder="O que você está oferecendo? (ex: iPhone 8)"/>
      <button class="btn" onclick="window.__addTrade()">Publicar</button>
    </div>
    <hr/>
    <div class="list">
      \${trades.length? trades.map(t=>\`
        <div class="item">
          <div class="kv"><span><b>\${t.title}</b></span><span>@\${t.owner}</span></div>
          <div class="small" style="margin-top:6px">\${t.msg||""}</div>
          <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn ghost" onclick="window.__offer('\${t.id}')">Propor troca</button>
            \${t.owner===u.id ? \`<button class="btn ghost" onclick="window.__delTrade('\${t.id}')">Apagar</button>\`:""}
          </div>
        </div>\`).join("") : \`<div class="small">Nada publicado ainda.</div>\`}
    </div>
  \`);
  window.__addTrade = ()=>{
    const title = document.getElementById("tTitle").value.trim();
    if(!title) return alert("Digite o que você quer trocar");
    const all = load(LS.trades, []);
    all.unshift({id:"t"+Math.random().toString(16).slice(2), owner:u.id, title});
    save(LS.trades, all);
    panel.style.display="none";
  };
  window.__delTrade = (id)=>{
    let all = load(LS.trades, []);
    all = all.filter(t=>t.id!==id);
    save(LS.trades, all);
    panel.style.display="none";
  };
  window.__offer = (id)=>{
    const all = load(LS.trades, []);
    const t = all.find(x=>x.id===id);
    if(!t) return;
    const msg = prompt("Escreva sua proposta (ex: troco por X):");
    if(msg===null) return;
    t.msg = msg;
    save(LS.trades, all);
    alert("Proposta enviada (simulação). Depois a gente liga isso no chat.");
    panel.style.display="none";
  };
}

function showChat(){
  setActiveTab("chat");
  const u = currentUser();
  if(!u) return showLogin();
  const chats = load(LS.chats, {});
  openModal(\`
    <h2><i class="fa-solid fa-comments"></i> Chat</h2>
    <div class="small">Digite o @id de alguém (ex: @admin) para abrir conversa.</div>
    <hr/>
    <div class="row">
      <input id="toUser" placeholder="@id do usuário"/>
      <button class="btn" onclick="window.__openChat()">Abrir</button>
    </div>
    <hr/>
    <div class="small">Conversas salvas no seu navegador por enquanto.</div>
  \`);
  window.__openChat = ()=>{
    const to = document.getElementById("toUser").value.trim().replace("@","");
    if(!to) return;
    if(!users[to]) return alert("Usuário não existe ainda.");
    const key = [u.id,to].sort().join("|");
    const thread = chats[key] || [];
    openModal(\`
      <h2><i class="fa-solid fa-message"></i> @\${u.id} ↔ @\${to}</h2>
      <div class="list" style="max-height:45vh;overflow:auto" id="thread">
        \${thread.map(m=>\`<div class="item"><div class="kv"><span>@\${m.from}</span><span>\${new Date(m.ts).toLocaleString()}</span></div><div style="margin-top:6px">\${escapeHtml(m.text)}</div></div>\`).join("") || '<div class="small">Sem mensagens.</div>'}
      </div>
      <hr/>
      <div class="row">
        <input id="msg" placeholder="Mensagem..."/>
        <button class="btn" onclick="window.__sendMsg('\${to}')">Enviar</button>
      </div>
    \`);
    window.__sendMsg = (to2)=>{
      const text = document.getElementById("msg").value.trim();
      if(!text) return;
      const k = [u.id,to2].sort().join("|");
      const all = load(LS.chats, {});
      all[k] = all[k] || [];
      all[k].push({from:u.id, text, ts:Date.now()});
      save(LS.chats, all);
      document.getElementById("msg").value="";
      // reabrir pra atualizar
      panel.style.display="none";
      showChat();
    };
  };
}

function showCam(){
  setActiveTab("cam");
  openModal(\`
    <h2><i class="fa-solid fa-camera"></i> Câmera</h2>
    <div class="small">Na Vercel funciona no navegador, mas depende de permissão. (Só preview)</div>
    <hr/>
    <button class="btn" onclick="window.__openCam()">Abrir câmera na tela grande</button>
    <button class="btn ghost" onclick="window.__closeCam()" style="margin-left:8px">Fechar</button>
  \`);
  window.__openCam = async ()=>{
    try{
      const stream = await navigator.mediaDevices.getUserMedia({video:true,audio:false});
      player.srcObject = stream;
      player.muted = true;
      player.play().catch(()=>{});
      panel.style.display="none";
    }catch(e){
      alert("Permita a câmera no navegador.");
    }
  };
  window.__closeCam = ()=>{
    if(player.srcObject){
      player.srcObject.getTracks().forEach(t=>t.stop());
      player.srcObject = null;
      openPost(index);
    }
    panel.style.display="none";
  };
}

function togglePanic(){
  dangerOn = !dangerOn;
  applyDangerUI();
}

function showAdm(){
  setActiveTab("adm");
  const u = currentUser();
  if(!u || u.role!=="master") return alert("Somente ADM master.");
  const allUsers = Object.entries(users).map(([id, v])=>({id,...v}));
  openModal(\`
    <h2><i class="fa-solid fa-shield-halved"></i> Painel ADM Master</h2>
    <div class="small">Controle básico (sem banco). BLUE e cargos ficam salvos no navegador.</div>
    <hr/>
    <div class="list">
      \${allUsers.map(x=>\`
        <div class="item">
          <div class="kv"><span><b>@\${x.id}</b></span><span>role: \${x.role||"user"} • BLUE: \${x.blue||0}</span></div>
          <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn ghost" onclick="window.__giveBlue('\${x.id}')">Dar BLUE</button>
            <button class="btn ghost" onclick="window.__setMod('\${x.id}', true)">Tornar MOD</button>
            <button class="btn ghost" onclick="window.__setMod('\${x.id}', false)">Remover MOD</button>
          </div>
        </div>\`).join("")}
    </div>
  \`);
  window.__giveBlue = (id)=>{
    const n = prompt("Quantos BLUE?");
    const val = Number(n);
    if(!Number.isFinite(val) || val<=0) return;
    users[id].blue = (users[id].blue||0) + val;
    save(LS.users, users);
    refreshHeader();
    alert("OK. BLUE atualizado.");
    panel.style.display="none";
  };
  window.__setMod = (id, on)=>{
    if(id==="admin") return alert("Admin master não muda.");
    users[id].role = on ? "mod" : "user";
    save(LS.users, users);
    alert("OK.");
    panel.style.display="none";
  };
}

/* =======================
   Login / Cadastro
======================= */
function showLogin(){
  openModal(\`
    <h2><i class="fa-solid fa-user"></i> Entrar / Cadastrar</h2>
    <div class="small">Admin master: <b>admin</b> / <b>1533</b></div>
    <hr/>
    <div class="row">
      <input id="lgUser" placeholder="Usuário (ex: joao)"/>
      <input id="lgPass" placeholder="Senha" type="password"/>
    </div>
    <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn" onclick="window.__doLogin()">Entrar</button>
      <button class="btn ghost" onclick="window.__doSignup()">Cadastrar</button>
      <button class="btn ghost" onclick="window.__logout()">Sair</button>
    </div>
    <hr/>
    <div class="small">Dica: cadastro salva no celular (localStorage). Depois a gente coloca banco de verdade.</div>
  \`);
  window.__doLogin = ()=>{
    const u = document.getElementById("lgUser").value.trim();
    const p = document.getElementById("lgPass").value;
    if(!u||!p) return alert("Preencha usuário e senha.");
    if(!users[u] || users[u].pass!==p) return alert("Login inválido.");
    session = {user:u, ts:Date.now()};
    save(LS.session, session);
    refreshHeader();
    panel.style.display="none";
  };
  window.__doSignup = ()=>{
    const u = document.getElementById("lgUser").value.trim();
    const p = document.getElementById("lgPass").value;
    if(!u||!p) return alert("Preencha usuário e senha.");
    if(users[u]) return alert("Esse usuário já existe.");
    users[u] = {pass:p, role:"user", blue:0, kids:0};
    save(LS.users, users);
    alert("Cadastrado! Agora entre.");
  };
  window.__logout = ()=>{
    session = null; save(LS.session, null);
    refreshHeader();
    panel.style.display="none";
  };
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
}

/* =======================
   Eventos da barra
======================= */
document.querySelectorAll(".navbtn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const t = btn.dataset.tab;
    if(btn.id==="loginBtn") return showLogin();
    if(t==="timeline"){ setActiveTab("timeline"); panel.style.display="none"; return; }
    if(t==="home") return showHome();
    if(t==="trade") return showTrade();
    if(t==="chat") return showChat();
    if(t==="cam") return showCam();
    if(t==="panic") return togglePanic();
    if(t==="adm") return showAdm();
  });
});

refreshHeader();
applyDangerUI();
</script>
</body>
</html>`);
});

module.exports = app;
