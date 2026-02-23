// /api/index.js — ICE-CUBO (UI + API em 1 arquivo, sem depender de BASE_URL)
const https = require("https");
const { URL } = require("url");

const MP_ACCESS_TOKEN = (process.env.MP_ACCESS_TOKEN || "").trim();

// DB em memória (protótipo)
const DB = globalThis.__ICE_DB__ || (globalThis.__ICE_DB__ = {
  users: {},      // u -> { pass, blue, loves:Set, follows:Set, children:Set }
  posts: [],      // { id, owner, type, dataUrl, createdAt }
});

const now = () => Date.now();

function j(res, code, obj) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
}
function h(res, code, html) {
  res.statusCode = code;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(html);
}
function readBody(req) {
  return new Promise((resolve) => {
    let d = "";
    req.on("data", (c) => (d += c));
    req.on("end", () => resolve(d));
  });
}
function safeUser(u) {
  return String(u || "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20);
}
function ensureUser(username) {
  const u = safeUser(username);
  if (!u) return null;
  if (!DB.users[u]) {
    DB.users[u] = {
      pass: "",
      blue: 0,
      loves: new Set(),
      follows: new Set(),
      children: new Set(),
    };
  }
  return u;
}
function authFromReq(req) {
  const u = safeUser(req.headers["x-ice-user"]);
  const p = String(req.headers["x-ice-pass"] || "");
  if (!u || !DB.users[u]) return null;
  if (DB.users[u].pass !== p) return null;
  return u;
}
function asJSONUser(u) {
  const x = DB.users[u];
  return {
    username: u,
    blue: x.blue,
    loves: Array.from(x.loves),
    follows: Array.from(x.follows),
    children: Array.from(x.children),
  };
}

function httpJSON(method, url, headers = {}, bodyObj = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = bodyObj ? JSON.stringify(bodyObj) : null;

    const opts = {
      method,
      hostname: u.hostname,
      path: u.pathname + (u.search || ""),
      headers: {
        "Content-Type": "application/json",
        ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
        ...headers,
      },
    };

    const r = https.request(opts, (resp) => {
      let s = "";
      resp.on("data", (c) => (s += c));
      resp.on("end", () => {
        let json = null;
        try { json = s ? JSON.parse(s) : null; } catch {}
        resolve({ status: resp.statusCode, json, text: s });
      });
    });

    r.on("error", reject);
    if (data) r.write(data);
    r.end();
  });
}

