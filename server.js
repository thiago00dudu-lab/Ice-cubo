// server.js — ICE-CUB (Vercel-ready) | 1 arquivo só
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

/* ================= DADOS (MEMÓRIA) =================
⚠️ Em Vercel (serverless), dados em memória podem resetar.
Quando você quiser, eu passo pra Supabase/Firebase pra ficar permanente. */
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

/* ================= HOME ================= */
app.get("/", (req,res)=> res.redirect("/app"));

/* ================= LOGIN ================= */
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

/* ================= CADASTRO + FILHOS (REF) ================= */
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

/* ================= PANIC (PERIGO) ================= */
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
      list.push({ user, lat: st.lat, lon: st.lon, acc: st.acc, ts: st.ts });
    }
  }
  list.sort((a,b)=>b.ts-a.ts);
  res.json({ ok:true, list: list.slice(0,100) });
});

/* ================= POSTS (Timeline + Perfil + Delete) ================= */
app.post("/api/post", requireAuth, (req,res)=>{
  const text=String(req.body.text||"").trim();
  if(!text) return res.json({ok:false, err:"texto vazio"});
  posts.push({id:nowId("p_"), user:req.me.username, text, ts:Date.now()});
  if(posts.length>800) posts.splice(0,posts.length-800);
  res.json({ok:true});
});

app.get("/api/posts", requireAuth, (req,res)=>{
  const qUser = safeUser(req.query.user || "");
  let list = posts;
  if(qUser) list = posts.filter(p => p.user === qUser);
  res.json({ ok:true, list: list.slice(-250).reverse() });
});

app.post("/api/post/delete", requireAuth, (req,res)=>{
  const id = String(req.body.id || "").trim();
  if(!id) return res.json({ ok:false, err:"id inválido" });

  const me = req.me.username;
  const isMaster = req.me.role === "MASTER";

  const idx = posts.findIndex(p => p.id === id);
  if(idx < 0) return res.json({ ok:false, err:"post não encontrado" });

  const post = posts[idx];
  if(post.user !== me && !isMaster) return res.json({ ok:false, err:"sem permissão" });

  posts.splice(idx, 1);
  res.json({ ok:true });
});

/* ================= TROCAS ================= */
app.post("/api/trade", requireAuth, (req,res)=>{
  const item=String(req.body.item||"").trim();
  const want=String(req.body.want||"").trim();
  if(!item||!want) return res.json({ok:false, err:"campos vazios"});
  trades.push({id:nowId("t_"), user:req.me.username, item, want, ts:Date.now()});
  if(trades.length>500) trades.splice(0,trades.length-500);
  res.json({ok:true});
});

app.get("/api/trades", requireAuth, (req,res)=>{
  res.json({ok:true, list: trades.slice(-200).reverse()});
});

/* ================= USERS SEARCH (Parceiros) ================= */
app.get("/api/users/search", requireAuth, (req,res)=>{
  const q=safeUser(req.query.q||"");
  const list=[];
  if(q){
    for(const [name,u] of users.entries()){
      if(!u.banned && name.includes(q)){
        list.push({user:name});
        if(list.length>=25) break;
      }
    }
  }
  res.json({ok:true,list});
});

/* ================= CHAT (WhatsApp simples) ================= */
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
  if(arr.length>400) arr.splice(0,arr.length-400);
  res.json({ok:true});
});

