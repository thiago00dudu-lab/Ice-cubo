// /api/index.js (Vercel) — ICE-CUBO (1 arquivo grande: UI + API)
// Env vars necessárias (Vercel > Settings > Environment Variables):
// MP_ACCESS_TOKEN = "APP_USR-...." (produção) ou TEST-.... (teste)
// BASE_URL = "https://SEU-PROJETO.vercel.app"  (opcional, mas recomendado)
// MP_WEBHOOK_SECRET = "qualquer_coisa" (opcional - se você configurar no MP)

const https = require("https");
const { URL } = require("url");

const MP_ACCESS_TOKEN = (process.env.MP_ACCESS_TOKEN || "").trim();
const BASE_URL = (process.env.BASE_URL || "").trim(); // ex: https://ice-cubo.vercel.app
const MP_WEBHOOK_SECRET = (process.env.MP_WEBHOOK_SECRET || "").trim();

// --- “DB” em memória (protótipo). Em serverless pode resetar.
const DB = globalThis.__ICE_DB__ || (globalThis.__ICE_DB__ = {
  users: {},          // username -> { pass, blue, follows:Set, children:Set, affiliateOf, bonusToMine, minedTotal }
  posts: [],          // { id, owner, type, dataUrl, createdAt }
  mpPayments: {},     // paymentId -> { status, amount, username, createdAt }
});

function now() { return Date.now(); }
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
      follows: new Set(),
      children: new Set(),
      affiliateOf: null,
      bonusToMine: 0,
      minedTotal: 0,
    };
  }
  return u;
}

function authFromReq(req) {
  // autenticação simples via headers
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
    follows: Array.from(x.follows),
    children: Array.from(x.children),
    affiliateOf: x.affiliateOf,
    bonusToMine: x.bonusToMine,
    minedTotal: x.minedTotal,
  };
}

