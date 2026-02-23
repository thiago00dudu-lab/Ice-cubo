// api/index.js  (Vercel)  — TUDO EM UM ARQUIVO SÓ
const crypto = require("crypto");
const MP = "https://api.mercadopago.com";
const RATE_BRL_TO_BLUE = 1000; // ⭐ 1 real = 1000 BLUE => R$0,05 = 50 BLUE (se o MP aceitar)
// Se o MP recusar 0,05, use R$1,00. (O MP pode ter mínimo)

// ===== "DB" (DEMO) =====
let USERS = global.USERS || {};             // email -> {id,email,ref}
let BAL = global.BAL || {};                 // email -> blue balance
let SITE = global.SITE || { blue: 0 };      // site balance
let CREDITED = global.CREDITED || {};       // paymentId -> true (evita creditar 2x)

let POW = global.POW || {                   // mineração estilo BTC (simulação)
  cap: 21000000,
  minted: 0,
  blocks: 0,
  reward: 50,
  halvEvery: 210000,  // pra testar rápido, coloque 20
  nextHalv: 210000,
  diff: 4,            // dificuldade PoW (3 = mais fácil no celular)
  challenges: {}      // email -> {nonce,ts}
};

global.USERS = USERS;
global.BAL = BAL;
global.SITE = SITE;
global.CREDITED = CREDITED;
global.POW = POW;

function j(res, code, obj) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
}
async function readBody(req) {
  if (req.body) return req.body;
  let raw = "";
  await new Promise((r) => {
    req.on("data", (c) => (raw += c));
    req.on("end", r);
  });
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}
function sha256hex(s) {
  return crypto.createHash("sha256").update(s).digest("hex");
}
function getUser(email) {
  email = String(email || "").trim().toLowerCase();
  if (!email) return null;
  if (!USERS[email]) USERS[email] = { id: email, email, ref: null };
  if (BAL[email] == null) BAL[email] = 0;
  return USERS[email];
}

// ===== BLUE mint helper (cap) =====
function mintBlue(amountBlue) {
  const can = Math.max(0, Math.min(amountBlue, POW.cap - POW.minted));
  POW.minted += can;
  return can;
}

// ===== Depósito split =====
function creditDeposit(email, amountBRL, paymentId) {
  // idempotência
  if (paymentId && CREDITED[paymentId]) return { ok: true, already: true };
  const u = getUser(email);
  if (!u) return { ok: false, error: "email inválido" };

  // Converte BRL -> BLUE
  let totalBlue = amountBRL * RATE_BRL_TO_BLUE;

  // respeita cap
  const minted = mintBlue(totalBlue);
  if (minted <= 0) return { ok: false, error: "Cap 21.000.000 atingido." };
  totalBlue = minted;

  const buyer = totalBlue * 0.85;
  const ref = totalBlue * 0.05;
  const site = totalBlue * 0.05;
  // 5% “extra” (se não tiver pai vai pro site)
  const extra = totalBlue * 0.05;

  BAL[email] = (BAL[email] || 0) + buyer;

  if (u.ref && USERS[u.ref]) {
    BAL[u.ref] = (BAL[u.ref] || 0) + ref;
    SITE.blue += site;
  } else {
    // sem pai: 5% do pai vira do site
    SITE.blue += (ref + site);
  }
  SITE.blue += extra;

  if (paymentId) CREDITED[paymentId] = true;
  return { ok: true, buyer, totalBlue };
}

// ===== Mercado Pago helpers =====
async function mpFetch(path, method, token, bodyObj) {
  const r = await fetch(MP + path, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": Date.now().toString(36) + Math.random().toString(16).slice(2),
    },
    body: bodyObj ? JSON.stringify(bodyObj) : undefined,
  });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, data, status: r.status };
}

