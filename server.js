const express = require("express");
const crypto = require("crypto");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "5mb" }));

/* ================= CONFIG ================= */
const SECRET = process.env.AUTH_SECRET || "ICE_SECRET_TROCAR_DEPOIS";

/* ================= BLUE ================= */
const BLUE_MAX = 21_000_000;
let blueSupply = 0;

/* ================= DADOS (MEMÓRIA) ================= */
const users = new Map();        // user -> {pass, role, saldoBlue, gender, parent, children:Set, banned}
const posts = [];               // {id,user,text,ts}
const trades = [];              // {id,user,item,want,ts}
const chats = new Map();        // key "a|b" -> [{from,to,msg,ts}]
const panicState = new Map();   // user -> {on, lat, lon, acc, ts}

/* ADMIN MASTER */
users.set("admin", {
  pass: "1533",
  role: "MASTER",
  saldoBlue: 0,
  gender: "M",
  parent: null,
  children: new Set(),
  banned: false
});

/* ================= HELPERS ================= */
function safeUser(u){
  return String(u||"").trim().toLowerCase().replace(/[^a-z0-9_]/g,"");
}
function sign(data){
  return crypto.createHmac("sha256", SECRET).update(data).digest("hex");
}
function makeToken(username){
  const payload = Buffer.from(JSON.stringify({u: username, iat: Date.now()}))
    .toString("base64")
    .replace(/=/g,"");
  return payload + "." + sign(payload);
}
function readToken(token){
  try{
    const [p,s]=String(token||"").split(".");
    if(!p||!s) return null;
    if(sign(p)!==s) return null;
    return JSON.parse(Buffer.from(p,"base64").toString());
  }catch{ return null; }
}
function cookieParse(req){
  const h=req.headers.cookie||"";
  const out={};
  h.split(";").map(x=>x.trim()).filter(Boolean).forEach(p=>{
    const i=p.indexOf("=");
    if(i>-1) out[p.slice(0,i)] = decodeURIComponent(p.slice(i+1));
  });
  return out;
}
function auth(req){
  const c=cookieParse(req);
  const t=c.ice;
  const dec=readToken(t);
  if(!dec||!dec.u) return null;
  const u=safeUser(dec.u);
  const rec=users.get(u);
  if(!rec||rec.banned) return null;
  return { username:u, ...rec };
}
function requireAuth(req,res,next){
  const me=auth(req);
  if(!me) return res.redirect("/login");
  req.me=me;
  next();
}
function chatKey(a,b){ return [a,b].sort().join("|"); }
function nowId(prefix){ return prefix + Math.random().toString(36).slice(2) + Date.now().toString(36); }

/* ================= LOGIN/CADASTRO ================= */
app.get("/", (req,res)=> res.redirect("/app"));

app.get("/login",(req,res)=>{
  res.send(`<!doctype html><html lang="pt-br"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ICE • Login</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#0f172a;color:#fff;font-family:system-ui}
.card{width:360px;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:18px}
h1{margin:0 0 10px}
input{width:100%;padding:12px;border:0;border-radius:12px;margin:8px 0;background:#0b1220;color:#fff}
button{width:100%;padding:12px;border:0;border-radius:12px;background:#38bdf8;color:#001018;font-weight:900}
a{color:#38bdf8;text-decoration:none}
.small{opacity:.85;font-size:12px}
</style></head><body>
<div class="card">
<h1>ICE-CUB</h1>
<form method="POST" action="/login">
<input name="user" placeholder="Usuário" required>
<input name="pass" type="password" placeholder="Senha" required>
<button type="submit">Entrar</button>
</form>
<p class="small">Não tem conta? <a href="/register">Cadastrar</a></p>
<p class="small">Master: <b>admin</b> / <b>1533</b></p>
</div></body></html>`);
});

