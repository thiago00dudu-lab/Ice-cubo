const express = require("express");
const crypto = require("crypto");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* =================== CONFIG =================== */
const SECRET = process.env.AUTH_SECRET || "ICE_SUPER_SECRET_TROCAR_DEPOIS";

/* =================== BLUE =================== */
const BLUE_MAX = 21_000_000;
let blueSupply = 0;

/* =================== "BANCO" EM MEMÓRIA (DEMO) =================== */
const users = new Map();

// ADMIN MASTER
users.set("admin", {
  pass: "1533",
  role: "MASTER",
  saldo: 0,
  banned: false,
  children: new Set(),
  parent: null,
});

/* =================== HELPERS =================== */
function safeUser(u) {
  return String(u || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
}

function cookieParse(req) {
  const h = req.headers.cookie || "";
  const out = {};
  h.split(";")
    .map((v) => v.trim())
    .filter(Boolean)
    .forEach((p) => {
      const i = p.indexOf("=");
      if (i > -1) out[p.slice(0, i)] = decodeURIComponent(p.slice(i + 1));
    });
  return out;
}

function base64url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function sign(data) {
  return crypto.createHmac("sha256", SECRET).update(data).digest("hex");
}

function makeToken(payloadObj) {
  const payload = base64url(JSON.stringify(payloadObj));
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

function readToken(token) {
  try {
    const [payload, sig] = String(token || "").split(".");
    if (!payload || !sig) return null;
    if (sign(payload) !== sig) return null;
    const json = Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString();
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function auth(req) {
  const c = cookieParse(req);
  const t = c.ice;
  const decoded = readToken(t);
  if (!decoded || !decoded.u) return null;

  const username = safeUser(decoded.u);
  const u = users.get(username);
  if (!u || u.banned) return null;

  return { username, ...u };
}

function requireAuth(req, res, next) {
  const me = auth(req);
  if (!me) return res.redirect("/login");
  req.me = me;
  next();
}

function requireMaster(req, res, next) {
  const me = auth(req);
  if (!me || me.role !== "MASTER") return res.status(403).send("Acesso negado");
  req.me = me;
  next();
}

/* =================== PÁGINAS LOGIN / CADASTRO =================== */
app.get("/login", (req, res) => {
  res.send(`<!doctype html><html lang="pt-br"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>ICE Login</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#0f172a;color:#fff;font-family:system-ui}
.card{width:340px;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:18px}
h1{margin:0 0 8px}
input{width:100%;padding:12px;border:0;border-radius:12px;margin:8px 0;background:#0b1220;color:#fff}
button{width:100%;padding:12px;border:0;border-radius:12px;background:#38bdf8;color:#001018;font-weight:900}
a{color:#38bdf8;text-decoration:none}
.small{opacity:.85;font-size:12px}
</style></head><body>
<div class="card">
<h1>ICE CUBO</h1>
<form method="POST" action="/login">
<input name="user" placeholder="Usuário" required>
<input name="pass" type="password" placeholder="Senha" required>
<button type="submit">Entrar</button>
</form>
<p class="small">Não tem conta? <a href="/register">Cadastrar</a></p>
<p class="small">Master: <b>admin</b> / <b>1533</b></p>
</div></body></html>`);
});

app.post("/login", (req, res) => {
  const user = safeUser(req.body.user);
  const pass = String(req.body.pass || "").trim();
  const u = users.get(user);

  if (!u || u.pass !== pass || u.banned) return res.redirect("/login");

  const token = makeToken({ u: user, iat: Date.now() });
  res.setHeader(
    "Set-Cookie",
    `ice=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax`
  );
  res.redirect("/app");
});

app.get("/register", (req, res) => {
  res.send(`<!doctype html><html lang="pt-br"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>ICE Cadastro</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#0f172a;color:#fff;font-family:system-ui}
.card{width:340px;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:18px}
h1{margin:0 0 8px}
input{width:100%;padding:12px;border:0;border-radius:12px;margin:8px 0;background:#0b1220;color:#fff}
button{width:100%;padding:12px;border:0;border-radius:12px;background:#38bdf8;color:#001018;font-weight:900}
a{color:#38bdf8;text-decoration:none}
.small{opacity:.85;font-size:12px}
</style></head><body>
<div class="card">
<h1>Cadastrar</h1>
<form method="POST" action="/register">
<input name="user" placeholder="Usuário (min 3)" required>
<input name="pass" type="password" placeholder="Senha (min 3)" required>
<button type="submit">Criar conta</button>
</form>
<p class="small"><a href="/login">Voltar</a></p>
</div></body></html>`);
});

app.post("/register", (req, res) => {
  const user = safeUser(req.body.user);
  const pass = String(req.body.pass || "").trim();

  if (user.length < 3 || pass.length < 3) return res.redirect("/register");
  if (users.has(user)) return res.redirect("/register");

  users.set(user, {
    pass,
    role: "USER",
    saldo: 0,
    banned: false,
    children: new Set(),
    parent: null,
  });

  res.redirect("/login");
});

app.post("/logout", (req, res) => {
  res.setHeader("Set-Cookie", "ice=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
  res.redirect("/login");
});

/* =================== APP =================== */
app.get("/", (req, res) => res.redirect("/app"));

app.get("/app", requireAuth, (req, res) => {
  const me = req.me;
  const star = me.role === "MASTER" ? "⭐" : "";
  res.send(`<!doctype html><html lang="pt-br"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<title>ICE</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
body{margin:0;background:#0b1220;color:#fff;font-family:system-ui;height:100vh;overflow:hidden}
.stage{height:50vh;background:#000;position:relative}
#main{width:100%;height:100%;object-fit:cover}
.section{display:none;padding:12px 12px 78px;height:calc(50vh);overflow:auto}
.section.active{display:block}
.nav{position:fixed;left:0;right:0;bottom:0;height:64px;background:#1e293b;border-top:1px solid #334155;
display:flex;justify-content:space-around;align-items:center}
.nav i{font-size:22px;color:#38bdf8;padding:12px 14px;border-radius:16px}
.nav i.active{background:rgba(0,0,0,.25);border:1px solid rgba(56,189,248,.25)}
.nav i.panic{color:#fff;background:rgba(239,68,68,.85)}
.nav i.panic.off{background:rgba(239,68,68,.15);color:#fecaca}

body.panic-active{animation:panicFlash 1s infinite}
@keyframes panicFlash{0%{background:#0b1220}50%{background:#3b0000}100%{background:#0b1220}}
.alertBar{position:fixed;top:0;left:0;right:0;z-index:9999;background:#ef4444;color:#fff;text-align:center;
padding:10px;font-weight:900}
.badge{position:fixed;top:12px;left:12px;right:12px;z-index:20;
display:flex;justify-content:space-between;align-items:center;gap:10px;
padding:10px 12px;border-radius:16px;background:rgba(30,41,59,.7);border:1px solid rgba(148,163,184,.25);
backdrop-filter:blur(10px)}
.btnTop{border:0;border-radius:12px;padding:10px 12px;background:rgba(255,255,255,.10);
color:#fff;font-weight:900;border:1px solid rgba(148,163,184,.25)}
</style></head><body>

<div id="alertBox"></div>

<div class="badge">
  <div><b>@${me.username}</b> ${star} • 🟦 <b>${me.saldo}</b> BLUE</div>
  <form method="POST" action="/logout" style="margin:0"><button class="btnTop">Sair</button></form>
</div>

<div class="stage">
  <video id="main" playsinline controls
    src="https://www.w3schools.com/html/mov_bbb.mp4"></video>
</div>

<div id="timeline" class="section active">
  <h3>🎬 Timeline</h3>
  <p>Aqui vai ficar o feed público (vídeos/fotos). (Base pronta.)</p>
</div>

<div id="profile" class="section">
  <h3>🏠 Seu perfil</h3>
  <p>Usuário: <b>@${me.username}</b> ${star}</p>
  <p>Saldo: <b>${me.saldo}</b> BLUE</p>
</div>

<div id="trade" class="section">
  <h3>🔄 O que tem pra mim (Trocas)</h3>
  <p>(Base pronta.)</p>
</div>

${me.role === "MASTER" ? `
<div id="admin" class="section">
  <h3>🛡️ Painel ADM MASTER</h3>
  <p>Supply BLUE: <b>${blueSupply}</b> / <b>${BLUE_MAX}</b></p>
  <div style="display:flex;gap:10px;flex-wrap:wrap">
    <input id="mint" placeholder="Emitir BLUE" style="padding:10px;border-radius:12px;border:0;background:#111827;color:#fff">
    <button class="btnTop" onclick="mintBlue()">Emitir</button>
  </div>
  <p style="opacity:.8;margin-top:10px">*Compra via API entra depois.</p>
</div>` : ""}

<div class="nav">
  <i class="fa-solid fa-film active" id="navTimeline" title="Timeline"></i>
  <i class="fa-solid fa-house" id="navHome" title="Perfil"></i>
  <i class="fa-solid fa-right-left" id="navTrade" title="Trocas"></i>
  <i class="fa-solid fa-triangle-exclamation panic off" id="navPanic" title="Perigo"></i>
  ${me.role === "MASTER" ? `<i class="fa-solid fa-shield-halved" id="navAdmin" title="ADM"></i>` : ""}
</div>

<script>
  const sec = {
    timeline: document.getElementById("timeline"),
    profile: document.getElementById("profile"),
    trade: document.getElementById("trade"),
    admin: document.getElementById("admin")
  };
  const navTimeline = document.getElementById("navTimeline");
  const navHome = document.getElementById("navHome");
  const navTrade = document.getElementById("navTrade");
  const navPanic = document.getElementById("navPanic");
  const navAdmin = document.getElementById("navAdmin");

  function show(id){
    Object.values(sec).filter(Boolean).forEach(s=>s.classList.remove("active"));
    sec[id].classList.add("active");
    [navTimeline,navHome,navTrade,navAdmin].filter(Boolean).forEach(n=>n.classList.remove("active"));
    if(id==="timeline") navTimeline.classList.add("active");
    if(id==="profile") navHome.classList.add("active");
    if(id==="trade") navTrade.classList.add("active");
    if(id==="admin" && navAdmin) navAdmin.classList.add("active");
  }

  navTimeline.onclick=()=>show("timeline");
  navHome.onclick=()=>show("profile");
  navTrade.onclick=()=>show("trade");
  if(navAdmin) navAdmin.onclick=()=>show("admin");

  let panicOn=false;
  function panic(){
    panicOn=!panicOn;
    document.body.classList.toggle("panic-active", panicOn);
    navPanic.classList.toggle("off", !panicOn);
    if(panicOn){
      if(!document.getElementById("alertBar")){
        const bar=document.createElement("div");
        bar.className="alertBar";
        bar.id="alertBar";
        bar.textContent="🚨 LOCALIZAÇÃO SENDO COMPARTILHADA • ÁREA DE RISCO 🚨";
        document.getElementById("alertBox").appendChild(bar);
      }
    }else{
      const bar=document.getElementById("alertBar");
      if(bar) bar.remove();
    }
  }
  navPanic.onclick=panic;

  ${me.role === "MASTER" ? `
  function mintBlue(){
    fetch("/admin/mint",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({val: document.getElementById("mint").value})
    }).then(()=>location.reload());
  }` : ""}
</script>

</body></html>`);
});

/* =================== BLUE (ADM) =================== */
app.post("/admin/mint", requireMaster, (req, res) => {
  const v = Number(req.body.val || 0);
  if (!Number.isFinite(v) || v <= 0) return res.status(400).send("valor inválido");
  if (blueSupply + v > BLUE_MAX) return res.status(400).send("limite atingido");
  blueSupply += v;
  res.send("OK");
});

/* =================== EXPORT (Vercel) =================== */
module.exports = app;
