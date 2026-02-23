// api/index.js (Vercel) — ICE-CUBO "um arquivo só"
// UI + API no mesmo endpoint: /api?op=...
// DEPÓSITO PIX: Mercado Pago (MP_ACCESS_TOKEN obrigatório)
// Webhook (op=mp_webhook) é básico (recomendado usar verificação oficial MP)
// SAQUE: protótipo (gera pedido p/ ADM aprovar). Saque real automático exige backend+compliance.

const https = require("https");
const { URL } = require("url");

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN?.trim();
const BASE_URL = process.env.BASE_URL || ""; // ex: https://seuapp.vercel.app
// Se você tiver webhook secret e quiser validar, você precisa implementar conforme docs oficiais do MP.
const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET || "";

const ADM_LOGIN = "ADM";
const ADM_SENHA = "1533";

// ======= util http =======
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
function httpJSON(method, url, headers, bodyObj) {
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
        ...(headers || {}),
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

// ======= armazenamento serverless (VOLÁTIL!) =======
// Em Vercel serverless isso pode resetar. Para “real”, use DB/KV.
const MEM = global.__ICE_MEM__ || (global.__ICE_MEM__ = {
  // pagamentos: id -> { userId, amount, status }
  payments: {},
  // créditos: userId -> blueNumber
  blue: {},
  // pedidos de saque: [{id,userId,amount,pixKey,status,ts}]
  withdraws: [],
});

// ======= UI =======
function pageHTML() {
  // Observação: dados de usuários/posts ficam no localStorage (por dispositivo).
  // O backend só entra em PIX (MP) e lista/aprovação de saques (protótipo).
  return `<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<title>ICE-CUBO</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
:root{
  --bg1:#dff3ff;--bg2:#bfe8ff;--bg3:#072445;
  --glass:rgba(255,255,255,.58);--line:rgba(7,36,69,.18);
  --t:#06223f;--m:#2b587d;--a:#0ea5e9;--d:#0b2a6a;
  --card:rgba(255,255,255,.65);--shadow:rgba(0,0,0,.12);
  --ok:#16a34a;--warn:#f59e0b;--bad:#ef4444;
}
*{box-sizing:border-box}
body{
  margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;color:var(--t);
  height:100vh;overflow:hidden;
  background:
    radial-gradient(1200px 700px at 15% -10%,rgba(255,255,255,.85),transparent 55%),
    radial-gradient(900px 700px at 110% 20%,rgba(56,189,248,.25),transparent 60%),
    linear-gradient(180deg,var(--bg1),var(--bg2) 45%,#7dd3fc 70%,#2aa9ff 86%,var(--bg3));
}
body:before{
  content:"";position:fixed;inset:0;pointer-events:none;opacity:.35;mix-blend-mode:multiply;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cg fill='none'%3E%3Ccircle cx='22' cy='88' r='3' fill='%23ffffff' opacity='.35'/%3E%3Ccircle cx='35' cy='98' r='2' fill='%23ffffff' opacity='.25'/%3E%3Ccircle cx='48' cy='88' r='2' fill='%23ffffff' opacity='.2'/%3E%3Cpath d='M60 10c6 10 6 20 0 30c-6-10-6-20 0-30Z' fill='%230ea5e9' opacity='.35'/%3E%3Cpath d='M85 35c-10 6-20 6-30 0c10-6 20-6 30 0Z' fill='%230ea5e9' opacity='.25'/%3E%3Cpath d='M82 86c8-10 12-18 4-28c-9 6-14 12-4 28Z' fill='%230b5fa5' opacity='.22'/%3E%3Cpath d='M82 86c2-6 8-10 12-12' stroke='%230b5fa5' opacity='.22' stroke-width='2' stroke-linecap='round'/%3E%3Cpath d='M82 86c-2-6-8-10-12-12' stroke='%230b5fa5' opacity='.22' stroke-width='2' stroke-linecap='round'/%3E%3C/g%3E%3C/svg%3E");
  background-size:160px 160px;
}
a{color:inherit}button{cursor:pointer}input,textarea{font:inherit}
#app{height:100vh;display:flex;flex-direction:column}
.top{
  height:52vh;position:relative;border-radius:0 0 26px 26px;overflow:hidden;
  background:rgba(0,0,0,.08);
}
.bub:before,.bub:after{
  content:"";position:absolute;inset:-20%;
  background:
   radial-gradient(circle,rgba(255,255,255,.35) 0 2px,transparent 3px) 0 0/120px 120px,
   radial-gradient(circle,rgba(255,255,255,.22) 0 1px,transparent 2px) 40px 20px/160px 160px;
  animation:float 14s linear infinite;opacity:.55
}
.bub:after{animation-duration:20s;opacity:.35;transform:scale(1.15)}
@keyframes float{to{transform:translateY(-120px)}}

.brand{
  position:absolute;top:10px;left:12px;right:12px;
  display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:5;
}
.logo{
  display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);
  background:var(--glass);backdrop-filter:blur(10px);border-radius:18px;
  box-shadow:0 10px 30px rgba(0,0,0,.10)
}
.avatar{
  width:34px;height:34px;border-radius:14px;display:grid;place-items:center;
  background:linear-gradient(135deg,#38bdf8,#0b2a6a);color:#fff;font-weight:900;
}
.brandname{display:flex;flex-direction:column;line-height:1.05}
.brandname b{letter-spacing:1.2px;font-size:15px}
.brandname small{color:var(--m);font-size:11px}
.roleBadge{display:inline-flex;align-items:center;gap:6px;font-weight:900;font-size:11px;margin-top:2px}
.starGold{color:#ffd700;text-shadow:0 1px 0 rgba(0,0,0,.15)}
.starBlue{color:#38bdf8;text-shadow:0 1px 0 rgba(0,0,0,.12)}
.bear{font-size:16px}

.pill{
  display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);
  background:var(--glass);backdrop-filter:blur(10px);border-radius:18px;
}
.coin{
  width:28px;height:28px;border-radius:50%;display:grid;place-items:center;
  background:radial-gradient(circle at 30% 30%,#38bdf8,#0b2a6a);
  border:1px solid rgba(255,215,0,.55);
  box-shadow:0 0 0 2px rgba(255,215,0,.18) inset
}
.coin span{color:#ffd700;font-weight:1000}
.pill .meta{display:flex;flex-direction:column;line-height:1.05}
.pill .meta b{font-size:12px}
.pill .meta small{font-size:11px;color:var(--m)}

.viewer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:2}
#mainV,#camV{width:100%;height:100%;object-fit:cover;display:none}
#mainCover{
  width:100%;height:100%;display:grid;place-items:center;
  background:linear-gradient(135deg,rgba(255,255,255,.25),rgba(255,255,255,.05));
}
.stageHint{
  width:min(92%,520px);background:rgba(255,255,255,.55);border:1px solid var(--line);
  border-radius:22px;backdrop-filter:blur(12px);padding:14px;
  box-shadow:0 18px 60px rgba(0,0,0,.16)
}
.stageHint b{display:block;font-size:16px}
.stageHint small{color:var(--m)}
.stageBar{
  position:absolute;left:12px;right:12px;bottom:12px;display:flex;gap:10px;z-index:6;
}
.btn{
  flex:1;display:flex;align-items:center;justify-content:center;gap:8px;
  padding:12px;border-radius:18px;border:1px solid var(--line);
  background:rgba(255,255,255,.62);backdrop-filter:blur(12px);
  box-shadow:0 12px 30px rgba(0,0,0,.10);
  font-weight:900;color:var(--t)
}
.btn:active{transform:scale(.99)}
.btn.ok{background:rgba(22,163,74,.18)}
.btn.warn{background:rgba(245,158,11,.18)}
.btn.bad{background:rgba(239,68,68,.16)}
.btn.primary{background:rgba(14,165,233,.18)}

.bottom{
  flex:1;display:flex;flex-direction:column;gap:10px;padding:12px 12px 90px;
}
.cardsRow{
  display:flex;gap:10px;overflow:auto;padding-bottom:4px;scrollbar-width:none
}
.cardsRow::-webkit-scrollbar{display:none}
.card{
  min-width:140px;max-width:140px;border-radius:18px;overflow:hidden;
  border:1px solid var(--line);background:rgba(255,255,255,.60);backdrop-filter:blur(10px);
  box-shadow:0 12px 30px rgba(0,0,0,.10);position:relative;
}
.thumb{height:88px;background:#0b2a6a;display:grid;place-items:center;color:#fff;font-weight:1000}
.thumb img,.thumb video{width:100%;height:100%;object-fit:cover}
.card .cbody{padding:10px}
.tag{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:900;color:var(--m)}
.card .title{font-weight:1000;margin-top:6px;font-size:12px}
.card .hint{font-size:11px;color:var(--m);margin-top:4px}

.panel{
  display:none;flex-direction:column;gap:10px;
  border:1px solid var(--line);background:rgba(255,255,255,.55);backdrop-filter:blur(12px);
  border-radius:22px;padding:12px;box-shadow:0 18px 60px rgba(0,0,0,.14);
}
.panel.active{display:flex}
.hrow{display:flex;align-items:center;justify-content:space-between;gap:10px}
.hrow h3{margin:0;font-size:14px}
.muted{color:var(--m);font-size:12px}
.row{display:flex;gap:10px;flex-wrap:wrap}
.field{flex:1;min-width:140px}
input,textarea{
  width:100%;padding:12px 12px;border-radius:16px;border:1px solid var(--line);
  background:rgba(255,255,255,.70);outline:none
}
textarea{min-height:90px;resize:none}
.sbtn{
  padding:12px 14px;border-radius:16px;border:1px solid var(--line);
  background:rgba(255,255,255,.72);font-weight:900
}
.sbtn.ok{background:rgba(22,163,74,.20)}
.sbtn.warn{background:rgba(245,158,11,.20)}
.sbtn.bad{background:rgba(239,68,68,.18)}
.hr{height:1px;background:rgba(7,36,69,.12);margin:6px 0}

.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.post{
  border:1px solid var(--line);border-radius:18px;overflow:hidden;background:rgba(255,255,255,.72)
}
.post .ph{height:110px;background:#0b2a6a;display:grid;place-items:center;color:#fff;font-weight:1000}
.post img,.post video{width:100%;height:110px;object-fit:cover;display:block}
.post .pb{padding:10px}
.post .pb b{font-size:12px}
.post .pb small{display:block;color:var(--m);font-size:11px;margin-top:4px}

.nav{
  position:fixed;left:12px;right:12px;bottom:14px;
  display:flex;justify-content:space-between;gap:10px;
  padding:10px;border-radius:22px;border:1px solid var(--line);
  background:rgba(255,255,255,.55);backdrop-filter:blur(12px);
  box-shadow:0 18px 60px rgba(0,0,0,.16);
}
.nbtn{
  flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
  padding:10px;border-radius:18px;color:var(--m);font-weight:900;font-size:11px;border:1px solid transparent
}
.nbtn i{font-size:18px}
.nbtn.active{color:var(--t);background:rgba(14,165,233,.12);border-color:rgba(14,165,233,.20)}
.badge{
  display:inline-flex;align-items:center;gap:6px;font-weight:1000;font-size:12px
}
.qrBox{
  border:1px dashed rgba(7,36,69,.25);border-radius:18px;padding:12px;background:rgba(255,255,255,.7)
}
.k{
  font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;
  font-size:12px;word-break:break-all;color:#06325b
}
.toast{
  position:fixed;left:12px;right:12px;top:14px;z-index:50;
  display:none;align-items:center;justify-content:space-between;gap:10px;
  padding:12px 14px;border-radius:18px;border:1px solid var(--line);
  background:rgba(255,255,255,.75);backdrop-filter:blur(12px);
  box-shadow:0 18px 60px rgba(0,0,0,.16);font-weight:900
}
.toast.show{display:flex}
</style>
</head>
<body>
<div class="toast" id="toast"><span id="toastMsg">—</span><button class="sbtn" onclick="hideToast()">OK</button></div>

<div id="app">
  <div class="top bub">
    <div class="brand">
      <div class="logo">
        <div class="avatar" id="ava">IC</div>
        <div class="brandname">
          <b>ICE-CUBO</b>
          <small id="sub">Rede • Lives • BLUE</small>
          <div class="roleBadge" id="roleBadge" style="display:none"></div>
        </div>
      </div>
      <div class="pill">
        <div class="coin"><span>B</span></div>
        <div class="meta">
          <b><span id="blueTop">0</span> BLUE</b>
          <small id="whoTop">deslogado</small>
        </div>
      </div>
    </div>

    <div class="viewer">
      <video id="mainV" playsinline muted loop></video>
      <video id="camV" playsinline muted autoplay></video>
      <div id="mainCover">
        <div class="stageHint">
          <b>Toque 2x em um card abaixo</b>
          <small>Ele sobe pro palco. A câmera abre só no ícone.</small>
        </div>
      </div>
    </div>

    <div class="stageBar">
      <button class="btn primary" id="btnSwapMain"><i class="fa-solid fa-up-right-and-down-left-from-center"></i> Subir card</button>
      <button class="btn ok" id="btnCam"><i class="fa-solid fa-video"></i> Câmera</button>
      <button class="btn bad" id="btnStop"><i class="fa-solid fa-stop"></i> Parar</button>
    </div>
  </div>

  <div class="bottom">
    <div class="cardsRow" id="cardsRow"></div>

    <div class="panel active" id="panelTimeline">
      <div class="hrow"><h3><i class="fa-solid fa-stream"></i> Timeline</h3><span class="muted">posts (local)</span></div>
      <div class="row">
        <button class="sbtn" id="btnRefresh"><i class="fa-solid fa-rotate"></i> Atualizar</button>
        <button class="sbtn" id="btnRef"><i class="fa-solid fa-link"></i> Link convite</button>
        <button class="sbtn warn" id="btnMine"><i class="fa-solid fa-hammer"></i> Quebrar gelo</button>
      </div>
      <div class="muted" id="mineNote">Jogo: quebre o gelo e ganhe BLUE (protótipo, só local).</div>
      <div class="hr"></div>
      <div class="grid" id="tlGrid"></div>
    </div>

    <div class="panel" id="panelPerfil">
      <div class="hrow"><h3><i class="fa-solid fa-user"></i> Seu perfil</h3><span class="muted">poste foto/vídeo</span></div>
      <div class="row">
        <div class="field"><input id="nick" placeholder="Seu nome (ex: Jessica)"></div>
        <button class="sbtn" id="saveNick"><i class="fa-solid fa-floppy-disk"></i> Salvar</button>
      </div>
      <div class="row">
        <label class="sbtn" style="display:inline-flex;align-items:center;gap:8px">
          <i class="fa-solid fa-image"></i> Abrir galeria
          <input id="filePick" type="file" accept="image/*,video/*" style="display:none">
        </label>
        <button class="sbtn ok" id="postBtn"><i class="fa-solid fa-upload"></i> Postar</button>
        <span class="muted" id="pickInfo">Nenhum arquivo</span>
      </div>
      <div class="hr"></div>
      <div class="hrow"><h3 style="font-size:14px;margin:0"><i class="fa-solid fa-user-plus"></i> Seguindo</h3><span class="muted" id="followCount">0</span></div>
      <div class="muted" id="followList">—</div>

      <div class="hr"></div>
      <div class="hrow"><h3 style="font-size:14px;margin:0"><i class="fa-solid fa-sitemap"></i> Filhos</h3><span class="muted" id="childCount">0</span></div>
      <div class="muted" id="childList">—</div>

      <div class="hr"></div>
      <div class="muted" style="margin-bottom:8px">Seus posts:</div>
      <div class="grid" id="myPosts"></div>
    </div>

    <div class="panel" id="panelCarteira">
      <div class="hrow"><h3><i class="fa-solid fa-wallet"></i> Carteira</h3><span class="muted">depósito / saque</span></div>

      <div class="row">
        <div class="badge"><i class="fa-solid fa-coins"></i> <span id="blueWallet">0</span> BLUE</div>
        <div class="muted" id="walletUser">—</div>
      </div>

      <div class="hr"></div>

      <div style="font-weight:1000;font-size:14px"><i class="fa-solid fa-sack-dollar"></i> Depósito (PIX Mercado Pago)</div>
      <div class="row">
        <div class="field"><input id="depVal" type="number" min="1" step="1" placeholder="Valor (ex: 10)"></div>
        <button class="sbtn ok" id="depBtn"><i class="fa-brands fa-pix"></i> Gerar PIX</button>
      </div>
      <div id="depOut" class="qrBox" style="display:none">
        <div class="muted">PIX gerado. Copie e pague.</div>
        <div class="k" id="pixCode">—</div>
        <div class="row" style="margin-top:10px">
          <button class="sbtn" id="copyPix"><i class="fa-solid fa-copy"></i> Copiar</button>
          <button class="sbtn" id="checkPix"><i class="fa-solid fa-circle-check"></i> Verificar pagamento</button>
        </div>
        <div class="muted" id="pixStatus" style="margin-top:8px">—</div>
      </div>

      <div class="hr"></div>

      <div style="font-weight:1000;font-size:14px"><i class="fa-solid fa-building-columns"></i> Saque (pedido)</div>
      <div class="row">
        <div class="field"><input id="saqueVal" type="number" min="1" step="1" placeholder="BLUE para sacar"></div>
        <div class="field"><input id="pixKey" placeholder="Sua chave PIX (email/celular/cpf)"></div>
        <button class="sbtn warn" id="saqueBtn"><i class="fa-solid fa-paper-plane"></i> Solicitar saque</button>
      </div>
      <div class="muted">Saque aqui é pedido (protótipo). O ADM aprova/rejeita.</div>

      <div class="hr"></div>
      <div class="hrow"><h3 style="font-size:14px;margin:0"><i class="fa-solid fa-list-check"></i> Meus pedidos</h3><span class="muted" id="wCount">0</span></div>
      <div id="wList" class="muted">—</div>
    </div>

    <div class="panel" id="panelADM">
      <div class="hrow"><h3><i class="fa-solid fa-shield-halved"></i> ADM</h3><span class="muted">somente ADM master</span></div>

      <div id="admGate">
        <div class="row">
          <div class="field"><input id="admLogin" placeholder="Login"></div>
          <div class="field"><input id="admSenha" placeholder="Senha" type="password"></div>
        </div>
        <button class="sbtn ok" id="admEntrar"><i class="fa-solid fa-right-to-bracket"></i> Entrar</button>
        <div class="muted">ADM master: ${ADM_LOGIN} / ${ADM_SENHA}</div>
      </div>

      <div id="admPanel" style="display:none">
        <div class="row">
          <button class="sbtn" id="admSync"><i class="fa-solid fa-rotate"></i> Atualizar lista</button>
          <button class="sbtn bad" id="admLogout"><i class="fa-solid fa-right-from-bracket"></i> Sair</button>
        </div>
        <div class="hr"></div>
        <div style="font-weight:1000">Usuários (local)</div>
        <div class="muted" id="admUsers">—</div>

        <div class="hr"></div>
        <div style="font-weight:1000">Pedidos de Saque (server protótipo)</div>
        <div class="muted" id="admWithdraws">—</div>
      </div>
    </div>

  </div>

  <div class="nav">
    <div class="nbtn active" data-tab="timeline"><i class="fa-solid fa-house"></i><div>HOME</div></div>
    <div class="nbtn" data-tab="perfil"><i class="fa-solid fa-user"></i><div>PERFIL</div></div>
    <div class="nbtn" data-tab="carteira"><i class="fa-solid fa-wallet"></i><div>CARTEIRA</div></div>
    <div class="nbtn" data-tab="timeline"><i class="fa-solid fa-layer-group"></i><div>TIMELINE</div></div>
    <div class="nbtn" data-tab="adm"><i class="fa-solid fa-star"></i><div>ADM</div></div>
  </div>
</div>

<script>
/* ===========================
   Storage local (protótipo)
=========================== */
const LS = {
  get(k, def){ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):def }catch{return def} },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)) }
};

// "banco" local
let me = LS.get("ice.me", null);
let users = LS.get("ice.users", {}); // id -> {id,nick,role,banned,children:[],following:[]}
let posts = LS.get("ice.posts", []); // {id,uid,type,data,ts}
let mine = LS.get("ice.mine", {ice:100, last:0}); // jogo

function uid(){
  return "u_" + Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(2,6);
}
function now(){ return Date.now(); }

function toast(msg){
  const t=document.getElementById("toast");
  document.getElementById("toastMsg").textContent=msg;
  t.classList.add("show");
  clearTimeout(window.__tto);
  window.__tto=setTimeout(()=>t.classList.remove("show"), 2400);
}
function hideToast(){ document.getElementById("toast").classList.remove("show"); }

// cria usuário automático
function ensureMe(){
  if(!me){
    const id=uid();
    me={id,nick:"Visitante",role:"user"}; // role: user | mod | admin
    users[id]={id,nick:me.nick,role:"user",banned:false,children:[],following:[]};
    LS.set("ice.me", me); LS.set("ice.users", users);
  }
  // aplicar convite ?ref=
  const qs=new URLSearchParams(location.search);
  const ref=qs.get("ref");
  if(ref && ref!==me.id){
    // adiciona como pai -> me vira "filho" de ref
    if(users[ref]){
      const parent=users[ref];
      if(!parent.children.includes(me.id)) parent.children.push(me.id);
      const mineUser=users[me.id];
      if(!mineUser.following.includes(ref)) mineUser.following.push(ref);
      LS.set("ice.users", users);
      toast("Convite aplicado: você virou filho/seguindo!");
      history.replaceState({}, "", location.pathname);
    }
  }
}
ensureMe();

function isAdmin(){ return me?.role==="admin"; }
function isMod(){ return me?.role==="mod"; }

function roleBadgeHTML(u){
  if(u.role==="admin") return '<span class="bear">🐻</span><span class="starGold"><i class="fa-solid fa-star"></i> ADM</span>';
  if(u.role==="mod") return '<span class="starBlue"><i class="fa-solid fa-star"></i> MOD</span>';
  return '';
}

function syncTop(){
  document.getElementById("whoTop").textContent = me ? me.nick : "deslogado";
  document.getElementById("ava").textContent = (me?.nick||"IC").slice(0,2).toUpperCase();
  const rb=document.getElementById("roleBadge");
  const html = roleBadgeHTML(me);
  rb.style.display = html ? "inline-flex" : "none";
  rb.innerHTML = html;

  // BLUE (local + server protótipo)
  const localBlue = LS.get("ice.blue", 0);
  document.getElementById("blueTop").textContent = localBlue;
  document.getElementById("blueWallet").textContent = localBlue;
  document.getElementById("walletUser").textContent = "@" + me.id.slice(-6);
}

function setTab(tab){
  document.querySelectorAll(".nbtn").forEach(b=>{
    b.classList.toggle("active", b.dataset.tab===tab);
  });
  const map = {
    timeline: "panelTimeline",
    perfil: "panelPerfil",
    carteira: "panelCarteira",
    adm: "panelADM",
  };
  Object.values(map).forEach(id=>document.getElementById(id).classList.remove("active"));
  document.getElementById(map[tab]||"panelTimeline").classList.add("active");

  // gate ADM
  if(tab==="adm"){
    document.getElementById("admGate").style.display = isAdmin() ? "none" : "block";
    document.getElementById("admPanel").style.display = isAdmin() ? "block" : "none";
    if(isAdmin()) loadADM();
  }
}
document.querySelectorAll(".nbtn").forEach(b=>b.onclick=()=>setTab(b.dataset.tab));

/* ===========================
   Cards "vídeos" com 2x toque
=========================== */
const demoCards = [
  {id:"c1", title:"ICE IA", tag:"vídeo", src:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"},
  {id:"c2", title:"Ursinho BLUE", tag:"foto", src:"https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=60"},
  {id:"c3", title:"Mar + Bolhas", tag:"vídeo", src:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"},
  {id:"c4", title:"Sky", tag:"foto", src:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60"},
];

function renderCards(){
  const row=document.getElementById("cardsRow");
  row.innerHTML="";
  demoCards.forEach(c=>{
    const el=document.createElement("div");
    el.className="card";
    el.innerHTML = \`
      <div class="thumb">\${c.tag==="vídeo" ? "<i class='fa-solid fa-play'></i>" : "<i class='fa-solid fa-image'></i>"}</div>
      <div class="cbody">
        <div class="tag"><i class="fa-solid fa-layer-group"></i> \${c.tag}</div>
        <div class="title">\${c.title}</div>
        <div class="hint">2 toques: palco</div>
      </div>\`;
    // thumb preview
    const th=el.querySelector(".thumb");
    if(c.tag==="foto"){
      th.innerHTML=\`<img src="\${c.src}" alt="">\`;
    }else{
      th.innerHTML=\`<video src="\${c.src}" muted playsinline></video>\`;
      const v=th.querySelector("video");
      v.addEventListener("loadeddata", ()=>v.play().catch(()=>{}));
    }

    // double tap
    let last=0;
    el.addEventListener("touchend", ()=>{
      const t=Date.now();
      if(t-last<350) openToStage(c);
      last=t;
    });
    el.addEventListener("dblclick", ()=>openToStage(c));
    row.appendChild(el);
  });
}
renderCards();

async function openToStage(card){
  stopStage();
  const mainV=document.getElementById("mainV");
  const cover=document.getElementById("mainCover");
  cover.style.display="none";
  if(card.tag==="foto"){
    // foto em "vídeo": coloca imagem como background
    mainV.style.display="none";
    const v=document.getElementById("camV");
    v.style.display="none";
    const mc=document.getElementById("mainCover");
    mc.style.display="grid";
    mc.innerHTML = \`
      <div class="stageHint">
        <b>\${card.title}</b>
        <small>Você subiu um card pro palco.</small>
      </div>
      <img src="\${card.src}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" alt="">
    \`;
  }else{
    mainV.src=card.src;
    mainV.style.display="block";
    await mainV.play().catch(()=>{});
  }
  toast("Card no palco ✅");
}

function stopStage(){
  const mainV=document.getElementById("mainV");
  const camV=document.getElementById("camV");
  try{ mainV.pause(); }catch{}
  try{ camV.pause(); }catch{}
  mainV.style.display="none"; camV.style.display="none";
  document.getElementById("mainCover").style.display="grid";
  // restaura cover padrão
  document.getElementById("mainCover").innerHTML = \`
    <div class="stageHint">
      <b>Toque 2x em um card abaixo</b>
      <small>Ele sobe pro palco. A câmera abre só no ícone.</small>
    </div>\`;
}

document.getElementById("btnStop").onclick=stopStage;
document.getElementById("btnSwapMain").onclick=()=>toast("Use 2 toques no card 👇");

document.getElementById("btnCam").onclick=async ()=>{
  stopStage();
  const camV=document.getElementById("camV");
  const cover=document.getElementById("mainCover");
  cover.style.display="none";
  camV.style.display="block";
  try{
    const st = await navigator.mediaDevices.getUserMedia({video:true,audio:false});
    camV.srcObject=st;
    await camV.play();
    toast("Câmera ligada ✅");
  }catch(e){
    stopStage();
    toast("Sem permissão de câmera 😕");
  }
};

/* ===========================
   Posts (local)
=========================== */
let picked=null;
const pickInfo=document.getElementById("pickInfo");
document.getElementById("filePick").addEventListener("change", async (e)=>{
  const f=e.target.files?.[0];
  if(!f){ picked=null; pickInfo.textContent="Nenhum arquivo"; return; }
  picked=f; pickInfo.textContent=f.name;
});
document.getElementById("saveNick").onclick=()=>{
  const n=document.getElementById("nick").value.trim();
  if(!n) return toast("Digite um nome");
  me.nick=n;
  users[me.id].nick=n;
  LS.set("ice.me", me); LS.set("ice.users", users);
  syncTop(); renderPerfil(); renderTimeline();
  toast("Nome salvo ✅");
};
document.getElementById("postBtn").onclick=async ()=>{
  if(!picked) return toast("Escolha um arquivo");
  const f=picked;
  const type = f.type.startsWith("video") ? "video" : "image";
  const reader = new FileReader();
  reader.onload = ()=>{
    const data = reader.result;
    posts.unshift({id:uid(), uid:me.id, type, data, ts:Date.now()});
    LS.set("ice.posts", posts);
    picked=null; document.getElementById("filePick").value=""; pickInfo.textContent="Nenhum arquivo";
    renderPerfil(); renderTimeline();
    toast("Postado ✅");
  };
  reader.readAsDataURL(f);
};

/* ===========================
   Timeline / Perfil render
=========================== */
function fmt(t){ const d=new Date(t); return d.toLocaleString(); }
function renderTimeline(){
  const g=document.getElementById("tlGrid");
  g.innerHTML="";
  const all = LS.get("ice.posts", []);
  if(!all.length){
    g.innerHTML='<div class="muted">Sem posts ainda. Poste algo no Perfil.</div>';
    return;
  }
  all.slice(0,20).forEach(p=>{
    const u=users[p.uid]||{nick:"?"};
    const el=document.createElement("div");
    el.className="post";
    el.innerHTML = \`
      <div class="ph">\${p.type==="video" ? "<video src='"+p.data+"' muted playsinline></video>" : "<img src='"+p.data+"' alt=''>"} </div>
      <div class="pb">
        <b>\${u.nick} \${roleBadgeHTML(u)?(" · "+roleBadgeHTML(u)):""}</b>
        <small>\${fmt(p.ts)}</small>
        <div class="row" style="margin-top:8px">
          <button class="sbtn" data-act="follow">Seguir</button>
          <button class="sbtn warn" data-act="child">Adotar (filho)</button>
          <button class="sbtn bad" data-act="ban" style="display:\${(isAdmin()||isMod())?'inline-flex':'none'}">Bloquear</button>
        </div>
      </div>\`;
    // autoplay thumb video
    const vv=el.querySelector("video");
    if(vv) vv.play().catch(()=>{});

    el.querySelectorAll("button").forEach(b=>{
      b.onclick=()=>{
        const act=b.dataset.act;
        if(act==="follow"){
          if(p.uid===me.id) return toast("Você já é você 😄");
          if(!users[me.id].following.includes(p.uid)) users[me.id].following.push(p.uid);
          LS.set("ice.users", users); renderPerfil(); toast("Seguindo ✅");
        }
        if(act==="child"){
          if(p.uid===me.id) return toast("Não dá");
          if(!users[me.id].children.includes(p.uid)) users[me.id].children.push(p.uid);
          LS.set("ice.users", users); renderPerfil(); toast("Virou seu filho ✅");
        }
        if(act==="ban"){
          // moderador pode banir user/mod, mas NÃO pode banir ADM
          const target=users[p.uid];
          if(!target) return;
          if(target.role==="admin") return toast("ADM é intocável.");
          if(isMod() && target.role==="mod") return toast("MOD não bane MOD (só ADM).");
          target.banned=true;
          LS.set("ice.users", users);
          toast("Usuário bloqueado ✅");
          renderTimeline(); renderPerfil(); loadADM();
        }
      };
    });
    g.appendChild(el);
  });
}

function renderPerfil(){
  document.getElementById("nick").value = me.nick || "";
  const f=users[me.id].following||[];
  const c=users[me.id].children||[];
  document.getElementById("followCount").textContent=f.length;
  document.getElementById("childCount").textContent=c.length;
  document.getElementById("followList").textContent = f.length ? f.map(id=>"@"+(users[id]?.nick||id.slice(-6))).join(" • ") : "—";
  document.getElementById("childList").textContent = c.length ? c.map(id=>"@"+(users[id]?.nick||id.slice(-6))).join(" • ") : "—";

  const mp=document.getElementById("myPosts");
  mp.innerHTML="";
  const minePosts = LS.get("ice.posts", []).filter(p=>p.uid===me.id);
  if(!minePosts.length){
    mp.innerHTML='<div class="muted">Você ainda não postou.</div>';
  }else{
    minePosts.slice(0,10).forEach(p=>{
      const el=document.createElement("div");
      el.className="post";
      el.innerHTML=\`
        <div class="ph">\${p.type==="video" ? "<video src='"+p.data+"' muted playsinline></video>" : "<img src='"+p.data+"' alt=''>"} </div>
        <div class="pb"><b>Seu post</b><small>\${fmt(p.ts)}</small></div>\`;
      const vv=el.querySelector("video"); if(vv) vv.play().catch(()=>{});
      mp.appendChild(el);
    });
  }
}

document.getElementById("btnRefresh").onclick=()=>{ users=LS.get("ice.users",users); posts=LS.get("ice.posts",posts); renderTimeline(); renderPerfil(); syncTop(); toast("Atualizado ✅"); };

document.getElementById("btnRef").onclick=()=>{
  const link = location.origin + location.pathname + "?ref=" + me.id;
  navigator.clipboard?.writeText(link).then(()=>toast("Link copiado ✅")).catch(()=>toast("Copie manual: "+link));
};

/* ===========================
   Jogo "quebrar gelo" (protótipo)
=========================== */
function addBlueLocal(n){
  const cur = LS.get("ice.blue", 0);
  LS.set("ice.blue", Math.max(0, cur + n));
  syncTop();
}
document.getElementById("btnMine").onclick=()=>{
  const st=LS.get("ice.mine", mine);
  if(st.ice<=0){ toast("Sem gelo. Volta depois."); return; }
  // chance simples
  const gain = (Math.random()<0.08) ? 5 : (Math.random()<0.35 ? 2 : 1);
  st.ice = Math.max(0, st.ice - 5);
  LS.set("ice.mine", st);
  addBlueLocal(gain);
  toast("Ursinho quebrou o gelo 🐻 +"+gain+" BLUE");
};

/* ===========================
   ADM login + painel
=========================== */
document.getElementById("admEntrar").onclick=()=>{
  const l=document.getElementById("admLogin").value.trim();
  const s=document.getElementById("admSenha").value.trim();
  if(l===${JSON.stringify(ADM_LOGIN)} && s===${JSON.stringify(ADM_SENHA)}){
    me.role="admin";
    users[me.id].role="admin";
    LS.set("ice.me", me); LS.set("ice.users", users);
    syncTop(); setTab("adm"); toast("ADM logado ✅");
  }else toast("Login/senha incorretos");
};
document.getElementById("admLogout").onclick=()=>{
  me.role="user";
  // não derruba outros admins (só seu device)
  users[me.id].role="user";
  LS.set("ice.me", me); LS.set("ice.users", users);
  syncTop(); setTab("timeline"); toast("Saiu do ADM");
};
document.getElementById("admSync").onclick=()=>loadADM();

async function loadADM(){
  users=LS.get("ice.users", users);
  const box=document.getElementById("admUsers");
  const list=Object.values(users);
  if(!list.length){ box.textContent="—"; return; }
  box.innerHTML = list.map(u=>{
    const badge = roleBadgeHTML(u);
    const ban = u.banned ? " <span style='color:var(--bad);font-weight:1000'>(bloqueado)</span>" : "";
    const actions = (u.id===me.id) ? "" : \`
      <div class="row" style="margin:6px 0 10px">
        <button class="sbtn" onclick="promote('\${u.id}')"><i class="fa-solid fa-star"></i> MOD</button>
        <button class="sbtn" onclick="demote('\${u.id}')"><i class="fa-solid fa-user'></i> USER</button>
        <button class="sbtn bad" onclick="banUser('\${u.id}')"><i class="fa-solid fa-ban"></i> Ban</button>
        <button class="sbtn ok" onclick="unbanUser('\${u.id}')"><i class="fa-solid fa-check"></i> Unban</button>
      </div>\`;
    return \`
      <div style="padding:10px;border:1px solid rgba(7,36,69,.14);border-radius:16px;margin:10px 0;background:rgba(255,255,255,.65)">
        <div style="font-weight:1000">\${u.nick} <span class="muted">@\${u.id.slice(-6)}</span> \${badge?(" · "+badge):""}\${ban}</div>
        \${actions}
      </div>\`;
  }).join("");

  // withdraws (server)
  const wbox=document.getElementById("admWithdraws");
  try{
    const r = await fetch("/api?op=withdraw_list&admin=1");
    const data = await r.json();
    if(!data.ok) throw new Error();
    const arr = data.items||[];
    if(!arr.length){ wbox.textContent="—"; return; }
    wbox.innerHTML = arr.map(it=>{
      return \`
      <div style="padding:10px;border:1px solid rgba(7,36,69,.14);border-radius:16px;margin:10px 0;background:rgba(255,255,255,.65)">
        <div style="font-weight:1000">#\${it.id} · \${it.amount} BLUE · <span class="muted">@\${it.userId.slice(-6)}</span></div>
        <div class="muted">PIX: \${it.pixKey} · status: <b>\${it.status}</b></div>
        <div class="row" style="margin-top:8px">
          <button class="sbtn ok" onclick="wdAct('\${it.id}','approve')"><i class="fa-solid fa-check"></i> Aprovar</button>
          <button class="sbtn bad" onclick="wdAct('\${it.id}','reject')"><i class="fa-solid fa-xmark"></i> Rejeitar</button>
        </div>
      </div>\`;
    }).join("");
  }catch{
    wbox.textContent="Falha ao carregar saques.";
  }
}

window.promote = (id)=>{
  const u=users[id]; if(!u) return;
  if(u.role==="admin") return toast("Já é ADM.");
  u.role="mod";
  LS.set("ice.users", users);
  toast("Virou moderador ✅");
  loadADM(); renderTimeline(); syncTop();
};
window.demote = (id)=>{
  const u=users[id]; if(!u) return;
  if(u.role==="admin") return toast("ADM intocável.");
  u.role="user";
  LS.set("ice.users", users);
  toast("Voltou para user ✅");
  loadADM(); renderTimeline(); syncTop();
};
window.banUser = (id)=>{
  const u=users[id]; if(!u) return;
  if(u.role==="admin") return toast("ADM intocável.");
  u.banned=true;
  LS.set("ice.users", users);
  toast("Bloqueado ✅");
  loadADM(); renderTimeline();
};
window.unbanUser = (id)=>{
  const u=users[id]; if(!u) return;
  u.banned=false;
  LS.set("ice.users", users);
  toast("Desbloqueado ✅");
  loadADM(); renderTimeline();
};
window.wdAct = async (id, act)=>{
  const r = await fetch("/api?op=withdraw_act", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id,act,admin:true})});
  const d = await r.json();
  toast(d.ok ? "Atualizado ✅" : (d.msg||"Erro"));
  loadADM(); renderMyWithdraws();
};

/* ===========================
   Carteira: depósito PIX MP + saque pedido
=========================== */
let lastPaymentId = null;

document.getElementById("depBtn").onclick = async ()=>{
  const v = Number(document.getElementById("depVal").value||0);
  if(!v || v<1) return toast("Digite um valor válido");
  toast("Gerando PIX...");
  const r = await fetch("/api?op=mp_create", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({amount:v, userId:me.id})
  });
  const d = await r.json();
  if(!d.ok) return toast(d.msg||"Erro no PIX");
  lastPaymentId = d.paymentId;
  document.getElementById("depOut").style.display="block";
  document.getElementById("pixCode").textContent = d.copyPaste || "—";
  document.getElementById("pixStatus").textContent = "Aguardando pagamento...";
  toast("PIX gerado ✅");
};

document.getElementById("copyPix").onclick=()=>{
  const txt=document.getElementById("pixCode").textContent;
  navigator.clipboard?.writeText(txt).then(()=>toast("Copiado ✅")).catch(()=>toast("Copie manual"));
};

document.getElementById("checkPix").onclick = async ()=>{
  if(!lastPaymentId) return toast("Gere um PIX primeiro");
  const r = await fetch("/api?op=mp_status&id="+encodeURIComponent(lastPaymentId)+"&userId="+encodeURIComponent(me.id));
  const d = await r.json();
  if(!d.ok) return toast(d.msg||"Erro");
  document.getElementById("pixStatus").textContent = "Status: " + d.status;
  if(d.status==="approved"){
    // creditou do lado server (volátil) e aqui do lado local
    addBlueLocal(d.blueAdded||0);
    toast("Pagamento aprovado ✅ +BLUE");
  }else toast("Ainda não aprovado");
};

document.getElementById("saqueBtn").onclick = async ()=>{
  const amount = Number(document.getElementById("saqueVal").value||0);
  const pixKey = document.getElementById("pixKey").value.trim();
  if(!amount || amount<1) return toast("Valor inválido");
  if(!pixKey) return toast("Digite sua chave PIX");
  const cur = LS.get("ice.blue", 0);
  if(cur < amount) return toast("Sem BLUE suficiente");
  // debita local e cria pedido no server
  LS.set("ice.blue", cur - amount); syncTop();
  const r = await fetch("/api?op=withdraw_create", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({userId:me.id, amount, pixKey})});
  const d = await r.json();
  if(!d.ok){ // se falhar, estorna local
    LS.set("ice.blue", cur); syncTop();
    return toast(d.msg||"Erro no saque");
  }
  toast("Pedido de saque enviado ✅");
  document.getElementById("saqueVal").value="";
  document.getElementById("pixKey").value="";
  renderMyWithdraws();
};

async function renderMyWithdraws(){
  const r = await fetch("/api?op=withdraw_list&userId="+encodeURIComponent(me.id));
  const d = await r.json();
  const box=document.getElementById("wList");
  if(!d.ok) { box.textContent="Erro."; return; }
  const arr=d.items||[];
  document.getElementById("wCount").textContent=arr.length;
  if(!arr.length){ box.textContent="—"; return; }
  box.innerHTML = arr.map(it=>\`#\${it.id} · \${it.amount} BLUE · <b>\${it.status}</b>\`).join("<br>");
}
renderMyWithdraws();

/* ===========================
   Start
=========================== */
syncTop(); renderPerfil(); renderTimeline();
</script>
</body>
</html>`;
}

/* ===========================
   API ops (no mesmo /api)
=========================== */
async function op_mp_create(req, res) {
  if (!MP_ACCESS_TOKEN) return j(res, 400, { ok: false, msg: "Falta MP_ACCESS_TOKEN na Vercel (Environment Variables)." });
  const body = JSON.parse((await readBody(req)) || "{}");
  const amount = Number(body.amount || 0);
  const userId = String(body.userId || "");
  if (!amount || amount < 1) return j(res, 400, { ok: false, msg: "Valor inválido" });
  if (!userId) return j(res, 400, { ok: false, msg: "userId inválido" });

  // Importante: para teste, você pode usar um e-mail fixo.
  const payerEmail = "test@icecubo.local";

  const payload = {
    transaction_amount: amount,
    description: "ICE-CUBO DEPÓSITO PIX",
    payment_method_id: "pix",
    payer: { email: payerEmail },
    metadata: { user_id: userId },
    notification_url: BASE_URL ? (BASE_URL.replace(/\\/$/, "") + "/api?op=mp_webhook") : undefined,
  };
  if (!payload.notification_url) delete payload.notification_url;

  const r = await httpJSON(
    "POST",
    "https://api.mercadopago.com/v1/payments",
    { Authorization: "Bearer " + MP_ACCESS_TOKEN },
    payload
  );

  if (r.status < 200 || r.status >= 300) {
    return j(res, 500, { ok: false, msg: "Erro Mercado Pago", detail: r.json || r.text });
  }

  const p = r.json;
  const paymentId = String(p.id);
  const copyPaste =
    p.point_of_interaction?.transaction_data?.qr_code ||
    p.point_of_interaction?.transaction_data?.qr_code_base64 ||
    "";

  MEM.payments[paymentId] = { userId, amount, status: p.status || "pending" };

  return j(res, 200, { ok: true, paymentId, status: p.status, copyPaste });
}

async function op_mp_status(req, res, url) {
  if (!MP_ACCESS_TOKEN) return j(res, 400, { ok: false, msg: "Falta MP_ACCESS_TOKEN." });
  const id = url.searchParams.get("id");
  const userId = url.searchParams.get("userId") || "";
  if (!id) return j(res, 400, { ok: false, msg: "id faltando" });

  const r = await httpJSON(
    "GET",
    "https://api.mercadopago.com/v1/payments/" + encodeURIComponent(id),
    { Authorization: "Bearer " + MP_ACCESS_TOKEN }
  );
  if (r.status < 200 || r.status >= 300) return j(res, 500, { ok: false, msg: "Erro consultando pagamento", detail: r.json || r.text });

  const status = r.json?.status || "unknown";
  // Se aprovado, credita BLUE (protótipo)
  let blueAdded = 0;
  const metaUser = r.json?.metadata?.user_id || MEM.payments[id]?.userId || userId;
  if (status === "approved" && metaUser) {
    // regra: 1 real = 1 BLUE (ajuste como quiser)
    const amount = Number(r.json?.transaction_amount || MEM.payments[id]?.amount || 0);
    const cur = Number(MEM.blue[metaUser] || 0);
    const added = Math.floor(amount);
    MEM.blue[metaUser] = cur + added;
    blueAdded = added;
  }
  if (MEM.payments[id]) MEM.payments[id].status = status;
  return j(res, 200, { ok: true, status, blueAdded });
}

async function op_mp_webhook(req, res) {
  // Webhook básico: MP manda notificações.
  // Para segurança real, implemente verificação conforme docs oficiais do Mercado Pago.
  const bodyText = await readBody(req);
  // tenta extrair payment id:
  let paymentId = "";
  try {
    const b = JSON.parse(bodyText || "{}");
    paymentId = String(b?.data?.id || b?.id || "");
  } catch {}
  return j(res, 200, { ok: true, received: true, paymentId });
}

async function op_withdraw_create(req, res) {
  const body = JSON.parse((await readBody(req)) || "{}");
  const userId = String(body.userId || "");
  const amount = Number(body.amount || 0);
  const pixKey = String(body.pixKey || "").slice(0, 120);
  if (!userId) return j(res, 400, { ok: false, msg: "userId inválido" });
  if (!amount || amount < 1) return j(res, 400, { ok: false, msg: "valor inválido" });
  if (!pixKey) return j(res, 400, { ok: false, msg: "pixKey inválida" });

  const id = "W" + Math.random().toString(36).slice(2, 8).toUpperCase();
  MEM.withdraws.unshift({ id, userId, amount, pixKey, status: "pending", ts: Date.now() });
  return j(res, 200, { ok: true, id });
}

async function op_withdraw_list(req, res, url) {
  const isAdmin = url.searchParams.get("admin") === "1" || url.searchParams.get("admin") === "true";
  const userId = url.searchParams.get("userId") || "";
  let items = MEM.withdraws;
  if (!isAdmin && userId) items = items.filter((w) => w.userId === userId);
  if (!isAdmin && !userId) items = [];
  return j(res, 200, { ok: true, items });
}

async function op_withdraw_act(req, res) {
  const body = JSON.parse((await readBody(req)) || "{}");
  const id = String(body.id || "");
  const act = String(body.act || "");
  const admin = !!body.admin;
  if (!admin) return j(res, 403, { ok: false, msg: "Somente ADM" });
  const it = MEM.withdraws.find((w) => w.id === id);
  if (!it) return j(res, 404, { ok: false, msg: "Não encontrado" });
  if (act === "approve") it.status = "approved";
  else if (act === "reject") it.status = "rejected";
  else return j(res, 400, { ok: false, msg: "Ação inválida" });
  return j(res, 200, { ok: true });
}

/* ===========================
   Handler principal
=========================== */
module.exports = async (req, res) => {
  const url = new URL(req.url, "https://local/");
  const op = (url.searchParams.get("op") || "").toLowerCase();

  // Rotas API
  if (op === "mp_create" && req.method === "POST") return op_mp_create(req, res);
  if (op === "mp_status" && req.method === "GET") return op_mp_status(req, res, url);
  if (op === "mp_webhook") return op_mp_webhook(req, res);
  if (op === "withdraw_create" && req.method === "POST") return op_withdraw_create(req, res);
  if (op === "withdraw_list" && req.method === "GET") return op_withdraw_list(req, res, url);
  if (op === "withdraw_act" && req.method === "POST") return op_withdraw_act(req, res);

  // Se acessar /api?json=1, devolve status
  if (url.searchParams.get("json") === "1") return j(res, 200, { ok: true, msg: "ICE-CUBO online" });

  // UI
  return h(res, 200, pageHTML());
};