app.post("/login",(req,res)=>{
  const u=safeUser(req.body.user);
  const pass=String(req.body.pass||"");
  const rec=users.get(u);
  if(!rec || rec.pass!==pass || rec.banned) return res.redirect("/login");
  const token=makeToken(u);
  res.setHeader("Set-Cookie", `ice=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax`);
  res.redirect("/app");
});

app.get("/register",(req,res)=>{
  const ref=safeUser(req.query.ref||"");
  res.send(`<!doctype html><html lang="pt-br"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ICE • Cadastro</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#0f172a;color:#fff;font-family:system-ui}
.card{width:360px;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:18px}
h1{margin:0 0 10px}
input,select{width:100%;padding:12px;border:0;border-radius:12px;margin:8px 0;background:#0b1220;color:#fff}
button{width:100%;padding:12px;border:0;border-radius:12px;background:#38bdf8;color:#001018;font-weight:900}
a{color:#38bdf8;text-decoration:none}
.small{opacity:.85;font-size:12px}
</style></head><body>
<div class="card">
<h1>Cadastrar</h1>
<div class="small">Convite (opcional): <b>${ref ? "@"+ref : "nenhum"}</b></div>
<form method="POST" action="/register">
<input name="user" placeholder="Usuário (min 3)" required>
<input name="pass" type="password" placeholder="Senha (min 3)" required>
<select name="gender" required>
  <option value="" selected disabled>Seu gênero</option>
  <option value="M">Homem</option>
  <option value="F">Mulher</option>
  <option value="O">Outro</option>
</select>
<input name="ref" placeholder="ref (opcional)" value="${ref}">
<button type="submit">Criar conta</button>
</form>
<p class="small"><a href="/login">Voltar</a></p>
</div></body></html>`);
});

app.post("/register",(req,res)=>{
  const u=safeUser(req.body.user);
  const pass=String(req.body.pass||"").trim();
  const gender=String(req.body.gender||"").trim().toUpperCase();
  const ref=safeUser(req.body.ref||"");

  if(u.length<3 || pass.length<3) return res.redirect("/register");
  if(!["M","F","O"].includes(gender)) return res.redirect("/register");
  if(users.has(u)) return res.redirect("/register");

  users.set(u,{
    pass,
    role:"USER",
    saldoBlue:0,
    gender,
    parent:null,
    children:new Set(),
    banned:false
  });

  if(ref && users.has(ref) && ref!==u){
    users.get(u).parent = ref;
    users.get(ref).children.add(u);
  }

  res.redirect("/login");
});

