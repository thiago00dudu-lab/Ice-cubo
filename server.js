const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// -------------------- MEMÓRIA (sem DB) --------------------
const SESS = new Map(); // sid -> username
const USERS = new Map(); // username -> userObj
const POSTS = []; // {id,type,content,caption,author,ts}
const TRADES = []; // {id,author,have,want,media,ts,status,proposals:[{from,offer,media,ts}]}
const CHATS = new Map(); // key "a|b" -> [{from,text,ts}]

const BLUE = {
  name: "BLUE",
  maxSupply: 22000000,
  minted: 0
};

function now() { return Date.now(); }
function rid(prefix="id"){ return prefix + "_" + Math.random().toString(36).slice(2,10) + "_" + now().toString(36); }
function esc(s=""){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function parseCookies(req){
  const raw = req.headers.cookie || "";
  const out = {};
  raw.split(";").map(x=>x.trim()).filter(Boolean).forEach(p=>{
    const i = p.indexOf("=");
    if(i>-1) out[p.slice(0,i)] = decodeURIComponent(p.slice(i+1));
  });
  return out;
}
function setCookie(res, name, value){
  // Lax pra funcionar normal no mobile
  res.setHeader("Set-Cookie", `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax`);
}
function clearCookie(res, name){
  res.setHeader("Set-Cookie", `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
}

function getUser(req){
  const c = parseCookies(req);
  const sid = c.sid;
  if(!sid) return null;
  const uname = SESS.get(sid);
  if(!uname) return null;
  return USERS.get(uname) || null;
}

function ensureAdminUser(){
  if(!USERS.has("admin")){
    USERS.set("admin", {
      username:"admin",
      pass:"1533",
      role:"OWNER", // OWNER = admin master
      parent:null,
      children:[],
      created: now(),
      lastSeen: now(),
      onlineMs: 0,
      blue: 0,
      blocked: false
    });
  }
}
ensureAdminUser();

// -------------------- LAYOUT --------------------
function layout({title="ICE-CUBO", body=""}){
  return `<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>
<title>${esc(title)}</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
:root{
  --bg1:#071a2b; --bg2:#0b2e4a;
  --card:rgba(255,255,255,.06);
  --card2:rgba(255,255,255,.09);
  --txt:#e6f2ff; --mut:#9cc6ff;
  --pri:#38bdf8; --danger:#ef4444;
  --gold:#f8d34a; --blueStar:#60a5fa;
  --glass:rgba(15, 23, 42, .55);
  --glass2:rgba(30, 41, 59, .55);
  --stroke:rgba(148,163,184,.25);
}
*{box-sizing:border-box}
body{
  margin:0; color:var(--txt); font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;
  min-height:100vh; overflow:hidden;
  background:
    radial-gradient(900px 500px at 30% 15%, rgba(56,189,248,.18), transparent 55%),
    radial-gradient(800px 600px at 70% 40%, rgba(96,165,250,.12), transparent 60%),
    linear-gradient(180deg,var(--bg1),var(--bg2));
}

/* Fundo tropical (bolhas + conchinhas/estrelas simples) */
.ocean{
  position:fixed; inset:0; pointer-events:none; opacity:.9;
  background:
    radial-gradient(8px 8px at 12% 80%, rgba(255,255,255,.10), transparent 60%),
    radial-gradient(10px 10px at 86% 72%, rgba(255,255,255,.10), transparent 60%),
    radial-gradient(7px 7px at 22% 62%, rgba(255,255,255,.10), transparent 60%),
    radial-gradient(12px 12px at 40% 88%, rgba(255,255,255,.09), transparent 60%),
    radial-gradient(9px 9px at 66% 78%, rgba(255,255,255,.09), transparent 60%),
    radial-gradient(6px 6px at 78% 90%, rgba(255,255,255,.09), transparent 60%);
  filter: blur(.2px);
}
.bubble{
  position:absolute; bottom:-60px; width:18px; height:18px; border-radius:50%;
  border:1px solid rgba(255,255,255,.18);
  background:radial-gradient(circle at 30% 30%, rgba(255,255,255,.25), rgba(255,255,255,0) 65%);
  animation: rise linear infinite;
  opacity:.7;
}
@keyframes rise{
  from{ transform:translateY(0) translateX(0) scale(1); opacity:.0}
  10%{opacity:.7}
  to{ transform:translateY(-110vh) translateX(30px) scale(1.25); opacity:0}
}

.topbar{
  height:56px; display:flex; align-items:center; justify-content:space-between;
  padding:0 12px; position:sticky; top:0; z-index:5;
  backdrop-filter: blur(10px);
  background: linear-gradient(180deg, rgba(15,23,42,.75), rgba(15,23,42,.35));
  border-bottom:1px solid var(--stroke);
}
.brand{
  display:flex; align-items:center; gap:10px; font-weight:900; letter-spacing:.6px;
}
.brand .logo{
  width:34px; height:34px; border-radius:12px; display:grid; place-items:center;
  background: radial-gradient(circle at 30% 30%, rgba(56,189,248,.35), rgba(59,130,246,.18));
  border:1px solid rgba(148,163,184,.25);
  position:relative; overflow:hidden;
}
.brand .logo:before{
  content:""; position:absolute; inset:-30%;
  background:conic-gradient(from 210deg, rgba(56,189,248,.0), rgba(56,189,248,.35), rgba(56,189,248,.0));
  animation: spin 5s linear infinite;
}
@keyframes spin{ to{transform:rotate(360deg)} }
.brand .logo i{ position:relative; z-index:2; color:rgba(255,255,255,.9) }
.brand .name{
  display:flex; flex-direction:column; line-height:1;
}
.brand .name b{ font-size:16px }
.brand .name span{ font-size:11px; color:var(--mut); font-weight:700 }
.rightInfo{ display:flex; align-items:center; gap:10px; color:var(--mut); font-weight:700; font-size:12px; }
.pill{
  padding:6px 10px; border-radius:999px; border:1px solid var(--stroke);
  background:rgba(30,41,59,.45);
  display:flex; align-items:center; gap:8px;
}

.app{
  height: calc(100vh - 56px);
  display:flex; flex-direction:column;
}
.stage{
  height:44vh; min-height:250px;
  margin:10px 10px 6px;
  border-radius:22px;
  border:1px solid var(--stroke);
  overflow:hidden; position:relative;
  background: radial-gradient(1400px 500px at 50% 10%, rgba(56,189,248,.08), transparent 60%),
              rgba(0,0,0,.72);
}
.stageMedia, .stageImg{
  position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; display:none;
}
.stageText{
  position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
  color:rgba(255,255,255,.8); font-weight:800; text-align:center; padding:20px;
}
.stageHint{
  position:absolute; left:12px; top:12px; font-size:12px; color:rgba(255,255,255,.75);
  background:rgba(0,0,0,.35); border:1px solid rgba(255,255,255,.12);
  padding:6px 10px; border-radius:999px; backdrop-filter: blur(8px);
}
.stageFull{
  position:absolute; right:12px; top:12px; font-size:12px; color:rgba(255,255,255,.75);
  background:rgba(0,0,0,.35); border:1px solid rgba(255,255,255,.12);
  padding:6px 10px; border-radius:999px; backdrop-filter: blur(8px);
  display:flex; gap:8px; align-items:center;
}
.liveBtn{
  position:absolute; right:14px; bottom:14px;
  border:0; border-radius:999px; padding:10px 14px;
  background:var(--danger); color:white; font-weight:900; cursor:pointer;
  box-shadow: 0 12px 30px rgba(239,68,68,.18);
}
.liveBtn.off{ background:rgba(255,255,255,.14); color:rgba(255,255,255,.9); border:1px solid rgba(255,255,255,.18); }
.panicLamp{
  position:absolute; left:14px; bottom:14px; padding:9px 12px; border-radius:999px;
  background:rgba(255,255,255,.14); border:1px solid rgba(255,255,255,.18);
  color:rgba(255,255,255,.9); font-weight:900; display:none;
}
.panicLamp.on{
  display:flex; align-items:center; gap:8px;
  background:rgba(239,68,68,.22);
  border-color:rgba(239,68,68,.35);
  animation: pulse 1.2s ease-in-out infinite;
}
@keyframes pulse{
  0%,100%{ transform:scale(1); box-shadow:0 0 0 rgba(239,68,68,.0) }
  50%{ transform:scale(1.02); box-shadow:0 0 24px rgba(239,68,68,.25) }
}

.strip{
  margin:0 10px 6px;
  padding:10px;
  border-radius:18px;
  border:1px solid var(--stroke);
  background:rgba(15,23,42,.25);
  backdrop-filter: blur(10px);
  overflow:auto;
  display:flex; gap:10px;
  -webkit-overflow-scrolling: touch;
}
.thumb{
  min-width:130px; height:82px; border-radius:16px; overflow:hidden;
  border:1px solid rgba(148,163,184,.22);
  background:rgba(255,255,255,.06);
  position:relative; cursor:pointer;
}
.thumb img, .thumb video{
  width:100%; height:100%; object-fit:cover; display:block;
}
.thumb .tag{
  position:absolute; left:8px; bottom:8px;
  padding:4px 8px; border-radius:999px; font-size:11px; font-weight:900;
  background:rgba(0,0,0,.4); border:1px solid rgba(255,255,255,.12);
}
.section{
  flex:1; margin:0 10px 70px; overflow:auto; padding-bottom:20px;
  -webkit-overflow-scrolling: touch;
}
.card{
  border-radius:18px; border:1px solid var(--stroke);
  background:rgba(30,41,59,.35); backdrop-filter: blur(10px);
  margin:10px 0; overflow:hidden;
}
.cardHead{
  display:flex; justify-content:space-between; align-items:center;
  padding:10px 12px; border-bottom:1px solid rgba(148,163,184,.15);
}
.userLine{ display:flex; align-items:center; gap:8px; font-weight:900; }
.starGold{ color:var(--gold) }
.starBlue{ color:var(--blueStar) }
.kids{ color:rgba(255,255,255,.75); font-size:12px; font-weight:800; padding:2px 8px; border:1px solid rgba(255,255,255,.12); border-radius:999px; background:rgba(0,0,0,.2) }
.smallBtn{
  border:1px solid rgba(148,163,184,.22);
  background:rgba(255,255,255,.08);
  color:rgba(255,255,255,.9);
  padding:8px 10px; border-radius:12px; font-weight:900; cursor:pointer;
}
.smallBtn.danger{ border-color: rgba(239,68,68,.35); background:rgba(239,68,68,.18); }

.media{
  width:100%; max-height:360px; object-fit:cover; display:block;
}
.caption{ padding:10px 12px; color:rgba(255,255,255,.85); }
.caption small{ color:var(--mut); font-weight:700 }

.nav{
  position:fixed; left:0; right:0; bottom:0; z-index:6;
  height:64px; display:flex; justify-content:space-around; align-items:center;
  background: linear-gradient(180deg, rgba(15,23,42,.05), rgba(15,23,42,.78));
  border-top:1px solid var(--stroke);
  backdrop-filter: blur(12px);
}
.navBtn{
  width:46px; height:46px; border-radius:16px; display:grid; place-items:center;
  color:rgba(255,255,255,.85);
  border:1px solid rgba(148,163,184,.18);
  background:rgba(255,255,255,.06);
}
.navBtn.active{ border-color:rgba(56,189,248,.45); background:rgba(56,189,248,.12); color:white; }
.navBtn.danger{ border-color:rgba(239,68,68,.35); background:rgba(239,68,68,.12); }
.badge{
  position:absolute; transform: translate(12px,-14px);
  background:rgba(56,189,248,.95); color:#001018;
  border-radius:999px; font-size:10px; font-weight:900;
  padding:2px 6px; border:1px solid rgba(255,255,255,.25);
}

.modal{
  position:fixed; inset:0; display:none; z-index:10;
  background:rgba(0,0,0,.55);
  align-items:flex-end;
}
.sheet{
  width:100%; max-height:88vh; overflow:auto;
  border-radius:22px 22px 0 0;
  border:1px solid rgba(148,163,184,.25);
  background:rgba(15,23,42,.82);
  backdrop-filter: blur(14px);
  padding:14px;
}
.sheet h2{ margin:6px 0 10px; }
.row{ display:flex; gap:10px; }
.input, textarea{
  width:100%; padding:12px 12px; border-radius:14px;
  border:1px solid rgba(148,163,184,.22);
  background:rgba(255,255,255,.06);
  color:rgba(255,255,255,.92);
  outline:none;
}
textarea{ min-height:90px; resize:none; }
hr{ border:0; border-top:1px solid rgba(148,163,184,.18); margin:12px 0; }
.note{ color:var(--mut); font-weight:700; font-size:12px; }
.grid2{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.listItem{
  border:1px solid rgba(148,163,184,.18);
  background:rgba(255,255,255,.05);
  border-radius:16px;
  padding:10px;
}
.pair{
  display:flex; align-items:center; justify-content:space-between; gap:8px;
}
a.link{ color:var(--pri); text-decoration:none; font-weight:900; }
.dangerBar{
  position:fixed; inset:0; pointer-events:none; display:none; z-index:9;
  border:2px solid rgba(239,68,68,.55);
  box-shadow: inset 0 0 0 9999px rgba(239,68,68,.06);
}
.dangerBar.on{ display:block; animation: pulse 1.2s ease-in-out infinite; }

.center{ min-height:100vh; display:flex; align-items:center; justify-content:center; padding:16px; }
.auth{
  width:min(420px, 92vw);
  border-radius:22px;
  border:1px solid var(--stroke);
  background:rgba(15,23,42,.60);
  backdrop-filter: blur(14px);
  padding:16px;
}
.auth h1{ margin:4px 0 2px }
.auth p{ margin:0 0 12px; color:var(--mut); font-weight:700; }
.auth .brandRow{ display:flex; gap:12px; align-items:center; margin-bottom:12px; }
.auth .brandRow .mark{
  width:54px; height:54px; border-radius:18px;
  border:1px solid rgba(148,163,184,.25);
  background: radial-gradient(circle at 30% 30%, rgba(56,189,248,.35), rgba(59,130,246,.18));
  display:grid; place-items:center; position:relative; overflow:hidden;
}
.auth .brandRow .mark:before{
  content:""; position:absolute; inset:-30%;
  background:conic-gradient(from 210deg, rgba(56,189,248,.0), rgba(56,189,248,.35), rgba(56,189,248,.0));
  animation: spin 5s linear infinite;
}
.auth .brandRow .mark i{ position:relative; z-index:1; font-size:22px }
.btn{
  width:100%; padding:12px 12px; border:0; border-radius:16px;
  background:rgba(56,189,248,.95);
  color:#001018; font-weight:1000; cursor:pointer;
}
.btnAlt{
  width:100%; padding:12px 12px; border-radius:16px;
  border:1px solid rgba(148,163,184,.22);
  background:rgba(255,255,255,.06);
  color:rgba(255,255,255,.92); font-weight:900; cursor:pointer;
}
</style>
</head>
<body>
<div class="ocean" id="ocean"></div>
${body}
</body></html>`;
}

// -------------------- AUTH PAGES --------------------
function authPage(type="login", msg=""){
  const isLogin = type === "login";
  return layout({
    title: "ICE-CUBO",
    body: `
<div class="center">
  <div class="auth">
    <div class="brandRow">
      <div class="mark"><i class="fa-solid fa-cube"></i></div>
      <div>
        <h1>ICE-CUBO</h1>
        <p>Futurístico • Tropical • Social</p>
      </div>
    </div>
    ${msg ? `<div class="note" style="margin-bottom:10px;color:#ffd1d1">${esc(msg)}</div>` : ""}
    ${isLogin ? `
      <form method="POST" action="/login">
        <input class="input" name="user" placeholder="Usuário" required />
        <div style="height:10px"></div>
        <input class="input" name="pass" type="password" placeholder="Senha" required />
        <div style="height:10px"></div>
        <button class="btn" type="submit">Entrar</button>
      </form>
      <div style="height:10px"></div>
      <a class="link" href="/cadastro">Criar conta</a>
    ` : `
      <form method="POST" action="/cadastro">
        <input class="input" name="user" placeholder="Usuário" required />
        <div style="height:10px"></div>
        <input class="input" name="pass" type="password" placeholder="Senha" required />
        <div style="height:10px"></div>
        <input class="input" name="ref" placeholder="Código do pai (opcional)" />
        <div style="height:10px"></div>
        <button class="btn" type="submit">Cadastrar</button>
      </form>
      <div style="height:10px"></div>
      <a class="link" href="/">Voltar</a>
      <div style="height:10px"></div>
      <div class="note">Dica: se você veio por alguém, coloque o usuário dele como “código do pai”.</div>
    `}
  </div>
</div>

<script>
(function bubbles(){
  const ocean=document.getElementById("ocean");
  for(let i=0;i<14;i++){
    const b=document.createElement("div");
    b.className="bubble";
    b.style.left=Math.random()*100+"%";
    b.style.animationDuration=(6+Math.random()*7)+"s";
    b.style.animationDelay=(Math.random()*4)+"s";
    b.style.width=b.style.height=(12+Math.random()*22)+"px";
    ocean.appendChild(b);
  }
})();
</script>
`
  });
}

// -------------------- APP PAGE --------------------
function appPage(u){
  const isOwner = u.role === "OWNER";
  const isMod = u.role === "MOD";
  const star = isOwner ? `<i class="fa-solid fa-star starGold"></i>` : (isMod ? `<i class="fa-solid fa-star starBlue"></i>` : "");
  const kids = (u.children?.length || 0);

  return layout({
    title:"ICE-CUBO",
    body: `
<div class="dangerBar" id="dangerBar"></div>

<div class="topbar">
  <div class="brand">
    <div class="logo" title="BLUE + gelo"><i class="fa-solid fa-cube"></i></div>
    <div class="name">
      <b>ICE-CUBO</b>
      <span>BLUE • Trocas • Lives</span>
    </div>
  </div>
  <div class="rightInfo">
    <div class="pill" title="Seu perfil">
      <span>${star}</span>
      <span>@${esc(u.username)}</span>
      <span class="kids" title="Filhos indicados">+${kids}</span>
    </div>
    <div class="pill" title="Saldo BLUE">
      <i class="fa-solid fa-coins"></i>
      <span id="blueBal">${u.blue||0}</span>
      <span>BLUE</span>
    </div>
    <a class="link" href="/sair" style="margin-left:4px">Sair</a>
  </div>
</div>

<div class="app">
  <div class="stage" id="stage">
    <div class="stageHint"><i class="fa-solid fa-hand-pointer"></i> Toque p/ abrir • Arraste p/ lado</div>
    <div class="stageFull"><i class="fa-solid fa-expand"></i> 2 toques: tela cheia</div>
    <div class="stageText" id="stageText">Toque em um item abaixo para abrir no palco<br><span style="opacity:.75;font-weight:700;font-size:12px">ou clique LIVE para câmera</span></div>
    <img class="stageImg" id="stageImg" alt=""/>
    <video class="stageMedia" id="stageVid" playsinline controls></video>
    <video class="stageMedia" id="cam" autoplay playsinline muted></video>
    <button class="liveBtn off" id="liveBtn"><i class="fa-solid fa-video"></i> LIVE</button>
    <div class="panicLamp" id="panicLamp"><i class="fa-solid fa-triangle-exclamation"></i> Perigo ATIVO • localização compartilhada</div>
  </div>

  <div class="strip" id="strip"></div>

  <div class="section" id="section"></div>
</div>

<div class="nav">
  <div class="navBtn active" id="navHome" onclick="go('home')" title="Timeline"><i class="fa-solid fa-house"></i></div>
  <div class="navBtn" id="navSwap" onclick="go('swap')" title="O que tem pra mim"><i class="fa-solid fa-arrows-rotate"></i></div>
  <div class="navBtn" id="navPost" onclick="openPost()" title="Postar"><i class="fa-solid fa-plus"></i></div>
  <div class="navBtn" id="navChat" onclick="go('chat')" title="Mensagens"><i class="fa-solid fa-comments"></i></div>
  <div class="navBtn danger" id="navPanic" onclick="togglePanic()" title="Perigo"><i class="fa-solid fa-siren-on"></i></div>
  ${isOwner ? `<div class="navBtn" id="navAdm" onclick="go('adm')" title="ADM"><i class="fa-solid fa-shield-halved"></i></div>` : ``}
</div>

<!-- MODAL -->
<div class="modal" id="modal" onclick="if(event.target.id==='modal')closeModal()">
  <div class="sheet" id="sheet"></div>
</div>

<script>
/* bolhas */
(function bubbles(){
  const ocean=document.getElementById("ocean");
  for(let i=0;i<14;i++){
    const b=document.createElement("div");
    b.className="bubble";
    b.style.left=Math.random()*100+"%";
    b.style.animationDuration=(6+Math.random()*7)+"s";
    b.style.animationDelay=(Math.random()*4)+"s";
    b.style.width=b.style.height=(12+Math.random()*22)+"px";
    ocean.appendChild(b);
  }
})();

const ME = ${JSON.stringify({username:u.username, role:u.role})};

const stage = document.getElementById("stage");
const stageText = document.getElementById("stageText");
const stageImg = document.getElementById("stageImg");
const stageVid = document.getElementById("stageVid");
const cam = document.getElementById("cam");
const liveBtn = document.getElementById("liveBtn");
const strip = document.getElementById("strip");
const section = document.getElementById("section");
const modal = document.getElementById("modal");
const sheet = document.getElementById("sheet");
const panicLamp = document.getElementById("panicLamp");
const dangerBar = document.getElementById("dangerBar");
const blueBal = document.getElementById("blueBal");

let ST = {
  tab: "home",
  items: [],
  idx: 0,
  stream: null,
  panic: false,
  loc: null
};

// ---------- HELPERS ----------
function q(s){ return document.querySelector(s); }
function setActiveNav(){
  ["Home","Swap","Post","Chat","Panic","Adm"].forEach(k=>{
    const el = document.getElementById("nav"+k);
    if(!el) return;
    el.classList.remove("active");
  });
  if(ST.tab==="home") navHome.classList.add("active");
  if(ST.tab==="swap") navSwap.classList.add("active");
  if(ST.tab==="chat") navChat.classList.add("active");
  if(ST.tab==="adm") { const el=document.getElementById("navAdm"); if(el) el.classList.add("active"); }
}
function openModal(html){
  sheet.innerHTML = html;
  modal.style.display = "flex";
}
function closeModal(){ modal.style.display="none"; sheet.innerHTML=""; }
async function api(path, opts={}){
  const res = await fetch(path, { headers: {"Content-Type":"application/json"}, ...opts });
  const t = await res.text();
  try { return JSON.parse(t); } catch { return { ok:false, error:t || "Erro" }; }
}
function stopAll(){
  // camera
  if(ST.stream){
    ST.stream.getTracks().forEach(t=>t.stop());
    ST.stream=null;
  }
  cam.style.display="none";
  cam.srcObject=null;
  liveBtn.classList.add("off");
  liveBtn.innerHTML = '<i class="fa-solid fa-video"></i> LIVE';
  // video
  stageVid.pause();
  stageVid.style.display="none";
  stageVid.src = "";
  // img
  stageImg.style.display="none";
  stageImg.src = "";
  // text
  stageText.style.display="flex";
}
function showItem(it){
  stopAll();
  stageText.style.display="none";
  if(it.type==="img"){
    stageImg.src = it.content;
    stageImg.style.display="block";
  }else{
    stageVid.src = it.content;
    stageVid.style.display="block";
    stageVid.play().catch(()=>{});
  }
}

// ---------- SWIPE (palco) ----------
let touchStartX=null, touchStartY=null, touchT=0;
stage.addEventListener("touchstart",(e)=>{
  const t=e.touches[0];
  touchStartX=t.clientX; touchStartY=t.clientY; touchT=Date.now();
},{passive:true});
stage.addEventListener("touchend",(e)=>{
  if(touchStartX==null) return;
  const t=e.changedTouches[0];
  const dx=t.clientX-touchStartX, dy=t.clientY-touchStartY;
  const dt=Date.now()-touchT;
  touchStartX=null;
  if(Math.abs(dx)>50 && Math.abs(dy)<60 && dt<600){
    if(dx<0) next();
    else prev();
  }
},{passive:true});

// ---------- DOUBLE TAP (tela cheia do palco) ----------
let lastTap=0;
stage.addEventListener("click", ()=>{
  const now=Date.now();
  if(now-lastTap<320){
    // double
    toggleFull();
    lastTap=0;
  }else{
    lastTap=now;
  }
});
function toggleFull(){
  const el = stage;
  if(!document.fullscreenElement){
    el.requestFullscreen?.().catch(()=>{});
  }else{
    document.exitFullscreen?.().catch(()=>{});
  }
}

// ---------- LIVE ----------
liveBtn.onclick = async ()=>{
  // alterna câmera
  if(!ST.stream){
    stopAll();
    try{
      ST.stream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
      cam.srcObject = ST.stream;
      cam.style.display="block";
      stageText.style.display="none";
      liveBtn.classList.remove("off");
      liveBtn.innerHTML = '<i class="fa-solid fa-stop"></i> STOP';
    }catch(e){
      alert("Permita câmera/microfone");
      ST.stream=null;
      stopAll();
    }
  }else{
    stopAll();
  }
};

// ---------- LOAD DATA ----------
async function load(){
  const data = await api("/api/data");
  if(!data.ok){ section.innerHTML = '<div class="note">Erro ao carregar. Recarregue.</div>'; return; }
  ST.items = data.items || [];
  blueBal.textContent = data.me?.blue ?? blueBal.textContent;

  buildStrip();
  if(ST.items.length){
    ST.idx = 0;
    showItem(ST.items[0]);
  }else{
    stopAll();
  }
  renderTab();
}
function buildStrip(){
  strip.innerHTML="";
  ST.items.forEach((it,i)=>{
    const d=document.createElement("div");
    d.className="thumb";
    d.innerHTML = it.type==="img"
      ? '<img src="'+it.content+'" alt=""/><div class="tag">@'+it.author+'</div>'
      : '<video src="'+it.content+'" muted playsinline></video><div class="tag">@'+it.author+'</div>';
    d.onclick = ()=>{
      ST.idx=i;
      showItem(it);
    };
    strip.appendChild(d);
  });
}
function next(){
  if(!ST.items.length) return;
  ST.idx = (ST.idx+1) % ST.items.length;
  showItem(ST.items[ST.idx]);
}
function prev(){
  if(!ST.items.length) return;
  ST.idx = (ST.idx-1+ST.items.length) % ST.items.length;
  showItem(ST.items[ST.idx]);
}

// ---------- TABS ----------
function go(tab){
  ST.tab=tab;
  setActiveNav();
  renderTab();
}
function renderTab(){
  if(ST.tab==="home") return renderHome();
  if(ST.tab==="swap") return renderSwap();
  if(ST.tab==="chat") return renderChat();
  if(ST.tab==="adm") return renderAdm();
}
function renderHome(){
  api("/api/posts").then(data=>{
    if(!data.ok){ section.innerHTML='<div class="note">Erro no feed.</div>'; return; }
    const posts = data.posts || [];
    section.innerHTML = posts.map(p=>cardPost(p)).join("") || '<div class="note">Sem posts ainda. Poste algo no botão +</div>';
  });
}
function roleStar(role){
  if(role==="OWNER") return '<i class="fa-solid fa-star starGold"></i>';
  if(role==="MOD") return '<i class="fa-solid fa-star starBlue"></i>';
  return '';
}
function cardPost(p){
  const isMine = p.author === ME.username;
  const media = p.type==="img"
    ? '<img class="media" src="'+esc(p.content)+'" alt=""/>'
    : '<video class="media" src="'+esc(p.content)+'" controls playsinline></video>';
  return `
  <div class="card">
    <div class="cardHead">
      <div class="userLine">
        ${roleStar(p.role)}
        <span>@${esc(p.author)}</span>
        <span class="kids">+${p.kids||0}</span>
      </div>
      <div class="pair">
        <button class="smallBtn" onclick="openDM('${esc(p.author)}')"><i class="fa-solid fa-paper-plane"></i></button>
        ${isMine ? `<button class="smallBtn danger" onclick="delPost('${p.id}')"><i class="fa-solid fa-trash"></i></button>` : ``}
      </div>
    </div>
    ${media}
    <div class="caption">${esc(p.caption||"")}<br><small>${new Date(p.ts).toLocaleString()}</small></div>
  </div>`;
}

async function delPost(id){
  if(!confirm("Apagar esse post?")) return;
  const r = await api("/api/post/delete", {method:"POST", body: JSON.stringify({id})});
  if(!r.ok) return alert("Não deu pra apagar");
  renderHome();
  load();
}

// ---------- POST MODAL ----------
function openPost(){
  openModal(`
    <h2><i class="fa-solid fa-plus"></i> Postar na Timeline</h2>
    <div class="note">Escolha: Foto/Imagem (link) ou Vídeo (link). (Upload real vem depois)</div>
    <div style="height:10px"></div>
    <div class="grid2">
      <div>
        <div class="note">Tipo</div>
        <select class="input" id="pType">
          <option value="img">Imagem</option>
          <option value="vid">Vídeo</option>
        </select>
      </div>
      <div>
        <div class="note">Legenda</div>
        <input class="input" id="pCap" placeholder="Escreva algo..." />
      </div>
    </div>
    <div style="height:10px"></div>
    <div class="note">Link (URL)</div>
    <input class="input" id="pUrl" placeholder="https://..." />
    <div style="height:10px"></div>
    <button class="btn" onclick="sendPost()">Publicar</button>
    <div style="height:10px"></div>
    <button class="btnAlt" onclick="closeModal()">Fechar</button>
  `);
}
async function sendPost(){
  const type = q("#pType").value;
  const caption = q("#pCap").value || "";
  const content = q("#pUrl").value || "";
  if(!content.startsWith("http")) return alert("Cole um link http/https");
  const r = await api("/api/post", {method:"POST", body: JSON.stringify({type, caption, content})});
  if(!r.ok) return alert(r.error || "Erro");
  closeModal();
  go("home");
  renderHome();
  load();
}

// ---------- TROCAS ----------
function renderSwap(){
  api("/api/trades").then(data=>{
    if(!data.ok){ section.innerHTML='<div class="note">Erro nas trocas.</div>'; return; }
    const list = data.trades || [];
    section.innerHTML = `
      <div class="card">
        <div class="cardHead">
          <div class="userLine"><i class="fa-solid fa-arrows-rotate"></i> O que tem pra mim</div>
          <button class="smallBtn" onclick="openTradeNew()"><i class="fa-solid fa-plus"></i> Nova</button>
        </div>
        <div class="caption">
          Aqui você posta o que tem para trocar, e outras pessoas mandam proposta com foto/link e chat.
        </div>
      </div>
      ${list.map(t=>tradeCard(t)).join("") || '<div class="note">Sem trocas ainda.</div>'}
    `;
  });
}
function tradeCard(t){
  const mine = t.author===ME.username;
  const status = t.status==="open" ? "Aberto" : (t.status==="closed" ? "Fechado" : t.status);
  return `
    <div class="card">
      <div class="cardHead">
        <div class="userLine">${roleStar(t.role)} @${esc(t.author)} <span class="kids">+${t.kids||0}</span></div>
        <div class="pair">
          <button class="smallBtn" onclick="openTrade('${t.id}')"><i class="fa-solid fa-eye"></i></button>
          ${mine ? `<button class="smallBtn danger" onclick="closeTrade('${t.id}')"><i class="fa-solid fa-lock"></i></button>`:``}
        </div>
      </div>
      <div class="caption">
        <b>Tenho:</b> ${esc(t.have)}<br>
        <b>Quero:</b> ${esc(t.want)}<br>
        <small>Status: ${esc(status)} • ${new Date(t.ts).toLocaleString()} • Propostas: ${t.proposalsCount||0}</small>
      </div>
    </div>
  `;
}
function openTradeNew(){
  openModal(`
    <h2><i class="fa-solid fa-arrows-rotate"></i> Nova troca</h2>
    <div class="note">Cole link de foto/vídeo (por enquanto). Depois colocamos upload.</div>
    <div style="height:10px"></div>
    <div class="note">O que você tem</div>
    <input class="input" id="tHave" placeholder="Ex: iPhone XR, tênis, videogame..." />
    <div style="height:10px"></div>
    <div class="note">O que você quer</div>
    <input class="input" id="tWant" placeholder="Ex: notebook, bicicleta..." />
    <div style="height:10px"></div>
    <div class="note">Mídia (link)</div>
    <input class="input" id="tMedia" placeholder="https://..." />
    <div style="height:10px"></div>
    <button class="btn" onclick="sendTrade()">Publicar troca</button>
    <div style="height:10px"></div>
    <button class="btnAlt" onclick="closeModal()">Fechar</button>
  `);
}
async function sendTrade(){
  const have=q("#tHave").value||"";
  const want=q("#tWant").value||"";
  const media=q("#tMedia").value||"";
  if(have.trim().length<2 || want.trim().length<2) return alert("Preencha 'tenho' e 'quero'");
  const r=await api("/api/trade", {method:"POST", body: JSON.stringify({have,want,media})});
  if(!r.ok) return alert(r.error||"Erro");
  closeModal();
  go("swap"); renderSwap();
}
async function closeTrade(id){
  if(!confirm("Fechar essa troca?")) return;
  const r=await api("/api/trade/close",{method:"POST", body: JSON.stringify({id})});
  if(!r.ok) return alert("Erro");
  renderSwap();
}
async function openTrade(id){
  const data = await api("/api/trade/"+id);
  if(!data.ok) return alert("Não achei");
  const t=data.trade;
  const mine=t.author===ME.username;
  const media = t.media ? `<div class="listItem"><div class="note">Mídia</div><a class="link" href="${esc(t.media)}" target="_blank">Abrir mídia</a></div>` : '';
  const props = (t.proposals||[]).map(p=>`
    <div class="listItem">
      <div class="pair">
        <div><b>@${esc(p.from)}</b> <span class="note">${new Date(p.ts).toLocaleString()}</span></div>
        <button class="smallBtn" onclick="openDM('${esc(p.from)}')"><i class="fa-solid fa-comments"></i></button>
      </div>
      <div style="height:6px"></div>
      <div><b>Oferta:</b> ${esc(p.offer)}</div>
      ${p.media ? `<div><b>Mídia:</b> <a class="link" href="${esc(p.media)}" target="_blank">abrir</a></div>` : ``}
    </div>
  `).join("") || `<div class="note">Sem propostas ainda.</div>`;

  openModal(`
    <h2>Troca de @${esc(t.author)}</h2>
    <div class="listItem"><b>Tenho:</b> ${esc(t.have)}<br><b>Quero:</b> ${esc(t.want)}<br><small>${new Date(t.ts).toLocaleString()}</small></div>
    ${media}
    <hr/>
    <h3>Enviar proposta</h3>
    <div class="note">Se interessou? Envie oferta + link de foto/vídeo do que você oferece.</div>
    <div style="height:10px"></div>
    <input class="input" id="pOffer" placeholder="Ex: Dou um Xbox + controle..." />
    <div style="height:10px"></div>
    <input class="input" id="pMedia" placeholder="Link da sua mídia (opcional)" />
    <div style="height:10px"></div>
    <button class="btn" onclick="sendProposal('${t.id}')">Enviar proposta</button>
    <hr/>
    <h3>Propostas (${t.proposalsCount||0})</h3>
    ${props}
    <div style="height:12px"></div>
    <button class="btnAlt" onclick="closeModal()">Fechar</button>
  `);
}
async function sendProposal(id){
  const offer=q("#pOffer").value||"";
  const media=q("#pMedia").value||"";
  if(offer.trim().length<2) return alert("Escreva sua oferta");
  const r=await api("/api/trade/propose",{method:"POST", body: JSON.stringify({id, offer, media})});
  if(!r.ok) return alert(r.error||"Erro");
  openTrade(id); // recarrega
}

// ---------- CHAT ----------
function chatKey(a,b){
  return [a,b].sort().join("|");
}
function renderChat(){
  section.innerHTML = `
    <div class="card">
      <div class="cardHead">
        <div class="userLine"><i class="fa-solid fa-comments"></i> Mensagens</div>
        <button class="smallBtn" onclick="openFindUser()"><i class="fa-solid fa-magnifying-glass"></i> Buscar</button>
      </div>
      <div class="caption">
        Digite o nome/@id do usuário para conversar no privado.
      </div>
    </div>
    <div id="chatList" class="note">Carregando...</div>
  `;
  api("/api/chats").then(d=>{
    const el=q("#chatList");
    if(!d.ok) return el.textContent="Erro";
    if(!d.list.length) return el.textContent="Nenhuma conversa ainda.";
    el.innerHTML = d.list.map(x=>`
      <div class="listItem" onclick="openDM('${esc(x.with)}')" style="cursor:pointer">
        <div class="pair">
          <div><b>@${esc(x.with)}</b></div>
          <div class="note">${new Date(x.lastTs).toLocaleString()}</div>
        </div>
        <div class="note">${esc(x.lastText||"")}</div>
      </div>
    `).join("");
  });
}
function openFindUser(){
  openModal(`
    <h2><i class="fa-solid fa-user-plus"></i> Encontrar pessoa</h2>
    <div class="note">Digite o @nome para abrir chat e virar parceiro.</div>
    <div style="height:10px"></div>
    <input class="input" id="findU" placeholder="Ex: neo" />
    <div style="height:10px"></div>
    <button class="btn" onclick="goDM()">Abrir conversa</button>
    <div style="height:10px"></div>
    <button class="btnAlt" onclick="closeModal()">Fechar</button>
  `);
}
window.goDM = ()=>{
  const u=q("#findU").value.trim().replace(/^@/,"");
  if(!u) return alert("Digite o usuário");
  openDM(u);
};
async function openDM(withUser){
  withUser = (withUser||"").replace(/^@/,"");
  if(withUser===ME.username) return alert("Você é você 😅");
  const d = await api("/api/dm/"+encodeURIComponent(withUser));
  if(!d.ok) return alert(d.error||"Não achei esse usuário");
  const msgs = d.msgs || [];
  openModal(`
    <h2>Chat com @${esc(withUser)}</h2>
    <div id="dmBox" style="display:flex;flex-direction:column;gap:8px;max-height:48vh;overflow:auto;padding:6px;">
      ${msgs.map(m=>`
        <div style="
          align-self:${m.from===ME.username?"flex-end":"flex-start"};
          max-width:84%;
          border:1px solid rgba(148,163,184,.22);
          background:${m.from===ME.username?"rgba(56,189,248,.14)":"rgba(255,255,255,.06)"};
          border-radius:16px;
          padding:10px 12px;">
          <div style="font-weight:900;font-size:12px;opacity:.9">@${esc(m.from)}</div>
          <div>${esc(m.text)}</div>
          <div class="note" style="text-align:right;margin-top:6px">${new Date(m.ts).toLocaleTimeString()}</div>
        </div>
      `).join("")}
    </div>
    <div style="height:10px"></div>
    <div class="row">
      <input class="input" id="dmText" placeholder="Mensagem..." />
      <button class="smallBtn" onclick="sendDM('${esc(withUser)}')"><i class="fa-solid fa-paper-plane"></i></button>
    </div>
    <div style="height:10px"></div>
    <button class="btnAlt" onclick="closeModal()">Fechar</button>
  `);
  setTimeout(()=>{ const b=q("#dmBox"); if(b) b.scrollTop=b.scrollHeight; },50);
}
async function sendDM(withUser){
  const text = q("#dmText").value || "";
  if(text.trim().length<1) return;
  const r = await api("/api/dm/send",{method:"POST", body: JSON.stringify({to:withUser, text})});
  if(!r.ok) return alert(r.error||"Erro");
  openDM(withUser);
}

// ---------- PANIC (perigo) ----------
async function togglePanic(){
  ST.panic = !ST.panic;
  dangerBar.classList.toggle("on", ST.panic);
  panicLamp.classList.toggle("on", ST.panic);

  if(ST.panic){
    // pedir localização
    if(!navigator.geolocation){
      alert("Seu navegador não tem geolocalização");
      ST.panic=false;
      dangerBar.classList.remove("on");
      panicLamp.classList.remove("on");
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos)=>{
      ST.loc = {lat: pos.coords.latitude, lon: pos.coords.longitude, acc: pos.coords.accuracy};
      await api("/api/panic", {method:"POST", body: JSON.stringify({on:true, loc:ST.loc})});
    }, async ()=>{
      alert("Permita localização para compartilhar");
      ST.panic=false;
      dangerBar.classList.remove("on");
      panicLamp.classList.remove("on");
      await api("/api/panic", {method:"POST", body: JSON.stringify({on:false})});
    }, {enableHighAccuracy:true, timeout:9000});
  }else{
    ST.loc=null;
    await api("/api/panic", {method:"POST", body: JSON.stringify({on:false})});
  }
}

// ---------- ADM ----------
function renderAdm(){
  if(ME.role!=="OWNER"){
    section.innerHTML='<div class="note">Sem acesso.</div>'; return;
  }
  api("/api/adm").then(d=>{
    if(!d.ok){ section.innerHTML='<div class="note">Erro ADM.</div>'; return; }
    const u = d.users||[];
    section.innerHTML = `
      <div class="card">
        <div class="cardHead">
          <div class="userLine"><i class="fa-solid fa-shield-halved"></i> Painel ADM Master</div>
          <button class="smallBtn" onclick="openBlue()"><i class="fa-solid fa-coins"></i> BLUE</button>
        </div>
        <div class="caption">
          Controle total: banir, promover moderador, ver tempo online, saldo BLUE, pânico.
          <br><small>Supply BLUE: ${BLUE.maxSupply.toLocaleString()} • Minted: ${d.blue?.minted?.toLocaleString()||0}</small>
        </div>
      </div>

      ${u.map(x=>`
        <div class="listItem">
          <div class="pair">
            <div><b>@${esc(x.username)}</b> ${roleStar(x.role)} <span class="kids">+${x.kids}</span></div>
            <div class="pair">
              <button class="smallBtn" onclick="openDM('${esc(x.username)}')"><i class="fa-solid fa-comments"></i></button>
              <button class="smallBtn ${x.blocked?'danger':''}" onclick="toggleBlock('${esc(x.username)}')">${x.blocked?'Desbloquear':'Bloquear'}</button>
            </div>
          </div>
          <div class="note">Tempo online (aprox): ${(x.onlineMin)} min • BLUE: ${x.blue} • Pânico: ${x.panic?'ATIVO':'off'}</div>
          <div style="height:8px"></div>
          <div class="pair">
            <button class="smallBtn" onclick="promote('${esc(x.username)}')">Promover MOD</button>
            <button class="smallBtn" onclick="demote('${esc(x.username)}')">Remover MOD</button>
            <button class="smallBtn" onclick="mint('${esc(x.username)}')">+ BLUE</button>
          </div>
        </div>
      `).join("")}
    `;
  });
}
async function toggleBlock(user){
  const r = await api("/api/adm/block",{method:"POST", body: JSON.stringify({user})});
  if(!r.ok) return alert("Erro");
  renderAdm();
}
async function promote(user){
  const r = await api("/api/adm/promote",{method:"POST", body: JSON.stringify({user})});
  if(!r.ok) return alert(r.error||"Erro");
  renderAdm();
}
async function demote(user){
  const r = await api("/api/adm/demote",{method:"POST", body: JSON.stringify({user})});
  if(!r.ok) return alert("Erro");
  renderAdm();
}
function openBlue(){
  openModal(\`
    <h2><i class="fa-solid fa-coins"></i> BLUE (Controle ADM)</h2>
    <div class="note">Total: ${BLUE.maxSupply.toLocaleString()} • Já emitido: <span id="mintedNow">...</span></div>
    <div style="height:10px"></div>
    <div class="note">Mint (emitir) para usuário</div>
    <input class="input" id="mUser" placeholder="usuario" />
    <div style="height:10px"></div>
    <input class="input" id="mAmt" placeholder="quantidade (ex: 100)" />
    <div style="height:10px"></div>
    <button class="btn" onclick="doMint()">Emitir BLUE</button>
    <div style="height:10px"></div>
    <button class="btnAlt" onclick="closeModal()">Fechar</button>
  \`);
  api("/api/adm").then(d=>{
    const el=q("#mintedNow"); if(el) el.textContent = (d.blue?.minted||0).toLocaleString();
  });
}
async function doMint(){
  const user=q("#mUser").value.trim().replace(/^@/,"");
  const amt=Number(q("#mAmt").value||0);
  if(!user||!amt||amt<1) return alert("Preencha usuário e quantidade");
  const r=await api("/api/adm/mint",{method:"POST", body: JSON.stringify({user, amt})});
  if(!r.ok) return alert(r.error||"Erro");
  alert("Emitido!");
  closeModal();
  renderAdm();
}
async function mint(user){
  const amt=Number(prompt("Quantos BLUE emitir para @"+user+" ?","100")||0);
  if(!amt||amt<1) return;
  const r=await api("/api/adm/mint",{method:"POST", body: JSON.stringify({user, amt})});
  if(!r.ok) return alert(r.error||"Erro");
  renderAdm();
}

// ---------- START ----------
go("home");
load();
</script>
`
  });
}

// -------------------- ROUTES --------------------
app.get("/", (req,res)=>{
  const u = getUser(req);
  if(u) return res.redirect("/app");
  res.send(authPage("login"));
});

app.get("/cadastro",(req,res)=>{
  res.send(authPage("cadastro"));
});

app.post("/cadastro",(req,res)=>{
  ensureAdminUser();
  const user = (req.body.user||"").trim().replace(/\s+/g,"");
  const pass = (req.body.pass||"").trim();
  const ref  = (req.body.ref||"").trim().replace(/^@/,"");
  if(user.length<3) return res.send(authPage("cadastro","Usuário muito curto (mín 3)."));
  if(pass.length<3) return res.send(authPage("cadastro","Senha muito curta (mín 3)."));
  if(USERS.has(user)) return res.send(authPage("cadastro","Usuário já existe."));
  const parent = ref && USERS.has(ref) ? ref : null;

  const newU = {
    username:user,
    pass,
    role:"USER",
    parent,
    children:[],
    created: now(),
    lastSeen: now(),
    onlineMs: 0,
    blue: 0,
    blocked:false,
    panic:false,
    panicLoc:null
  };
  USERS.set(user, newU);
  if(parent){
    USERS.get(parent).children.push(user);
  }
  // login
  const sid = rid("sid");
  SESS.set(sid, user);
  setCookie(res,"sid",sid);
  res.redirect("/app");
});

app.post("/login",(req,res)=>{
  ensureAdminUser();
  const user = (req.body.user||"").trim().replace(/^@/,"");
  const pass = (req.body.pass||"").trim();
  const u = USERS.get(user);
  if(!u || u.pass!==pass) return res.send(authPage("login","Login ou senha inválidos."));
  if(u.blocked) return res.send(authPage("login","Usuário bloqueado."));
  const sid = rid("sid");
  SESS.set(sid, user);
  setCookie(res,"sid",sid);
  res.redirect("/app");
});

app.get("/sair",(req,res)=>{
  const c = parseCookies(req);
  if(c.sid) SESS.delete(c.sid);
  clearCookie(res,"sid");
  res.redirect("/");
});

app.get("/app",(req,res)=>{
  const u = getUser(req);
  if(!u) return res.redirect("/");
  if(u.blocked) return res.send(authPage("login","Usuário bloqueado."));
  // registra "tempo online" simples
  u.lastSeen = now();
  res.send(appPage(u));
});

// -------------------- API (JSON) --------------------
app.get("/api/data",(req,res)=>{
  const u = getUser(req);
  if(!u) return res.status(401).json({ok:false, error:"Sem login"});
  if(u.blocked) return res.status(403).json({ok:false, error:"Bloqueado"});
  // itens do strip (mistura posts + padrões)
  const items = [];
  // defaults
  const defaults = [
    {type:"vid",content:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",author:"neo"},
    {type:"vid",content:"https://www.w3schools.com/html/mov_bbb.mp4",author:"tech"},
    {type:"img",content:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=60",author:"future"},
    {type:"img",content:"https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=60",author:"cyber"}
  ];
  defaults.forEach(d=>items.push({id:rid("d"), ...d}));

  // últimos posts
  POSTS.slice(-20).reverse().forEach(p=>{
    items.unshift({ id:p.id, type:p.type, content:p.content, author:p.author });
  });

  res.json({ok:true, me:{username:u.username, role:u.role, blue:u.blue}, items});
});

app.get("/api/posts",(req,res)=>{
  const u = getUser(req);
  if(!u) return res.status(401).json({ok:false});
  const out = POSTS.slice(-60).reverse().map(p=>{
    const au = USERS.get(p.author);
    return {
      ...p,
      role: au?.role || "USER",
      kids: au?.children?.length || 0
    };
  });
  res.json({ok:true, posts: out});
});

app.post("/api/post",(req,res)=>{
  const u = getUser(req);
  if(!u) return res.status(401).json({ok:false, error:"Sem login"});
  if(u.blocked) return res.status(403).json({ok:false, error:"Bloqueado"});
  const {type, caption, content} = req.body||{};
  if(!content || !String(content).startsWith("http")) return res.json({ok:false, error:"Link inválido"});
  if(type!=="img" && type!=="vid") return res.json({ok:false, error:"Tipo inválido"});
  const p = { id: rid("p"), type, caption: String(caption||"").slice(0,220), content: String(content), author: u.username, ts: now() };
  POSTS.push(p);
  res.json({ok:true});
});

app.post("/api/post/delete",(req,res)=>{
  const u = getUser(req);
  if(!u) return res.status(401).json({ok:false});
  const {id} = req.body||{};
  const idx = POSTS.findIndex(p=>p.id===id);
  if(idx<0) return res.json({ok:false});
  if(POSTS[idx].author !== u.username && u.role!=="OWNER") return res.json({ok:false, error:"Sem permissão"});
  POSTS.splice(idx,1);
  res.json({ok:true});
});

// ---- trades ----
app.get("/api/trades",(req,res)=>{
  const u = getUser(req);
  if(!u) return res.status(401).json({ok:false});
  const out = TRADES.slice(-60).reverse().map(t=>{
    const au = USERS.get(t.author);
    return {
      id:t.id, author:t.author,
      have:t.have, want:t.want, media:t.media||"",
      ts:t.ts, status:t.status,
      proposalsCount: (t.proposals||[]).length,
      role: au?.role || "USER",
      kids: au?.children?.length || 0
    };
  });
  res.json({ok:true, trades: out});
});

app.post("/api/trade",(req,res)=>{
  const u=getUser(req);
  if(!u) return res.status(401).json({ok:false, error:"Sem login"});
  if(u.blocked) return res.status(403).json({ok:false, error:"Bloqueado"});
  const {have,want,media} = req.body||{};
  const t={
    id: rid("t"),
    author:u.username,
    have:String(have||"").slice(0,140),
    want:String(want||"").slice(0,140),
    media: String(media||"").slice(0,400),
    ts: now(),
    status:"open",
    proposals:[]
  };
  TRADES.push(t);
  res.json({ok:true});
});

app.post("/api/trade/close",(req,res)=>{
  const u=getUser(req);
  if(!u) return res.status(401).json({ok:false});
  const {id} = req.body||{};
  const t = TRADES.find(x=>x.id===id);
  if(!t) return res.json({ok:false});
  if(t.author!==u.username && u.role!=="OWNER") return res.json({ok:false, error:"Sem permissão"});
  t.status="closed";
  res.json({ok:true});
});

app.get("/api/trade/:id",(req,res)=>{
  const u=getUser(req);
  if(!u) return res.status(401).json({ok:false});
  const t = TRADES.find(x=>x.id===req.params.id);
  if(!t) return res.json({ok:false});
  const au = USERS.get(t.author);
  res.json({
    ok:true,
    trade:{
      id:t.id, author:t.author,
      have:t.have, want:t.want, media:t.media,
      ts:t.ts, status:t.status,
      proposals: t.proposals || [],
      proposalsCount: (t.proposals||[]).length,
      role: au?.role || "USER",
      kids: au?.children?.length || 0
    }
  });
});

app.post("/api/trade/propose",(req,res)=>{
  const u=getUser(req);
  if(!u) return res.status(401).json({ok:false, error:"Sem login"});
  if(u.blocked) return res.status(403).json({ok:false, error:"Bloqueado"});
  const {id, offer, media} = req.body||{};
  const t = TRADES.find(x=>x.id===id);
  if(!t) return res.json({ok:false, error:"Troca não existe"});
  if(t.status!=="open") return res.json({ok:false, error:"Troca fechada"});
  t.proposals.push({
    from:u.username,
    offer:String(offer||"").slice(0,180),
    media:String(media||"").slice(0,400),
    ts: now()
  });
  res.json({ok:true});
});

// ---- chats ----
function chatKey(a,b){ return [a,b].sort().join("|"); }

app.get("/api/chats",(req,res)=>{
  const u=getUser(req);
  if(!u) return res.status(401).json({ok:false});
  const list=[];
  for(const [k,msgs] of CHATS.entries()){
    if(!msgs.length) continue;
    const [a,b]=k.split("|");
    if(a!==u.username && b!==u.username) continue;
    const withUser = (a===u.username)?b:a;
    const last = msgs[msgs.length-1];
    list.push({with:withUser, lastTs:last.ts, lastText:last.text});
  }
  list.sort((x,y)=>y.lastTs-x.lastTs);
  res.json({ok:true, list});
});

app.get("/api/dm/:user",(req,res)=>{
  const u=getUser(req);
  if(!u) return res.status(401).json({ok:false});
  const other = (req.params.user||"").replace(/^@/,"");
  const ou = USERS.get(other);
  if(!ou) return res.json({ok:false, error:"Usuário não existe"});
  const k = chatKey(u.username, other);
  res.json({ok:true, msgs: CHATS.get(k) || []});
});

app.post("/api/dm/send",(req,res)=>{
  const u=getUser(req);
  if(!u) return res.status(401).json({ok:false, error:"Sem login"});
  if(u.blocked) return res.status(403).json({ok:false, error:"Bloqueado"});
  const to = String((req.body||{}).to||"").replace(/^@/,"");
  const text = String((req.body||{}).text||"").slice(0,500);
  if(!to || !USERS.has(to)) return res.json({ok:false, error:"Usuário não existe"});
  if(!text.trim()) return res.json({ok:false, error:"Mensagem vazia"});
  const k = chatKey(u.username, to);
  const arr = CHATS.get(k) || [];
  arr.push({from:u.username, text, ts: now()});
  CHATS.set(k, arr);
  res.json({ok:true});
});

// ---- panic ----
app.post("/api/panic",(req,res)=>{
  const u=getUser(req);
  if(!u) return res.status(401).json({ok:false});
  const {on, loc} = req.body||{};
  u.panic = !!on;
  if(u.panic && loc && typeof loc.lat==="number" && typeof loc.lon==="number"){
    u.panicLoc = {lat:loc.lat, lon:loc.lon, acc:loc.acc||null, ts: now()};
  }else{
    u.panicLoc = null;
  }
  res.json({ok:true});
});

// ---- ADM ----
app.get("/api/adm",(req,res)=>{
  const u=getUser(req);
  if(!u || u.role!=="OWNER") return res.status(403).json({ok:false});
  const out=[];
  for(const x of USERS.values()){
    const onlineMin = Math.max(0, Math.floor((x.onlineMs || 0)/60000));
    out.push({
      username:x.username,
      role:x.role,
      blocked:!!x.blocked,
      kids: x.children?.length || 0,
      blue: x.blue || 0,
      panic: !!x.panic,
      onlineMin
    });
  }
  out.sort((a,b)=>a.username.localeCompare(b.username));
  res.json({ok:true, users: out, blue:{...BLUE}});
});

app.post("/api/adm/block",(req,res)=>{
  const u=getUser(req);
  if(!u || u.role!=="OWNER") return res.status(403).json({ok:false});
  const user = String((req.body||{}).user||"").replace(/^@/,"");
  if(!USERS.has(user) || user==="admin") return res.json({ok:false});
  const x = USERS.get(user);
  x.blocked = !x.blocked;
  res.json({ok:true});
});

app.post("/api/adm/promote",(req,res)=>{
  const u=getUser(req);
  if(!u || u.role!=="OWNER") return res.status(403).json({ok:false});
  const user = String((req.body||{}).user||"").replace(/^@/,"");
  const x = USERS.get(user);
  if(!x) return res.json({ok:false, error:"Não existe"});
  if(user==="admin") return res.json({ok:false, error:"Já é OWNER"});
  x.role="MOD";
  res.json({ok:true});
});

app.post("/api/adm/demote",(req,res)=>{
  const u=getUser(req);
  if(!u || u.role!=="OWNER") return res.status(403).json({ok:false});
  const user = String((req.body||{}).user||"").replace(/^@/,"");
  const x = USERS.get(user);
  if(!x) return res.json({ok:false, error:"Não existe"});
  if(user==="admin") return res.json({ok:false, error:"Não pode"});
  x.role="USER";
  res.json({ok:true});
});

app.post("/api/adm/mint",(req,res)=>{
  const u=getUser(req);
  if(!u || u.role!=="OWNER") return res.status(403).json({ok:false});
  const user = String((req.body||{}).user||"").replace(/^@/,"");
  const amt = Number((req.body||{}).amt||0);
  const x = USERS.get(user);
  if(!x) return res.json({ok:false, error:"Usuário não existe"});
  if(!amt || amt<1) return res.json({ok:false, error:"Quantidade inválida"});
  if(BLUE.minted + amt > BLUE.maxSupply) return res.json({ok:false, error:"Sem supply disponível"});
  BLUE.minted += amt;
  x.blue = (x.blue||0) + amt;
  res.json({ok:true});
});

// -------------------- EXPORT VERCEL HANDLER --------------------
module.exports = (req, res) => app(req, res);
