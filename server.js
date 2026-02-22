const express = require("express");
const crypto = require("crypto");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "6mb" })); // para uploads pequenos (base64)

/* =================== CONFIG AUTH (Vercel OK) =================== */
const SECRET = process.env.AUTH_SECRET || "ICE_SUPER_SECRET_TROCAR_DEPOIS";

/* =================== BLUE =================== */
const BLUE_MAX = 21_000_000;
let blueSupply = 0;

/* =================== DADOS (MEMÓRIA - DEMO) =================== */
const users = new Map(); // username -> {pass, role, saldoBlue, banned, children:Set, parent}
const partners = new Map(); // username -> Set(partnerUser)
const chats = new Map(); // key a|b -> [{from,to,msg,ts}]
const posts = []; // {id,user,type,media,ts}  type: img|vid  media: url/data
const trades = []; // {id,user,title,want,desc,media:[], offers:[], ts}
const panicState = new Map(); // username -> {on:boolean, lat, lon, acc, ts}

// admin master
users.set("admin", {
  pass: "1533",
  role: "MASTER",
  saldoBlue: 0,
  banned: false,
  children: new Set(),
  parent: null
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

function sign(data) {
  return crypto.createHmac("sha256", SECRET).update(data).digest("hex");
}

function makeToken(payloadObj) {
  const payload = Buffer.from(JSON.stringify(payloadObj))
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${payload}.${sign(payload)}`;
}

function readToken(token) {
  try {
    const [payload, sig] = String(token || "").split(".");
    if (!payload || !sig) return null;
    if (sign(payload) !== sig) return null;
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(b64, "base64").toString();
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

function chatKey(a, b) {
  return [a, b].sort().join("|");
}

function nowId(prefix) {
  return prefix + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function ensureSet(map, key) {
  if (!map.has(key)) map.set(key, new Set());
  return map.get(key);
}

function isSmallDataUrl(s) {
  // limite simples (evita explodir payload)
  if (!s) return false;
  if (typeof s !== "string") return false;
  if (!s.startsWith("data:")) return false;
  // ~4.5MB base64 caber em 6mb json
  return s.length <= 4_500_000;
}

/* =================== LOGIN / CADASTRO =================== */
app.get("/", (req, res) => res.redirect("/app"));

app.get("/login", (req, res) => {
  res.send(pageLogin());
});

app.post("/login", (req, res) => {
  const user = safeUser(req.body.user);
  const pass = String(req.body.pass || "").trim();
  const u = users.get(user);
  if (!u || u.pass !== pass || u.banned) return res.redirect("/login");

  const token = makeToken({ u: user, iat: Date.now() });
  res.setHeader("Set-Cookie", `ice=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax`);
  res.redirect("/app");
});

// registro com indicação opcional: /register?ref=pai
app.get("/register", (req, res) => {
  const ref = safeUser(req.query.ref || "");
  res.send(pageRegister(ref));
});

app.post("/register", (req, res) => {
  const user = safeUser(req.body.user);
  const pass = String(req.body.pass || "").trim();
  const ref = safeUser(req.body.ref || "");

  if (user.length < 3 || pass.length < 3) return res.redirect("/register");
  if (users.has(user)) return res.redirect("/register");

  users.set(user, {
    pass,
    role: "USER",
    saldoBlue: 0,
    banned: false,
    children: new Set(),
    parent: null
  });

  // filiação opcional (não é parceiros)
  if (ref && users.has(ref) && ref !== user) {
    users.get(user).parent = ref;
    users.get(ref).children.add(user);
  }

  res.redirect("/login");
});

app.post("/logout", (req, res) => {
  res.setHeader("Set-Cookie", "ice=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
  res.redirect("/login");
});

/* =================== API: USERS / PARCEIROS =================== */
app.get("/api/users/search", requireAuth, (req, res) => {
  const q = safeUser(req.query.q || "");
  if (!q) return res.json({ ok: true, list: [] });

  const list = [];
  for (const [name, u] of users.entries()) {
    if (name.includes(q) && !u.banned) {
      list.push({
        user: name,
        role: u.role,
        kids: u.children.size
      });
      if (list.length >= 20) break;
    }
  }
  res.json({ ok: true, list });
});

app.post("/api/partners/add", requireAuth, (req, res) => {
  const me = req.me.username;
  const other = safeUser(req.body.user);
  if (!other || !users.has(other) || other === me) return res.json({ ok: false, err: "inválido" });

  ensureSet(partners, me).add(other);
  ensureSet(partners, other).add(me);
  res.json({ ok: true });
});

app.get("/api/partners/list", requireAuth, (req, res) => {
  const me = req.me.username;
  const set = ensureSet(partners, me);
  res.json({ ok: true, list: [...set].slice(0, 200) });
});

/* =================== API: CHAT =================== */
app.post("/chat/send", requireAuth, (req, res) => {
  const me = req.me.username;
  const to = safeUser(req.body.to);
  const msg = String(req.body.msg || "").trim();
  if (!to || !users.has(to)) return res.json({ ok: false, err: "destino inválido" });
  if (!msg) return res.json({ ok: false, err: "mensagem vazia" });

  const k = chatKey(me, to);
  if (!chats.has(k)) chats.set(k, []);
  const arr = chats.get(k);
  arr.push({ from: me, to, msg, ts: Date.now() });
  if (arr.length > 300) arr.splice(0, arr.length - 300);

  res.json({ ok: true });
});

app.get("/chat/get", requireAuth, (req, res) => {
  const me = req.me.username;
  const withUser = safeUser(req.query.with);
  if (!withUser || !users.has(withUser)) return res.json({ ok: false, err: "usuário inválido" });

  const k = chatKey(me, withUser);
  res.json({ ok: true, messages: (chats.get(k) || []).slice(-120) });
});

/* =================== API: PANIC / GEO =================== */
app.post("/api/panic/set", requireAuth, (req, res) => {
  const me = req.me.username;
  const on = !!req.body.on;
  const lat = Number(req.body.lat);
  const lon = Number(req.body.lon);
  const acc = Number(req.body.acc);

  if (on) {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.json({ ok: false, err: "sem coords" });
    }
    panicState.set(me, { on: true, lat, lon, acc: Number.isFinite(acc) ? acc : null, ts: Date.now() });
    return res.json({ ok: true });
  } else {
    panicState.set(me, { on: false, lat: null, lon: null, acc: null, ts: Date.now() });
    return res.json({ ok: true });
  }
});

/* =================== API: POSTS (FACEBOOK STYLE) =================== */
app.get("/api/posts", requireAuth, (req, res) => {
  // timeline pública
  const list = posts.slice(-120).reverse();
  res.json({ ok: true, list });
});

app.get("/api/posts/mine", requireAuth, (req, res) => {
  const me = req.me.username;
  const list = posts.filter(p => p.user === me).slice(-120).reverse();
  res.json({ ok: true, list });
});

app.post("/api/post", requireAuth, (req, res) => {
  const me = req.me.username;
  const type = String(req.body.type || "").trim(); // img|vid
  const media = String(req.body.media || "").trim(); // url ou data:
  if (!["img", "vid"].includes(type)) return res.json({ ok: false, err: "type inválido" });
  if (!media || media.length < 10) return res.json({ ok: false, err: "media inválida" });

  // se for data url, limita tamanho
  if (media.startsWith("data:") && !isSmallDataUrl(media)) {
    return res.json({ ok: false, err: "arquivo grande demais (use menor ou URL)" });
  }

  posts.push({ id: nowId("p_"), user: me, type, media, ts: Date.now() });
  if (posts.length > 800) posts.splice(0, posts.length - 800);

  res.json({ ok: true });
});

/* =================== API: TROCAS + PROPOSTAS (DUAS COLUNAS) =================== */
app.get("/api/trades", requireAuth, (req, res) => {
  const list = trades.slice(-120).reverse();
  res.json({ ok: true, list });
});

app.post("/api/trade/create", requireAuth, (req, res) => {
  const me = req.me.username;
  const title = String(req.body.title || "").trim();
  const want = String(req.body.want || "").trim();
  const desc = String(req.body.desc || "").trim();
  const media = Array.isArray(req.body.media) ? req.body.media.map(String) : [];

  if (!title || title.length < 2) return res.json({ ok: false, err: "título inválido" });
  if (!want || want.length < 2) return res.json({ ok: false, err: "quer inválido" });

  const cleanMedia = media
    .filter(m => m && m.length > 10)
    .slice(0, 4);

  for (const m of cleanMedia) {
    if (m.startsWith("data:") && !isSmallDataUrl(m)) return res.json({ ok: false, err: "mídia grande demais" });
  }

  trades.push({
    id: nowId("t_"),
    user: me,
    title,
    want,
    desc,
    media: cleanMedia, // fotos/vídeos do item
    offers: [], // propostas de outras pessoas
    ts: Date.now()
  });

  if (trades.length > 400) trades.splice(0, trades.length - 400);
  res.json({ ok: true });
});

app.post("/api/trade/offer", requireAuth, (req, res) => {
  const me = req.me.username;
  const tradeId = String(req.body.tradeId || "").trim();
  const note = String(req.body.note || "").trim();
  const media = Array.isArray(req.body.media) ? req.body.media.map(String) : [];

  const t = trades.find(x => x.id === tradeId);
  if (!t) return res.json({ ok: false, err: "trade não existe" });
  if (t.user === me) return res.json({ ok: false, err: "você é dono do item" });

  const cleanMedia = media
    .filter(m => m && m.length > 10)
    .slice(0, 4);

  for (const m of cleanMedia) {
    if (m.startsWith("data:") && !isSmallDataUrl(m)) return res.json({ ok: false, err: "mídia grande demais" });
  }

  t.offers.push({
    id: nowId("o_"),
    from: me,
    note,
    media: cleanMedia,
    ts: Date.now()
  });

  if (t.offers.length > 50) t.offers.splice(0, t.offers.length - 50);

  res.json({ ok: true });
});

/* =================== ADM: BLUE CONTROL =================== */
app.get("/admin/blue", requireMaster, (req, res) => {
  const list = [];
  for (const [name, u] of users.entries()) {
    list.push({ user: name, role: u.role, saldoBlue: u.saldoBlue, banned: u.banned });
  }
  res.json({ ok: true, supply: blueSupply, max: BLUE_MAX, users: list.slice(0, 400) });
});

app.post("/admin/mint", requireMaster, (req, res) => {
  const v = Number(req.body.amount || 0);
  if (!Number.isFinite(v) || v <= 0) return res.json({ ok: false, err: "valor inválido" });
  if (blueSupply + v > BLUE_MAX) return res.json({ ok: false, err: "limite atingido" });
  blueSupply += v;
  res.json({ ok: true, supply: blueSupply });
});

app.post("/admin/give", requireMaster, (req, res) => {
  const user = safeUser(req.body.user);
  const v = Number(req.body.amount || 0);
  if (!user || !users.has(user)) return res.json({ ok: false, err: "usuário inválido" });
  if (!Number.isFinite(v) || v === 0) return res.json({ ok: false, err: "valor inválido" });

  const u = users.get(user);
  u.saldoBlue = Math.max(0, Number(u.saldoBlue || 0) + v);
  res.json({ ok: true, user, saldoBlue: u.saldoBlue });
});

/* =================== UI PAGES =================== */
app.get("/app", requireAuth, (req, res) => {
  const me = req.me;
  res.send(pageApp(me));
});

function pageLogin() {
  return `<!doctype html><html lang="pt-br"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>ICE Login</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#0f172a;color:#fff;font-family:system-ui}
.card{width:360px;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:18px}
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
</div></body></html>`;
}

function pageRegister(ref) {
  return `<!doctype html><html lang="pt-br"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>ICE Cadastro</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#0f172a;color:#fff;font-family:system-ui}
.card{width:360px;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:18px}
h1{margin:0 0 8px}
input{width:100%;padding:12px;border:0;border-radius:12px;margin:8px 0;background:#0b1220;color:#fff}
button{width:100%;padding:12px;border:0;border-radius:12px;background:#38bdf8;color:#001018;font-weight:900}
a{color:#38bdf8;text-decoration:none}
.small{opacity:.85;font-size:12px}
</style></head><body>
<div class="card">
<h1>Cadastrar</h1>
<div class="small">Indicação (opcional): <b>${ref ? "@"+ref : "nenhuma"}</b></div>
<form method="POST" action="/register">
<input name="user" placeholder="Usuário (min 3)" required>
<input name="pass" type="password" placeholder="Senha (min 3)" required>
<input name="ref" placeholder="ref (opcional)" value="${ref || ""}">
<button type="submit">Criar conta</button>
</form>
<p class="small"><a href="/login">Voltar</a></p>
</div></body></html>`;
}

function pageApp(me) {
  const star = me.role === "MASTER" ? "⭐" : (me.role === "MOD" ? "🔵⭐" : "");
  const kids = me.children ? me.children.size : 0;

  return `<!doctype html><html lang="pt-br"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<title>ICE</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
:root{
  --bg1:#071833; --bg2:#061126;
  --glass:rgba(30,160,255,.16); --glass2:rgba(0,120,255,.08);
  --ring:rgba(56,189,248,.55);
  --danger:#ef4444;
}
*{box-sizing:border-box}
body{
  margin:0;height:100vh;overflow:hidden;color:#fff;font-family:system-ui;
  background:
    radial-gradient(1200px 600px at 20% 10%, #123b7a 0%, transparent 60%),
    radial-gradient(900px 500px at 80% 30%, #0ea5e9 0%, transparent 55%),
    linear-gradient(180deg,var(--bg1),var(--bg2));
}
.ocean{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.bubble{
  position:absolute;bottom:-80px;border-radius:999px;
  border:1px solid rgba(159,231,255,.35); background:rgba(159,231,255,.10);
  animation: rise linear infinite;
}
@keyframes rise{from{transform:translateY(0);opacity:.0} 15%{opacity:.55} to{transform:translateY(-120vh);opacity:0}}
.shell,.starfish{position:absolute;opacity:.25;text-shadow:0 12px 30px rgba(0,0,0,.35)}
.shell{font-size:28px}.starfish{font-size:30px}

.wrap{position:relative;z-index:1;height:100vh;display:flex;flex-direction:column}
.badge{
  position:fixed;top:10px;left:12px;right:12px;z-index:50;
  display:flex;align-items:center;justify-content:space-between;gap:10px;
  padding:10px 12px;border-radius:16px;
  background:linear-gradient(180deg,var(--glass),var(--glass2));
  border:1px solid rgba(159,231,255,.18);
  backdrop-filter: blur(12px);
  font-weight:900;font-size:12px;
}
.badge small{opacity:.85;font-weight:800}
.btnTop{
  border:0;cursor:pointer;font-weight:900;
  padding:10px 12px;border-radius:14px;
  background:rgba(0,0,0,.25);color:#fff;
  border:1px solid rgba(159,231,255,.16);
}

.stage{
  margin-top:58px;
  height:44vh;background:rgba(0,0,0,.42);position:relative;overflow:hidden;
  border-radius:0 0 26px 26px;
}
#main{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#000;display:none}
.hint{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:16px;
  color:rgba(255,255,255,.78);font-weight:900;text-shadow:0 10px 20px rgba(0,0,0,.45)
}

.section{flex:1;display:none;padding:12px 12px 78px;overflow:auto;gap:10px}
.section.active{display:flex;flex-direction:column}

.box{
  border-radius:18px;padding:12px;
  background:linear-gradient(180deg, rgba(30,160,255,.14), rgba(0,120,255,.07));
  border:1px solid rgba(159,231,255,.18);
  backdrop-filter: blur(10px);
}
.box h3{margin:0 0 10px}

.row{display:flex;gap:10px;flex-wrap:wrap}
.inp,.ta,select{
  width:100%;padding:12px;border-radius:12px;border:0;background:#081022;color:#fff;outline:none
}
.ta{min-height:84px;resize:none}
.btn{
  border:0;border-radius:12px;padding:12px 14px;background:#38bdf8;font-weight:900;color:#001018;cursor:pointer
}
.btn2{
  border:0;border-radius:12px;padding:12px 14px;background:rgba(255,255,255,.10);
  border:1px solid rgba(159,231,255,.18);color:#fff;font-weight:900;cursor:pointer
}

.feed{
  display:grid;grid-template-columns:1fr;gap:10px
}
.postCard{
  border-radius:18px;overflow:hidden;
  border:1px solid rgba(159,231,255,.16);
  background:rgba(15,23,42,.55);
}
.postHead{padding:10px;font-weight:900;display:flex;justify-content:space-between;align-items:center}
.media{width:100%;max-height:55vh;object-fit:cover;background:#000;display:block}
.actions{padding:10px;display:flex;gap:10px;flex-wrap:wrap}
.tag{
  display:inline-block;padding:6px 10px;border-radius:999px;background:rgba(0,0,0,.25);
  border:1px solid rgba(159,231,255,.16);font-weight:900;font-size:12px
}

.nav{
  position:fixed;left:0;right:0;bottom:0;z-index:60;height:66px;
  display:flex;justify-content:space-around;align-items:center;
  background:linear-gradient(180deg, rgba(30,160,255,.14), rgba(0,0,0,.35));
  border-top:1px solid rgba(159,231,255,.16);
  backdrop-filter: blur(12px);
}
.nav i{font-size:22px;color:#7dd3fc;padding:12px 14px;border-radius:16px}
.nav i.active{background:rgba(0,0,0,.22);border:1px solid rgba(159,231,255,.18)}
.nav .panic{color:#fff;background:rgba(239,68,68,.85);border:1px solid rgba(255,255,255,.18)}
.nav .panic.off{background:rgba(239,68,68,.18);color:#fecaca}

body.panic-active{animation:panicFlash 1s infinite}
@keyframes panicFlash{0%{filter:none}50%{filter:brightness(.92) saturate(1.1)}100%{filter:none}}
.alertBar{position:fixed;top:0;left:0;right:0;z-index:9999;background:#ef4444;color:#fff;text-align:center;padding:10px;font-weight:900}

.modal{position:fixed;inset:0;z-index:999;background:rgba(0,0,0,.55);display:none;align-items:end;justify-content:center}
.sheet{width:100%;max-width:560px;height:76vh;background:#0b1220;border-radius:18px 18px 0 0;border:1px solid rgba(159,231,255,.18);
  display:flex;flex-direction:column;overflow:hidden}
.sheetTop{padding:12px;display:flex;justify-content:space-between;align-items:center;background:rgba(30,160,255,.10)}
.msgs{flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:10px}
.msg{max-width:82%;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.08);border:1px solid rgba(159,231,255,.14);font-weight:800;font-size:13px}
.me{align-self:flex-end;background:rgba(56,189,248,.14)}
.inputRow{display:flex;gap:10px;padding:12px;border-top:1px solid rgba(159,231,255,.12)}
.inputRow input{flex:1;padding:12px;border-radius:12px;border:0;background:#081022;color:#fff}
</style>
</head><body>

<div class="ocean" id="ocean"></div>

<div id="alertBox"></div>

<div class="wrap">
  <div class="badge" id="topBadge">
    <div>
      Você: <b>@${me.username}</b> ${star}
      <small>• filhos ${kids} • 🟦 ${Number(me.saldoBlue||0)} BLUE</small>
    </div>
    <form method="POST" action="/logout" style="margin:0">
      <button class="btnTop" type="submit">Sair</button>
    </form>
  </div>

  <div class="stage" id="stage">
    <div class="hint" id="hint">Timeline e Trocas ficam em baixo 👇<br/>Abra posts, parceiros, chat e trocas</div>
    <video id="main" playsinline controls></video>
  </div>

  <!-- TIMELINE (Facebook) -->
  <div class="section active" id="secTimeline">
    <div class="box">
      <h3>Timeline pública</h3>
      <div style="opacity:.85;font-weight:800">Posts de todos os usuários (foto/vídeo).</div>
    </div>
    <div class="feed" id="feed"></div>
  </div>

  <!-- PERFIL -->
  <div class="section" id="secProfile">
    <div class="box">
      <h3>Seu perfil</h3>
      <div class="row">
        <button class="btn2" onclick="shareInvite()">Compartilhar convite</button>
        <span class="tag" id="inviteLink"></span>
      </div>
      <div style="opacity:.85;margin-top:10px;font-weight:800">
        Pai: <span style="color:#9fe7ff">${me.parent ? "@"+me.parent : "nenhum"}</span>
      </div>
    </div>

    <div class="box">
      <h3>Postar (aparece pra todos)</h3>
      <div class="row">
        <select id="postType" style="max-width:160px">
          <option value="img">Foto</option>
          <option value="vid">Vídeo</option>
        </select>
        <input class="inp" id="postUrl" placeholder="OU cole uma URL (imagem ou mp4)" />
      </div>
      <div class="row" style="margin-top:10px">
        <input type="file" id="postFile" accept="image/*,video/*" class="inp" />
      </div>
      <div class="row" style="margin-top:10px">
        <button class="btn" onclick="createPost()">Publicar</button>
        <button class="btn2" onclick="openTimeline()">Ver na Timeline</button>
      </div>
      <div id="postMsg" style="margin-top:8px;opacity:.9;font-weight:900"></div>
    </div>

    <div class="box">
      <h3>Seus posts</h3>
      <div class="feed" id="myFeed"></div>
    </div>
  </div>

  <!-- PARCEIROS -->
  <div class="section" id="secPartners">
    <div class="box">
      <h3>Parceiros</h3>
      <div style="opacity:.85;font-weight:800">Procure por nome/ID e adicione como parceiro (não é filiação).</div>
      <div class="row" style="margin-top:10px">
        <input class="inp" id="partnerQ" placeholder="Digite o nome/ID (ex: neo)" />
        <button class="btn2" onclick="searchUsers()">Buscar</button>
      </div>
      <div id="searchRes" style="margin-top:10px"></div>
    </div>

    <div class="box">
      <h3>Meus parceiros</h3>
      <div id="partnerList"></div>
    </div>
  </div>

  <!-- TROCAS -->
  <div class="section" id="secTrades">
    <div class="box">
      <h3>O que tem pra mim (Trocas)</h3>
      <div style="opacity:.85;font-weight:800">Você publica seu item com foto/vídeo. Outros fazem proposta com fotos/vídeos do lado.</div>
    </div>

    <div class="box">
      <h3>Publicar item para trocar</h3>
      <input class="inp" id="trTitle" placeholder="O que você tem? (ex: Xbox, Celular)" />
      <input class="inp" id="trWant" placeholder="O que você quer em troca? (ex: Bike)" style="margin-top:10px" />
      <textarea class="ta" id="trDesc" placeholder="Detalhes (opcional)" style="margin-top:10px"></textarea>

      <div class="row" style="margin-top:10px">
        <input class="inp" id="trUrl" placeholder="OU cole URL de foto/vídeo do item" />
      </div>
      <div class="row" style="margin-top:10px">
        <input type="file" id="trFile" accept="image/*,video/*" class="inp" multiple />
      </div>

      <div class="row" style="margin-top:10px">
        <button class="btn" onclick="createTrade()">Publicar troca</button>
      </div>
      <div id="trMsg" style="margin-top:8px;opacity:.9;font-weight:900"></div>
    </div>

    <div class="box" id="tradeList">
      <h3>Vitrine de trocas</h3>
      <div style="opacity:.85">Carregando...</div>
    </div>
  </div>

  <!-- ADM -->
  ${me.role==="MASTER" ? `
  <div class="section" id="secAdmin">
    <div class="box">
      <h3>Painel ADM MASTER ⭐</h3>
      <div style="opacity:.85;font-weight:800">Controlar BLUE (sem compra agora).</div>
      <div class="row" style="margin-top:10px">
        <input class="inp" id="mintVal" placeholder="Emitir BLUE (mint)" />
        <button class="btn2" onclick="mintBlue()">Emitir</button>
      </div>
      <div class="row" style="margin-top:10px">
        <input class="inp" id="giveUser" placeholder="Usuário" />
        <input class="inp" id="giveVal" placeholder="Quantidade (pode negativo pra tirar)" />
        <button class="btn2" onclick="giveBlue()">Aplicar</button>
      </div>
      <div id="admMsg" style="margin-top:8px;opacity:.9;font-weight:900"></div>
      <div class="box" style="margin-top:12px">
        <h3>Resumo</h3>
        <div id="blueInfo" style="opacity:.85">Carregando...</div>
      </div>
    </div>
  </div>` : ""}

  <!-- NAV -->
  <div class="nav">
    <i class="fa-solid fa-film active" id="navTimeline" title="Timeline"></i>
    <i class="fa-solid fa-house" id="navProfile" title="Perfil"></i>
    <i class="fa-solid fa-user-group" id="navPartners" title="Parceiros"></i>
    <i class="fa-solid fa-right-left" id="navTrades" title="Trocas"></i>
    <i class="fa-solid fa-triangle-exclamation panic off" id="navPanic" title="Perigo"></i>
    ${me.role==="MASTER" ? `<i class="fa-solid fa-shield-halved" id="navAdmin" title="ADM"></i>` : ``}
  </div>

  <!-- CHAT -->
  <div class="modal" id="chatModal">
    <div class="sheet">
      <div class="sheetTop">
        <div>Chat com <b id="chatWith">@?</b></div>
        <button class="btnTop" onclick="closeChat()">Fechar</button>
      </div>
      <div class="msgs" id="chatMsgs"></div>
      <div class="inputRow">
        <input id="chatInput" placeholder="Digite..." />
        <button class="btn" onclick="sendMsg()">Enviar</button>
      </div>
    </div>
  </div>
</div>

<script>
  const ME="${me.username}";
  const ROLE="${me.role}";

  // ocean decor
  (function oceanDecor(){
    const ocean=document.getElementById("ocean");
    for(let i=0;i<26;i++){
      const b=document.createElement("div");
      b.className="bubble";
      b.style.left=(Math.random()*100)+"vw";
      b.style.animationDuration=(6+Math.random()*9)+"s";
      b.style.animationDelay=(Math.random()*6)+"s";
      const s=10+Math.random()*22;
      b.style.width=s+"px"; b.style.height=s+"px";
      ocean.appendChild(b);
    }
    const deco=[{c:"shell",t:"🐚"},{c:"shell",t:"🪸"},{c:"starfish",t:"⭐"},{c:"starfish",t:"🌟"}];
    for(let i=0;i<10;i++){
      const d=document.createElement("div");
      const p=deco[Math.floor(Math.random()*deco.length)];
      d.className=p.c; d.textContent=p.t;
      d.style.left=(Math.random()*100)+"vw";
      d.style.top=(20+Math.random()*75)+"vh";
      d.style.transform="rotate("+(Math.random()*60-30)+"deg)";
      ocean.appendChild(d);
    }
  })();

  // invite
  const invite = location.origin + "/register?ref=" + encodeURIComponent(ME);
  document.getElementById("inviteLink").textContent = invite;

  function showSection(id){
    ["secTimeline","secProfile","secPartners","secTrades"${me.role==="MASTER" ? ',"secAdmin"' : ""}].forEach(s=>{
      const el=document.getElementById(s);
      if(el) el.classList.remove("active");
    });
    document.getElementById(id).classList.add("active");
    ["navTimeline","navProfile","navPartners","navTrades","navAdmin"].forEach(n=>{
      const el=document.getElementById(n);
      if(el) el.classList.remove("active");
    });
    if(id==="secTimeline") navTimeline.classList.add("active");
    if(id==="secProfile") navProfile.classList.add("active");
    if(id==="secPartners") navPartners.classList.add("active");
    if(id==="secTrades") navTrades.classList.add("active");
    if(id==="secAdmin" && navAdmin) navAdmin.classList.add("active");
  }

  const navTimeline=document.getElementById("navTimeline");
  const navProfile=document.getElementById("navProfile");
  const navPartners=document.getElementById("navPartners");
  const navTrades=document.getElementById("navTrades");
  const navPanic=document.getElementById("navPanic");
  const navAdmin=document.getElementById("navAdmin");

  navTimeline.onclick=()=>openTimeline();
  navProfile.onclick=()=>openProfile();
  navPartners.onclick=()=>openPartners();
  navTrades.onclick=()=>openTrades();
  if(navAdmin) navAdmin.onclick=()=>openAdmin();

  function openTimeline(){ showSection("secTimeline"); loadTimeline(); }
  function openProfile(){ showSection("secProfile"); loadMine(); }
  function openPartners(){ showSection("secPartners"); loadPartners(); }
  function openTrades(){ showSection("secTrades"); loadTrades(); }
  function openAdmin(){ showSection("secAdmin"); loadBlue(); }

  // Stage preview
  const main=document.getElementById("main");
  const hint=document.getElementById("hint");
  function preview(type, media){
    hint.style.display="none";
    main.style.display="block";
    if(type==="vid"){
      main.srcObject=null;
      main.src=media;
      main.play().catch(()=>{});
    }else{
      // mostrar imagem usando "poster" hack (coloca num video e pausa)
      main.pause();
      main.removeAttribute("src");
      main.load();
      main.style.display="none";
      // cria overlay img
      let img=document.getElementById("stageImg");
      if(!img){
        img=document.createElement("img");
        img.id="stageImg";
        img.style.position="absolute";
        img.style.inset="0";
        img.style.width="100%";
        img.style.height="100%";
        img.style.objectFit="cover";
        img.style.background="#000";
        document.getElementById("stage").appendChild(img);
      }
      img.src=media;
    }
  }

  function clearStageImg(){
    const img=document.getElementById("stageImg");
    if(img) img.remove();
  }

  // ---------- Timeline ----------
  async function loadTimeline(){
    clearStageImg();
    const r=await fetch("/api/posts");
    const j=await r.json();
    if(!j.ok) return;
    const feed=document.getElementById("feed");
    feed.innerHTML="";
    (j.list||[]).forEach(p=>{
      const card=document.createElement("div");
      card.className="postCard";
      card.innerHTML = \`
        <div class="postHead">
          <span>@\${p.user}</span>
          <span style="opacity:.75;font-size:12px">\${new Date(p.ts).toLocaleString()}</span>
        </div>
        \${p.type==="img"
          ? \`<img class="media" src="\${p.media}" />\`
          : \`<video class="media" src="\${p.media}" controls playsinline></video>\`}
        <div class="actions">
          <button class="btn2" onclick="openChat('@\${p.user}')">💬 Conversar</button>
          <button class="btn2" onclick="preview('\${p.type}','\${p.media.replace(/'/g,"&#39;")}')">👁 Ver no palco</button>
        </div>\`;
      feed.appendChild(card);
    });
  }

  async function loadMine(){
    const r=await fetch("/api/posts/mine");
    const j=await r.json();
    if(!j.ok) return;
    const my=document.getElementById("myFeed");
    my.innerHTML="";
    (j.list||[]).forEach(p=>{
      const card=document.createElement("div");
      card.className="postCard";
      card.innerHTML=\`
        <div class="postHead"><span>Seu post</span><span style="opacity:.75;font-size:12px">\${new Date(p.ts).toLocaleString()}</span></div>
        \${p.type==="img"
          ? \`<img class="media" src="\${p.media}" />\`
          : \`<video class="media" src="\${p.media}" controls playsinline></video>\`}
        <div class="actions">
          <button class="btn2" onclick="preview('\${p.type}','\${p.media.replace(/'/g,"&#39;")}')">👁 Ver no palco</button>
        </div>\`;
      my.appendChild(card);
    });
  }

  async function fileToDataUrl(file){
    return new Promise((resolve,reject)=>{
      const fr=new FileReader();
      fr.onload=()=>resolve(fr.result);
      fr.onerror=reject;
      fr.readAsDataURL(file);
    });
  }

  async function createPost(){
    const type=document.getElementById("postType").value;
    const url=(document.getElementById("postUrl").value||"").trim();
    const file=document.getElementById("postFile").files[0];
    const msg=document.getElementById("postMsg");
    msg.textContent="";

    let media=url;
    if(file){
      // limite prático (2.5MB)
      if(file.size > 2_500_000){
        msg.textContent="Arquivo grande demais. Use um menor ou cole uma URL.";
        return;
      }
      media = await fileToDataUrl(file);
    }
    if(!media){
      msg.textContent="Coloque uma URL ou escolha um arquivo.";
      return;
    }

    const r=await fetch("/api/post",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ type, media })
    });
    const j=await r.json();
    msg.textContent = j.ok ? "Postado ✅ (aparece na Timeline)" : ("Erro: "+(j.err||""));
    if(j.ok){
      document.getElementById("postUrl").value="";
      document.getElementById("postFile").value="";
      loadMine();
      loadTimeline();
    }
  }

  async function shareInvite(){
    try{
      if(navigator.share){
        await navigator.share({ title:"ICE CUBO", text:"Entra pelo meu convite:", url: invite });
      }else{
        await navigator.clipboard.writeText(invite);
        alert("Link copiado ✅\\n"+invite);
      }
    }catch{
      alert("Copie manualmente:\\n"+invite);
    }
  }

  // ---------- Parceiros ----------
  async function searchUsers(){
    const q=(document.getElementById("partnerQ").value||"").trim();
    const resDiv=document.getElementById("searchRes");
    resDiv.innerHTML="Buscando...";
    const r=await fetch("/api/users/search?q="+encodeURIComponent(q));
    const j=await r.json();
    if(!j.ok) return;
    if(!j.list.length){ resDiv.innerHTML="<div style='opacity:.85'>Nada encontrado.</div>"; return; }
    resDiv.innerHTML="";
    j.list.forEach(u=>{
      const d=document.createElement("div");
      d.className="box";
      d.style.marginTop="10px";
      d.innerHTML=\`
        <div style="font-weight:900">@\${u.user} <span style="opacity:.8">(\${u.role})</span></div>
        <div style="opacity:.85;margin-top:6px">Filhos: \${u.kids}</div>
        <div class="row" style="margin-top:10px">
          <button class="btn2" onclick="addPartner('\${u.user}')">➕ Virar parceiro</button>
          <button class="btn2" onclick="openChat('@\${u.user}')">💬 Conversar</button>
        </div>\`;
      resDiv.appendChild(d);
    });
  }

  async function addPartner(u){
    await fetch("/api/partners/add",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ user: u })
    });
    loadPartners();
    alert("@"+u+" agora é seu parceiro ✅");
  }

  async function loadPartners(){
    const r=await fetch("/api/partners/list");
    const j=await r.json();
    if(!j.ok) return;
    const list=document.getElementById("partnerList");
    list.innerHTML="";
    if(!j.list.length){
      list.innerHTML="<div style='opacity:.85'>Você ainda não tem parceiros.</div>";
      return;
    }
    j.list.forEach(u=>{
      const d=document.createElement("div");
      d.className="box";
      d.style.marginTop="10px";
      d.innerHTML=\`
        <div style="font-weight:900">@\${u}</div>
        <div class="row" style="margin-top:10px">
          <button class="btn2" onclick="openChat('@\${u}')">💬 Chat</button>
        </div>\`;
      list.appendChild(d);
    });
  }

  // ---------- Chat ----------
  const chatModal=document.getElementById("chatModal");
  const chatWithEl=document.getElementById("chatWith");
  const chatMsgs=document.getElementById("chatMsgs");
  const chatInput=document.getElementById("chatInput");
  let chatTo=null, chatTimer=null;

  function openChat(u){
    u=String(u||"").replace("@","").toLowerCase();
    if(!u) return;
    chatTo=u;
    chatWithEl.textContent="@"+u;
    chatModal.style.display="flex";
    loadChat();
    clearInterval(chatTimer);
    chatTimer=setInterval(loadChat, 2000);
  }
  function closeChat(){
    chatModal.style.display="none";
    chatTo=null;
    clearInterval(chatTimer); chatTimer=null;
  }
  async function loadChat(){
    if(!chatTo) return;
    const r=await fetch("/chat/get?with="+encodeURIComponent(chatTo));
    const j=await r.json();
    if(!j.ok) return;
    chatMsgs.innerHTML="";
    (j.messages||[]).forEach(m=>{
      const d=document.createElement("div");
      d.className="msg"+(m.from===ME?" me":"");
      d.textContent=(m.from===ME?"Você: ":"@"+m.from+": ")+m.msg;
      chatMsgs.appendChild(d);
    });
    chatMsgs.scrollTop=chatMsgs.scrollHeight;
  }
  async function sendMsg(){
    const msg=(chatInput.value||"").trim();
    if(!msg||!chatTo) return;
    chatInput.value="";
    await fetch("/chat/send",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ to: chatTo, msg })
    });
    loadChat();
  }

  // ---------- Pânico com localização real ----------
  let panicOn=false;
  let watchId=null;

  async function setPanic(on, coords){
    const payload = on
      ? { on:true, lat:coords.latitude, lon:coords.longitude, acc:coords.accuracy }
      : { on:false };
    await fetch("/api/panic/set",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
  }

  function showAlertBar(text){
    const box=document.getElementById("alertBox");
    let bar=document.getElementById("alertBar");
    if(!bar){
      bar=document.createElement("div");
      bar.className="alertBar";
      bar.id="alertBar";
      box.appendChild(bar);
    }
    bar.textContent=text;
  }

  function removeAlertBar(){
    const bar=document.getElementById("alertBar");
    if(bar) bar.remove();
  }

  async function togglePanic(){
    panicOn=!panicOn;
    document.body.classList.toggle("panic-active", panicOn);
    navPanic.classList.toggle("off", !panicOn);

    if(panicOn){
      showAlertBar("🚨 ATIVO: pedindo localização… (compartilhando ao obter)");
      if(!navigator.geolocation){
        showAlertBar("🚨 ERRO: seu navegador não suporta localização.");
        return;
      }
      watchId = navigator.geolocation.watchPosition(async (pos)=>{
        const c=pos.coords;
        showAlertBar(\`🚨 LOCALIZAÇÃO COMPARTILHADA • lat \${c.latitude.toFixed(5)} • lon \${c.longitude.toFixed(5)} • ±\${Math.round(c.accuracy)}m\`);
        try{ await setPanic(true, c); }catch{}
      }, (err)=>{
        showAlertBar("🚨 LOCALIZAÇÃO NEGADA / DESLIGADA • ative a permissão no navegador.");
      }, { enableHighAccuracy:true, maximumAge:5000, timeout:10000 });
    }else{
      if(watchId!==null) navigator.geolocation.clearWatch(watchId);
      watchId=null;
      removeAlertBar();
      try{ await setPanic(false); }catch{}
    }
  }
  navPanic.onclick=togglePanic;

  // ---------- Trocas + Propostas ----------
  async function createTrade(){
    const title=(document.getElementById("trTitle").value||"").trim();
    const want=(document.getElementById("trWant").value||"").trim();
    const desc=(document.getElementById("trDesc").value||"").trim();
    const url=(document.getElementById("trUrl").value||"").trim();
    const files=[...document.getElementById("trFile").files];
    const msg=document.getElementById("trMsg");
    msg.textContent="";

    let media=[];
    if(url) media.push(url);

    // até 4 arquivos pequenos
    for(const f of files.slice(0,4)){
      if(f.size > 2_500_000){
        msg.textContent="Um arquivo é grande demais. Use menor ou URL.";
        return;
      }
      media.push(await fileToDataUrl(f));
    }

    const r=await fetch("/api/trade/create",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ title, want, desc, media })
    });
    const j=await r.json();
    msg.textContent = j.ok ? "Troca publicada ✅" : ("Erro: "+(j.err||""));

    if(j.ok){
      document.getElementById("trTitle").value="";
      document.getElementById("trWant").value="";
      document.getElementById("trDesc").value="";
      document.getElementById("trUrl").value="";
      document.getElementById("trFile").value="";
      loadTrades();
    }
  }

  function renderMediaThumb(m){
    const isVid = m.startsWith("data:video") || m.endsWith(".mp4") || m.includes("video");
    return isVid
      ? \`<video src="\${m}" style="width:100%;border-radius:14px" controls playsinline></video>\`
      : \`<img src="\${m}" style="width:100%;border-radius:14px;max-height:220px;object-fit:cover" />\`;
  }

  async function loadTrades(){
    const r=await fetch("/api/trades");
    const j=await r.json();
    if(!j.ok) return;

    const box=document.getElementById("tradeList");
    box.innerHTML="<h3>Vitrine de trocas</h3>";

    (j.list||[]).forEach(t=>{
      const card=document.createElement("div");
      card.className="box";
      card.style.marginTop="12px";

      const ownerTag = \`@\${t.user}\`;
      const mediaHtml = (t.media||[]).slice(0,4).map(m=>\`<div style="margin-top:8px">\${renderMediaThumb(m)}</div>\`).join("");

      const offers = (t.offers||[]).slice(-6).reverse().map(o=>{
        const offerMedia = (o.media||[]).slice(0,4).map(m=>\`<div style="margin-top:8px">\${renderMediaThumb(m)}</div>\`).join("");
        return \`
          <div class="box" style="margin-top:10px">
            <div style="font-weight:900">Proposta de @\${o.from}</div>
            <div style="opacity:.85;margin-top:6px">\${o.note ? o.note : "(sem mensagem)"}</div>
            \${offerMedia}
            <div class="row" style="margin-top:10px">
              <button class="btn2" onclick="openChat('@\${o.from}')">💬 Chat</button>
            </div>
          </div>\`;
      }).join("");

      card.innerHTML = \`
        <div style="font-weight:900;font-size:16px">\${ownerTag}</div>
        <div style="opacity:.9;margin-top:6px"><b>📦 Tem:</b> \${escapeHtml(t.title)}</div>
        <div style="opacity:.9;margin-top:4px"><b>🔁 Quer:</b> \${escapeHtml(t.want)}</div>
        \${t.desc ? \`<div style="opacity:.85;margin-top:6px">\${escapeHtml(t.desc)}</div>\` : ""}
        \${mediaHtml}
        <div class="row" style="margin-top:10px">
          <button class="btn2" onclick="openOffer('\${t.id}','\${t.user}')">🤝 Fazer proposta</button>
          <button class="btn2" onclick="openChat('@\${t.user}')">💬 Conversar com dono</button>
        </div>

        <div style="margin-top:12px">
          <div style="font-weight:900">Propostas (lado a lado)</div>
          \${offers || "<div style='opacity:.85;margin-top:6px'>Ainda não tem propostas.</div>"}
        </div>
      \`;
      box.appendChild(card);
    });
  }

  function escapeHtml(s){
    return String(s||"").replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
  }

  async function openOffer(tradeId, owner){
    const note = prompt("Escreva sua proposta (ex: tenho um relógio + fone):") || "";
    // pega até 4 mídias via seletor
    const pick = document.createElement("input");
    pick.type="file";
    pick.accept="image/*,video/*";
    pick.multiple=true;
    pick.onchange = async ()=>{
      const files=[...pick.files].slice(0,4);
      const media=[];
      for(const f of files){
        if(f.size > 2_500_000){
          alert("Arquivo grande demais. Use menor ou envie por URL depois.");
          return;
        }
        media.push(await fileToDataUrl(f));
      }
      const r=await fetch("/api/trade/offer",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ tradeId, note, media })
      });
      const j=await r.json();
      if(!j.ok) alert("Erro: "+(j.err||""));
      else{
        alert("Proposta enviada ✅");
        loadTrades();
        openChat("@"+owner);
      }
    };
    pick.click();
  }

  // ---------- BLUE (ADM) ----------
  async function loadBlue(){
    const el=document.getElementById("blueInfo");
    if(!el) return;
    const r=await fetch("/admin/blue");
    const j=await r.json();
    if(!j.ok) return;
    el.innerHTML = \`Supply: <b>\${j.supply}</b> / <b>\${j.max}</b> BLUE\`;
  }

  async function mintBlue(){
    const v=(document.getElementById("mintVal").value||"").trim();
    const r=await fetch("/admin/mint",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ amount: v })
    });
    const j=await r.json();
    document.getElementById("admMsg").textContent = j.ok ? "Emitido ✅" : ("Erro: "+(j.err||""));
    loadBlue();
  }

  async function giveBlue(){
    const u=(document.getElementById("giveUser").value||"").trim();
    const v=(document.getElementById("giveVal").value||"").trim();
    const r=await fetch("/admin/give",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ user: u, amount: v })
    });
    const j=await r.json();
    document.getElementById("admMsg").textContent = j.ok ? ("Saldo @"+j.user+": "+j.saldoBlue) : ("Erro: "+(j.err||""));
  }

  // init
  openTimeline();
</script>

</body></html>`;
}

/* =================== EXPORT (Vercel) =================== */
module.exports = app;