// ===== Handler =====
module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, "http://x");
    const action = (url.searchParams.get("a") || "").trim(); // a = ação (tudo no mesmo endpoint)
    const token = process.env.MP_ACCESS_TOKEN;

    // ---------- API ACTIONS ----------
    // REGISTER
    if (action === "register") {
      const b = await readBody(req);
      const email = String(b.email || "").trim().toLowerCase();
      const ref = String(b.ref || "").trim().toLowerCase();

      if (!email) return j(res, 400, { ok: false, error: "email obrigatório" });
      const u = getUser(email);

      // salva ref só se ainda não tem e ref existe
      if (!u.ref && ref && ref !== email) {
        getUser(ref); // garante que existe
        u.ref = ref;
      }
      return j(res, 200, { ok: true, user: u, balance: BAL[email] || 0 });
    }

    // BALANCE
    if (action === "bal") {
      const email = String(url.searchParams.get("email") || "").trim().toLowerCase();
      getUser(email);
      return j(res, 200, { ok: true, balance: BAL[email] || 0, site: SITE.blue || 0, pow: { minted: POW.minted, cap: POW.cap, reward: POW.reward, blocks: POW.blocks } });
    }

    // WITHDRAW (DEMO)
    if (action === "withdraw") {
      const b = await readBody(req);
      const email = String(b.email || "").trim().toLowerCase();
      const amount = Number(b.amount || 0);
      if (!email) return j(res, 400, { ok: false, error: "email obrigatório" });
      getUser(email);
      if (amount < 50) return j(res, 400, { ok: false, error: "Saque mínimo: 50 BLUE" });
      if ((BAL[email] || 0) < amount) return j(res, 400, { ok: false, error: "Saldo insuficiente", balance: BAL[email] || 0 });
      BAL[email] -= amount;
      return j(res, 200, { ok: true, balance: BAL[email] });
    }

    // MINE GET (desafio)
    if (action === "mine_get") {
      const email = String(url.searchParams.get("email") || "").trim().toLowerCase();
      if (!email) return j(res, 400, { ok: false, error: "email obrigatório" });
      getUser(email);
      const nonce = Date.now().toString(36) + Math.random().toString(16).slice(2);
      POW.challenges[email] = { nonce, ts: Date.now() };
      return j(res, 200, { ok: true, nonce, diff: POW.diff, reward: POW.reward, blocks: POW.blocks, minted: POW.minted, cap: POW.cap });
    }

    // MINE POST (solução)
    if (action === "mine") {
      const b = await readBody(req);
      const email = String(b.email || "").trim().toLowerCase();
      const nonce = String(b.nonce || "").trim();
      const sol = String(b.solution || "").trim();
      if (!email || !nonce || !sol) return j(res, 400, { ok: false, error: "Envie {email, nonce, solution}" });

      const ch = POW.challenges[email];
      if (!ch || ch.nonce !== nonce) return j(res, 400, { ok: false, error: "Desafio inválido. Gere outro." });
      if (Date.now() - ch.ts > 5 * 60 * 1000) return j(res, 400, { ok: false, error: "Desafio expirou. Gere outro." });

      const h = sha256hex(nonce + "|" + email + "|" + sol);
      const target = "0".repeat(POW.diff);
      if (!h.startsWith(target)) return j(res, 400, { ok: false, error: "PoW inválido", hash: h });

      delete POW.challenges[email];

      if (POW.minted >= POW.cap) return j(res, 200, { ok: true, cap: true, msg: "Cap atingido" });

      POW.blocks += 1;

      let canMint = Math.min(POW.reward, POW.cap - POW.minted);
      canMint = mintBlue(canMint); // respeita cap
      BAL[email] = (BAL[email] || 0) + canMint;

      if (POW.blocks >= POW.nextHalv) {
        POW.reward = Math.max(0.00000001, POW.reward / 2);
        POW.nextHalv += POW.halvEvery;
      }

      return j(res, 200, { ok: true, mined: canMint, balance: BAL[email], blocks: POW.blocks, reward: POW.reward, minted: POW.minted, cap: POW.cap });
    }

    // MP CREATE PIX
    if (action === "mp_create") {
      if (!token) return j(res, 500, { ok: false, error: "MP_ACCESS_TOKEN não configurado" });
      if (req.method !== "POST") return j(res, 405, { ok: false, error: "Use POST" });

      const b = await readBody(req);
      const email = String(b.email || "").trim().toLowerCase();
      const amount = Number(b.amount || 0);

      if (!email || !amount || Number.isNaN(amount)) return j(res, 400, { ok: false, error: "Envie { email, amount }" });
      getUser(email);

      const transaction_amount = Math.round(amount * 100) / 100;

      const r = await mpFetch("/v1/payments", "POST", token, {
        transaction_amount,
        description: "Compra BLUE - ICE-CUBO",
        payment_method_id: "pix",
        payer: { email },
      });

      if (!r.ok) return j(res, 400, { ok: false, error: r.data });

      const tx = r.data.point_of_interaction?.transaction_data || {};
      return j(res, 200, {
        ok: true,
        paymentId: r.data.id,
        status: r.data.status,
        amount: r.data.transaction_amount,
        qr_code: tx.qr_code || null,
        qr_code_base64: tx.qr_code_base64 || null,
      });
    }

    // MP STATUS (fallback manual)
    if (action === "mp_status") {
      if (!token) return j(res, 500, { ok: false, error: "MP_ACCESS_TOKEN não configurado" });
      const paymentId = String(url.searchParams.get("id") || "").trim();
      const email = String(url.searchParams.get("email") || "").trim().toLowerCase();
      if (!paymentId || !email) return j(res, 400, { ok: false, error: "Envie id e email" });

      const r = await mpFetch(`/v1/payments/${paymentId}`, "GET", token);
      if (!r.ok) return j(res, 400, { ok: false, error: r.data });

      const st = r.data.status;
      if (st === "approved") {
        const out = creditDeposit(email, Number(r.data.transaction_amount || 0), String(r.data.id));
        return j(res, 200, { ok: true, status: st, credited: out.ok, already: out.already || false, balance: BAL[email] || 0 });
      }
      return j(res, 200, { ok: true, status: st, balance: BAL[email] || 0 });
    }

    // MP WEBHOOK (automático)
    if (action === "mp_webhook") {
      // MP envia POST com {type:"payment", data:{id}}
      if (!token) return res.status(200).end();
      if (req.method !== "POST") return res.status(200).end();

      let raw = "";
      await new Promise((r) => { req.on("data", (c) => (raw += c)); req.on("end", r); });
      let data = {};
      try { data = raw ? JSON.parse(raw) : {}; } catch {}

      if (data.type !== "payment") return res.status(200).end();
      const paymentId = data.data?.id;
      if (!paymentId) return res.status(200).end();

      const pr = await mpFetch(`/v1/payments/${paymentId}`, "GET", token);
      if (!pr.ok) return res.status(200).end();

      if (pr.data.status === "approved") {
        const email = String(pr.data.payer?.email || "").trim().toLowerCase();
        const amount = Number(pr.data.transaction_amount || 0);
        if (email && amount) creditDeposit(email, amount, String(pr.data.id));
      }
      return res.status(200).end();
    }

    // ---------- DEFAULT: SERVE O SITE ----------
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    // pega ref do link (?ref=)
    const refFromUrl = (url.searchParams.get("ref") || "").trim().toLowerCase();

    res.statusCode = 200;
    res.end(`<!doctype html><html lang="pt-br"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>ICE-CUBO</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
:root{--bg1:#dff3ff;--bg2:#bfe8ff;--bg3:#072445;--g:rgba(255,255,255,.60);--l:rgba(7,36,69,.18);--t:#06223f;--m:#2b587d;--a:#0ea5e9}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;color:var(--t);height:100vh;overflow:hidden;
background:radial-gradient(1200px 700px at 15% -10%,rgba(255,255,255,.85),transparent 55%),
radial-gradient(900px 700px at 110% 20%,rgba(56,189,248,.25),transparent 60%),
linear-gradient(180deg,var(--bg1),var(--bg2) 45%,#7dd3fc 70%,#2aa9ff 86%,var(--bg3));}
body:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.35;mix-blend-mode:multiply;
background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cg fill='none'%3E%3Cpath d='M60 10c6 10 6 20 0 30c-6-10-6-20 0-30Z' fill='%230ea5e9' opacity='.35'/%3E%3Cpath d='M35 35c10 6 20 6 30 0c-10-6-20-6-30 0Z' fill='%230ea5e9' opacity='.25'/%3E%3Cpath d='M85 35c-10 6-20 6-30 0c10-6 20-6 30 0Z' fill='%230ea5e9' opacity='.25'/%3E%3Ccircle cx='22' cy='88' r='3' fill='%23ffffff' opacity='.35'/%3E%3Ccircle cx='35' cy='98' r='2' fill='%23ffffff' opacity='.25'/%3E%3Ccircle cx='48' cy='88' r='2' fill='%23ffffff' opacity='.2'/%3E%3Cpath d='M82 86c8-10 12-18 4-28c-9 6-14 12-4 28Z' fill='%230b5fa5' opacity='.22'/%3E%3Cpath d='M82 86c2-6 8-10 12-12' stroke='%230b5fa5' opacity='.22' stroke-width='2' stroke-linecap='round'/%3E%3Cpath d='M82 86c-2-6-8-10-12-12' stroke='%230b5fa5' opacity='.22' stroke-width='2' stroke-linecap='round'/%3E%3C/g%3E%3C/svg%3E");background-size:140px 140px;}
button{cursor:pointer;border:0}input{font:inherit}
.wrap{height:100vh;display:flex;flex-direction:column}
.top{height:42vh;position:relative;border-radius:0 0 26px 26px;overflow:hidden;background:rgba(0,0,0,.06)}
.bub:before,.bub:after{content:"";position:absolute;inset:-20%;background:
radial-gradient(circle,rgba(255,255,255,.35) 0 2px,transparent 3px) 0 0/120px 120px,
radial-gradient(circle,rgba(255,255,255,.22) 0 1px,transparent 2px) 40px 20px/160px 160px;
animation:float 14s linear infinite;opacity:.55}
.bub:after{animation-duration:20s;opacity:.35;transform:scale(1.15)}
@keyframes float{to{transform:translateY(-120px)}}
.brand{position:absolute;top:10px;left:12px;right:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:3}
.logo{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(10px);border-radius:18px}
.bear{width:44px;height:44px;border-radius:16px;border:1px solid rgba(7,36,69,.14);background:rgba(255,255,255,.65);display:grid;place-items:center;overflow:hidden}
@keyframes paw{0%,100%{transform:translate(0,0) rotate(-3deg)}50%{transform:translate(2px,-1px) rotate(6deg)}}
@keyframes coin{0%,100%{transform:translate(0,0)}50%{transform:translate(0,-1px)}}
.paw{transform-origin:24px 24px;animation:paw 1.1s ease-in-out infinite}
.coinAnim{transform-origin:22px 26px;animation:coin 1.1s ease-in-out infinite}
.pill{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(10px);border-radius:18px}
.coin{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 30% 30%,#38bdf8,#0b2a6a);
border:1px solid rgba(255,215,0,.55);box-shadow:0 0 0 2px rgba(255,215,0,.18) inset}
.coin span{color:#ffd700;font-weight:1000}
.mid{flex:1;overflow:auto;padding:12px 12px 80px}
.card{background:rgba(255,255,255,.65);border:1px solid var(--l);border-radius:18px;padding:12px;margin:10px 0;backdrop-filter:blur(10px)}
h1,h2{margin:0 0 8px} .mut{color:var(--m);font-size:12px}
.btn{padding:12px 12px;border-radius:16px;background:rgba(14,165,233,.16);border:1px solid rgba(14,165,233,.25);color:#075985;font-weight:900}
.row{display:flex;gap:10px;flex-wrap:wrap}
.field{flex:1;min-width:170px}
.field input{width:100%;padding:12px;border-radius:14px;border:1px solid rgba(7,36,69,.14);background:rgba(255,255,255,.85)}
.nav{position:fixed;left:10px;right:10px;bottom:10px;display:flex;gap:10px}
.nav button{flex:1;padding:12px 10px;border-radius:20px;border:1px solid var(--l);background:rgba(255,255,255,.65);backdrop-filter:blur(14px);color:var(--t);display:flex;align-items:center;justify-content:center;gap:8px;font-weight:900}
pre{white-space:pre-wrap;word-break:break-word;background:rgba(0,0,0,.06);padding:10px;border-radius:14px;border:1px solid rgba(7,36,69,.12)}
img.qr{width:220px;max-width:100%;border-radius:14px;border:1px solid rgba(7,36,69,.12);background:#fff;padding:8px}
</style></head><body>
<div class="wrap">
  <div class="top bub">
    <div class="brand">
      <div class="logo">
        <div class="bear" title="urso tentando tirar BLUE">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="ice" x1="10" y1="20" x2="50" y2="54">
                <stop stop-color="#9ae6ff" stop-opacity=".9"/><stop offset="1" stop-color="#1f4ed8" stop-opacity=".55"/>
              </linearGradient>
              <radialGradient id="gold" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(34 36) rotate(45) scale(18)">
                <stop stop-color="#ffeaa7"/><stop offset="1" stop-color="#ffb703"/>
              </radialGradient>
            </defs>
            <rect x="10" y="26" width="40" height="28" rx="6" fill="url(#ice)" stroke="rgba(255,255,255,.35)"/>
            <g class="coinAnim">
              <circle cx="30" cy="40" r="10" fill="url(#gold)" stroke="rgba(255,215,0,.65)"/>
              <path d="M30 33v14M24 36h10a4 4 0 0 1 0 8H24" stroke="#0b2a6a" stroke-width="3" stroke-linecap="round"/>
            </g>
            <g class="paw">
              <circle cx="50" cy="24" r="10" fill="rgba(255,255,255,.95)"/>
              <circle cx="44" cy="18" r="3" fill="rgba(255,255,255,.95)"/>
              <circle cx="56" cy="18" r="3" fill="rgba(255,255,255,.95)"/>
              <circle cx="50" cy="25" r="2" fill="#0b2a6a"/>
            </g>
          </svg>
        </div>
        <div>
          <div style="font-weight:1000;letter-spacing:1.1px">ICE-CUBO</div>
          <div class="mut">depósito • mineração • indicação</div>
        </div>
      </div>
      <div class="pill" title="BLUE">
        <div class="coin"><span>B</span></div>
        <div>
          <div style="font-weight:1000" id="blueBal">0.000000 BLUE</div>
          <div class="mut" id="blueInfo">cap 21.000.000</div>
        </div>
      </div>
    </div>
  </div>

  <div class="mid">
    <div class="card" id="loginCard">
      <h2><i class="fa-solid fa-right-to-bracket"></i> Entrar</h2>
      <div class="mut">Cole seu email. Indicação é opcional.</div>
      <div class="row" style="margin-top:10px">
        <div class="field"><input id="email" placeholder="seu@email.com"></div>
        <div class="field"><input id="ref" placeholder="pai (email) opcional" value="${refFromUrl || ""}"></div>
      </div>
      <div style="margin-top:10px" class="row">
        <button class="btn" onclick="entrar()">Entrar</button>
      </div>
    </div>

    <div id="panel" style="display:none">
      <div class="card">
        <h2><i class="fa-solid fa-wallet"></i> Seu saldo</h2>
        <div style="font-size:26px;font-weight:1000" id="saldo">0.000000</div>
        <div class="mut" id="net"></div>
      </div>

      <div class="card">
        <h2><i class="fa-solid fa-qrcode"></i> Depósito PIX (Mercado Pago)</h2>
        <div class="mut">Teste: R$0,05 vira 50 BLUE (se o MP aceitar). Se falhar, teste R$1,00.</div>
        <div class="row" style="margin-top:10px">
          <div class="field"><input id="valor" placeholder="valor em R$ (ex: 0.05)"></div>
          <button class="btn" onclick="depositar()">Gerar PIX</button>
        </div>
        <div id="pixBox" style="margin-top:10px"></div>
      </div>

      <div class="card">
        <h2><i class="fa-solid fa-hammer"></i> Minerar BLUE (estilo BTC)</h2>
        <div class="mut">50 BLUE/bloco • halving por blocos • cap 21M • blocos continuam sempre</div>
        <button class="btn" onclick="minerar()">Minerar 1 bloco</button>
        <div id="mineStatus" class="mut" style="margin-top:10px"></div>
      </div>

      <div class="card">
        <h2><i class="fa-solid fa-arrow-up-right-dots"></i> Saque</h2>
        <div class="mut">Saque mínimo: 50 BLUE</div>
        <div class="row" style="margin-top:10px">
          <div class="field"><input id="saque" placeholder="quantidade BLUE (mín. 50)"></div>
          <button class="btn" onclick="sacar()">Solicitar</button>
        </div>
        <div id="wmsg" class="mut" style="margin-top:10px"></div>
      </div>

      <div class="card">
        <h2><i class="fa-solid fa-share-nodes"></i> Indicação</h2>
        <div class="mut">5% de cada depósito do seu filho é seu. Se não tiver pai, esses 5% vão pro site.</div>
        <div class="mut" style="margin-top:10px">Seu link:</div>
        <pre id="link"></pre>
        <button class="btn" onclick="copiar()">Copiar link</button>
      </div>
    </div>
  </div>

  <div class="nav">
    <button onclick="atualizar()"><i class="fa-solid fa-rotate"></i> Atualizar</button>
    <button onclick="logout()"><i class="fa-solid fa-right-from-bracket"></i> Sair</button>
  </div>
</div>

<script>
let email = localStorage.getItem("ice_email") || "";
let lastPaymentId = localStorage.getItem("ice_last_pay") || "";

function fmt(n){ return Number(n||0).toFixed(6); }

function showPanel(on){
  document.getElementById("loginCard").style.display = on ? "none" : "block";
  document.getElementById("panel").style.display = on ? "block" : "none";
}

async function entrar(){
  const e = (document.getElementById("email").value || "").trim().toLowerCase();
  const ref = (document.getElementById("ref").value || "").trim().toLowerCase();
  if(!e) return alert("Digite um email");
  email = e;
  localStorage.setItem("ice_email", email);
  await fetch("?a=register", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ email, ref }) }).catch(()=>{});
  showPanel(true);
  document.getElementById("link").textContent = location.origin + location.pathname + "?ref=" + encodeURIComponent(email);
  atualizar();
}

function logout(){
  localStorage.removeItem("ice_email");
  email="";
  showPanel(false);
}

async function atualizar(){
  if(!email) return;
  const d = await fetch("?a=bal&email="+encodeURIComponent(email)).then(r=>r.json()).catch(()=>({}));
  if(!d.ok) return;
  document.getElementById("saldo").textContent = fmt(d.balance);
  document.getElementById("blueBal").textContent = fmt(d.balance) + " BLUE";
  document.getElementById("blueInfo").textContent = "cap 21.000.000 • minted " + Math.floor(d.pow.minted).toLocaleString("pt-BR") + " • reward " + d.pow.reward;
  document.getElementById("net").textContent = "Site BLUE (demo): " + fmt(d.site) + " • Blocos: " + d.pow.blocks;
}

async function depositar(){
  if(!email) return alert("Entre primeiro.");
  const amount = Number(document.getElementById("valor").value || 0);
  if(!amount) return alert("Digite um valor");
  const box = document.getElementById("pixBox");
  box.innerHTML = "Gerando PIX…";

  const r = await fetch("?a=mp_create", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ email, amount })
  }).then(r=>r.json()).catch(()=>({ok:false}));

  if(!r.ok){
    box.innerHTML = "<b>Erro:</b> " + (typeof r.error==="string" ? r.error : JSON.stringify(r.error));
    return;
  }

  lastPaymentId = r.paymentId;
  localStorage.setItem("ice_last_pay", lastPaymentId);

  const img = r.qr_code_base64 ? \`<img class="qr" src="data:image/png;base64,\${r.qr_code_base64}">\` : "";
  const code = r.qr_code ? \`<pre>\${r.qr_code}</pre>\` : "";

  box.innerHTML = \`
    <div class="mut">Pague o PIX. O crédito entra automático via webhook. Se demorar, clique Verificar.</div>
    <div style="margin-top:10px">\${img}</div>
    <div style="margin-top:10px">\${code}</div>
    <button class="btn" style="margin-top:10px" onclick="verificar()">Verificar pagamento</button>
  \`;
}

async function verificar(){
  if(!email || !lastPaymentId) return alert("Sem pagamento para verificar.");
  const box = document.getElementById("pixBox");
  box.insertAdjacentHTML("beforeend", "<div class='mut' style='margin-top:8px'>Verificando…</div>");
  const r = await fetch("?a=mp_status&id="+encodeURIComponent(lastPaymentId)+"&email="+encodeURIComponent(email)).then(r=>r.json()).catch(()=>({}));
  if(r.ok){
    box.insertAdjacentHTML("beforeend", "<div class='mut'>Status: <b>"+r.status+"</b> • saldo: "+fmt(r.balance)+"</div>");
    atualizar();
  }
}

async function sacar(){
  const v = Number(document.getElementById("saque").value||0);
  const w = document.getElementById("wmsg");
  w.textContent = "Enviando…";
  const r = await fetch("?a=withdraw", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ email, amount:v }) }).then(r=>r.json()).catch(()=>({}));
  w.textContent = r.ok ? ("✅ OK • saldo: "+fmt(r.balance)) : ("❌ " + (r.error||"erro"));
  atualizar();
}

async function sha256hex(str){
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(str));
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("");
}

async function minerar(){
  if(!email) return alert("Entre primeiro.");
  const st = document.getElementById("mineStatus");
  st.textContent = "Gerando desafio…";

  const ch = await fetch("?a=mine_get&email="+encodeURIComponent(email)).then(r=>r.json()).catch(()=>({ok:false}));
  if(!ch.ok) return st.textContent = "Erro: "+(ch.error||"");

  const diff = ch.diff, nonce = ch.nonce, target = "0".repeat(diff);
  st.textContent = "Minerando… (no celular pode levar alguns segundos)";

  let sol = 0, tries = 0;
  while(true){
    const h = await sha256hex(nonce + "|" + email + "|" + sol);
    tries++;
    if(h.startsWith(target)) break;
    sol++;
    if(tries % 250 === 0) st.textContent = "Minerando… tentativas: " + tries;
  }

  st.textContent = "Enviando bloco…";
  const out = await fetch("?a=mine", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ email, nonce, solution:String(sol) }) }).then(r=>r.json()).catch(()=>({ok:false}));
  if(!out.ok) return st.textContent = "Falhou: " + (out.error||"");

  st.textContent = "✅ Bloco minerado! +" + out.mined + " BLUE • Blocos: " + out.blocks + " • Reward: " + out.reward;
  atualizar();
}

function copiar(){
  const t = document.getElementById("link").textContent;
  navigator.clipboard?.writeText(t).then(()=>alert("Link copiado ✅")).catch(()=>alert("Copie manualmente 👍"));
}

// auto-login
if(email){
  showPanel(true);
  document.getElementById("link").textContent = location.origin + location.pathname + "?ref=" + encodeURIComponent(email);
  atualizar();
} else {
  showPanel(false);
}
</script></body></html>`);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Erro: " + e.message);
  }
};