function uiHTML() {
  return `<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<title>ICE-CUBO</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
:root{
  --bg1:#041726; --bg2:#052b45;
  --card:rgba(255,255,255,.06);
  --line:rgba(255,255,255,.12);
  --txt:#eaf6ff; --mut:rgba(255,255,255,.66);
  --pri:#3bb7ff; --ok:#31d67b; --warn:#ffd166; --love:#ff4d6d;
  --r:22px;
}
*{box-sizing:border-box}
body{
  margin:0; color:var(--txt);
  font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;
  background:
    radial-gradient(1000px 700px at 20% 10%, rgba(59,183,255,.22), transparent 60%),
    radial-gradient(900px 650px at 85% 25%, rgba(49,214,123,.12), transparent 60%),
    linear-gradient(180deg, var(--bg1), var(--bg2));
  min-height:100vh; overflow-x:hidden;
}
.ocean{position:fixed; inset:0; pointer-events:none; opacity:.75; background:
  radial-gradient(circle at 12% 30%, rgba(255,255,255,.20) 0 2px, transparent 3px) 0 0/120px 120px,
  radial-gradient(circle at 35% 70%, rgba(255,255,255,.10) 0 2px, transparent 3px) 0 0/180px 180px,
  radial-gradient(circle at 80% 40%, rgba(255,255,255,.14) 0 2px, transparent 3px) 0 0/150px 150px;
}
.bub{position:fixed; border:1px solid rgba(255,255,255,.14); border-radius:999px; width:16px; height:16px; opacity:.22; animation: float 14s linear infinite; pointer-events:none;}
@keyframes float{from{transform:translateY(120vh) translateX(0) scale(.9)}to{transform:translateY(-20vh) translateX(60px) scale(1.15)}}
.sea-icons{position:fixed; inset:0; pointer-events:none; opacity:.18;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cg fill='none' stroke='white' stroke-opacity='.55'%3E%3Cpath d='M110 30c10 20 10 45 0 65-10-20-10-45 0-65Z'/%3E%3Cpath d='M70 60c20 10 45 10 65 0-20-10-45-10-65 0Z'/%3E%3Cpath d='M150 60c-20 10-45 10-65 0 20-10 45-10 65 0Z'/%3E%3Cpath d='M85 140c8-18 22-30 35-30s27 12 35 30c-18-8-52-8-70 0Z'/%3E%3Ccircle cx='60' cy='170' r='10'/%3E%3Ccircle cx='170' cy='170' r='14'/%3E%3Cpath d='M110 110c18 10 18 40 0 55-18-15-18-45 0-55Z'/%3E%3C/g%3E%3C/svg%3E");
  background-size:220px 220px; background-repeat:repeat;
}
.wrap{max-width:980px; margin:0 auto; padding:14px 12px 96px}
.topbar{display:flex; gap:10px; align-items:stretch; justify-content:space-between}
.brand,.wallet{background:var(--card); border:1px solid var(--line); border-radius:var(--r); padding:12px; backdrop-filter: blur(10px); box-shadow:0 10px 30px rgba(0,0,0,.25);}
.brand{flex:1; display:flex; align-items:center; gap:12px; min-width:0}
.wallet{width:180px; display:flex; align-items:center; justify-content:space-between}
.logo{width:44px; height:44px; border-radius:16px; display:grid; place-items:center; background:linear-gradient(135deg, rgba(59,183,255,.95), rgba(49,214,123,.55)); border:1px solid rgba(255,255,255,.22); font-weight:900;}
.titleRow{display:flex; align-items:center; gap:10px}
.tt{font-weight:900; letter-spacing:.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis}
.sub{color:var(--mut); font-size:12px}
.badgeStar{color:#ffd166; margin-left:6px}
.coinBlue{width:34px; height:34px; border-radius:999px; display:grid; place-items:center;
  background:radial-gradient(circle at 30% 30%, #b8fff1, #59a7ff 42%, #0a3f86 75%),
             radial-gradient(circle at 30% 30%, rgba(255,210,120,.9), rgba(255,210,120,0) 50%);
  border:1px solid rgba(255,210,120,.55);
  position:relative; overflow:hidden; box-shadow:0 6px 18px rgba(0,0,0,.25);
  animation: coinPulse 2.2s ease-in-out infinite;
}
@keyframes coinPulse{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
.coinBlue span{font-size:10px; font-weight:900; letter-spacing:.6px; color:#ffe8a3; text-shadow:0 1px 0 rgba(0,0,0,.35);}
.coinBlue:after{content:""; position:absolute; inset:-30%; background:conic-gradient(from 90deg, rgba(255,255,255,0), rgba(255,255,255,.35), rgba(255,255,255,0)); animation: spin 2.6s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}
.pill{display:flex; align-items:center; gap:10px; background:rgba(0,0,0,.18); border:1px solid rgba(255,255,255,.10); padding:10px 12px; border-radius:18px;}
.coin{width:34px; height:34px; border-radius:999px; display:grid; place-items:center;
  background:radial-gradient(circle at 30% 30%, #ffe8a3, #d2a84c 55%, #7a560f); border:1px solid rgba(255,255,255,.18);}
.coin b{font-weight:900; color:#0b3a68; text-shadow:0 1px 0 rgba(255,255,255,.35);}
.section{margin-top:12px; background:var(--card); border:1px solid var(--line); border-radius:var(--r); padding:12px; backdrop-filter: blur(10px);}
.bigTitle{font-weight:900; color:var(--pri); font-size:28px; text-align:center; margin:6px 0 0}
.bigHint{color:var(--mut); text-align:center; margin:4px 0 6px}
.grid2{display:grid; gap:12px; grid-template-columns:1fr}
@media(min-width:820px){.grid2{grid-template-columns:1.2fr .8fr}}
.viewerBox{background:rgba(0,0,0,.22); border:1px solid rgba(255,255,255,.10); border-radius:18px; padding:10px;}
.viewerTop{display:flex; justify-content:space-between; align-items:center; margin-bottom:8px}
.viewer{width:100%; height:240px; border-radius:16px; overflow:hidden; background:#000; border:1px solid rgba(255,255,255,.10); display:grid; place-items:center; position:relative;}
.viewer img,.viewer video{width:100%; height:100%; object-fit:cover}
.viewer .ph{color:rgba(255,255,255,.65); font-size:13px}
.viewerTap{position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,.0), rgba(0,0,0,.18));}
.btnRow{display:flex; gap:10px; margin-top:10px; flex-wrap:wrap}
.btn{border:none; cursor:pointer; border-radius:16px; padding:12px 14px; display:flex; align-items:center; justify-content:center; gap:10px; background:rgba(255,255,255,.08); color:var(--txt); border:1px solid rgba(255,255,255,.10);}
.btn.ok{background:rgba(49,214,123,.18); border-color:rgba(49,214,123,.25)}
.btn.love{background:rgba(255,77,109,.14); border-color:rgba(255,77,109,.22)}
.btn.love.on{background:rgba(255,77,109,.28); border-color:rgba(255,77,109,.40)}
.btn:active{transform:scale(.99)}
.muted{color:var(--mut); font-size:12px}
input{width:100%; padding:12px 12px; border-radius:16px; border:1px solid rgba(255,255,255,.12); background:rgba(0,0,0,.22); color:var(--txt); outline:none;}
.row{display:flex; gap:10px; align-items:center; flex-wrap:wrap}
.field{flex:1; min-width:160px}
hr{border:none; border-top:1px solid rgba(255,255,255,.10); margin:12px 0}
.stripWrap{margin-top:10px; background:rgba(0,0,0,.16); border:1px solid rgba(255,255,255,.10); border-radius:18px; padding:10px;}
.strip{display:flex; gap:10px; overflow-x:auto; -webkit-overflow-scrolling:touch; padding-bottom:6px;}
.item{min-width:128px; width:128px; height:96px; border-radius:16px; overflow:hidden; background:#000; border:1px solid rgba(255,255,255,.12); position:relative; flex:0 0 auto;}
.item img,.item video{width:100%; height:100%; object-fit:cover}
.item .tag{position:absolute; left:8px; bottom:8px; background:rgba(0,0,0,.45); border:1px solid rgba(255,255,255,.12); padding:4px 8px; border-radius:999px; font-size:11px; color:#fff;}
.item .like{position:absolute; right:8px; top:8px; width:28px; height:28px; border-radius:999px; display:grid; place-items:center; background:rgba(0,0,0,.45); border:1px solid rgba(255,255,255,.12);}
.item .like i{color:#fff; opacity:.9}
.item .like.on i{color:var(--love)}
.item:active{transform:scale(.99)}
.modal{position:fixed; inset:0; display:none; place-items:center; background:rgba(0,0,0,.45); z-index:50;}
.modal.on{display:grid}
.modalCard{width:min(520px, calc(100% - 24px)); background:rgba(10,20,30,.78); border:1px solid rgba(255,255,255,.14); border-radius:22px; backdrop-filter: blur(14px); padding:14px;}
.modalTop{display:flex; justify-content:space-between; align-items:center}
.xBtn{border:none; background:rgba(255,255,255,.10); color:#fff; width:38px; height:38px; border-radius:14px; cursor:pointer; border:1px solid rgba(255,255,255,.14);}
.kv{display:grid; gap:6px; margin-top:10px}
.kv div{color:var(--mut); font-size:12px}
.kv b{color:#fff}
.toast{position:fixed; top:12px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,.55); border:1px solid rgba(255,255,255,.18); color:#fff; padding:10px 12px; border-radius:16px; display:none; z-index:60; max-width:min(720px, calc(100% - 20px));}
.toast.on{display:block}
</style>
</head>
<body>
<div class="ocean"></div>
<div class="sea-icons"></div>
<div id="toast" class="toast"></div>

<div class="wrap">
  <div class="topbar">
    <div class="brand">
      <div class="logo">IC</div>
      <div style="min-width:0">
        <div class="titleRow">
          <div class="tt">ICE-CUBO <span class="badgeStar" id="star" style="display:none">⭐</span></div>
          <div class="coinBlue" title="BLUE Coin"><span>BLUE</span></div>
        </div>
        <div class="sub">Timeline • Perfil • Carteira • ADM</div>
        <div class="sub" id="who" style="margin-top:2px">deslogado</div>
      </div>
    </div>

    <div class="wallet">
      <div class="pill">
        <div class="coin"><b>B</b></div>
        <div>
          <div style="font-weight:900" id="blueBal">0 BLUE</div>
          <div class="sub" id="role">—</div>
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="bigTitle">ICE-CUBO</div>
    <div class="bigHint">1 toque no post embaixo → sobe no visor. 1 toque no visor → perfil do dono.</div>
  </div>

  <div class="grid2">
    <div class="section viewerBox">
      <div class="viewerTop">
        <div>
          <div style="font-weight:900">Visor</div>
          <div class="muted" id="viewerLabel">—</div>
        </div>
        <div class="muted" id="viewerOwner">—</div>
      </div>

      <div class="viewer" id="viewer">
        <div class="ph">Clique num post embaixo</div>
        <div class="viewerTap" id="viewerTap"></div>
      </div>

      <div class="btnRow">
        <button class="btn ok" id="liveBtn"><i class="fa-solid fa-video"></i> LIVE</button>
        <button class="btn love" id="loveBtn"><i class="fa-solid fa-heart"></i> LOVE</button>
      </div>

      <div class="stripWrap">
        <div class="row" style="justify-content:space-between; margin-bottom:6px">
          <div style="font-weight:900"><i class="fa-solid fa-photo-film"></i> Timeline (embaixo)</div>
          <div class="muted" id="feedCount">0</div>
        </div>
        <div class="strip" id="strip"></div>
      </div>
    </div>

    <div class="section">
      <div class="row" style="justify-content:space-between">
        <div style="font-weight:900"><i class="fa-solid fa-wallet"></i> Carteira</div>
        <div class="muted">Depósito (Cartão)</div>
      </div>

      <div class="muted" style="margin-top:6px">Depósito via Mercado Pago (Checkout Pro)</div>
      <div class="row" style="margin-top:8px">
        <div class="field"><input id="depAmount" placeholder="Valor (ex: 10)" inputmode="decimal"/></div>
        <button class="btn ok" id="cardBtn"><i class="fa-regular fa-credit-card"></i> Pagar</button>
      </div>
      <div class="muted" id="depMsg" style="margin-top:6px"></div>

      <hr>

      <div class="row" style="justify-content:space-between">
        <div style="font-weight:900"><i class="fa-solid fa-user"></i> Entrar / Criar conta</div>
        <div class="muted">ADM é intocável</div>
      </div>
      <div class="row" style="margin-top:8px">
        <div class="field"><input id="uName" placeholder="usuario"/></div>
        <div class="field"><input id="uPass" placeholder="senha" type="password"/></div>
      </div>
      <div class="row" style="margin-top:8px">
        <button class="btn ok" id="loginBtn"><i class="fa-solid fa-right-to-bracket"></i> Entrar</button>
        <button class="btn" id="createBtn"><i class="fa-solid fa-user-plus"></i> Criar</button>
        <button class="btn" id="logoutBtn"><i class="fa-solid fa-arrow-right-from-bracket"></i> Sair</button>
      </div>
      <div class="muted" id="authMsg" style="margin-top:8px"></div>

      <hr>

      <div class="row" style="justify-content:space-between">
        <div style="font-weight:900"><i class="fa-solid fa-upload"></i> Postar</div>
        <div class="muted" id="pickInfo">Nenhum arquivo</div>
      </div>
      <div class="row" style="margin-top:8px">
        <label class="btn">
          <i class="fa-solid fa-image"></i> Abrir
          <input id="filePick" type="file" accept="image/*,video/*" style="display:none">
        </label>
        <button class="btn ok" id="postBtn"><i class="fa-solid fa-bolt"></i> Postar</button>
      </div>
      <div class="muted" id="postMsg" style="margin-top:8px"></div>
    </div>
  </div>
</div>

<div class="modal" id="profileModal">
  <div class="modalCard">
    <div class="modalTop">
      <div>
        <div style="font-weight:900; font-size:16px" id="pUser">@—</div>
        <div class="muted" id="pInfo">—</div>
      </div>
      <button class="xBtn" id="closeModal"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="kv">
      <div><b>BLUE:</b> <span id="pBlue">0</span></div>
      <div><b>Posts:</b> <span id="pPosts">0</span></div>
      <div><b>Seguindo:</b> <span id="pFollows">0</span></div>
    </div>
    <div class="row" style="margin-top:10px; justify-content:flex-end">
      <button class="btn" id="followBtn"><i class="fa-solid fa-user-plus"></i> Seguir</button>
    </div>
  </div>
</div>

<script>
const $ = (id)=>document.getElementById(id);
const toast = (m)=>{ const t=$("toast"); t.textContent=m; t.classList.add("on"); setTimeout(()=>t.classList.remove("on"), 2200); };

let sess = JSON.parse(localStorage.getItem("ice_sess")||"null");
function saveSess(){ localStorage.setItem("ice_sess", JSON.stringify(sess)); }
function headers(){ return sess ? {"x-ice-user": sess.user, "x-ice-pass": sess.pass} : {}; }

async function api(op, body){
  const r = await fetch("/api?op="+encodeURIComponent(op), {
    method:"POST",
    headers:{ "Content-Type":"application/json", ...headers() },
    body: JSON.stringify(body||{})
  });
  return r.json();
}

// bolhas
for(let i=0;i<16;i++){
  const b=document.createElement("div");
  b.className="bub";
  b.style.left=(Math.random()*100)+"vw";
  b.style.animationDelay=(Math.random()*-14)+"s";
  const s=10+Math.random()*22;
  b.style.width=b.style.height=s+"px";
  b.style.opacity=(.10+Math.random()*.22);
  document.body.appendChild(b);
}

function setWho(me){
  $("who").textContent = me ? ("logado: "+me.username) : "deslogado";
  $("blueBal").textContent = (me ? me.blue : 0) + " BLUE";
  $("role").textContent = me ? me.username.toUpperCase() : "—";
  $("star").style.display = (me && me.username==="adm") ? "inline" : "none";
}

let currentPost=null;
let liveStream=null;

function setViewer(p){
  currentPost = p || null;
  const v=$("viewer");
  v.innerHTML="";
  const tap=document.createElement("div");
  tap.className="viewerTap"; tap.id="viewerTap";
  v.appendChild(tap);

  if(!p){
    v.insertAdjacentHTML("afterbegin", '<div class="ph">Clique num post embaixo</div>');
    $("viewerLabel").textContent="—";
    $("viewerOwner").textContent="—";
    $("loveBtn").classList.remove("on");
    return;
  }
  $("viewerLabel").textContent = new Date(p.createdAt).toLocaleString();
  $("viewerOwner").textContent = "@"+p.owner;

  if(p.type==="img"){
    const im=document.createElement("img"); im.src=p.dataUrl; v.insertBefore(im, tap);
  } else {
    const vd=document.createElement("video");
    vd.src=p.dataUrl; vd.controls=true; vd.playsInline=true; vd.autoplay=true;
    v.insertBefore(vd, tap);
  }
}

async function refreshLoveBtn(){
  if(!sess || !currentPost){ $("loveBtn").classList.remove("on"); return; }
  const me = await api("me");
  if(!me.ok){ $("loveBtn").classList.remove("on"); return; }
  const on = (me.me.loves||[]).includes(currentPost.id);
  $("loveBtn").classList.toggle("on", on);
}

$("loveBtn").onclick = async ()=>{
  if(!sess) return alert("Entre primeiro.");
  if(!currentPost) return alert("Escolha um post embaixo.");
  const r = await api("toggle_love", {postId: currentPost.id});
  if(!r.ok) return alert(r.err||"erro");
  $("loveBtn").classList.toggle("on", r.on);
  toast(r.on ? "LOVE ligado" : "LOVE desligado");
  renderStrip(window.__FEED__ || []);
};

document.addEventListener("click", async (e)=>{
  if(e.target && e.target.id==="viewerTap"){
    if(!currentPost) return;
    await openProfile(currentPost.owner);
  }
});

let modalUser=null;
async function openProfile(user){
  modalUser=user;
  const r = await api("get_profile", {user});
  if(!r.ok) return alert(r.err||"erro");
  $("pUser").textContent="@"+r.profile.username;
  $("pInfo").textContent="Perfil do criador";
  $("pBlue").textContent=r.profile.blue;
  $("pPosts").textContent=r.profile.posts;
  $("pFollows").textContent=r.profile.follows;
  $("profileModal").classList.add("on");
  $("followBtn").style.display = (sess && sess.user!==user) ? "inline-flex" : "none";
}
$("closeModal").onclick=()=>$("profileModal").classList.remove("on");
$("profileModal").onclick=(e)=>{ if(e.target.id==="profileModal") $("profileModal").classList.remove("on"); };

$("followBtn").onclick = async ()=>{
  if(