app.post("/logout",(req,res)=>{
  res.setHeader("Set-Cookie","ice=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
  res.redirect("/login");
});

/* ================= PANIC API (COMPARTILHAR PRA TODOS) ================= */
app.post("/api/panic/update", requireAuth, (req,res)=>{
  const me=req.me.username;
  const on = !!req.body.on;

  if(!on){
    panicState.set(me, { on:false, lat:null, lon:null, acc:null, ts:Date.now() });
    return res.json({ ok:true, on:false });
  }

  const lat = Number(req.body.lat);
  const lon = Number(req.body.lon);
  const acc = Number(req.body.acc);

  if(!Number.isFinite(lat) || !Number.isFinite(lon)){
    return res.json({ ok:false, err:"sem coordenadas" });
  }

  panicState.set(me, {
    on:true,
    lat, lon,
    acc: Number.isFinite(acc) ? acc : null,
    ts: Date.now()
  });

  res.json({ ok:true, on:true });
});

app.get("/api/panic/list", requireAuth, (req,res)=>{
  const list=[];
  for(const [user, st] of panicState.entries()){
    if(st && st.on){
      list.push({
        user,
        lat: st.lat,
        lon: st.lon,
        acc: st.acc,
        ts: st.ts
      });
    }
  }
  // mais recentes primeiro
  list.sort((a,b)=>b.ts-a.ts);
  res.json({ ok:true, list: list.slice(0,100) });
});

/* ================= POSTS ================= */
app.post("/api/post", requireAuth, (req,res)=>{
  const text=String(req.body.text||"").trim();
  if(!text) return res.json({ok:false, err:"texto vazio"});
  posts.push({id:nowId("p_"), user:req.me.username, text, ts:Date.now()});
  if(posts.length>600) posts.splice(0,posts.length-600);
  res.json({ok:true});
});
app.get("/api/posts", requireAuth, (req,res)=>{
  res.json({ok:true, list: posts.slice(-120).reverse()});
});

/* ================= TRADES ================= */
app.post("/api/trade", requireAuth, (req,res)=>{
  const item=String(req.body.item||"").trim();
  const want=String(req.body.want||"").trim();
  if(!item||!want) return res.json({ok:false, err:"campos vazios"});
  trades.push({id:nowId("t_"), user:req.me.username, item, want, ts:Date.now()});
  if(trades.length>400) trades.splice(0,trades.length-400);
  res.json({ok:true});
});
app.get("/api/trades", requireAuth, (req,res)=>{
  res.json({ok:true, list: trades.slice(-120).reverse()});
});

/* ================= USERS SEARCH ================= */
app.get("/api/users/search", requireAuth, (req,res)=>{
  const q=safeUser(req.query.q||"");
  const list=[];
  if(q){
    for(const [name,u] of users.entries()){
      if(!u.banned && name.includes(q) && name!=="ice_ai"){
        list.push({user:name});
        if(list.length>=25) break;
      }
    }
  }
  res.json({ok:true,list});
});

/* ================= CHAT (SIMPLES) ================= */
app.post("/chat/send", requireAuth, (req,res)=>{
  const me=req.me.username;
  const to=safeUser(req.body.to);
  const msg=String(req.body.msg||"").trim();
  if(!to || !msg) return res.json({ok:false, err:"inválido"});
  if(!users.has(to)) return res.json({ok:false, err:"usuário não existe"});

  const k=chatKey(me,to);
  if(!chats.has(k)) chats.set(k, []);
  const arr=chats.get(k);
  arr.push({from:me,to,msg,ts:Date.now()});
  if(arr.length>300) arr.splice(0,arr.length-300);
  res.json({ok:true});
});
app.get("/chat/get", requireAuth, (req,res)=>{
  const me=req.me.username;
  const withUser=safeUser(req.query.with);
  if(!withUser) return res.json({ok:false, err:"inválido"});
  if(!users.has(withUser)) return res.json({ok:false, err:"usuário não existe"});
  const k=chatKey(me,withUser);
  res.json({ok:true, messages:(chats.get(k)||[]).slice(-120)});
});

/* ================= BLUE (ADM) ================= */
app.post("/admin/mint", requireAuth, (req,res)=>{
  if(req.me.role!=="MASTER") return res.json({ok:false, err:"negado"});
  const v=Number(req.body.amount||0);
  if(!Number.isFinite(v) || v<=0) return res.json({ok:false, err:"valor inválido"});
  if(blueSupply+v > BLUE_MAX) return res.json({ok:false, err:"limite atingido"});
  blueSupply+=v;
  res.json({ok:true, supply: blueSupply, max: BLUE_MAX});
});
app.post("/admin/give", requireAuth, (req,res)=>{
  if(req.me.role!=="MASTER") return res.json({ok:false, err:"negado"});
  const u=safeUser(req.body.user);
  const v=Number(req.body.amount||0);
  if(!u || !users.has(u)) return res.json({ok:false, err:"usuário inválido"});
  if(!Number.isFinite(v) || v===0) return res.json({ok:false, err:"valor inválido"});
  const rec=users.get(u);
  rec.saldoBlue = Math.max(0, Number(rec.saldoBlue||0) + v);
  res.json({ok:true, user:u, saldoBlue: rec.saldoBlue});
});

/* ================= APP UI ================= */
app.get("/app", requireAuth, (req,res)=>{
  const me=req.me;
  const isMaster = me.role==="MASTER";
  const star = isMaster ? "⭐" : "";
  const invite = `/register?ref=${encodeURIComponent(me.username)}`;

  res.send(`<!doctype html><html lang="pt-br"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>ICE-CUB</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
*{box-sizing:border-box}
body{margin:0;background:#0b1220;color:#fff;font-family:system-ui;height:100vh;overflow:hidden}
.top{position:fixed;left:12px;right:12px;top:10px;z-index:50;padding:12px;border-radius:18px;
  background:linear-gradient(180deg, rgba(30,160,255,.18), rgba(0,120,255,.08));
  border:1px solid rgba(159,231,255,.20);backdrop-filter: blur(14px);
  display:flex;justify-content:space-between;align-items:center;gap:10px}
.brand{font-weight:1000;letter-spacing:.18em;text-transform:uppercase;font-size:18px;
  background:linear-gradient(90deg,#7dd3fc,#38bdf8,#a5b4fc,#7dd3fc);
  -webkit-background-clip:text;background-clip:text;color:transparent;
  filter: drop-shadow(0 0 10px rgba(56,189,248,.35));}
.small{opacity:.85;font-size:12px;font-weight:900}
.btnTop{border:0;border-radius:12px;padding:10px 12px;background:rgba(0,0,0,.25);color:#fff;font-weight:900;
  border:1px solid rgba(159,231,255,.18)}
.stage{margin-top:68px;height:38vh;background:#000;border-radius:0 0 22px 22px;overflow:hidden;position:relative}
.hint{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:12px;opacity:.85;font-weight:900}
.section{display:none;height:calc(62vh - 66px);overflow:auto;padding:12px 12px 86px}
.section.active{display:block}
.box{border-radius:18px;padding:12px;margin-bottom:12px;background:rgba(30,41,59,.65);border:1px solid rgba(148,163,184,.25)}
.inp,textarea{width:100%;padding:12px;border-radius:12px;border:0;background:#081022;color:#fff;outline:none}
textarea{min-height:90px;resize:none}
.row{display:flex;gap:10px;flex-wrap:wrap}
.btn{border:0;border-radius:12px;padding:12px 14px;background:#38bdf8;color:#001018;font-weight:1000;cursor:pointer}
.btn2{border:0;border-radius:12px;padding:12px 14px;background:rgba(255,255,255,.10);
  border:1px solid rgba(148,163,184,.25);color:#fff;font-weight:1000;cursor:pointer}
.feed{display:flex;flex-direction:column;gap:10px}
.card{border-radius:18px;overflow:hidden;background:rgba(15,23,42,.55);border:1px solid rgba(148,163,184,.25)}
.cardHead{padding:10px;font-weight:1000;display:flex;justify-content:space-between;align-items:center}
.cardBody{padding:10px;opacity:.95}
.nav{position:fixed;left:0;right:0;bottom:0;height:66px;z-index:60;background:#1e293b;border-top:1px solid #334155;
  display:flex;justify-content:space-around;align-items:center}
.nav i{font-size:22px;color:#7dd3fc;padding:12px 14px;border-radius:16px}
.nav i.active{background:rgba(0,0,0,.22);border:1px solid rgba(148,163,184,.25)}
.nav .panic{color:#fff;background:rgba(239,68,68,.90);border:1px solid rgba(255,255,255,.18)}
.nav .panic.off{background:rgba(239,68,68,.18);color:#fecaca}
.alertBar{position:fixed;top:0;left:0;right:0;z-index:9999;background:#ef4444;color:#fff;text-align:center;padding:10px;font-weight:1000}
body.panic-active{animation:panicFlash 1s infinite}
@keyframes panicFlash{0%{filter:none}50%{filter:brightness(.92) saturate(1.1)}100%{filter:none}}
</style></head><body>

<div id="alertBox"></div>

<div class="top">
  <div>
    <div class="brand">ICE-CUB</div>
    <div class="small">Você: <b>@${me.username}</b> ${star} • 🟦 <b>${Number(me.saldoBlue||0)}</b> BLUE</div>
  </div>
  <form method="POST" action="/logout" style="margin:0"><button class="btnTop">Sair</button></form>
</div>

<div class="stage">
  <div class="hint">Timeline • Perfil • Trocas • Alertas • Perigo (GPS)</div>
</div>

<!-- TIMELINE -->
<div class="section active" id="secTimeline">
  <div class="box">
    <h3 style="margin:0 0 10px">📸 Timeline</h3>
    <textarea class="inp" id="postText" placeholder="Escreva algo..."></textarea>
    <div class="row" style="margin-top:10px">
      <button class="btn" onclick="createPost()">Publicar</button>
      <button class="btn2" onclick="loadPosts()">Atualizar</button>
    </div>
    <div id="postMsg" class="small" style="margin-top:8px"></div>
  </div>
  <div class="feed" id="feed"></div>
</div>

<!-- PERFIL -->
<div class="section" id="secProfile">
  <div class="box">
    <h3 style="margin:0 0 10px">🏠 Perfil</h3>
    <div class="small">Convite: <b id="inviteBox"></b></div>
    <div class="row" style="margin-top:10px">
      <button class="btn2" onclick="shareInvite()">Compartilhar convite</button>
    </div>
  </div>

  ${isMaster ? `
  <div class="box">
    <h3 style="margin:0 0 10px">🛡️ ADM (BLUE)</h3>
    <div class="row">
      <input class="inp" id="giveUser" placeholder="Usuário (ex: neo)" style="max-width:220px">
      <input class="inp" id="giveVal" placeholder="Quantidade (ex: 100)" style="max-width:220px">
      <button class="btn2" onclick="giveBlue()">Aplicar</button>
    </div>
    <div id="admMsg" class="small" style="margin-top:8px"></div>
  </div>
  ` : ""}
</div>

<!-- TROCAS -->
<div class="section" id="secTrades">
  <div class="box">
    <h3 style="margin:0 0 10px">🔄 Trocas</h3>
    <input class="inp" id="tItem" placeholder="O que você tem?">
    <input class="inp" id="tWant" placeholder="O que quer em troca?" style="margin-top:10px">
    <div class="row" style="margin-top:10px">
      <button class="btn" onclick="createTrade()">Publicar troca</button>
      <button class="btn2" onclick="loadTrades()">Atualizar</button>
    </div>
    <div id="tradeMsg" class="small" style="margin-top:8px"></div>
  </div>
  <div class="feed" id="tradeList"></div>
</div>

<!-- ALERTAS DE RISCO (PRA TODOS VEREM) -->
<div class="section" id="secAlerts">
  <div class="box">
    <h3 style="margin:0 0 10px">🚨 Alertas de risco</h3>
    <div class="small">Lista pública de quem ativou o Perigo (atualiza sozinho).</div>
    <div class="row" style="margin-top:10px">
      <button class="btn2" onclick="loadAlerts()">Atualizar agora</button>
    </div>
  </div>
  <div class="feed" id="alertsList"></div>
</div>

<!-- NAV -->
<div class="nav">
  <i class="fa-solid fa-film active" id="navTimeline" title="Timeline"></i>
  <i class="fa-solid fa-house" id="navProfile" title="Perfil"></i>
  <i class="fa-solid fa-right-left" id="navTrades" title="Trocas"></i>
  <i class="fa-solid fa-bell" id="navAlerts" title="Alertas"></i>
  <i class="fa-solid fa-triangle-exclamation panic off" id="navPanic" title="Perigo"></i>
</div>

<script>
  const ME="${me.username}";
  const INVITE = location.origin + "${invite}";
  document.getElementById("inviteBox").textContent = INVITE;

  const secTimeline=document.getElementById("secTimeline");
  const secProfile=document.getElementById("secProfile");
  const secTrades=document.getElementById("secTrades");
  const secAlerts=document.getElementById("secAlerts");

  const navTimeline=document.getElementById("navTimeline");
  const navProfile=document.getElementById("navProfile");
  const navTrades=document.getElementById("navTrades");
  const navAlerts=document.getElementById("navAlerts");
  const navPanic=document.getElementById("navPanic");

  function setActive(section){
    [secTimeline,secProfile,secTrades,secAlerts].forEach(s=>s.classList.remove("active"));
    section.classList.add("active");
    [navTimeline,navProfile,navTrades,navAlerts].forEach(n=>n.classList.remove("active"));
    if(section===secTimeline) navTimeline.classList.add("active");
    if(section===secProfile) navProfile.classList.add("active");
    if(section===secTrades) navTrades.classList.add("active");
    if(section===secAlerts) navAlerts.classList.add("active");
  }

  navTimeline.onclick=()=>{ setActive(secTimeline); loadPosts(); };
  navProfile.onclick=()=>{ setActive(secProfile); };
  navTrades.onclick=()=>{ setActive(secTrades); loadTrades(); };
  navAlerts.onclick=()=>{ setActive(secAlerts); loadAlerts(); };

  async function shareInvite(){
    try{
      if(navigator.share){
        await navigator.share({ title:"ICE-CUB", text:"Entra no ICE pelo meu convite:", url: INVITE });
      }else{
        await navigator.clipboard.writeText(INVITE);
        alert("Link copiado ✅");
      }
    }catch{
      alert("Convite: " + INVITE);
    }
  }

  // ===== Timeline =====
  function escapeHtml(s){
    return String(s||"").replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
  }
  async function createPost(){
    const text=(document.getElementById("postText").value||"").trim();
    if(!text) return;
    const r=await fetch("/api/post",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text})});
    const j=await r.json();
    document.getElementById("postMsg").textContent = j.ok ? "Publicado ✅" : ("Erro: "+(j.err||""));
    if(j.ok){ document.getElementById("postText").value=""; loadPosts(); }
  }
  async function loadPosts(){
    const r=await fetch("/api/posts"); const j=await r.json();
    const feed=document.getElementById("feed");
    feed.innerHTML="";
    (j.list||[]).forEach(p=>{
      const d=document.createElement("div");
      d.className="card";
      d.innerHTML=\`
        <div class="cardHead"><span>@\${p.user}</span><span class="small">\${new Date(p.ts).toLocaleString()}</span></div>
        <div class="cardBody">\${escapeHtml(p.text)}</div>\`;
      feed.appendChild(d);
    });
  }

  // ===== Trocas =====
  async function createTrade(){
    const item=(document.getElementById("tItem").value||"").trim();
    const want=(document.getElementById("tWant").value||"").trim();
    if(!item || !want) return;
    const r=await fetch("/api/trade",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({item,want})});
    const j=await r.json();
    document.getElementById("tradeMsg").textContent = j.ok ? "Troca publicada ✅" : ("Erro: "+(j.err||""));
    if(j.ok){ document.getElementById("tItem").value=""; document.getElementById("tWant").value=""; loadTrades(); }
  }
  async function loadTrades(){
    const r=await fetch("/api/trades"); const j=await r.json();
    const list=document.getElementById("tradeList");
    list.innerHTML="";
    (j.list||[]).forEach(t=>{
      const d=document.createElement("div");
      d.className="card";
      d.innerHTML=\`
        <div class="cardHead"><span>@\${t.user}</span><span class="small">\${new Date(t.ts).toLocaleString()}</span></div>
        <div class="cardBody"><b>Tem:</b> \${escapeHtml(t.item)}</div>
        <div class="cardBody"><b>Quer:</b> \${escapeHtml(t.want)}</div>\`;
      list.appendChild(d);
    });
  }

  // ===== ALERTAS (LISTA PÚBLICA) =====
  async function loadAlerts(){
    const r=await fetch("/api/panic/list"); const j=await r.json();
    const list=document.getElementById("alertsList");
    list.innerHTML="";
    const arr = (j.list||[]);
    if(!arr.length){
      list.innerHTML = "<div class='box'><div class='small'>Nenhum alerta ativo agora.</div></div>";
      return;
    }
    arr.forEach(a=>{
      const maps = "https://www.google.com/maps?q="+encodeURIComponent(a.lat+","+a.lon);
      const d=document.createElement("div");
      d.className="card";
      d.innerHTML=\`
        <div class="cardHead"><span>🚨 @\${a.user}</span><span class="small">\${new Date(a.ts).toLocaleTimeString()}</span></div>
        <div class="cardBody">Lat: <b>\${a.lat.toFixed(5)}</b> • Lon: <b>\${a.lon.toFixed(5)}</b> • ±\${a.acc?Math.round(a.acc):"?"}m</div>
        <div class="cardBody"><a href="\${maps}" target="_blank" style="color:#38bdf8;font-weight:1000;text-decoration:none">Abrir no Maps</a></div>\`;
      list.appendChild(d);
    });
  }

  // auto refresh dos alertas quando estiver na aba
  let alertsTimer=null;
  function startAlertsAuto(){
    if(alertsTimer) return;
    alertsTimer=setInterval(()=>{
      if(secAlerts.classList.contains("active")) loadAlerts();
    }, 2500);
  }
  startAlertsAuto();

  // ===== PERIGO (GPS) — ARRUMADO: LIGA/DESLIGA DE VERDADE =====
  let panicOn=false;
  let watchId=null;

  function showBar(text){
    let bar=document.getElementById("alertBar");
    if(!bar){
      bar=document.createElement("div");
      bar.className="alertBar";
      bar.id="alertBar";
      document.getElementById("alertBox").appendChild(bar);
    }
    bar.textContent=text;
  }
  function removeBar(){
    const bar=document.getElementById("alertBar");
    if(bar) bar.remove();
  }

  async function sendPanic(on, coords){
    const payload = on ? { on:true, lat:coords.latitude, lon:coords.longitude, acc:coords.accuracy } : { on:false };
    await fetch("/api/panic/update",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
  }

  async function turnOffPanic(reason){
    panicOn=false;
    navPanic.classList.add("off");
    document.body.classList.remove("panic-active");
    if(watchId!==null){
      navigator.geolocation.clearWatch(watchId);
      watchId=null;
    }
    removeBar();
    try{ await sendPanic(false); }catch{}
    if(reason) alert(reason);
  }

  async function togglePanic(){
    // se já está ligado -> DESLIGA
    if(panicOn){
      return turnOffPanic();
    }

    // liga
    panicOn=true;
    navPanic.classList.remove("off");
    document.body.classList.add("panic-active");

    if(!navigator.geolocation){
      return turnOffPanic("Seu navegador não suporta localização.");
    }

    showBar("🚨 Perigo ATIVO: solicitando localização…");

    // watchPosition: atualiza em tempo real e dá pra desligar
    watchId = navigator.geolocation.watchPosition(async (pos)=>{
      const c=pos.coords;
      showBar(\`🚨 Localização compartilhada • \${c.latitude.toFixed(5)}, \${c.longitude.toFixed(5)} • ±\${Math.round(c.accuracy)}m\`);
      try{ await sendPanic(true, c); }catch{}
    }, async (err)=>{
      // se negar permissão, desliga de verdade e avisa
      await turnOffPanic("Localização negada/desligada. Ative a permissão do GPS no navegador.");
    }, { enableHighAccuracy:true, maximumAge:2000, timeout:12000 });
  }

  navPanic.onclick=togglePanic;

  // init
  loadPosts();
  loadTrades();
</script>

</body></html>`);
});

/* ================= EXPORT (Vercel) ================= */
module.exports = app;