// --- UI HTML (tudo inline)
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
  --bg1:#071a2a; --bg2:#0a2b45; --card:rgba(255,255,255,.06);
  --line:rgba(255,255,255,.10); --txt:#eaf6ff; --mut:rgba(255,255,255,.65);
  --ok:#31d67b; --warn:#ffd166; --pri:#3bb7ff;
  --r:22px;
}
*{box-sizing:border-box}
body{
  margin:0; color:var(--txt); font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;
  background: radial-gradient(1100px 700px at 15% 10%, rgba(59,183,255,.28), transparent 60%),
              radial-gradient(900px 650px at 80% 30%, rgba(49,214,123,.14), transparent 60%),
              linear-gradient(180deg, var(--bg1), var(--bg2));
  min-height:100vh; overflow-x:hidden;
}
.ocean{
  position:fixed; inset:0; pointer-events:none; opacity:.55; mix-blend-mode:screen;
  background:
    radial-gradient(circle at 10% 30%, rgba(255,255,255,.18) 0 2px, transparent 3px) 0 0/120px 120px,
    radial-gradient(circle at 35% 70%, rgba(255,255,255,.10) 0 2px, transparent 3px) 0 0/180px 180px,
    radial-gradient(circle at 80% 40%, rgba(255,255,255,.14) 0 2px, transparent 3px) 0 0/150px 150px;
  filter: blur(.2px);
}
.bub{position:fixed; border:1px solid rgba(255,255,255,.12); border-radius:999px; width:16px; height:16px; opacity:.25; animation: float 14s linear infinite}
@keyframes float{from{transform:translateY(120vh) translateX(0) scale(.9)} to{transform:translateY(-20vh) translateX(60px) scale(1.15)}}
.wrap{max-width:980px; margin:0 auto; padding:14px 12px 96px}
.topbar{
  display:flex; gap:10px; align-items:stretch; justify-content:space-between; margin-top:4px
}
.brand, .wallet{
  background:var(--card); border:1px solid var(--line); border-radius:var(--r);
  padding:12px 12px; backdrop-filter: blur(10px);
  box-shadow:0 10px 30px rgba(0,0,0,.25);
}
.brand{flex:1; display:flex; align-items:center; gap:12px}
.wallet{width:180px; display:flex; align-items:center; justify-content:space-between}
.logo{
  width:44px; height:44px; border-radius:16px; display:grid; place-items:center;
  background:linear-gradient(135deg, rgba(59,183,255,.9), rgba(49,214,123,.55));
  border:1px solid rgba(255,255,255,.22);
  font-weight:900;
}
.mascot{
  width:38px; height:38px; border-radius:14px;
  display:grid; place-items:center;
  background:rgba(255,255,255,.08);
  border:1px solid rgba(255,255,255,.12);
  position:relative; overflow:hidden;
}
.mascot i{opacity:.9}
.mascot:after{
  content:""; position:absolute; inset:-30%;
  background:radial-gradient(circle, rgba(255,255,255,.25), transparent 60%);
  animation: shine 2.2s ease-in-out infinite;
}
@keyframes shine{0%,100%{transform:translateX(-30%) rotate(10deg)}50%{transform:translateX(30%) rotate(-10deg)}}
.tt{font-weight:900; letter-spacing:.5px}
.sub{color:var(--mut); font-size:12px}
.badgeStar{color:#ffd166; margin-left:6px}
.pill{
  display:flex; align-items:center; gap:10px; background:rgba(0,0,0,.18);
  border:1px solid rgba(255,255,255,.10); padding:10px 12px; border-radius:18px;
}
.coin{
  width:34px; height:34px; border-radius:999px; display:grid; place-items:center;
  background:radial-gradient(circle at 30% 30%, #ffe8a3, #d2a84c 55%, #7a560f);
  border:1px solid rgba(255,255,255,.18);
  position:relative;
}
.coin b{
  font-weight:900; color:#0b3a68; text-shadow:0 1px 0 rgba(255,255,255,.35);
}
.coin:after{
  content:""; position:absolute; inset:-20%;
  background:conic-gradient(from 90deg, rgba(255,255,255,.0), rgba(255,255,255,.25), rgba(255,255,255,.0));
  animation: spin 2.6s linear infinite;
}
@keyframes spin{to{transform:rotate(360deg)}}
.section{
  margin-top:12px; background:var(--card); border:1px solid var(--line);
  border-radius:var(--r); padding:12px; backdrop-filter: blur(10px);
}
.bigTitle{font-weight:900; color:var(--pri); font-size:28px; text-align:center; margin:6px 0 0}
.bigHint{color:var(--mut); text-align:center; margin:4px 0 6px}
.grid2{display:grid; gap:12px; grid-template-columns:1fr}
@media(min-width:820px){.grid2{grid-template-columns:1.15fr .85fr}}
.viewerBox{
  background:rgba(0,0,0,.22); border:1px solid rgba(255,255,255,.10);
  border-radius:18px; padding:10px;
}
.viewerTop{display:flex; justify-content:space-between; align-items:center; margin-bottom:8px}
.viewer{
  width:100%; height:220px; border-radius:16px; overflow:hidden;
  background:#000; border:1px solid rgba(255,255,255,.10);
  display:grid; place-items:center; position:relative;
}
.viewer img,.viewer video{width:100%; height:100%; object-fit:cover}
.viewer .ph{color:rgba(255,255,255,.65); font-size:13px}
.btnRow{display:flex; gap:10px; margin-top:10px}
.btn{
  border:none; cursor:pointer; border-radius:16px; padding:12px 14px;
  display:flex; align-items:center; justify-content:center; gap:10px;
  background:rgba(255,255,255,.08); color:var(--txt);
  border:1px solid rgba(255,255,255,.10);
}
.btn.ok{background:rgba(49,214,123,.18); border-color:rgba(49,214,123,.25)}
.btn.warn{background:rgba(255,209,102,.16); border-color:rgba(255,209,102,.22)}
.btn:active{transform:scale(.99)}
.muted{color:var(--mut); font-size:12px}
.tabs{
  position:fixed; left:50%; transform:translateX(-50%);
  bottom:10px; width:min(780px, calc(100% - 20px));
  background:rgba(0,0,0,.22); border:1px solid rgba(255,255,255,.12);
  border-radius:22px; backdrop-filter: blur(12px);
  display:flex; justify-content:space-between; padding:10px 10px;
}
.tab{
  flex:1; display:flex; flex-direction:column; align-items:center; gap:6px;
  color:rgba(255,255,255,.65); font-size:12px; cursor:pointer;
}
.tab i{font-size:18px}
.tab.on{color:#fff}
.panel{display:none}
.panel.on{display:block}
.row{display:flex; gap:10px; align-items:center; flex-wrap:wrap}
input, textarea{
  width:100%; padding:12px 12px; border-radius:16px;
  border:1px solid rgba(255,255,255,.12); background:rgba(0,0,0,.22);
  color:var(--txt); outline:none;
}
.field{flex:1; min-width:160px}
.sbtn{
  display:inline-flex; align-items:center; gap:8px; padding:11px 12px; border-radius:16px;
  background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.10); cursor:pointer;
}
hr{border:none; border-top:1px solid rgba(255,255,255,.10); margin:12px 0}
.cards{display:grid; grid-template-columns:1fr; gap:10px}
@media(min-width:700px){.cards{grid-template-columns:1fr 1fr}}
.card{
  background:rgba(0,0,0,.18); border:1px solid rgba(255,255,255,.10);
  border-radius:18px; padding:10px; overflow:hidden;
}
.thumb{
  width:100%; height:150px; border-radius:14px; overflow:hidden; background:#000;
  border:1px solid rgba(255,255,255,.10);
}
.thumb img,.thumb video{width:100%; height:100%; object-fit:cover}
.card .meta{display:flex; justify-content:space-between; align-items:center; margin-top:8px}
.small{font-size:12px; color:var(--mut)}
.followBtn{
  padding:8px 10px; border-radius:14px; border:1px solid rgba(255,255,255,.12);
  background:rgba(59,183,255,.14); color:#fff; cursor:pointer; font-size:12px;
}
.qrBox{
  margin-top:10px; background:rgba(0,0,0,.18); border:1px solid rgba(255,255,255,.10);
  border-radius:18px; padding:10px; display:none;
}
.qrBox.on{display:block}
.qrImg{width:180px; height:180px; border-radius:16px; overflow:hidden; background:#fff; display:grid; place-items:center}
.qrImg img{width:100%; height:100%; object-fit:contain}
.toast{
  position:fixed; top:12px; left:50%; transform:translateX(-50%);
  background:rgba(0,0,0,.55); border:1px solid rgba(255,255,255,.18);
  color:#fff; padding:10px 12px; border-radius:16px; display:none; z-index:50;
  max-width:min(720px, calc(100% - 20px));
}
.toast.on{display:block}
</style>
</head>
<body>
<div class="ocean"></div>
<div id="toast" class="toast"></div>

<div class="wrap">
  <div class="topbar">
    <div class="brand">
      <div class="logo">IC</div>
      <div class="mascot" title="Blue Coin">
        <i class="fa-solid fa-robot"></i>
      </div>
      <div style="min-width:0">
        <div class="tt">ICE-CUBO <span class="badgeStar" id="star" style="display:none">⭐</span></div>
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
    <div class="bigHint">poste, clique no post pra subir no visor, ou abra a câmera (LIVE).</div>
  </div>

  <div class="grid2">
    <div class="section viewerBox">
      <div class="viewerTop">
        <div>
          <div style="font-weight:900">Visor</div>
          <div class="muted">Clique em um post na Timeline</div>
        </div>
        <div class="muted" id="viewerLabel">—</div>
      </div>
      <div class="viewer" id="viewer">
        <div class="ph">—</div>
      </div>

      <div class="btnRow">
        <button class="btn ok" id="liveBtn"><i class="fa-solid fa-video"></i> LIVE</button>
        <button class="btn warn" id="mineBtn"><i class="fa-solid fa-hammer"></i> Minerar bônus</button>
      </div>
      <div class="muted" id="mineHint" style="margin-top:8px">Bônus aparece quando um afiliado depositar (protótipo).</div>
    </div>

    <div class="section">
      <div class="row" style="justify-content:space-between">
        <div style="font-weight:900"><i class="fa-solid fa-wallet"></i> Carteira</div>
        <div class="muted">PIX / QR</div>
      </div>

      <div class="muted" style="margin-top:6px">Depósito (PIX / QR Code — sem cartão)</div>
      <div class="row" style="margin-top:8px">
        <div class="field"><input id="depAmount" placeholder="Valor (ex: 10)" inputmode="decimal"/></div>
        <button class="btn ok" id="pixBtn"><i class="fa-brands fa-pix"></i> Gerar PIX</button>
      </div>
      <div class="muted" id="pixMsg" style="margin-top:6px"></div>

      <div class="qrBox" id="qrBox">
        <div class="row" style="gap:12px; align-items:flex-start">
          <div class="qrImg"><img id="qrImg" alt="QR Code"/></div>
          <div class="field" style="min-width:200px">
            <div class="muted" style="margin-bottom:6px">Copia e cola (código PIX)</div>
            <textarea id="qrText" rows="6" readonly></textarea>
            <div class="row" style="margin-top:8px">
              <button class="btn" id="copyPix"><i class="fa-solid fa-copy"></i> Copiar</button>
              <a class="btn" id="openMP" href="#" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir</a>
            </div>
          </div>
        </div>
      </div>

      <hr>
      <div class="muted">Saque (protótipo: vira pedido pro ADM)</div>
      <div class="row" style="margin-top:8px">
        <div class="field"><input id="wdAmount" placeholder="valor para sacar" inputmode="decimal"/></div>
        <button class="btn warn" id="wdBtn"><i class="fa-solid fa-paper-plane"></i> Solicitar</button>
      </div>
      <div class="muted" id="wdMsg" style="margin-top:6px"></div>
    </div>
  </div>

  <div class="section panel on" id="panelHome">
    <div class="row" style="justify-content:space-between">
      <div style="font-weight:900"><i class="fa-solid fa-photo-film"></i> Timeline</div>
      <div class="muted" id="feedNote">posts globais</div>
    </div>
    <div class="cards" id="timeline"></div>
  </div>

  <div class="section panel" id="panelProfile">
    <div class="row" style="justify-content:space-between">
      <div style="font-weight:900"><i class="fa-solid fa-user"></i> Seu perfil</div>
      <div class="muted">poste foto/vídeo</div>
    </div>

    <div class="section" style="margin-top:10px">
      <div class="row">
        <div class="field"><input id="uName" placeholder="usuario"/></div>
        <div class="field"><input id="uPass" placeholder="senha" type="password"/></div>
      </div>
      <div class="row" style="margin-top:8px">
        <button class="btn ok" id="loginBtn"><i class="fa-solid fa-right-to-bracket"></i> Entrar</button>
        <button class="btn" id="createBtn"><i class="fa-solid fa-user-plus"></i> Criar</button>
        <button class="btn" id="logoutBtn"><i class="fa-solid fa-arrow-right-from-bracket"></i> Sair</button>
      </div>
      <div class="muted" id="authMsg" style="margin-top:8px"></div>
    </div>

    <div class="section" style="margin-top:10px">
      <div class="row" style="justify-content:space-between">
        <div style="font-weight:900"><i class="fa-solid fa-link"></i> Afiliado</div>
        <div class="muted">ganha 5% quando afiliado deposita</div>
      </div>
      <div class="row" style="margin-top:8px">
        <div class="field"><input id="affOf" placeholder="sou afiliado de (usuario)"/></div>
        <button class="btn" id="setAffBtn"><i class="fa-solid fa-sitemap"></i> Salvar</button>
      </div>
      <div class="muted" id="affMsg" style="margin-top:6px"></div>
    </div>

    <div class="section" style="margin-top:10px">
      <div class="row" style="justify-content:space-between">
        <div style="font-weight:900"><i class="fa-solid fa-upload"></i> Postar</div>
        <div class="muted" id="pickInfo">Nenhum arquivo</div>
      </div>
      <div class="row" style="margin-top:8px">
        <label class="sbtn">
          <i class="fa-solid fa-image"></i> Abrir galeria
          <input id="filePick" type="file" accept="image/*,video/*" style="display:none">
        </label>
        <button class="btn ok" id="postBtn"><i class="fa-solid fa-bolt"></i> Postar</button>
      </div>
      <div class="muted" id="postMsg" style="margin-top:8px"></div>
    </div>

    <div class="section" style="margin-top:10px">
      <div class="row" style="justify-content:space-between">
        <div style="font-weight:900"><i class="fa-solid fa-user-check"></i> Seguindo</div>
        <div class="muted" id="followCount">0</div>
      </div>
      <div class="muted" id="followList">—</div>

      <hr>
      <div class="row" style="justify-content:space-between">
        <div style="font-weight:900"><i class="fa-solid fa-diagram-project"></i> Filhos</div>
        <div class="muted" id="childCount">0</div>
      </div>
      <div class="muted" id="childList">—</div>
    </div>

    <div class="section" style="margin-top:10px">
      <div class="row" style="justify-content:space-between">
        <div style="font-weight:900"><i class="fa-solid fa-grid-2"></i> Seus posts</div>
        <div class="muted" id="myCount">0</div>
      </div>
      <div class="cards" id="myPosts"></div>
    </div>
  </div>

  <div class="section panel" id="panelAdmin">
    <div class="row" style="justify-content:space-between">
      <div style="font-weight:900"><i class="fa-solid fa-shield-halved"></i> ADM</div>
      <div class="muted">prototipo</div>
    </div>
    <div class="muted" style="margin-top:6px">
      Aqui você vê pagamentos capturados via webhook (se configurar).
    </div>
    <div class="section" style="margin-top:10px">
      <div style="font-weight:900;margin-bottom:8px">Pagamentos (memória)</div>
      <div class="muted" id="payList">—</div>
    </div>
  </div>
</div>

<div class="tabs">
  <div class="tab on" data-tab="home"><i class="fa-solid fa-house"></i><div>HOME</div></div>
  <div class="tab" data-tab="profile"><i class="fa-solid fa-user"></i><div>PERFIL</div></div>
  <div class="tab" data-tab="wallet"><i class="fa-solid fa-wallet"></i><div>CARTEIRA</div></div>
  <div class="tab" data-tab="admin"><i class="fa-solid fa-star"></i><div>ADM</div></div>
</div>

<script>
/* ======= Helpers UI ======= */
const $ = (id)=>document.getElementById(id);
const toast = (m)=>{ const t=$("toast"); t.textContent=m; t.classList.add("on"); setTimeout(()=>t.classList.remove("on"), 2200); };
function setTab(name){
  document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("on", x.dataset.tab===name));
  $("panelHome").classList.toggle("on", name==="home");
  $("panelProfile").classList.toggle("on", name==="profile");
  // Carteira fica no painel principal da direita (sempre visível), então só muda foco com toast
  $("panelAdmin").classList.toggle("on", name==="admin");
  if(name==="wallet") toast("Carteira");
}
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>setTab(t.dataset.tab));

/* ======= Sessão simples (localStorage) ======= */
let sess = JSON.parse(localStorage.getItem("ice_sess")||"null");
function saveSess(){ localStorage.setItem("ice_sess", JSON.stringify(sess)); }
function headers(){
  return sess ? {"x-ice-user": sess.user, "x-ice-pass": sess.pass} : {};
}
async function api(op, body){
  const r = await fetch("/api?op="+encodeURIComponent(op), {
    method:"POST",
    headers: {"Content-Type":"application/json", ...headers()},
    body: JSON.stringify(body||{})
  });
  return r.json();
}

function renderWho(me){
  $("who").textContent = me ? ("logado: "+me.username) : "deslogado";
  $("blueBal").textContent = (me ? me.blue : 0) + " BLUE";
  $("role").textContent = me ? me.username.toUpperCase() : "—";
  $("star").style.display = (me && me.username==="adm") ? "inline" : "none";
}

/* ======= Fundo bolhas ======= */
for(let i=0;i<14;i++){
  const b=document.createElement("div");
  b.className="bub";
  b.style.left=(Math.random()*100)+"vw";
  b.style.animationDelay=(Math.random()*-14)+"s";
  b.style.width=b.style.height=(10+Math.random()*22)+"px";
  b.style.opacity=(.12+Math.random()*.22);
  document.body.appendChild(b);
}

/* ======= Viewer ======= */
let liveStream=null;
function setViewerMedia({type, src, label}){
  const v=$("viewer");
  v.innerHTML="";
  $("viewerLabel").textContent = label || "—";
  if(type==="img"){
    const im=document.createElement("img");
    im.src=src;
    v.appendChild(im);
  } else if(type==="video"){
    const vd=document.createElement("video");
    vd.src=src;
    vd.controls=true;
    vd.playsInline=true;
    vd.autoplay=true;
    v.appendChild(vd);
  } else if(type==="live"){
    const vd=document.createElement("video");
    vd.autoplay=true;
    vd.muted=true;
    vd.playsInline=true;
    vd.srcObject=src;
    v.appendChild(vd);
  } else {
    const ph=document.createElement("div");
    ph.className="ph";
    ph.textContent="—";
    v.appendChild(ph);
  }
}
setViewerMedia({type:"none"});

/* ======= Live camera ======= */
$("liveBtn").onclick = async ()=>{
  if(!sess){ return alert("Entre primeiro."); }
  try{
    if(liveStream){
      liveStream.getTracks().forEach(t=>t.stop());
      liveStream=null;
      setViewerMedia({type:"none"});
      toast("LIVE encerrada");
      return;
    }
    liveStream = await navigator.mediaDevices.getUserMedia({video:true,audio:false});
    setViewerMedia({type:"live", src: liveStream, label:"LIVE (câmera)"});
    toast("LIVE ligada");
  }catch(e){
    alert("Não consegui abrir a câmera: "+(e?.message||e));
  }
};

/* ======= Mineração ======= */
$("mineBtn").onclick = async ()=>{
  if(!sess) return alert("Entre primeiro.");
  const me = await api("me");
  if(!me.ok) return alert(me.err||"erro");
  if(!me.me.bonusToMine || me.me.bonusToMine<=0){
    return alert("Sem bônus pra minerar. (Aparece quando um afiliado seu depositar)");
  }
  const got = await api("mine_bonus", {});
  if(!got.ok) return alert(got.err||"erro");
  toast("Minerou +" + got.mined + " BLUE");
  await refreshAll();
};

/* ======= Auth ======= */
$("loginBtn").onclick = async ()=>{
  const u=$("uName").value.trim();
  const p=$("uPass").value.trim();
  const r = await api("login", {u,p});
  $("authMsg").textContent = r.ok ? "Logado!" : ("Erro: "+(r.err||""));
  if(r.ok){
    sess={user:r.user, pass:p};
    saveSess();
    await refreshAll();
    setTab("home");
  }
};
$("createBtn").onclick = async ()=>{
  const u=$("uName").value.trim();
  const p=$("uPass").value.trim();
  const r = await api("create", {u,p});
  $("authMsg").textContent = r.ok ? "Conta criada!" : ("Erro: "+(r.err||""));
  if(r.ok){
    sess={user:r.user, pass:p};
    saveSess();
    await refreshAll();
  }
};
$("logoutBtn").onclick = async ()=>{
  sess=null; saveSess();
  liveStream && liveStream.getTracks().forEach(t=>t.stop());
  liveStream=null;
  setViewerMedia({type:"none"});
  await refreshAll();
  toast("Saiu");
};

/* ======= Afiliado ======= */
$("setAffBtn").onclick = async ()=>{
  if(!sess) return alert("Entre primeiro.");
  const of=$("affOf").value.trim();
  const r = await api("set_affiliate_of", {of});
  $("affMsg").textContent = r.ok ? "Salvo!" : ("Erro: "+(r.err||""));
  await refreshAll();
};

/* ======= Postar ======= */
let picked=null;
$("filePick").onchange = (e)=>{
  picked = e.target.files && e.target.files[0] ? e.target.files[0] : null;
  $("pickInfo").textContent = picked ? (picked.name+" ("+Math.round(picked.size/1024)+"kb)") : "Nenhum arquivo";
};
async function fileToDataUrl(file){
  return new Promise((resolve,reject)=>{
    const fr=new FileReader();
    fr.onload=()=>resolve(fr.result);
    fr.onerror=reject;
    fr.readAsDataURL(file);
  });
}
$("postBtn").onclick = async ()=>{
  if(!sess) return alert("Entre primeiro.");
  if(!picked) return alert("Escolha um arquivo.");
  $("postMsg").textContent="Enviando...";
  try{
    const dataUrl = await fileToDataUrl(picked);
    const type = picked.type.startsWith("video") ? "video" : "img";
    const r = await api("post", {type, dataUrl});
    $("postMsg").textContent = r.ok ? "Postado!" : ("Erro: "+(r.err||""));
    picked=null; $("filePick").value=""; $("pickInfo").textContent="Nenhum arquivo";
    await refreshAll();
    setTab("home");
  }catch(e){
    $("postMsg").textContent="Erro: "+(e?.message||e);
  }
};

/* ======= Timeline render ======= */
function renderCards(list, el, mode){
  el.innerHTML="";
  if(!list || !list.length){
    el.innerHTML = '<div class="muted">— sem posts —</div>';
    return;
  }
  list.forEach(p=>{
    const c=document.createElement("div");
    c.className="card";
    const t=document.createElement("div");
    t.className="thumb";
    if(p.type==="img"){
      const im=document.createElement("img"); im.src=p.dataUrl; t.appendChild(im);
    }else{
      const vd=document.createElement("video"); vd.src=p.dataUrl; vd.muted=true; vd.playsInline=true; vd.loop=true; vd.autoplay=true; t.appendChild(vd);
    }
    t.onclick=()=>{
      // sobe pro visor
      setViewerMedia({type:p.type, src:p.dataUrl, label:"@"+p.owner+" • "+new Date(p.createdAt).toLocaleString()});
      toast("No visor");
    };
    const meta=document.createElement("div");
    meta.className="meta";
    meta.innerHTML = '<div class="small">@'+p.owner+' • '+new Date(p.createdAt).toLocaleString()+'</div>';
    const right=document.createElement("div");
    // seguir
    if(sess && p.owner !== sess.user){
      const b=document.createElement("button");
      b.className="followBtn";
      b.textContent="Seguir";
      b.onclick=async (ev)=>{
        ev.stopPropagation();
        const r=await api("follow", {target:p.owner});
        if(!r.ok) return alert(r.err||"erro");
        toast("Seguindo "+p.owner);
        await refreshAll();
      };
      right.appendChild(b);
    }
    meta.appendChild(right);
    c.appendChild(t);
    c.appendChild(meta);
    el.appendChild(c);
  });
}

/* ======= Pix / QR ======= */
$("pixBtn").onclick = async ()=>{
  if(!sess) return alert("Entre primeiro.");
  $("pixMsg").textContent="Gerando PIX...";
  $("qrBox").classList.remove("on");
  const amount = $("depAmount").value.trim().replace(",", ".");
  const r = await api("mp_pix", {amount});
  if(!r.ok){
    // mostra o erro detalhado (agora você vai ver o motivo real)
    $("pixMsg").textContent = "Erro: " + (r.err || "") + (r.mp ? (" | MP: "+JSON.stringify(r.mp)) : "");
    return;
  }
  $("pixMsg").textContent = "PIX criado! (aguarde pagar)";
  $("qrText").value = r.qr || "";
  $("qrImg").src = r.qrBase64 ? ("data:image/png;base64,"+r.qrBase64) : "";
  $("openMP").href = r.initPoint || "#";
  $("qrBox").classList.add("on");
};
$("copyPix").onclick = async ()=>{
  try{ await navigator.clipboard.writeText($("qrText").value||""); toast("Copiado!"); }catch{ alert("Não consegui copiar."); }
};

/* ======= Saque protótipo ======= */
$("wdBtn").onclick = async ()=>{
  if(!sess) return alert("Entre primeiro.");
  const amount = $("wdAmount").value.trim().replace(",", ".");
  const r = await api("withdraw", {amount});
  $("wdMsg").textContent = r.ok ? "Pedido enviado (protótipo)" : ("Erro: "+(r.err||""));
  await refreshAll();
};

/* ======= Refresh ======= */
async function refreshAll(){
  // me
  let me=null;
  if(sess){
    const r=await api("me");
    if(r.ok) me=r.me;
    else me=null;
  }
  renderWho(me);

  // timeline
  const feed = await fetch("/api?op=feed").then(r=>r.json());
  if(feed.ok){
    renderCards(feed.posts, $("timeline"), "all");
  }

  // profile lists
  if(me){
    $("followCount").textContent = (me.follows||[]).length;
    $("childCount").textContent  = (me.children||[]).length;
    $("followList").textContent  = (me.follows||[]).length ? me.follows.join(", ") : "—";
    $("childList").textContent   = (me.children||[]).length ? me.children.join(", ") : "—";
    $("myCount").textContent     = (feed.myPosts||[]).length;
  } else {
    $("followCount").textContent="0"; $("childCount").textContent="0";
    $("followList").textContent="—"; $("childList").textContent="—"; $("myCount").textContent="0";
  }

  // meus posts (se logado)
  if(sess){
    const my = await api("my_posts");
    if(my.ok) renderCards(my.posts, $("myPosts"), "mine");
  } else {
    $("myPosts").innerHTML = '<div class="muted">—</div>';
  }

  // ADM pagamentos
  const pay = await fetch("/api?op=pay_list").then(r=>r.json());
  if(pay.ok){
    $("payList").textContent = pay.items.length ? pay.items.join("\\n") : "—";
  }
}
refreshAll();
</script>
</body></html>`;
}

// ======= API router =======
module.exports = async (req, res) => {
  const u = new URL(req.url, "http://localhost");
  const op = u.searchParams.get("op") || "";

  // GET /api -> UI
  if (req.method === "GET" && (!op || op === "ui")) {
    return h(res, 200, uiHTML());
  }

  // GET ops
  if (req.method === "GET") {
    if (op === "feed") {
      const posts = DB.posts
        .slice()
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 60)
        .map((p) => ({ ...p }));
      return j(res, 200, { ok: true, posts });
    }
    if (op === "pay_list") {
      const items = Object.entries(DB.mpPayments)
        .sort((a, b) => (b[1].createdAt || 0) - (a[1].createdAt || 0))
        .slice(0, 30)
        .map(([id, x]) => `#${id} • ${x.status} • R$${x.amount} • user=${x.username || "?"}`);
      return j(res, 200, { ok: true, items });
    }
    return j(res, 200, { ok: true, msg: 'API ICE-CUBO online', hint: 'Abra /api no navegador' });
  }

  // POST body
  let body = {};
  try {
    const raw = await readBody(req);
    body = raw ? JSON.parse(raw) : {};
  } catch (e) {
    return j(res, 400, { ok: false, err: "JSON inválido" });
  }

  // helpers
  const me = authFromReq(req);

  // ===== Auth =====
  if (op === "create") {
    const user = safeUser(body.u);
    const pass = String(body.p || "");
    if (!user || pass.length < 2) return j(res, 200, { ok: false, err: "Usuário/senha inválidos" });
    ensureUser(user);
    if (DB.users[user].pass) return j(res, 200, { ok: false, err: "Usuário já existe" });
    DB.users[user].pass = pass;
    if (!DB.users["adm"]) { ensureUser("adm"); DB.users["adm"].pass = "1533"; }
    return j(res, 200, { ok: true, user });
  }

  if (op === "login") {
    const user = safeUser(body.u);
    const pass = String(body.p || "");
    if (!user || !DB.users[user]) return j(res, 200, { ok: false, err: "Login ou senha errados." });
    if (DB.users[user].pass !== pass) return j(res, 200, { ok: false, err: "Login ou senha errados." });
    return j(res, 200, { ok: true, user });
  }

  if (op === "me") {
    if (!me) return j(res, 200, { ok: false, err: "Entre primeiro." });
    return j(res, 200, { ok: true, me: asJSONUser(me) });
  }

  // ===== Affiliate =====
  if (op === "set_affiliate_of") {
    if (!me) return j(res, 200, { ok: false, err: "Entre primeiro." });
    const of = safeUser(body.of);
    if (!of) { DB.users[me].affiliateOf = null; return j(res, 200, { ok: true }); }
    if (!DB.users[of]) return j(res, 200, { ok: false, err: "Usuário afiliador não existe." });
    if (of === me) return j(res, 200, { ok: false, err: "Não pode ser você mesmo." });
    DB.users[me].affiliateOf = of;
    // filho
    DB.users[of].children.add(me);
    return j(res, 200, { ok: true });
  }

  // ===== Follow =====
  if (op === "follow") {
    if (!me) return j(res, 200, { ok: false, err: "Entre primeiro." });
    const target = safeUser(body.target);
    if (!target || !DB.users[target]) return j(res, 200, { ok: false, err: "Usuário não existe." });
    if (target === me) return j(res, 200, { ok: false, err: "Não dá pra seguir você." });
    DB.users[me].follows.add(target);
    return j(res, 200, { ok: true });
  }

  // ===== Posts =====
  if (op === "post") {
    if (!me) return j(res, 200, { ok: false, err: "Entre primeiro." });
    const type = body.type === "video" ? "video" : "img";
    const dataUrl = String(body.dataUrl || "");
    if (!dataUrl.startsWith("data:")) return j(res, 200, { ok: false, err: "Arquivo inválido." });
    // limita tamanho pra não estourar serverless
    if (dataUrl.length > 1_800_000) return j(res, 200, { ok: false, err: "Arquivo muito grande (reduza)." });

    const id = "p" + now() + Math.random().toString(16).slice(2);
    DB.posts.push({ id, owner: me, type, dataUrl, createdAt: now() });
    return j(res, 200, { ok: true, id });
  }

  if (op === "my_posts") {
    if (!me) return j(res, 200, { ok: false, err: "Entre primeiro." });
    const posts = DB.posts.filter(p => p.owner === me).sort((a,b)=>b.createdAt-a.createdAt).slice(0, 60);
    return j(res, 200, { ok: true, posts });
  }

  // ===== Withdraw protótipo =====
  if (op === "withdraw") {
    if (!me) return j(res, 200, { ok: false, err: "Entre primeiro." });
    const amount = Number(String(body.amount || "").replace(",", "."));
    if (!isFinite(amount) || amount <= 0) return j(res, 200, { ok: false, err: "Valor inválido" });
    if (DB.users[me].blue < amount) return j(res, 200, { ok: false, err: "Saldo insuficiente" });
    // protótipo: não debita automaticamente
    return j(res, 200, { ok: true });
  }

  // ===== Mine bonus =====
  if (op === "mine_bonus") {
    if (!me) return j(res, 200, { ok: false, err: "Entre primeiro." });
    const bonus = Number(DB.users[me].bonusToMine || 0);
    if (!bonus || bonus <= 0) return j(res, 200, { ok: false, err: "Sem bônus." });
    DB.users[me].blue += bonus;
    DB.users[me].minedTotal += bonus;
    DB.users[me].bonusToMine = 0;
    return j(res, 200, { ok: true, mined: bonus });
  }

  // ===== Mercado Pago PIX / QR =====
  if (op === "mp_pix") {
    if (!me) return j(res, 200, { ok: false, err: "Entre primeiro." });
    if (!MP_ACCESS_TOKEN) return j(res, 200, { ok: false, err: "MP_ACCESS_TOKEN não configurado na Vercel." });

    const amount = Number(String(body.amount || "").replace(",", "."));
    if (!isFinite(amount) || amount <= 0) return j(res, 200, { ok: false, err: "Valor inválido" });

    // payer email “falso válido” pro MP não rejeitar (você pode trocar por email real do usuário depois)
    const payerEmail = (me + "@icecubo.app").toLowerCase();

    // Cria um payment PIX
    const payload = {
      transaction_amount: amount,
      description: "Depósito ICE-CUBO (" + me.toUpperCase() + ")",
      payment_method_id: "pix",
      payer: { email: payerEmail },
      metadata: { ice_user: me },
      notification_url: (BASE_URL ? (BASE_URL.replace(/\\/$/, "") + "/api?op=mp_webhook") : undefined),
    };

    // remove campos undefined
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

    try {
      const r = await httpJSON(
        "POST",
        "https://api.mercadopago.com/v1/payments",
        { Authorization: "Bearer " + MP_ACCESS_TOKEN },
        payload
      );

      if (r.status < 200 || r.status >= 300) {
        return j(res, 200, { ok: false, err: "MP recusou", status: r.status, mp: r.json || r.text });
      }

      const data = r.json || {};
      const td = data.point_of_interaction && data.point_of_interaction.transaction_data ? data.point_of_interaction.transaction_data : null;
      const qr = td && td.qr_code ? td.qr_code : "";
      const qrBase64 = td && td.qr_code_base64 ? td.qr_code_base64 : "";
      const initPoint = data.init_point || data.transaction_details?.external_resource_url || "";

      // salva “pendente” (memória)
      DB.mpPayments[String(data.id)] = { status: data.status, amount, username: me, createdAt: now() };

      return j(res, 200, { ok: true, id: data.id, status: data.status, qr, qrBase64, initPoint });
    } catch (e) {
      return j(res, 200, { ok: false, err: String(e?.message || e), stack: String(e?.stack || "") });
    }
  }

  // ===== Webhook MP (opcional) =====
  if (op === "mp_webhook") {
    // MP envia POST com query topic/type + id / data.id etc.
    // Aqui a gente tenta buscar o pagamento e creditar 5% pro afiliador + marcar bônus pra minerar.
    try {
      // proteção simples (se você setar secret no MP, você também coloca no Vercel)
      if (MP_WEBHOOK_SECRET) {
        const got = String(req.headers["x-ice-secret"] || "");
        // (MP não manda esse header por padrão; é um “trava” opcional se você usar um proxy seu)
        // então não bloqueio por padrão. Mantém só como opção.
      }

      // tenta extrair id
      const q = u.searchParams;
      let pid = q.get("id") || q.get("data.id") || "";
      if (!pid && body && body.data && body.data.id) pid = String(body.data.id);
      if (!pid && body && body.id) pid = String(body.id);

      if (!pid) return j(res, 200, { ok: true });

      // consulta MP pra ter certeza do status
      const rr = await httpJSON(
        "GET",
        "https://api.mercadopago.com/v1/payments/" + encodeURIComponent(pid),
        { Authorization: "Bearer " + MP_ACCESS_TOKEN }
      );

      if (rr.status < 200 || rr.status >= 300) {
        return j(res, 200, { ok: true, warn: "não consultei", status: rr.status });
      }

      const pay = rr.json || {};
      const status = pay.status || "unknown";
      const amount = Number(pay.transaction_amount || 0);
      const user = pay.metadata && pay.metadata.ice_user ? safeUser(pay.metadata.ice_user) : null;

      DB.mpPayments[String(pid)] = { status, amount, username: user || "?", createdAt: now() };

      // se aprovado, credita
      if (status === "approved" && user && DB.users[user]) {
        // credita saldo
        DB.users[user].blue += amount;

        // afiliador ganha 5% em “bônus pra minerar”
        const aff = DB.users[user].affiliateOf;
        if (aff && DB.users[aff]) {
          const bonus = Math.max(0, Math.floor(amount * 0.05 * 100) / 100); // 2 casas
          DB.users[aff].bonusToMine += bonus;
        }
      }

      return j(res, 200, { ok: true });
    } catch (e) {
      return j(res, 200, { ok: true, err: String(e?.message || e) });
    }
  }

  return j(res, 404, { ok: false, err: "op inválida" });
};
