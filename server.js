const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50kb" }));

// -------------------- "BANCO" EM MEMÓRIA (demo) --------------------
const users = new Map(); // username -> {pass, role, banned, createdAt, timeMs, lastPing}
const sessions = new Map(); // sid -> username
const chats = new Map(); // key "a|b" -> [{from,to,msg,ts}]

// cria admin master
users.set("admin", {
  pass: "1533",
  role: "MASTER", // MASTER | MOD | USER
  banned: false,
  createdAt: Date.now(),
  timeMs: 0,
  lastPing: 0
});

function cookieParse(req) {
  const h = req.headers.cookie || "";
  const out = {};
  h.split(";").map(v => v.trim()).filter(Boolean).forEach(p => {
    const i = p.indexOf("=");
    if (i > -1) out[p.slice(0, i)] = decodeURIComponent(p.slice(i + 1));
  });
  return out;
}

function sid() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function auth(req) {
  const c = cookieParse(req);
  const s = c.sid && sessions.get(c.sid);
  if (!s) return null;
  const u = users.get(s);
  if (!u || u.banned) return null;
  return { username: s, ...u };
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

function chatKey(a, b) {
  return [a, b].sort().join("|");
}

// -------------------- ROTAS AUTH --------------------
app.get("/", (req, res) => res.redirect("/app"));

app.get("/login", (req, res) => {
  res.send(pageLogin(""));
});

app.post("/login", (req, res) => {
  const user = (req.body.user || "").trim();
  const pass = (req.body.pass || "").trim();
  const u = users.get(user);

  if (!u) return res.send(pageLogin("Usuário não existe."));
  if (u.banned) return res.send(pageLogin("Você foi banido."));
  if (u.pass !== pass) return res.send(pageLogin("Senha inválida."));

  const id = sid();
  sessions.set(id, user);
  res.setHeader("Set-Cookie", `sid=${encodeURIComponent(id)}; Path=/; HttpOnly; SameSite=Lax`);
  res.redirect("/app");
});

app.get("/register", (req, res) => {
  res.send(pageRegister(""));
});

app.post("/register", (req, res) => {
  const user = (req.body.user || "").trim().toLowerCase();
  const pass = (req.body.pass || "").trim();

  if (!user || user.length < 3) return res.send(pageRegister("Usuário muito curto."));
  if (!pass || pass.length < 3) return res.send(pageRegister("Senha muito curta."));
  if (users.has(user)) return res.send(pageRegister("Usuário já existe."));

  users.set(user, {
    pass,
    role: "USER",
    banned: false,
    createdAt: Date.now(),
    timeMs: 0,
    lastPing: 0
  });

  res.redirect("/login");
});

app.post("/logout", (req, res) => {
  const c = cookieParse(req);
  if (c.sid) sessions.delete(c.sid);
  res.setHeader("Set-Cookie", "sid=; Path=/; Max-Age=0");
  res.redirect("/login");
});

// -------------------- TRACK TEMPO --------------------
app.post("/track/ping", (req, res) => {
  const me = auth(req);
  if (!me) return res.json({ ok: false });

  const u = users.get(me.username);
  const t = Date.now();
  if (u.lastPing) u.timeMs += Math.max(0, t - u.lastPing);
  u.lastPing = t;

  res.json({ ok: true, role: u.role, banned: u.banned, timeMs: u.timeMs });
});

// -------------------- MODERAÇÃO / ADM --------------------
app.get("/admin/data", requireMaster, (req, res) => {
  const list = [];
  for (const [name, u] of users.entries()) {
    list.push({
      user: name,
      role: u.role,
      banned: u.banned,
      timeMin: Math.floor((u.timeMs || 0) / 60000)
    });
  }
  list.sort((a, b) => (b.timeMin - a.timeMin));
  res.json({ ok: true, list });
});

app.post("/admin/promote", requireMaster, (req, res) => {
  const target = (req.body.user || "").trim().toLowerCase();
  const u = users.get(target);
  if (!u) return res.json({ ok: false, err: "Usuário não existe" });
  if (target === "admin") return res.json({ ok: false, err: "admin já é MASTER" });
  u.role = "MOD";
  res.json({ ok: true });
});

app.post("/admin/demote", requireMaster, (req, res) => {
  const target = (req.body.user || "").trim().toLowerCase();
  const u = users.get(target);
  if (!u) return res.json({ ok: false, err: "Usuário não existe" });
  if (target === "admin") return res.json({ ok: false, err: "admin é MASTER" });
  u.role = "USER";
  res.json({ ok: true });
});

app.post("/mod/ban", requireAuth, (req, res) => {
  const me = req.me;
  if (!(me.role === "MASTER" || me.role === "MOD")) return res.status(403).json({ ok: false });
  const target = (req.body.user || "").trim().toLowerCase();
  if (!target || target === me.username) return res.json({ ok: false, err: "inválido" });
  if (target === "admin") return res.json({ ok: false, err: "não pode banir admin" });

  const u = users.get(target);
  if (!u) return res.json({ ok: false, err: "Usuário não existe" });
  u.banned = true;

  // derruba sessões desse usuário
  for (const [sid, uname] of sessions.entries()) if (uname === target) sessions.delete(sid);

  res.json({ ok: true });
});

app.post("/mod/unban", requireMaster, (req, res) => {
  const target = (req.body.user || "").trim().toLowerCase();
  const u = users.get(target);
  if (!u) return res.json({ ok: false, err: "Usuário não existe" });
  u.banned = false;
  res.json({ ok: true });
});

// -------------------- CHAT (polling simples) --------------------
app.post("/chat/send", requireAuth, (req, res) => {
  const me = req.me.username;
  const to = (req.body.to || "").trim().toLowerCase();
  const msg = (req.body.msg || "").trim();
  if (!to || !users.has(to)) return res.json({ ok: false, err: "Destino inválido" });
  if (!msg) return res.json({ ok: false, err: "Mensagem vazia" });

  const k = chatKey(me, to);
  if (!chats.has(k)) chats.set(k, []);
  chats.get(k).push({ from: me, to, msg, ts: Date.now() });
  // limita
  const arr = chats.get(k);
  if (arr.length > 200) arr.splice(0, arr.length - 200);

  res.json({ ok: true });
});

app.get("/chat/get", requireAuth, (req, res) => {
  const me = req.me.username;
  const withUser = (req.query.with || "").trim().toLowerCase();
  if (!withUser || !users.has(withUser)) return res.json({ ok: false, err: "Usuário inválido" });

  const k = chatKey(me, withUser);
  const arr = chats.get(k) || [];
  res.json({ ok: true, messages: arr.slice(-80) });
});

// -------------------- APP --------------------
app.get("/app", requireAuth, (req, res) => {
  const me = req.me;
  res.send(pageApp(me.username, me.role));
});

// -------------------- PÁGINAS HTML --------------------
function pageLogin(err) {
  return `<!doctype html><html lang="pt-br"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>ICE Login</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#0f172a;color:#fff;font-family:system-ui}
.card{width:320px;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:18px}
h1{margin:0 0 8px}
input{width:100%;padding:12px;border:0;border-radius:12px;margin:8px 0;background:#0b1220;color:#fff}
button{width:100%;padding:12px;border:0;border-radius:12px;background:#38bdf8;color:#001018;font-weight:900}
a{color:#38bdf8;text-decoration:none}
.err{color:#fecaca;background:rgba(239,68,68,.18);border:1px solid rgba(239,68,68,.35);padding:10px;border-radius:12px;margin:10px 0;font-weight:800}
.small{opacity:.85;font-size:12px}
</style></head><body>
<div class="card">
<h1>ICE CUBO</h1>
<div class="small">Entre para ver a timeline</div>
${err ? `<div class="err">${err}</div>` : ""}
<form method="POST" action="/login">
<input name="user" placeholder="Usuário" required>
<input name="pass" type="password" placeholder="Senha" required>
<button type="submit">Entrar</button>
</form>
<p class="small">Não tem conta? <a href="/register">Cadastrar</a></p>
<p class="small">Master: admin / 1533</p>
</div>
</body></html>`;
}

function pageRegister(err) {
  return `<!doctype html><html lang="pt-br"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>ICE Cadastro</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#0f172a;color:#fff;font-family:system-ui}
.card{width:320px;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:18px}
h1{margin:0 0 8px}
input{width:100%;padding:12px;border:0;border-radius:12px;margin:8px 0;background:#0b1220;color:#fff}
button{width:100%;padding:12px;border:0;border-radius:12px;background:#38bdf8;color:#001018;font-weight:900}
a{color:#38bdf8;text-decoration:none}
.err{color:#fecaca;background:rgba(239,68,68,.18);border:1px solid rgba(239,68,68,.35);padding:10px;border-radius:12px;margin:10px 0;font-weight:800}
.small{opacity:.85;font-size:12px}
</style></head><body>
<div class="card">
<h1>Cadastrar</h1>
${err ? `<div class="err">${err}</div>` : ""}
<form method="POST" action="/register">
<input name="user" placeholder="Usuário (min 3)" required>
<input name="pass" type="password" placeholder="Senha (min 3)" required>
<button type="submit">Criar</button>
</form>
<p class="small"><a href="/login">Voltar</a></p>
</div>
</body></html>`;
}

function pageApp(username, role) {
  const star =
    role === "MASTER" ? "⭐" :
    role === "MOD" ? "🔵⭐" : "";

  return `<!doctype html><html lang="pt-br"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<title>Ice App</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
:root{
  --bg1:#071833; --bg2:#061126; --c:#9fe7ff;
  --glass:rgba(30,160,255,.16); --glass2:rgba(0,120,255,.08);
  --ring:rgba(56,189,248,.55);
  --danger:#ef4444;
}
*{box-sizing:border-box}
body{
  margin:0;height:100vh;overflow:hidden;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;color:#fff;
  background: radial-gradient(1200px 600px at 20% 10%, #123b7a 0%, transparent 60%),
              radial-gradient(900px 500px at 80% 30%, #0ea5e9 0%, transparent 55%),
              linear-gradient(180deg,var(--bg1),var(--bg2));
  display:flex;flex-direction:column;
}
.topbar{
  position:fixed; top:10px; left:12px; right:12px; z-index:50;
  display:flex; align-items:center; justify-content:space-between; gap:10px;
}
.badge{
  padding:10px 12px;border-radius:999px;
  background:linear-gradient(180deg,var(--glass),var(--glass2));
  border:1px solid rgba(159,231,255,.18);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  font-weight:900; font-size:12px;
}
.badge.danger{
  background:rgba(239,68,68,.22);
  border-color:rgba(239,68,68,.45);
  color:#fecaca;
}
.btnTop{
  border:0; cursor:pointer; font-weight:900;
  padding:10px 12px;border-radius:14px;
  background:rgba(0,0,0,.25); color:#fff;
  border:1px solid rgba(159,231,255,.16);
}
.stage{
  height:58vh; position:relative; overflow:hidden;
  border-radius:0 0 26px 26px; background:rgba(0,0,0,.42);
}
#main{
  position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; display:none; background:#000;
}
.hint{
  position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
  text-align:center; padding:20px;
  color:rgba(255,255,255,.78); font-weight:900;
  text-shadow:0 10px 20px rgba(0,0,0,.45);
}
.timelineWrap{flex:1; padding:12px 12px 72px; display:flex; flex-direction:column; gap:10px}
.timeline{
  flex:1;border-radius:22px;padding:12px;
  background:linear-gradient(180deg, rgba(30,160,255,.14), rgba(0,120,255,.07));
  border:1px solid rgba(159,231,255,.18);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  overflow:hidden;
}
.rail{
  height:100%;
  display:flex; gap:12px;
  overflow-x:auto;
  scroll-snap-type:x mandatory;
  -webkit-overflow-scrolling:touch;
  padding-bottom:6px;
}
.rail::-webkit-scrollbar{height:0}
.card{
  flex:0 0 78%; max-width:78%;
  scroll-snap-align:center;
  border-radius:18px; overflow:hidden;
  position:relative;
  background:rgba(15,23,42,.55);
  border:1px solid rgba(159,231,255,.16);
  box-shadow: 0 18px 30px rgba(0,0,0,.35);
  user-select:none;
}
.card video{width:100%;height:100%;object-fit:cover;display:block}
.userTag{
  position:absolute; left:10px; top:10px;
  background:rgba(0,0,0,.35);
  border:1px solid rgba(159,231,255,.22);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  padding:6px 10px;border-radius:999px;
  font-size:12px;font-weight:900;
}
.activeRing{ outline:3px solid var(--ring); outline-offset:-3px; }

/* NAV */
.nav{
  position:fixed; left:0; right:0; bottom:0; z-index:60;
  height:64px;
  display:flex; justify-content:space-around; align-items:center;
  background:linear-gradient(180deg, rgba(30,160,255,.14), rgba(0,0,0,.35));
  border-top:1px solid rgba(159,231,255,.16);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
}
.nav i{
  font-size:22px; color:#7dd3fc;
  padding:12px 14px; border-radius:16px;
}
.nav i:active{transform:scale(.96)}
.nav .active{background:rgba(0,0,0,.22); border:1px solid rgba(159,231,255,.18)}
.nav .sos{
  color:#fff;
  background:rgba(239,68,68,.85);
  border:1px solid rgba(255,255,255,.18);
  box-shadow:0 10px 18px rgba(239,68,68,.20);
}
.nav .sos.off{background:rgba(239,68,68,.18); color:#fecaca}

/* Chat modal */
.modal{
  position:fixed; inset:0; z-index:999;
  background:rgba(0,0,0,.55);
  display:none; align-items:end; justify-content:center;
}
.sheet{
  width:100%; max-width:520px; height:72vh;
  background:#0b1220; border-radius:18px 18px 0 0;
  border:1px solid rgba(159,231,255,.18);
  display:flex; flex-direction:column; overflow:hidden;
}
.sheetTop{
  padding:12px; display:flex; justify-content:space-between; align-items:center;
  background:rgba(30,160,255,.10);
}
.sheetTop b{color:#9fe7ff}
.msgs{flex:1; overflow:auto; padding:12px; display:flex; flex-direction:column; gap:10px}
.msg{
  max-width:80%; padding:10px 12px; border-radius:14px;
  background:rgba(255,255,255,.08); border:1px solid rgba(159,231,255,.14);
  font-weight:700; font-size:13px;
}
.me{align-self:flex-end; background:rgba(56,189,248,.14)}
.inputRow{display:flex; gap:10px; padding:12px; border-top:1px solid rgba(159,231,255,.12)}
.inputRow input{
  flex:1; padding:12px; border-radius:12px; border:0;
  background:#081022; color:#fff;
}
.inputRow button{
  border:0; border-radius:12px; padding:12px 14px;
  background:#38bdf8; font-weight:900; color:#001018;
}

/* Admin panel modal */
.panel{
  position:fixed; inset:0; z-index:999;
  background:rgba(0,0,0,.65);
  display:none; align-items:center; justify-content:center;
}
.panelCard{
  width:min(720px,95vw); max-height:80vh; overflow:auto;
  background:#0b1220; border-radius:18px; padding:14px;
  border:1px solid rgba(159,231,255,.18);
}
.row{
  display:flex; align-items:center; justify-content:space-between;
  padding:10px; margin:8px 0;
  border-radius:14px;
  background:rgba(255,255,255,.06);
  border:1px solid rgba(159,231,255,.12);
}
.row small{opacity:.85}
.row button{
  border:0; border-radius:10px; padding:8px 10px; font-weight:900; cursor:pointer;
  background:rgba(56,189,248,.18); color:#9fe7ff; border:1px solid rgba(159,231,255,.16);
}
.row button.d{background:rgba(239,68,68,.18); color:#fecaca; border-color:rgba(239,68,68,.30)}
</style>
</head><body>

<div class="topbar">
  <div class="badge" id="profileBadge">Você: ${username} ${star}</div>
  <button class="btnTop" onclick="logout()">Sair</button>
</div>

<div class="stage" id="stage">
  <div class="hint" id="hint">Toque 1 vez num vídeo da timeline 👇<br/>e troque na tela grande jogando pro lado</div>
  <video id="main" playsinline controls></video>
</div>

<div class="timelineWrap">
  <div style="display:flex;justify-content:space-between;align-items:center;padding:0 4px;font-weight:900">
    <div>Timeline <span style="color:#9fe7ff">Pública</span></div>
    <div style="opacity:.85;font-size:12px" id="countTxt">0/0</div>
  </div>
  <div class="timeline">
    <div class="rail" id="rail"></div>
  </div>
</div>

<div class="nav">
  <i class="fa-solid fa-house active" id="navHome" title="Casa"></i>
  <i class="fa-solid fa-magnifying-glass" id="navSearch" title="Buscar/Chat"></i>
  <i class="fa-solid fa-camera" id="navCam" title="Câmera"></i>
  <i class="fa-solid fa-triangle-exclamation sos off" id="navSOS" title="Pânico"></i>
  ${role === "MASTER" ? `<i class="fa-solid fa-shield-halved" id="navAdmin" title="ADM"></i>` : `<i class="fa-solid fa-user" id="navProfile" title="Perfil"></i>`}
</div>

<!-- Chat -->
<div class="modal" id="chatModal">
  <div class="sheet">
    <div class="sheetTop">
      <div>Chat com <b id="chatWith">@?</b></div>
      <button class="btnTop" onclick="closeChat()">Fechar</button>
    </div>
    <div class="msgs" id="chatMsgs"></div>
    <div class="inputRow">
      <input id="chatInput" placeholder="Digite..." />
      <button onclick="sendMsg()">Enviar</button>
    </div>
  </div>
</div>

<!-- Admin Panel -->
<div class="panel" id="adminPanel">
  <div class="panelCard">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div style="font-weight:900;font-size:18px">Painel ADM MASTER ⭐</div>
      <button class="btnTop" onclick="closeAdmin()">Fechar</button>
    </div>
    <div style="opacity:.85;font-size:12px;margin:8px 0 12px">
      Aqui você vê usuários, tempo dentro do ICE, promove MOD (⭐ azul) e bane.
    </div>
    <div id="adminList"></div>
  </div>
</div>

<script>
  const ME = "${username}";
  const ROLE = "${role}"; // MASTER | MOD | USER

  const main = document.getElementById("main");
  const hint = document.getElementById("hint");
  const stage = document.getElementById("stage");
  const rail = document.getElementById("rail");
  const countTxt = document.getElementById("countTxt");
  const profileBadge = document.getElementById("profileBadge");

  const navHome = document.getElementById("navHome");
  const navSearch = document.getElementById("navSearch");
  const navCam = document.getElementById("navCam");
  const navSOS = document.getElementById("navSOS");
  const navAdmin = document.getElementById("navAdmin");
  const navProfile = document.getElementById("navProfile");

  // "vídeos de outros usuários" (demo)
  const posts = [
    { user:"neo",   src:"https://www.w3schools.com/html/mov_bbb.mp4" },
    { user:"tech",  src:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
    { user:"cyber", src:"https://media.w3.org/2010/05/sintel/trailer.mp4" }
  ];

  let active = 0;
  let stream = null;
  let sosActive = false;
  let chatTo = null;
  let chatTimer = null;

  function setNavActive(el){
    [navHome,navSearch,navCam,navSOS,navAdmin,navProfile].filter(Boolean).forEach(i=>i.classList.remove("active"));
    if(el) el.classList.add("active");
  }

  function render(){
    rail.innerHTML = "";
    posts.forEach((p, i) => {
      const card = document.createElement("div");
      card.className = "card" + (i===active ? " activeRing" : "");
      card.innerHTML = \`
        <div class="userTag">@\${p.user}</div>
        <video src="\${p.src}" muted playsinline preload="metadata"></video>
      \`;

      // ✅ 1 toque = sobe pra tela grande
      card.addEventListener("click", () => {
        setActive(i);
        openInStage(i);
      });

      rail.appendChild(card);
    });
    countTxt.textContent = (active+1) + "/" + posts.length;
  }

  function setActive(i){
    active = (i + posts.length) % posts.length;
    [...rail.children].forEach((c, idx) => c.classList.toggle("activeRing", idx===active));
    countTxt.textContent = (active+1) + "/" + posts.length;
  }

  function openInStage(i){
    stopLive();
    hint.style.display = "none";
    main.style.display = "block";
    main.controls = true;
    main.srcObject = null;
    main.src = posts[i].src;
    main.play().catch(()=>{});
  }

  // ✅ Swipe left/right no palco para trocar vídeo
  let sx=0, sy=0, moved=false;
  stage.addEventListener("touchstart", (e)=>{
    const t = e.touches[0];
    sx=t.clientX; sy=t.clientY; moved=false;
  }, {passive:true});
  stage.addEventListener("touchmove", (e)=>{
    moved=true;
  }, {passive:true});
  stage.addEventListener("touchend", (e)=>{
    if(!moved || main.style.display==="none") return;
    const t = e.changedTouches[0];
    const dx = t.clientX - sx;
    const dy = t.clientY - sy;
    if(Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)){
      if(dx < 0) next(); else prev();
    }
  }, {passive:true});

  function next(){ setActive(active+1); openInStage(active); }
  function prev(){ setActive(active-1); openInStage(active); }

  // Chat privado
  const chatModal = document.getElementById("chatModal");
  const chatWithEl = document.getElementById("chatWith");
  const chatMsgs = document.getElementById("chatMsgs");
  const chatInput = document.getElementById("chatInput");

  function openChat(u){
    chatTo = u.toLowerCase();
    chatWithEl.textContent = "@"+chatTo;
    chatModal.style.display = "flex";
    loadChat();
    clearInterval(chatTimer);
    chatTimer = setInterval(loadChat, 2000);
  }
  function closeChat(){
    chatModal.style.display = "none";
    chatTo = null;
    clearInterval(chatTimer);
    chatTimer = null;
  }
  async function loadChat(){
    if(!chatTo) return;
    const r = await fetch("/chat/get?with="+encodeURIComponent(chatTo));
    const j = await r.json();
    if(!j.ok) return;
    chatMsgs.innerHTML = "";
    j.messages.forEach(m=>{
      const d = document.createElement("div");
      d.className = "msg" + (m.from===ME ? " me" : "");
      d.textContent = (m.from===ME ? "Você: " : "@"+m.from+": ") + m.msg;
      chatMsgs.appendChild(d);
    });
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
  }
  async function sendMsg(){
    const msg = (chatInput.value||"").trim();
    if(!msg || !chatTo) return;
    chatInput.value = "";
    await fetch("/chat/send",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ to: chatTo, msg })
    });
    loadChat();
  }

  // "Buscar/Chat" (abre chat com usuário digitado)
  async function openSearch(){
    setNavActive(navSearch);
    const u = prompt("Digite o @ do usuário para conversar (ex: neo, tech, cyber):");
    if(!u) return;
    openChat(u.replace("@",""));
  }

  // Câmera (demo)
  async function openCam(){
    setNavActive(navCam);
    try{
      hint.style.display="none";
      main.style.display="block";
      main.src = "";
      main.controls = false;
      stream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
      main.srcObject = stream;
      main.muted = true;
      await main.play();
    }catch{
      alert("Permita a câmera.");
      stream=null;
    }
  }
  function stopLive(){
    if(stream){
      stream.getTracks().forEach(t=>t.stop());
      stream=null;
    }
  }

  // Pânico (visual por enquanto)
  function toggleSOS(){
    setNavActive(navSOS);
    sosActive = !sosActive;
    navSOS.classList.toggle("off", !sosActive);
    profileBadge.classList.toggle("danger", sosActive);
    profileBadge.textContent = sosActive
      ? "Você: "+ME+" (ÁREA DE RISCO) ⚠️"
      : "Você: "+ME+"";
    alert(sosActive ? "PÂNICO ATIVADO (perfil vermelho)" : "PÂNICO DESATIVADO");
  }

  // Painel ADM MASTER
  const adminPanel = document.getElementById("adminPanel");
  const adminList = document.getElementById("adminList");

  async function openAdmin(){
    setNavActive(navAdmin);
    adminPanel.style.display="flex";
    await refreshAdmin();
  }
  function closeAdmin(){ adminPanel.style.display="none"; }

  function roleIcon(r){
    if(r==="MASTER") return "⭐ dourada";
    if(r==="MOD") return "🔵⭐ mod";
    return "👤 user";
  }

  async function refreshAdmin(){
    const r = await fetch("/admin/data");
    const j = await r.json();
    if(!j.ok) return;
    adminList.innerHTML = "";
    j.list.forEach(x=>{
      const row = document.createElement("div");
      row.className="row";
      row.innerHTML = \`
        <div>
          <div style="font-weight:900">@\${x.user} — \${roleIcon(x.role)} \${x.banned?"(BANIDO)":""}</div>
          <small>Tempo no ICE: \${x.timeMin} min</small>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">
          <button onclick="promote('\${x.user}')">Virar MOD</button>
          <button onclick="demote('\${x.user}')">Tirar MOD</button>
          <button class="d" onclick="banUser('\${x.user}')">BANIR</button>
        </div>\`;
      adminList.appendChild(row);
    });
  }

  async function promote(u){
    await fetch("/admin/promote",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user:u})});
    refreshAdmin();
  }
  async function demote(u){
    await fetch("/admin/demote",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user:u})});
    refreshAdmin();
  }
  async function banUser(u){
    if(!confirm("Banir @"+u+"?")) return;
    await fetch("/mod/ban",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user:u})});
    refreshAdmin();
  }

  // Perfil (para USER/MOD)
  function openProfile(){
    setNavActive(navProfile);
    alert("Perfil: "+ME+"\\nCargo: "+ROLE);
  }

  async function logout(){
    await fetch("/logout",{method:"POST"});
    location.href="/login";
  }

  // navegação
  navHome.onclick = ()=>{ setNavActive(navHome); };
  navSearch.onclick = openSearch;
  navCam.onclick = openCam;
  navSOS.onclick = toggleSOS;
  if(navAdmin) navAdmin.onclick = openAdmin;
  if(navProfile) navProfile.onclick = openProfile;

  // ping tempo no ICE
  async function ping(){
    try{ await fetch("/track/ping",{method:"POST"}); }catch{}
  }
  setInterval(ping, 5000);
  ping();

  // init
  render();
</script>

</body></html>`;
}

// Vercel: não usar app.listen
module.exports = app;
