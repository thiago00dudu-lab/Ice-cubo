// /api/index.js — ICE-CUBO (UM arquivo) — Vercel Serverless
// PIX/QR REAL via Mercado Pago Payments API (payment_method_id="pix")
// Requer ENV no Vercel (Production): MP_ACCESS_TOKEN = APP_USR-...
// Opcional: BASE_URL=https://seuprojeto.vercel.app (pra webhook/links, aqui não é obrigatório)

const https = require("https");
const { URL } = require("url");

const ADM_LOGIN = "ADM";
const ADM_SENHA = "1533";

const MP_ACCESS_TOKEN = (process.env.MP_ACCESS_TOKEN || "").trim();
const BASE_URL = (process.env.BASE_URL || "").trim();

function sendHTML(res, html) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(html);
}
function sendJSON(res, code, obj) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
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
function safeBaseUrl() {
  if (!BASE_URL) return "";
  return BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
}

// =============== API ===============
async function mpCreatePixPayment({ amountBRL, user, email }) {
  if (!MP_ACCESS_TOKEN) {
    return { ok: false, err: "Falta MP_ACCESS_TOKEN no Vercel (Production)." };
  }
  // Mercado Pago exige payer.email válido
  if (!email || !String(email).includes("@")) {
    return { ok: false, err: "Informe um e-mail válido no Perfil (ex: seuemail@gmail.com)." };
  }
  const amount = Number(amountBRL);
  if (!amount || amount < 1) return { ok: false, err: "Valor mínimo 1." };

  // External reference ajuda a identificar
  const external_reference = `icecubo:${user}:${Date.now()}`;

  const body = {
    transaction_amount: Number(amount.toFixed(2)),
    description: `Depósito ICE-CUBO (${user})`,
    payment_method_id: "pix",
    payer: { email: String(email).trim() },
    external_reference,
  };

  const r = await httpJSON(
    "POST",
    "https://api.mercadopago.com/v1/payments",
    { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    body
  );

  if (r.status < 200 || r.status >= 300) {
    return { ok: false, err: "Mercado Pago erro ao criar PIX", detail: r.json || r.text };
  }

  const p = r.json || {};
  const t = p.point_of_interaction?.transaction_data || {};
  return {
    ok: true,
    payment_id: p.id,
    status: p.status,
    status_detail: p.status_detail,
    qr_code: t.qr_code || "",
    qr_code_base64: t.qr_code_base64 || "",
  };
}

async function mpGetPayment(paymentId) {
  if (!MP_ACCESS_TOKEN) return { ok: false, err: "Falta MP_ACCESS_TOKEN." };
  const id = String(paymentId || "").trim();
  if (!id) return { ok: false, err: "payment_id inválido." };

  const r = await httpJSON(
    "GET",
    `https://api.mercadopago.com/v1/payments/${encodeURIComponent(id)}`,
    { Authorization: `Bearer ${MP_ACCESS_TOKEN}` }
  );

  if (r.status < 200 || r.status >= 300) {
    return { ok: false, err: "Erro ao consultar pagamento", detail: r.json || r.text };
  }
  const p = r.json || {};
  return {
    ok: true,
    status: p.status,
    status_detail: p.status_detail,
    transaction_amount: p.transaction_amount,
    external_reference: p.external_reference,
  };
}

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, "https://local/");
    const op = url.searchParams.get("op") || "";

    if (op === "health") return sendJSON(res, 200, { ok: true, msg: "ICE-CUBO online" });

    if (op === "pix_create") {
      const raw = await readBody(req);
      let body = {};
      try { body = raw ? JSON.parse(raw) : {}; } catch { body = {}; }
      const out = await mpCreatePixPayment({
        amountBRL: body.amount,
        user: body.user,
        email: body.email,
      });
      return sendJSON(res, out.ok ? 200 : 400, out);
    }

    if (op === "pix_status") {
      const pid = url.searchParams.get("id") || "";
      const out = await mpGetPayment(pid);
      return sendJSON(res, out.ok ? 200 : 400, out);
    }

    // =============== UI ===============
    return sendHTML(res, `<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<title>ICE-CUBO</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
:root{
  --bgA:#001a33;--bgB:#004b7a;--card:rgba(255,255,255,.08);--bd:rgba(255,255,255,.12);
  --txt:#eaf6ff;--mut:rgba(234,246,255,.7);--a:#38bdf8;--ok:#22c55e;--warn:#f59e0b;--bad:#ef4444;
  --shadow:0 18px 45px rgba(0,0,0,.35);
}
*{box-sizing:border-box}html,body{height:100%}
body{
  margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;color:var(--txt);overflow:hidden;
  background:
    radial-gradient(1000px 600px at 20% -10%, rgba(56,189,248,.25), transparent 55%),
    radial-gradient(900px 700px at 120% 20%, rgba(34,197,94,.12), transparent 55%),
    linear-gradient(180deg, var(--bgA), var(--bgB));
}
#ocean:before,#ocean:after{
  content:"";position:fixed;inset:-20%;pointer-events:none;opacity:.55;
  background:
    radial-gradient(circle, rgba(255,255,255,.30) 0 2px, transparent 3px) 0 0/120px 120px,
    radial-gradient(circle, rgba(255,255,255,.16) 0 1px, transparent 2px) 40px 20px/160px 160px;
  animation:float 16s linear infinite;
}
#ocean:after{opacity:.30;animation-duration:24s;transform:scale(1.15)}
@keyframes float{to{transform:translateY(-140px)}}

#app{height:100%;display:flex;flex-direction:column}
.top{
  height:52vh;position:relative;overflow:hidden;border-radius:0 0 26px 26px;
  background:rgba(0,0,0,.22);
  box-shadow:var(--shadow);
}
.brand{
  position:absolute;top:10px;left:12px;right:12px;z-index:5;
  display:flex;align-items:center;justify-content:space-between;gap:10px;
}
.pill{
  display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--bd);
  background:rgba(0,0,0,.25);backdrop-filter:blur(10px);border-radius:18px;
}
.namebox{display:flex;align-items:center;gap:10px}
.logo{
  width:42px;height:42px;border-radius:14px;display:grid;place-items:center;
  background:linear-gradient(180deg, rgba(56,189,248,.9), rgba(14,165,233,.35));
  border:1px solid var(--bd);
}
.brandname{display:flex;flex-direction:column;line-height:1.05}
.brandname b{letter-spacing:1.3px;font-size:15px}
.brandname small{color:var(--mut);font-size:11px}

.bearWrap{display:flex;align-items:center;gap:8px}
.bear{
  width:46px;height:46px;filter:drop-shadow(0 10px 20px rgba(0,0,0,.35));
  animation:bear 1.9s ease-in-out infinite;
}
@keyframes bear{
  0%{transform:translateY(0) rotate(0deg)}
  30%{transform:translateY(-2px) rotate(-3deg)}
  60%{transform:translateY(1px) rotate(3deg)}
  100%{transform:translateY(0) rotate(0deg)}
}
.coin{
  width:30px;height:30px;border-radius:50%;display:grid;place-items:center;
  background:radial-gradient(circle at 30% 30%, #38bdf8, #0b2a6a);
  border:1px solid rgba(255,215,0,.55);
  box-shadow:0 0 0 2px rgba(255,215,0,.18) inset;
}
.coin span{color:#ffd700;font-weight:1000}

.viewer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
#stageCam{width:100%;height:100%;object-fit:cover;display:none}
#stageMedia{width:100%;height:100%;display:none}
#stageHint{
  text-align:center;padding:22px;border-radius:18px;border:1px solid var(--bd);
  background:rgba(0,0,0,.25);backdrop-filter:blur(10px);
}
#stageHint b{font-size:20px;color:var(--a)}
#stageHint small{display:block;color:var(--mut);margin-top:8px}

.stageBar{
  position:absolute;left:12px;right:12px;bottom:12px;z-index:5;
  display:flex;gap:10px;align-items:center;justify-content:space-between;
}
.card{flex:1;padding:10px 12px;border:1px solid var(--bd);border-radius:18px;background:rgba(0,0,0,.25);backdrop-filter:blur(10px)}
.row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.btn{
  border:0;border-radius:16px;padding:10px 12px;background:rgba(56,189,248,.22);
  color:var(--txt);border:1px solid rgba(56,189,248,.28)
}
.btn:active{transform:scale(.98)}
.btn.ok{background:rgba(34,197,94,.20);border-color:rgba(34,197,94,.32)}
.btn.warn{background:rgba(245,158,11,.20);border-color:rgba(245,158,11,.32)}
.btn.bad{background:rgba(239,68,68,.18);border-color:rgba(239,68,68,.30)}
.muted{color:var(--mut);font-size:12px}
.big{font-weight:900}
.starG{color:#ffd700}
.starB{color:#60a5fa}

.main{flex:1;overflow:auto;padding:12px 12px 92px}
.panel{display:none}
.panel.on{display:block}
.hrow{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:8px 0}
.input,textarea{
  width:100%;padding:12px 12px;border-radius:16px;border:1px solid var(--bd);
  background:rgba(0,0,0,.18);color:var(--txt);outline:none;
}
textarea{min-height:88px;resize:none}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.thumb{
  border-radius:18px;overflow:hidden;border:1px solid var(--bd);background:rgba(0,0,0,.22);
  box-shadow:0 10px 22px rgba(0,0,0,.22);
  cursor:pointer;
}
.thumb img,.thumb video{width:100%;height:150px;object-fit:cover;display:block}
.tag{display:flex;gap:8px;align-items:center;font-size:12px;color:var(--mut);padding:8px 10px}
hr{border:0;border-top:1px solid rgba(255,255,255,.10);margin:12px 0}

.nav{
  position:fixed;left:12px;right:12px;bottom:12px;z-index:10;
  display:flex;gap:10px;justify-content:space-around;
  padding:10px;border-radius:22px;border:1px solid var(--bd);
  background:rgba(0,0,0,.30);backdrop-filter:blur(12px);
}
.nav button{
  flex:1;border:0;background:transparent;color:var(--mut);
  padding:8px;border-radius:16px;display:flex;flex-direction:column;gap:6px;align-items:center
}
.nav button.on{color:var(--txt);background:rgba(56,189,248,.16);border:1px solid rgba(56,189,248,.22)}
.nav i{font-size:18px}
.badge{font-size:11px;color:var(--mut)}

.promoMine{
  position:fixed;right:16px;bottom:96px;z-index:20;
  width:56px;height:56px;border-radius:18px;
  display:none;place-items:center;
  border:1px solid rgba(255,255,255,.18);
  background:rgba(245,158,11,.22);
  backdrop-filter:blur(10px);
  box-shadow:0 16px 30px rgba(0,0,0,.35);
}
.promoMine.on{display:grid;animation:pulse 1.2s ease-in-out infinite}
.promoMine i{font-size:22px}
.promoMine small{font-size:10px;color:rgba(255,255,255,.85);margin-top:-6px}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}

.qrBox{
  border:1px solid rgba(255,255,255,.14);
  background:rgba(0,0,0,.22);
  border-radius:16px;
  padding:12px;
}
.qrImg{width:100%;max-width:320px;border-radius:14px;border:1px solid rgba(255,255,255,.12);display:block}
.code{
  word-break:break-all;
  font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size:12px;color:rgba(255,255,255,.85);
  padding:10px;border-radius:14px;border:1px solid rgba(255,255,255,.12);
  background:rgba(0,0,0,.20);
}
</style>
</head>
<body>
<div id="ocean"></div>

<button class="promoMine" id="promoMine">
  <i class="fa-solid fa-gift"></i>
  <small>BÔNUS</small>
</button>

<div id="app">
  <div class="top">
    <div class="brand">
      <div class="pill namebox">
        <div class="logo"><b>IC</b></div>
        <div class="bearWrap">
          <svg class="bear" viewBox="0 0 64 64" aria-hidden="true">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#bfe8ff"/>
              </linearGradient>
            </defs>
            <path d="M14 28c0-10 8-18 18-18s18 8 18 18v10c0 10-8 18-18 18S14 48 14 38V28Z" fill="url(#g1)" opacity=".95"/>
            <circle cx="24" cy="18" r="6" fill="#fff"/><circle cx="40" cy="18" r="6" fill="#fff"/>
            <circle cx="24" cy="18" r="3" fill="#cfefff"/><circle cx="40" cy="18" r="3" fill="#cfefff"/>
            <circle cx="26" cy="30" r="2" fill="#0b2a6a"/><circle cx="38" cy="30" r="2" fill="#0b2a6a"/>
            <path d="M30 34c2 2 2 4 0 6c-2-2-2-4 0-6Z" fill="#0b2a6a"/>
            <path d="M20 40c4 6 20 6 24 0" stroke="#0b2a6a" stroke-width="3" stroke-linecap="round" opacity=".55"/>
          </svg>
          <div class="brandname">
            <b>ICE-CUBO <span id="roleMark"></span></b>
            <small id="subTitle">Timeline • Perfil • Carteira</small>
          </div>
        </div>
      </div>

      <div class="pill">
        <div class="coin"><span>B</span></div>
        <div class="brandname">
          <b><span id="blueBal">0</span> BLUE</b>
          <small id="whoLine">deslogado</small>
        </div>
      </div>
    </div>

    <div class="viewer">
      <video id="stageCam" autoplay playsinline muted></video>
      <div id="stageMedia"></div>
      <div id="stageHint">
        <b>ICE-CUBO</b><br/>
        <small>poste, clique no post pra subir no visor, ou abra a câmera (LIVE).</small>
      </div>
    </div>

    <div class="stageBar">
      <div class="card">
        <div class="row" style="justify-content:space-between">
          <div>
            <div class="big" id="stageTitle">Visor</div>
            <div class="muted" id="stageSub">Clique em um post na Timeline</div>
          </div>
          <div class="row">
            <button class="btn ok" id="camBtn"><i class="fa-solid fa-video"></i> LIVE</button>
            <button class="btn warn" id="mineBtn"><i class="fa-solid fa-hammer"></i> Minerar bônus</button>
          </div>
        </div>
        <div class="muted" id="stageMsg" style="margin-top:8px">—</div>
      </div>
    </div>
  </div>

  <div class="main">
    <!-- PERFIL -->
    <div class="panel on" id="pPerfil">
      <div class="hrow">
        <h3 style="margin:0"><i class="fa-solid fa-user"></i> Seu perfil</h3>
        <span class="muted">poste foto/vídeo</span>
      </div>

      <div class="card" style="margin-bottom:10px">
        <div class="muted">Entrar / Criar conta <span style="float:right">ADM é intocável</span></div>
        <div class="row" style="margin-top:10px">
          <input class="input" id="loginUser" placeholder="usuário" autocomplete="off"/>
          <input class="input" id="loginPass" placeholder="senha" type="password"/>
        </div>
        <div class="row" style="margin-top:10px">
          <button class="btn ok" id="btnLogin"><i class="fa-solid fa-right-to-bracket"></i> Entrar</button>
          <button class="btn" id="btnCreate"><i class="fa-solid fa-user-plus"></i> Criar</button>
          <button class="btn bad" id="btnLogout"><i class="fa-solid fa-power-off"></i></button>
        </div>
        <div class="muted" id="refNote" style="margin-top:10px"></div>
      </div>

      <div class="card" style="margin-bottom:10px">
        <div class="hrow"><b><i class="fa-solid fa-at"></i> E-mail (obrigatório pro PIX)</b><span class="muted" id="mailInfo">—</span></div>
        <div class="row">
          <input class="input" id="emailInp" placeholder="seuemail@gmail.com"/>
          <button class="btn ok" id="saveEmail"><i class="fa-solid fa-floppy-disk"></i> Salvar</button>
        </div>
        <div class="muted" style="margin-top:8px">Sem e-mail, o Mercado Pago pode negar a criação do PIX.</div>
      </div>

      <div class="card">
        <div class="hrow"><b><i class="fa-solid fa-upload"></i> Postar</b><span class="muted" id="pickInfo">nenhum arquivo</span></div>
        <div class="row">
          <label class="btn">
            <i class="fa-solid fa-image"></i> Galeria
            <input id="filePick" type="file" accept="image/*,video/*" style="display:none">
          </label>
          <button class="btn ok" id="postBtn"><i class="fa-solid fa-bolt"></i> Postar</button>
        </div>
      </div>

      <div class="card" style="margin-top:10px">
        <div class="hrow"><b><i class="fa-solid fa-users"></i> Seguindo</b><span class="muted" id="followCount">0</span></div>
        <div class="muted" id="followList">—</div>
        <hr>
        <div class="hrow"><b><i class="fa-solid fa-sitemap"></i> Filhos</b><span class="muted" id="childCount">0</span></div>
        <div class="muted" id="childList">—</div>
        <hr>
        <div class="muted">Seu link (pra ganhar filhos):</div>
        <div class="row">
          <input class="input" id="myRef" readonly />
          <button class="btn" id="copyRef"><i class="fa-solid fa-copy"></i></button>
        </div>
        <div class="muted" style="margin-top:8px"><b>Bônus mineração:</b> <span id="mineBonusLine">0</span> BLUE</div>
      </div>
    </div>

    <!-- TIMELINE -->
    <div class="panel" id="pTimeline">
      <div class="hrow">
        <h3 style="margin:0"><i class="fa-solid fa-layer-group"></i> Timeline</h3>
        <span class="muted">clique no post → sobe no visor</span>
      </div>
      <div class="card">
        <div class="row">
          <input class="input" id="searchUser" placeholder="seguir usuário (ex: maria)" />
          <button class="btn ok" id="followBtn"><i class="fa-solid fa-user-plus"></i> Seguir</button>
        </div>
        <div class="muted" style="margin-top:8px" id="feedNote">Camada 1: seguindo/filhos • Camada 2: todos</div>
      </div>

      <div style="font-weight:900;margin:10px 0 6px">Seguindo/Filhos</div>
      <div class="grid" id="feedFollow"></div>

      <div style="font-weight:900;margin:14px 0 6px">Todos</div>
      <div class="grid" id="feedAll"></div>
    </div>

    <!-- CARTEIRA -->
    <div class="panel" id="pWallet">
      <div class="hrow">
        <h3 style="margin:0"><i class="fa-solid fa-wallet"></i> Carteira</h3>
        <span class="muted">PIX / QR</span>
      </div>

      <div class="card">
        <div class="muted"><b>Depósito</b> (PIX / QR Code — sem cartão)</div>
        <div class="row" style="margin-top:10px">
          <input class="input" id="depVal" placeholder="valor (mín 1)" inputmode="decimal"/>
          <button class="btn ok" id="depBtn"><i class="fa-brands fa-pix"></i> Gerar PIX</button>
        </div>

        <div id="qrArea" class="qrBox" style="margin-top:12px;display:none">
          <div class="muted" style="margin-bottom:8px">QR Code:</div>
          <img id="qrImg" class="qrImg" alt="QR PIX"/>
          <div class="muted" style="margin:12px 0 8px">Copia e cola:</div>
          <div id="qrCode" class="code"></div>
          <div class="row" style="margin-top:12px">
            <button class="btn" id="copyPix"><i class="fa-solid fa-copy"></i> Copiar</button>
            <button class="btn warn" id="paidBtn"><i class="fa-solid fa-circle-check"></i> Já paguei</button>
          </div>
          <div class="muted" id="pixMsg" style="margin-top:8px">—</div>
        </div>

        <div class="muted" id="depMsg" style="margin-top:10px">—</div>
      </div>

      <div class="card" style="margin-top:10px">
        <div class="muted"><b>Saque</b> (protótipo: vira pedido pro ADM)</div>
        <div class="row" style="margin-top:10px">
          <input class="input" id="wdVal" placeholder="valor para sacar" inputmode="decimal"/>
          <button class="btn warn" id="wdBtn"><i class="fa-solid fa-paper-plane"></i> Solicitar</button>
        </div>
        <div class="muted" id="wdMsg" style="margin-top:8px"></div>
      </div>

      <div class="card" style="margin-top:10px">
        <div class="hrow"><b><i class="fa-solid fa-clock-rotate-left"></i> Histórico</b><span class="muted" id="histCount">0</span></div>
        <div class="muted" id="histList">—</div>
      </div>
    </div>

    <!-- ADM -->
    <div class="panel" id="pADM">
      <div class="hrow">
        <h3 style="margin:0"><i class="fa-solid fa-shield-halved"></i> ADM</h3>
        <span class="muted">somente ADM</span>
      </div>
      <div class="card">
        <div class="muted"><b>Regras</b>: ADM intocável. MOD estrela azul.</div>
        <hr>
        <div class="row">
          <input class="input" id="modUser" placeholder="usuário para virar moderador" />
          <button class="btn ok" id="makeMod"><i class="fa-solid fa-star"></i> Promover</button>
        </div>
        <div class="row" style="margin-top:10px">
          <input class="input" id="banUser" placeholder="usuário para banir" />
          <button class="btn bad" id="banBtn"><i class="fa-solid fa-ban"></i> Banir</button>
        </div>
        <hr>
        <div class="hrow"><b><i class="fa-solid fa-money-check-dollar"></i> Saques pendentes</b><span class="muted" id="wdPend">0</span></div>
        <div id="wdList" class="muted">—</div>
      </div>
    </div>
  </div>

  <div class="nav">
    <button id="nTimeline"><i class="fa-solid fa-house"></i><div class="badge">HOME</div></button>
    <button id="nPerfil" class="on"><i class="fa-solid fa-user"></i><div class="badge">PERFIL</div></button>
    <button id="nWallet"><i class="fa-solid fa-wallet"></i><div class="badge">CARTEIRA</div></button>
    <button id="nADM"><i class="fa-solid fa-shield"></i><div class="badge">ADM</div></button>
  </div>
</div>

<script>
/* ====== STORAGE (protótipo em localStorage) ====== */
const KEY="icecubo_pix_v1";
const now=()=>new Date().toISOString();
const uid=()=>Math.random().toString(36).slice(2)+Date.now().toString(36);

function load(){ try{return JSON.parse(localStorage.getItem(KEY))||null}catch{return null} }
function save(db){ localStorage.setItem(KEY, JSON.stringify(db)) }

function init(){
  let db=load();
  if(!db){
    db={users:{},posts:[],withdraws:[],hist:[],pix:[]};
    db.users["${ADM_LOGIN}"]={
      u:"${ADM_LOGIN}",p:"${ADM_SENHA}",role:"ADM",banned:false,
      follow:[],childs:[],blue:0,refBy:"",mineBonus:0,email:"",
      created:now()
    };
    save(db);
  }
  return db;
}
let DB=init();

function getMeUser(){ return (localStorage.getItem("ice_me")||"").trim() }
function me(){ const u=getMeUser(); return u && DB.users[u] ? DB.users[u] : null }
function setMe(u){ localStorage.setItem("ice_me", u||""); }
function isADM(){ const m=me(); return m && m.role==="ADM"; }
function isMOD(){ const m=me(); return m && m.role==="MOD"; }
function alertx(t){ alert(t); }
function fmt(n){ return String(Math.floor(Number(n)||0)); }
function pushHist(user, txt, val){
  DB.hist.unshift({at:Date.now(),u:user,txt, val:Number(val||0)});
  if(DB.hist.length>120) DB.hist.pop();
  save(DB);
}

/* ====== TOP ====== */
function refreshTop(){
  const m=me();
  document.getElementById("blueBal").textContent = m ? fmt(m.blue) : "0";
  document.getElementById("whoLine").textContent = m ? (m.u+" "+(m.role==="ADM"?"(ADM)":m.role==="MOD"?"(MOD)":"")) : "deslogado";
  const rm=document.getElementById("roleMark");
  rm.innerHTML="";
  if(m){
    if(m.role==="ADM") rm.innerHTML=' <i class="fa-solid fa-star starG"></i>';
    if(m.role==="MOD") rm.innerHTML=' <i class="fa-solid fa-star starB"></i>';
  }
  document.getElementById("subTitle").textContent = m ? ("Timeline • Perfil • Carteira • "+m.role) : "Timeline • Perfil • Carteira";
  document.getElementById("mineBonusLine").textContent = m ? fmt(m.mineBonus||0) : "0";
  document.getElementById("mailInfo").textContent = m ? (m.email ? m.email : "não definido") : "—";
}

/* ====== STAGE (visor + live) ====== */
const stageHint = document.getElementById("stageHint");
const stageCam  = document.getElementById("stageCam");
const stageMedia = document.getElementById("stageMedia");
const stageTitle = document.getElementById("stageTitle");
const stageSub   = document.getElementById("stageSub");
const stageMsg   = document.getElementById("stageMsg");

function clearStage(){
  try{ stageCam.pause(); }catch{}
  stageCam.srcObject=null; stageCam.style.display="none";
  stageMedia.innerHTML=""; stageMedia.style.display="none";
  stageHint.style.display="block";
  stageTitle.textContent="Visor"; stageSub.textContent="Clique em um post na Timeline";
  stageMsg.textContent="—";
}
function showMediaPost(p){
  clearStage();
  stageHint.style.display="none";
  stageTitle.textContent = p.user;
  stageSub.textContent = (p.type==="img"?"FOTO":"VÍDEO")+" • "+new Date(p.at).toLocaleString();
  stageMedia.style.display="block";
  stageMedia.innerHTML = (p.type==="img")
    ? '<img src="'+p.data+'" style="width:100%;height:100%;object-fit:cover;display:block">'
    : '<video src="'+p.data+'" controls autoplay playsinline style="width:100%;height:100%;object-fit:cover;display:block"></video>';
}

document.getElementById("camBtn").onclick = async ()=>{
  try{
    const m=me(); if(!m) return alertx("Entre primeiro.");
    clearStage();
    stageHint.style.display="none";
    stageTitle.textContent="LIVE"; stageSub.textContent="Câmera ativa";
    const stream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
    stageCam.style.display="block";
    stageCam.srcObject = stream;
    stageCam.muted = true;
    await stageCam.play();
  }catch(e){
    alertx("Não deu pra abrir a câmera. Permita acesso.");
  }
};

/* ====== NAV ====== */
const panels={Timeline:document.getElementById("pTimeline"),Perfil:document.getElementById("pPerfil"),Wallet:document.getElementById("pWallet"),ADM:document.getElementById("pADM")};
function go(name){
  Object.keys(panels).forEach(k=>panels[k].classList.remove("on"));
  panels[name].classList.add("on");
  document.querySelectorAll(".nav button").forEach(b=>b.classList.remove("on"));
  document.getElementById("n"+name).classList.add("on");
  if(name==="ADM" && !isADM()){
    alertx("Apenas ADM.");
    panels["ADM"].classList.remove("on");
    panels["Perfil"].classList.add("on");
    document.getElementById("nADM").classList.remove("on");
    document.getElementById("nPerfil").classList.add("on");
  }
  renderAll();
}
document.getElementById("nTimeline").onclick=()=>go("Timeline");
document.getElementById("nPerfil").onclick=()=>go("Perfil");
document.getElementById("nWallet").onclick=()=>go("Wallet");
document.getElementById("nADM").onclick=()=>go("ADM");

/* ====== REF (filhos) ====== */
const pageUrl = new URL(location.href);
const ref = (pageUrl.searchParams.get("ref")||"").trim();
document.getElementById("refNote").textContent = ref ? ("Você entrou pelo link de: "+ref) : "Compartilhe seu link pra ganhar filhos.";

/* ====== AUTH ====== */
document.getElementById("btnCreate").onclick=()=>{
  const u=(document.getElementById("loginUser").value||"").trim();
  const p=(document.getElementById("loginPass").value||"").trim();
  if(!u||!p) return alertx("Preencha usuário e senha.");
  if(DB.users[u]) return alertx("Usuário já existe.");
  DB.users[u]={
    u,p,role:"USER",banned:false,
    follow:[],childs:[],
    blue:0,
    refBy:(ref && DB.users[ref] && ref!==u)? ref : "",
    mineBonus:0,
    email:"",
    created:now()
  };
  if(ref && DB.users[ref] && ref!==u){
    const RU=DB.users[ref];
    if(!RU.childs.includes(u)) RU.childs.push(u);
    if(!DB.users[u].follow.includes(ref)) DB.users[u].follow.push(ref);
  }
  save(DB);
  setMe(u);
  alertx("Conta criada e logada!");
  renderAll();
};
document.getElementById("btnLogin").onclick=()=>{
  const u=(document.getElementById("loginUser").value||"").trim();
  const p=(document.getElementById("loginPass").value||"").trim();
  if(!DB.users[u] || DB.users[u].p!==p) return alertx("Login ou senha errados.");
  if(DB.users[u].banned) return alertx("Você foi banido.");
  setMe(u);
  alertx("Logado!");
  renderAll();
};
document.getElementById("btnLogout").onclick=()=>{
  setMe("");
  alertx("Saiu.");
  clearStage();
  renderAll();
};

/* ====== EMAIL ====== */
document.getElementById("saveEmail").onclick=()=>{
  const m=me(); if(!m) return alertx("Entre primeiro.");
  const em=(document.getElementById("emailInp").value||"").trim();
  if(!em.includes("@")) return alertx("E-mail inválido.");
  m.email=em;
  save(DB);
  alertx("E-mail salvo!");
  renderAll();
};

/* ====== POSTS ====== */
let picked=null, pickedType=null;
document.getElementById("filePick").onchange=(e)=>{
  const f=e.target.files && e.target.files[0];
  picked=f||null;
  pickedType = f ? (f.type.startsWith("video")?"vid":"img") : null;
  document.getElementById("pickInfo").textContent = f ? (f.name+" ("+pickedType+")") : "nenhum arquivo";
};
document.getElementById("postBtn").onclick=()=>{
  const m=me(); if(!m) return alertx("Entre primeiro.");
  if(!picked) return alertx("Escolha uma foto/vídeo.");
  const r=new FileReader();
  r.onload=()=>{
    DB.posts.unshift({id:uid(),user:m.u,type:pickedType,data:r.result,at:Date.now()});
    save(DB);
    picked=null; document.getElementById("filePick").value=""; document.getElementById("pickInfo").textContent="nenhum arquivo";
    renderAll();
    go("Timeline");
  };
  r.readAsDataURL(picked);
};
function thumb(p){
  const wrap=document.createElement("div");
  wrap.className="thumb";
  const media = p.type==="img"
    ? '<img src="'+p.data+'">'
    : '<video src="'+p.data+'" muted playsinline></video>';
  wrap.innerHTML = media + '<div class="tag"><i class="fa-solid fa-user"></i> '+p.user+' <span style="margin-left:auto">'+new Date(p.at).toLocaleTimeString().slice(0,5)+'</span></div>';
  wrap.onclick=()=>showMediaPost(p);
  return wrap;
}
function renderFeed(){
  const m=me();
  const followBox=document.getElementById("feedFollow");
  const allBox=document.getElementById("feedAll");
  followBox.innerHTML=""; allBox.innerHTML="";

  const layer1Users = new Set();
  if(m){
    (m.follow||[]).forEach(x=>layer1Users.add(x));
    (m.childs||[]).forEach(x=>layer1Users.add(x));
    layer1Users.add(m.u);
  }
  const layer1 = DB.posts.filter(p=>layer1Users.has(p.user)).slice(0,20);
  const all = DB.posts.slice(0,30);

  layer1.forEach(p=>followBox.appendChild(thumb(p)));
  all.forEach(p=>allBox.appendChild(thumb(p)));
}
document.getElementById("followBtn").onclick=()=>{
  const m=me(); if(!m) return alertx("Entre primeiro.");
  const target=(document.getElementById("searchUser").value||"").trim();
  if(!target) return alertx("Digite um usuário.");
  if(!DB.users[target]) return alertx("Usuário não existe.");
  if(target===m.u) return alertx("Você já é você.");
  if(!m.follow.includes(target)) m.follow.push(target);
  save(DB);
  document.getElementById("searchUser").value="";
  renderAll();
};

/* ====== PROFILE UI ====== */
document.getElementById("copyRef").onclick=()=>{
  const v=document.getElementById("myRef").value;
  navigator.clipboard?.writeText(v);
  alertx("Link copiado!");
};
function renderProfile(){
  const m=me();
  document.getElementById("followCount").textContent = m? (m.follow.length):"0";
  document.getElementById("childCount").textContent  = m? (m.childs.length):"0";
  document.getElementById("followList").textContent = m && m.follow.length ? m.follow.join(", ") : "—";
  document.getElementById("childList").textContent  = m && m.childs.length ? m.childs.join(", ") : "—";
  const base = location.origin + location.pathname;
  document.getElementById("myRef").value = m ? (base + "?ref=" + encodeURIComponent(m.u)) : "entre para gerar seu link";
  document.getElementById("emailInp").value = m && m.email ? m.email : "";
}

/* ====== PIX / QR (REAL) ====== */
let currentPaymentId = "";

async function createPIX(){
  const m=me(); if(!m) return alertx("Entre primeiro.");
  const v = Number((document.getElementById("depVal").value||"").replace(",","."));
  if(!v || v < 1) return alertx("Valor mínimo 1.");
  if(!m.email || !m.email.includes("@")) return alertx("Salve um e-mail válido no Perfil primeiro.");

  document.getElementById("depMsg").textContent = "Gerando PIX/QR...";
  document.getElementById("qrArea").style.display="none";
  currentPaymentId = "";

  try{
    const r = await fetch("/api?op=pix_create", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ amount:v, user:m.u, email:m.email })
    });
    const j = await r.json();
    if(!j.ok){
      document.getElementById("depMsg").textContent = "Erro: "+(j.err||"");
      return;
    }

    currentPaymentId = String(j.payment_id||"");
    if(!j.qr_code_base64 || !j.qr_code){
      document.getElementById("depMsg").textContent = "PIX criado, mas não veio QR. Tente novamente.";
      return;
    }

    document.getElementById("qrImg").src = "data:image/png;base64,"+j.qr_code_base64;
    document.getElementById("qrCode").textContent = j.qr_code;
    document.getElementById("pixMsg").textContent = "Abra seu app do banco e pague. Depois clique em “Já paguei”.";
    document.getElementById("qrArea").style.display="block";
    document.getElementById("depMsg").textContent = "PIX/QR gerado ✅";

    // registra no histórico local (pendente)
    DB.pix.unshift({id:currentPaymentId, user:m.u, brl:v, status:"pending", at:Date.now()});
    save(DB);
    renderAll();
  }catch(e){
    document.getElementById("depMsg").textContent = "Falha de rede ao gerar PIX.";
  }
}
document.getElementById("depBtn").onclick = createPIX;

document.getElementById("copyPix").onclick=()=>{
  const t=document.getElementById("qrCode").textContent||"";
  if(!t) return;
  navigator.clipboard?.writeText(t);
  alertx("Copia e cola copiado!");
};

async function checkPaid(){
  const m=me(); if(!m) return alertx("Entre primeiro.");
  if(!currentPaymentId) return alertx("Nenhum PIX atual.");

  document.getElementById("pixMsg").textContent="Consultando pagamento...";
  try{
    const r = await fetch("/api?op=pix_status&id="+encodeURIComponent(currentPaymentId));
    const j = await r.json();
    if(!j.ok){
      document.getElementById("pixMsg").textContent="Erro: "+(j.err||"");
      return;
    }
    document.getElementById("pixMsg").textContent = "Status: "+j.status+" ("+j.status_detail+")";

    // Se aprovado -> credita BLUE e bônus do pai (5%)
    if(String(j.status) === "approved"){
      // evita creditar 2x
      const already = DB.hist.some(h=>h.txt==="Depósito PIX aprovado" && h.u===m.u && String(h.pid||"")===String(currentPaymentId));
      if(already) return alertx("Já creditado.");

      const brl = Number(j.transaction_amount||0) || (DB.pix.find(p=>p.id===currentPaymentId)?.brl || 0);
      const blueAdd = Math.floor(brl * 100); // 1 BRL = 100 BLUE (ajuste)
      m.blue += blueAdd;

      // bônus 5% pro pai/indicador (mineBonus)
      if(m.refBy && DB.users[m.refBy]){
        const parent = DB.users[m.refBy];
        const bonus = Math.floor(blueAdd * 0.05);
        parent.mineBonus = (parent.mineBonus||0) + bonus;
        pushHist(parent.u, "Bônus mineração 5% (filho depositou)", bonus);
      }

      // marca histórico
      DB.hist.unshift({at:Date.now(),u:m.u,txt:"Depósito PIX aprovado",val:blueAdd,pid:String(currentPaymentId)});
      // marca pix local
      const rec = DB.pix.find(p=>p.id===currentPaymentId);
      if(rec) rec.status="approved";
      save(DB);

      alertx("Pagamento aprovado! +" + blueAdd + " BLUE");
      renderAll();
    }
  }catch(e){
    document.getElementById("pixMsg").textContent="Falha ao consultar.";
  }
}
document.getElementById("paidBtn").onclick = checkPaid;

/* ====== SAQUE (protótipo) ====== */
document.getElementById("wdBtn").onclick=()=>{
  const m=me(); if(!m) return alertx("Entre primeiro.");
  const v = Number((document.getElementById("wdVal").value||"").replace(",","."));
  if(!v || v <= 0) return alertx("Valor inválido.");
  if(m.blue < v) return alertx("Saldo BLUE insuficiente.");
  const id=uid();
  DB.withdraws.unshift({id,u:m.u,val:v,at:Date.now(),status:"PENDENTE"});
  DB.hist.unshift({at:Date.now(),u:m.u,txt:"Solicitou saque",val:-v});
  save(DB);
  document.getElementById("wdVal").value="";
  document.getElementById("wdMsg").textContent="Pedido enviado (protótipo).";
  renderAll();
};

/* ====== MINERAÇÃO = RESGATAR BÔNUS ====== */
document.getElementById("mineBtn").onclick=()=>{
  const m=me(); if(!m) return alertx("Entre primeiro.");
  const bonus = Number(m.mineBonus||0);
  if(bonus<=0) return alertx("Sem bônus. Você ganha bônus quando um filho indicado deposita.");

  const chunk = Math.min(50, bonus); // resgata 50 por clique
  m.mineBonus -= chunk;
  m.blue += chunk;
  pushHist(m.u, "Minerou bônus (resgate)", chunk);
  save(DB);

  stageMsg.textContent = "Bônus minerado: +"+chunk+" BLUE";
  alertx("Bônus minerado! +" + chunk + " BLUE");
  renderAll();
};

/* ====== PROMO FLUTUANTE ====== */
function renderPromo(){
  const m=me();
  const btn=document.getElementById("promoMine");
  const has = m && Number(m.mineBonus||0)>0;
  btn.classList.toggle("on", !!has);
}
document.getElementById("promoMine").onclick=()=>{
  go("Wallet");
  alertx("Você tem bônus! Clique em “Minerar bônus”.");
};

/* ====== ADM ====== */
document.getElementById("makeMod").onclick=()=>{
  if(!isADM()) return alertx("Apenas ADM.");
  const u=(document.getElementById("modUser").value||"").trim();
  if(!u||!DB.users[u]) return alertx("Usuário não existe.");
  if(u==="${ADM_LOGIN}") return alertx("ADM já é ADM.");
  DB.users[u].role="MOD";
  save(DB);
  alertx("Moderador criado: "+u);
  document.getElementById("modUser").value="";
  renderAll();
};
document.getElementById("banBtn").onclick=()=>{
  if(!(isADM()||isMOD())) return alertx("Sem permissão.");
  const u=(document.getElementById("banUser").value||"").trim();
  if(!u||!DB.users[u]) return alertx("Usuário não existe.");
  if(u==="${ADM_LOGIN}") return alertx("ADM é intocável.");
  DB.users[u].banned=true;
  save(DB);
  alertx("Banido: "+u);
  document.getElementById("banUser").value="";
  renderAll();
};
function renderADM(){
  if(!isADM()){
    document.getElementById("wdList").textContent="—";
    document.getElementById("wdPend").textContent="0";
    return;
  }
  const pend = DB.withdraws.filter(w=>w.status==="PENDENTE");
  document.getElementById("wdPend").textContent = pend.length;
  document.getElementById("wdList").innerHTML = pend.length ? pend.map(w=>{
    return '<div style="margin:8px 0;padding:10px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18)">'+
      '<b>'+w.u+'</b> pediu <b>'+w.val+'</b> BLUE • '+new Date(w.at).toLocaleString()+
      '<div class="row" style="margin-top:8px">'+
      '<button class="btn ok" onclick="approveWD(\\''+w.id+'\\')">Aprovar</button>'+
      '<button class="btn bad" onclick="denyWD(\\''+w.id+'\\')">Negar</button>'+
      '</div></div>';
  }).join("") : "—";
}
window.approveWD=(id)=>{
  if(!isADM()) return alertx("Apenas ADM.");
  const w=DB.withdraws.find(x=>x.id===id); if(!w) return;
  w.status="APROVADO";
  save(DB);
  alertx("Aprovado (protótipo).");
  renderAll();
};
window.denyWD=(id)=>{
  if(!isADM()) return alertx("Apenas ADM.");
  const w=DB.withdraws.find(x=>x.id===id); if(!w) return;
  w.status="NEGADO";
  // devolve saldo (protótipo)
  const u=DB.users[w.u]; if(u) u.blue += w.val;
  save(DB);
  alertx("Negado e devolvido (protótipo).");
  renderAll();
};

/* ====== HISTÓRICO ====== */
function renderWallet(){
  const m=me();
  const hist = DB.hist.filter(h=>m? (h.u===m.u):false).slice(0,25);
  document.getElementById("histCount").textContent = hist.length;
  document.getElementById("histList").innerHTML = hist.length ? hist.map(h=>{
    const sign = h.val>=0? "+":"";
    return "• "+new Date(h.at).toLocaleString()+" — "+h.txt+" ("+sign+h.val+" BLUE)";
  }).join("<br>") : "—";
}

/* ====== START ====== */
function renderAll(){
  DB=init();
  const m=me();
  if(m && m.banned){ setMe(""); alertx("Você foi banido."); }
  refreshTop();
  renderProfile();
  renderFeed();
  renderWallet();
  renderADM();
  renderPromo();
}
clearStage();
renderAll();
</script>
</body>
</html>`);
  } catch (e) {
    return sendJSON(res, 500, { ok: false, err: String(e && e.message ? e.message : e) });
  }
};