app.get("/chat/get", requireAuth, (req,res)=>{
  const me=req.me.username;
  const withUser=safeUser(req.query.with);
  if(!withUser) return res.json({ok:false, err:"inválido"});
  if(!users.has(withUser)) return res.json({ok:false, err:"usuário não existe"});
  const k=chatKey(me,withUser);
  res.json({ok:true, messages:(chats.get(k)||[]).slice(-160)});
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
.stage{margin-top:68px;height:32vh;background:#000;border-radius:0 0 22px 22px;overflow:hidden;position:relative}
.hint{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:12px;opacity:.85;font-weight:1000}
.section{display:none;height:calc(68vh - 66px);overflow:auto;padding:12px 12px 96px}
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
.nav i{font-size:22px;color:#7dd3fc;padding:12px 14px;border-radius:16px;cursor:pointer}
.nav i.active{background:rgba(0,0,0,.22);border:1px solid rgba(148,163,184,.25)}
.nav .panic{color:#fff;background:rgba(239,68,68,.90);border:1px solid rgba(255,255,255,.18)}
.nav .panic.off{background:rgba(239,68,68,.18);color:#fecaca}
.alertBar{position:fixed;top:0;left:0;right:0;z-index:9999;background:#ef4444;color:#fff;text-align:center;padding:10px;font-weight:1000}
body.panic-active{animation:panicFlash 1s infinite}
@keyframes panicFlash{0%{filter:none}50%{filter:brightness(.92) saturate(1.1)}100%{filter:none}}

/* Mascote (urso + cubo + moeda BLUE) */
.brandRow{display:flex;align-items:center;gap:10px}
.mascot{
  width:54px;height:54px;border-radius:16px;
  background:linear-gradient(180deg, rgba(255,255,255,.10), rgba(56,189,248,.06));
  border:1px solid rgba(159,231,255,.22);
  display:grid;place-items:center;
  position:relative;overflow:hidden;
  box-shadow:0 12px 30px rgba(0,0,0,.35);
}
.mascot .bear{font-size:28px;position:absolute;left:8px;bottom:6px;transform-origin:center}
.mascot .cube{
  position:absolute;right:7px;bottom:10px;
  width:22px;height:22px;border-radius:6px;
  background:linear-gradient(180deg, rgba(125,211,252,.35), rgba(56,189,248,.14));
  border:1px solid rgba(159,231,255,.35);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);
}
.mascot .coin{
  position:absolute;right:10px;bottom:13px;
  width:16px;height:16px;border-radius:999px;
  background:radial-gradient(circle at 30% 30%, rgba(255,255,255,.35), rgba(0,0,0,0)),
             linear-gradient(180deg, rgba(30,64,175,.9), rgba(56,189,248,.45));
  border:1px solid rgba(255,215,0,.55);
  display:grid;place-items:center;
  color:#ffd700;font-weight:1000;font-size:10px;
}
.mascot .shine{
  position:absolute;inset:-40px;
  background:linear-gradient(120deg, transparent 35%, rgba(255,255,255,.18) 50%, transparent 65%);
  transform:translateX(-60px) rotate(10deg);
  animation:shine 2.4s linear infinite;
  pointer-events:none;
}
@keyframes shine{
  0%{transform:translateX(-80px) rotate(10deg)}
  100%{transform:translateX(120px) rotate(10deg)}
}
@keyframes tryPull{
  0%{transform:translate(0,0) rotate(0deg)}
  35%{transform:translate(2px,-2px) rotate(-6deg)}
  70%{transform:translate(-1px,1px) rotate(5deg)}
  100%{transform:translate(0,0) rotate(0deg)}
}
@keyframes coinWiggle{
  0%{transform:translate(0,0)}
  40%{transform:translate(-1px,-1px)}
  80%{transform:translate(1px,1px)}
  100%{transform:translate(0,0)}
}
.mascot .bear{animation:tryPull 1.15s ease-in-out infinite}
.mascot .coin{animation:coinWiggle .55s ease-in-out infinite}

/* Chat modal */
.modal{position:fixed;inset:0;background:rgba(0,0,0,.55);display:none;align-items:end;justify-content:center;z-index:999}
.sheet{width:100%;max-width:560px;height:76vh;background:#0b1220;border-radius:18px 18px 0 0;border:1px solid rgba(148,163,184,.25);
display:flex;flex-direction:column;overflow:hidden}
.sheetTop{padding:12px;background:#111827;display:flex;justify-content:space-between;align-items:center}
.msgs{flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:10px}
.msg{max-width:82%;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.08);border:1px solid rgba(148,163,184,.20);font-weight:900;font-size:13px}
.meMsg{align-self:flex-end;background:rgba(56,189,248,.14)}
.inputRow{display:flex;gap:10px;padding:12px;border-top:1px solid rgba(148,163,184,.20)}
.inputRow input{flex:1;padding:12px;border-radius:12px;border:0;background:#081022;color:#fff}
</style></head><body>

<div id="alertBox"></div>

<div class="top">
  <div>
    <div class="brandRow">
      <div class="mascot" title="BLUE preso no gelo 🧊">
        <div class="shine"></div>
        <div class="bear">🐻‍❄️</div>
        <div class="cube"></div>
        <div class="coin">B</div>
      </div>
      <div class="brand">ICE-CUB</div>
    </div>
    <div class="small">Você: <b>@${me.username}</b> ${star} • 🟦 <b>${Number(me.saldoBlue||0)}</b> BLUE</div>
  </div>
  <form method="POST" action="/logout" style="margin:0"><button class="btnTop">Sair</button></form>
</div>

<div class="stage">
  <div class="hint">Timeline • Perfil • Trocas • Alertas • Perigo (GPS) • Chat</div>
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
    <div class="small" style="margin-top:6px">Pai: <b>${me.parent ? "@"+me.parent : "nenhum"}</b> • Filhos: <b>${me.children ? me.children.size : 0}</b></div>
    <div class="row" style="margin-top:10px">
      <button class="btn2" onclick="shareInvite()">Compartilhar convite</button>
    </div>
  </div>

  <div class="box">
    <h3 style="margin:0 0 10px">🗂️ Minhas publicações</h3>
    <div class="row" style="margin-bottom:10px">
      <button class="btn2" onclick="loadMyPosts()">Atualizar</button>
    </div>
    <div class="feed" id="myFeed"></div>
  </div>

  ${isMaster ? `
  <div class="box">
    <h3 style="margin:0 0 10px">🛡️ ADM (BLUE)</h3>
    <div class="row">
      <input class="inp" id="giveUser" placeholder="Usuário (ex: neo)" style="max-width:220px">
      <input class="inp" id
