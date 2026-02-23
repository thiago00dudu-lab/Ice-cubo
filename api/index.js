// api/index.js (Vercel) — ICE-CUBO "tudo em um"
// Depósito real (Mercado Pago) com PIX/QR forçado. Saque: pedido (protótipo) para ADM aprovar.
// OBS: dados do app (users/posts/etc) ficam no localStorage (protótipo). Em produção: banco (Postgres/Redis/KV).

const https = require("https");
const { URL } = require("url");

const ADM_LOGIN = "ADM";
const ADM_SENHA = "1533";

const MP_ACCESS_TOKEN = (process.env.MP_ACCESS_TOKEN || "").trim(); // obrigatório p depósito real
const MP_WEBHOOK_SECRET = (process.env.MP_WEBHOOK_SECRET || "").trim(); // opcional (se for validar webhook)

function sendJSON(res, code, obj) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
}
function sendHTML(res, code, html) {
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
        ...(headers || {}),
        ...(data
          ? {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(data),
            }
          : {}),
      },
    };

    const r = https.request(opts, (resp) => {
      let s = "";
      resp.on("data", (c) => (s += c));
      resp.on("end", () => {
        let json = null;
        try {
          json = s ? JSON.parse(s) : null;
        } catch {}
        resolve({ status: resp.statusCode, json, text: s });
      });
    });
    r.on("error", reject);
    if (data) r.write(data);
    r.end();
  });
}

function baseUrlFromReq(req) {
  const proto = (req.headers["x-forwarded-proto"] || "https").toString();
  const host = (req.headers["x-forwarded-host"] || req.headers.host || "").toString();
  return `${proto}://${host}`;
}

async function mpCreatePreference({ amount, username, baseUrl }) {
  if (!MP_ACCESS_TOKEN) return { ok: false, error: "MP_ACCESS_TOKEN não configurado no Vercel." };

  const a = Number(amount);
  if (!isFinite(a) || a <= 0) return { ok: false, error: "Valor inválido." };

  // Forçar PIX/QR: exclui cartões, boleto e outros tipos.
  // Obs: a disponibilidade final também depende do Mercado Pago/conta.
  const body = {
    items: [
      {
        title: `Depósito ICE-CUBO (${username || "user"})`,
        quantity: 1,
        currency_id: "BRL",
        unit_price: Math.round(a * 100) / 100,
      },
    ],
    back_urls: {
      success: `${baseUrl}/api?paid=1`,
      pending: `${baseUrl}/api?paid=1`,
      failure: `${baseUrl}/api?paid=0`,
    },
    auto_return: "approved",
    payment_methods: {
      excluded_payment_types: [
        { id: "credit_card" },
        { id: "debit_card" },
        { id: "ticket" },
        { id: "atm" },
        { id: "prepaid_card" },
      ],
      // Não exclui "bank_transfer" para manter PIX disponível.
    },
    statement_descriptor: "ICE-CUBO",
  };

  const r = await httpJSON(
    "POST",
    "https://api.mercadopago.com/checkout/preferences",
    { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    body
  );

  if (r.status >= 200 && r.status < 300 && r.json) {
    return {
      ok: true,
      init_point: r.json.init_point,
      sandbox_init_point: r.json.sandbox_init_point,
      id: r.json.id,
    };
  }
  return { ok: false, error: r.json || r.text || `Erro MP (${r.status})` };
}

function pageHTML() {
  return `<!doctype html><html lang="pt-br"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<title>ICE-CUBO</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
:root{--bg1:#dff3ff;--bg2:#bfe8ff;--bg3:#06223f;--glass:rgba(255,255,255,.14);--line:rgba(255,255,255,.18);--t:#eaf6ff;--mut:rgba(234,246,255,.72);--a:#38bdf8;--b:#0ea5e9;--ok:#22c55e;--warn:#f59e0b;--bad:#ef4444}
*{box-sizing:border-box}html,body{height:100%}
body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;background:
radial-gradient(1100px 700px at 20% -10%,rgba(255,255,255,.35),transparent 55%),
radial-gradient(1000px 800px at 110% 35%,rgba(56,189,248,.24),transparent 60%),
linear-gradient(180deg,#0b1b33 0%, #061a2e 35%, #03213a 75%, #021526 100%);
color:var(--t);overflow:hidden}

/* Fundo do mar (desenho em SVG repetindo) */
body:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.35;mix-blend-mode:screen;
background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cg fill='none'%3E%3Ccircle cx='60' cy='180' r='4' fill='%23ffffff' opacity='.25'/%3E%3Ccircle cx='90' cy='200' r='3' fill='%23ffffff' opacity='.22'/%3E%3Ccircle cx='120' cy='170' r='2.5' fill='%23ffffff' opacity='.18'/%3E%3Cpath d='M30 55c20 10 35 25 35 45c0 20-15 35-35 45c-20-10-35-25-35-45c0-20 15-35 35-45Z' fill='%2338bdf8' opacity='.10'/%3E%3Cpath d='M170 70c18 8 32 20 32 38c0 18-14 30-32 38c-18-8-32-20-32-38c0-18 14-30 32-38Z' fill='%230ea5e9' opacity='.11'/%3E%3Cpath d='M185 150c-6 20-18 30-22 44c-3 10 2 20 10 26c10-6 20-16 20-30c0-15-6-23-8-40Z' fill='%23ffffff' opacity='.10'/%3E%3Cpath d='M64 94c14-18 24-26 40-14c-10 16-18 26-40 14Z' fill='%23ffffff' opacity='.08'/%3E%3Cpath d='M70 120c10 0 18 8 18 18s-8 18-18 18s-18-8-18-18s8-18 18-18Z' fill='%23f59e0b' opacity='.12'/%3E%3Cpath d='M70 126l4 10l10 0l-8 6l3 10l-9-6l-9 6l3-10l-8-6l10 0Z' fill='%23f59e0b' opacity='.18'/%3E%3Cpath d='M140 120c0-14 10-26 24-30c-8 10-8 20 0 30c8 10 8 20 0 30c-14-4-24-16-24-30Z' fill='%2388e0ff' opacity='.10'/%3E%3Cpath d='M170 90c-8 10-8 20 0 30c8 10 8 20 0 30' stroke='%2388e0ff' opacity='.18' stroke-width='3' stroke-linecap='round'/%3E%3C/g%3E%3C/svg%3E");
background-size:260px 260px}

#app{height:100vh;display:flex;flex-direction:column}
.top{height:50vh;position:relative;border-radius:0 0 26px 26px;overflow:hidden;background:rgba(255,255,255,.05);border-bottom:1px solid rgba(255,255,255,.10)}
.bub:before,.bub:after{content:"";position:absolute;inset:-25%;background:
radial-gradient(circle,rgba(255,255,255,.35) 0 2px,transparent 3px) 0 0/140px 140px,
radial-gradient(circle,rgba(255,255,255,.20) 0 1px,transparent 2px) 50px 30px/190px 190px;
animation:float 18s linear infinite;opacity:.45}
.bub:after{animation-duration:26s;opacity:.28;transform:scale(1.14)}
@keyframes float{to{transform:translateY(-150px)}}

.brand{position:absolute;top:10px;left:12px;right:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:5}
.logo{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);
background:rgba(0,0,0,.20);backdrop-filter:blur(10px);border-radius:18px;box-shadow:0 10px 30px rgba(0,0,0,.22)}
.badge{width:38px;height:38px;border-radius:14px;display:grid;place-items:center;background:rgba(56,189,248,.14);border:1px solid rgba(56,189,248,.22)}
.brandname{display:flex;flex-direction:column;line-height:1.05}
.brandname b{letter-spacing:1.2px;font-size:15px}
.brandname small{color:var(--mut);font-size:11px}
.walletPill{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);
background:rgba(0,0,0,.20);backdrop-filter:blur(10px);border-radius:18px}
.coin{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;
background:radial-gradient(circle at 30% 30%,#38bdf8,#0b2a6a);border:1px solid rgba(255,215,0,.55);
box-shadow:0 0 0 2px rgba(255,215,0,.16) inset}
.coin span{color:#ffd700;font-weight:1000}
.walletMeta{display:flex;flex-direction:column;line-height:1.05}
.walletMeta b{font-size:12px}
.walletMeta small{font-size:11px;color:var(--mut)}
.viewer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:2}
#mainV,#camV,#mainImg{width:100%;height:100%;object-fit:cover;display:none}
#hint{position:absolute;bottom:12px;left:12px;right:12px;z-index:4;
padding:10px 12px;border:1px solid var(--line);border-radius:16px;background:rgba(0,0,0,.24);
backdrop-filter:blur(10px);font-size:12px;color:var(--mut);display:flex;gap:10px;align-items:center;justify-content:space-between}
#hint b{color:var(--t)}
.smallRow{position:absolute;bottom:64px;left:12px;right:12px;z-index:4;display:flex;gap:10px;overflow:auto;padding-bottom:6px}
.thumb{min-width:120px;height:72px;border-radius:16px;overflow:hidden;border:1px solid var(--line);
background:rgba(0,0,0,.25);position:relative;cursor:pointer;flex:0 0 auto}
.thumb img,.thumb video{width:100%;height:100%;object-fit:cover}
.thumb .tcap{position:absolute;left:8px;right:8px;bottom:6px;font-size:11px;color:rgba(255,255,255,.85);
text-shadow:0 2px 10px rgba(0,0,0,.6);display:flex;justify-content:space-between;align-items:center}
.starGold{color:#ffd700;text-shadow:0 2px 10px rgba(0,0,0,.6)}
.starBlue{color:#60a5fa;text-shadow:0 2px 10px rgba(0,0,0,.6)}

.main{flex:1;overflow:hidden;display:flex;flex-direction:column;padding:12px;gap:12px}
.panel{flex:1;overflow:auto;border:1px solid rgba(255,255,255,.12);border-radius:22px;
background:rgba(0,0,0,.18);backdrop-filter:blur(10px);box-shadow:0 18px 60px rgba(0,0,0,.30);padding:12px}
.hrow{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.hrow h3{margin:0;font-size:14px;display:flex;gap:8px;align-items:center}
.muted{color:var(--mut);font-size:12px}
.row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.field{flex:1;min-width:140px}
input,textarea{width:100%;border-radius:16px;border:1px solid rgba(255,255,255,.15);background:rgba(0,0,0,.22);
color:var(--t);padding:12px 12px;outline:none}
textarea{min-height:84px;resize:none}
.btn{border:0;border-radius:16px;padding:12px 14px;background:rgba(56,189,248,.18);color:var(--t);
border:1px solid rgba(56,189,248,.22);cursor:pointer}
.btn:active{transform:scale(.99)}
.btnOk{background:rgba(34,197,94,.22);border-color:rgba(34,197,94,.28)}
.btnWarn{background:rgba(245,158,11,.22);border-color:rgba(245,158,11,.28)}
.btnBad{background:rgba(239,68,68,.20);border-color:rgba(239,68,68,.26)}
.card{border:1px solid rgba(255,255,255,.12);border-radius:22px;background:rgba(0,0,0,.18);
padding:12px;box-shadow:0 18px 60px rgba(0,0,0,.18)}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.pitem{border:1px solid rgba(255,255,255,.12);border-radius:18px;overflow:hidden;background:rgba(0,0,0,.20);cursor:pointer}
.pitem img,.pitem video{width:100%;height:130px;object-fit:cover;display:block}
.pmeta{padding:8px 10px;font-size:12px;color:var(--mut);display:flex;justify-content:space-between;gap:10px}

.nav{height:64px;padding:10px 12px;display:flex;gap:10px;align-items:center;justify-content:space-between;
border-top:1px solid rgba(255,255,255,.10);background:rgba(0,0,0,.22);backdrop-filter:blur(10px)}
.tab{flex:1;border-radius:18px;padding:10px 8px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.06);
color:rgba(255,255,255,.90);display:flex;flex-direction:column;align-items:center;gap:6px;font-size:11px;cursor:pointer}
.tab i{font-size:16px}
.tab.on{border-color:rgba(56,189,248,.35);background:rgba(56,189,248,.16)}
.pillMini{padding:8px 10px;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.20);font-size:12px;color:var(--mut)}
.hr{height:1px;background:rgba(255,255,255,.10);margin:10px 0}
.notice{font-size:12px;color:var(--mut);line-height:1.35}
.kpi{display:flex;gap:10px;flex-wrap:wrap}
.k{flex:1;min-width:120px;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.18);padding:10px}
.k b{display:block}
.small{font-size:11px;color:var(--mut)}
</style></head>
<body>
<div id="app">
  <div class="top bub">
    <div class="brand">
      <div class="logo">
        <div class="badge">IC</div>
        <div class="brandname">
          <b>ICE-CUBO</b>
          <small id="subTitle">Timeline • Perfil • Carteira</small>
        </div>
      </div>
      <div class="walletPill">
        <div class="coin"><span>B</span></div>
        <div class="walletMeta">
          <b><span id="blueBal">0</span> BLUE</b>
          <small id="who">deslogado</small>
        </div>
      </div>
    </div>

    <div class="viewer">
      <img id="mainImg" alt="">
      <video id="mainV" playsinline controls></video>
      <video id="camV" playsinline autoplay muted></video>
    </div>

    <div class="smallRow" id="thumbRow"></div>

    <div id="hint">
      <div><b>Dica:</b> clique num post (embaixo) pra abrir aqui em cima • <b>2 toques</b> num vídeo pra jogar pro grande</div>
      <div class="pillMini" id="minePill">⛏️ Minerar: precisa 10 filhos</div>
    </div>
  </div>

  <div class="main">
    <div class="panel" id="panelTimeline">
      <div class="hrow">
        <h3><i class="fa-solid fa-stream"></i> Timeline</h3>
        <span class="muted">posts aparecem aqui embaixo</span>
      </div>
      <div class="notice">Clique no card para abrir no grande. “Filhos/Seguindo” vem do seu perfil (protótipo local).</div>
      <div class="hr"></div>
      <div class="hrow"><h3 style="font-size:13px"><i class="fa-solid fa-user-group"></i> Seguindo/Filhos</h3><span class="muted" id="followCount">0</span></div>
      <div class="grid" id="feedFollow"></div>
      <div class="hr"></div>
      <div class="hrow"><h3 style="font-size:13px"><i class="fa-solid fa-globe"></i> Todos</h3><span class="muted" id="allCount">0</span></div>
      <div class="grid" id="feedAll"></div>
    </div>

    <div class="panel" id="panelProfile" style="display:none">
      <div class="hrow">
        <h3><i class="fa-solid fa-user"></i> Perfil</h3>
        <span class="muted">entrar / criar conta</span>
      </div>

      <div class="card">
        <div class="row">
          <div class="field"><input id="uLogin" placeholder="Login (ex: jessica)"></div>
          <div class="field"><input id="uPass" type="password" placeholder="Senha"></div>
          <button class="btn btnOk" id="btnEnter"><i class="fa-solid fa-right-to-bracket"></i> Entrar</button>
          <button class="btn" id="btnCreate"><i class="fa-solid fa-user-plus"></i> Criar</button>
        </div>
        <div class="muted" style="margin-top:8px">ADM é intocável. Login ADM / Senha 1533.</div>
      </div>

      <div class="hr"></div>

      <div class="card">
        <div class="hrow"><h3 style="margin:0"><i class="fa-solid fa-upload"></i> Postar foto/vídeo</h3><span class="muted">aparece na timeline</span></div>
        <div class="row">
          <label class="btn" style="display:inline-flex;align-items:center;gap:8px">
            <i class="fa-solid fa-image"></i> Escolher mídia
            <input id="filePick" type="file" accept="image/*,video/*" style="display:none">
          </label>
          <button class="btn btnOk" id="btnPost"><i class="fa-solid fa-paper-plane"></i> Postar</button>
          <span class="muted" id="pickInfo">Nenhum arquivo</span>
        </div>
        <div class="hr"></div>
        <div class="kpi">
          <div class="k"><b>Filhos</b><div class="small"><span id="childCount">0</span> (mínimo 10 p minerar)</div></div>
          <div class="k"><b>Seguindo</b><div class="small"><span id="followingCount">0</span></div></div>
          <div class="k"><b>Recompensa</b><div class="small">50 BLUE por bloco (demo)</div></div>
        </div>
        <div class="row" style="margin-top:10px">
          <button class="btn btnWarn" id="btnAddChild"><i class="fa-solid fa-child"></i> +1 Filho (demo)</button>
          <button class="btn" id="btnFollow"><i class="fa-solid fa-user-check"></i> Seguir alguém (demo)</button>
          <button class="btn btnOk" id="btnMine"><i class="fa-solid fa-hammer"></i> Minerar bloco</button>
        </div>
        <div class="muted" id="mineStatus" style="margin-top:8px">—</div>
      </div>
    </div>

    <div class="panel" id="panelWallet" style="display:none">
      <div class="hrow">
        <h3><i class="fa-solid fa-wallet"></i> Carteira</h3>
        <span class="muted">depósito PIX / saque</span>
      </div>

      <div class="card">
        <div class="notice">
          <b>Depósito (real):</b> abre Mercado Pago (PIX/QR).<br>
          <b>Saque (protótipo):</b> vira pedido pro ADM aprovar (saque automático real exige compliance/back-end).
        </div>
      </div>

      <div class="hr"></div>

      <div class="card">
        <div class="hrow"><h3 style="margin:0"><i class="fa-solid fa-sack-dollar"></i> Depósito</h3><span class="muted">PIX/QR</span></div>
        <div class="row">
          <div class="field"><input id="depVal" inputmode="decimal" placeholder="Valor (ex: 10)"></div>
          <button class="btn btnOk" id="btnDeposit"><i class="fa-brands fa-pix"></i> Depositar via PIX</button>
        </div>
        <div class="muted" id="depNote" style="margin-top:8px">—</div>
      </div>

      <div class="hr"></div>

      <div class="card">
        <div class="hrow"><h3 style="margin:0"><i class="fa-solid fa-building-columns"></i> Saque</h3><span class="muted">pedido</span></div>
        <div class="row">
          <div class="field"><input id="wdVal" inputmode="decimal" placeholder="Valor para sacar"></div>
          <button class="btn btnWarn" id="btnWithdraw"><i class="fa-solid fa-arrow-up-right-dots"></i> Solicitar saque</button>
        </div>
        <div class="muted" id="wdNote" style="margin-top:8px">—</div>
      </div>
    </div>

    <div class="panel" id="panelSwaps" style="display:none">
      <div class="hrow"><h3><i class="fa-solid fa-repeat"></i> Trocas</h3><span class="muted">produto + oferta</span></div>
      <div class="card">
        <div class="row">
          <div class="field"><input id="swapTitle" placeholder="Produto (ex: Tênis)"></div>
          <div class="field"><input id="swapWant" placeholder="Quero em troca (ex: BLUE)"></div>
        </div>
        <div class="row" style="margin-top:8px">
          <div class="field"><textarea id="swapDesc" placeholder="Descrição rápida..."></textarea></div>
        </div>
        <div class="row" style="margin-top:8px">
          <label class="btn" style="display:inline-flex;align-items:center;gap:8px">
            <i class="fa-solid fa-camera"></i> Foto/Vídeo
            <input id="swapFile" type="file" accept="image/*,video/*" style="display:none">
          </label>
          <button class="btn btnOk" id="btnSwapPost"><i class="fa-solid fa-bolt"></i> Publicar troca</button>
          <span class="muted" id="swapPickInfo">Nenhum arquivo</span>
        </div>
      </div>
      <div class="hr"></div>
      <div class="grid" id="swapGrid"></div>
    </div>

    <div class="panel" id="panelAdm" style="display:none">
      <div class="hrow"><h3><i class="fa-solid fa-shield-halved"></i> ADM</h3><span class="muted">somente ADM</span></div>
      <div class="card">
        <div class="notice"><b>ADM intocável.</b> Pode promover moderadores e aprovar saques. Moderador não consegue agir contra ADM.</div>
      </div>
      <div class="hr"></div>
      <div class="card">
        <div class="hrow"><h3 style="margin:0"><i class="fa-solid fa-user-gear"></i> Moderadores</h3><span class="muted">estrela azul</span></div>
        <div class="row">
          <div class="field"><input id="modUser" placeholder="Usuário para virar moderador"></div>
          <button class="btn btnOk" id="btnMakeMod"><i class="fa-solid fa-star"></i> Promover</button>
          <button class="btn btnBad" id="btnUnmod"><i class="fa-solid fa-star-half-stroke"></i> Remover</button>
        </div>
        <div class="muted" id="modNote" style="margin-top:8px">—</div>
      </div>
      <div class="hr"></div>
      <div class="card">
        <div class="hrow"><h3 style="margin:0"><i class="fa-solid fa-hand-holding-dollar"></i> Saques pendentes</h3><span class="muted">aprovar/recusar</span></div>
        <div id="withdrawList" class="muted">—</div>
      </div>
      <div class="hr"></div>
      <div class="card">
        <div class="hrow"><h3 style="margin:0"><i class="fa-solid fa-user-slash"></i> Bloquear usuário</h3><span class="muted">moderador/ADM</span></div>
        <div class="row">
          <div class="field"><input id="banUser" placeholder="Usuário para bloquear"></div>
          <button class="btn btnBad" id="btnBan"><i class="fa-solid fa-ban"></i> Bloquear</button>
          <button class="btn" id="btnUnban"><i class="fa-solid fa-check"></i> Desbloquear</button>
        </div>
        <div class="muted" id="banNote" style="margin-top:8px">—</div>
      </div>
    </div>
  </div>

  <div class="nav">
    <div class="tab on" data-tab="timeline"><i class="fa-solid fa-house"></i><span>HOME</span></div>
    <div class="tab" data-tab="profile"><i class="fa-solid fa-user"></i><span>PERFIL</span></div>
    <div class="tab" data-tab="wallet"><i class="fa-solid fa-credit-card"></i><span>CARTEIRA</span></div>
    <div class="tab" data-tab="swaps"><i class="fa-solid fa-layer-group"></i><span>TROCAS</span></div>
    <div class="tab" data-tab="live"><i class="fa-solid fa-video"></i><span>LIVE</span></div>
    <div class="tab" data-tab="adm"><i class="fa-solid fa-star"></i><span>ADM</span></div>
  </div>
</div>

<script>
/* ====== Storage (protótipo) ====== */
const S = {
  get(k, d){ try{ return JSON.parse(localStorage.getItem(k) || JSON.stringify(d)); }catch{ return d } },
  set(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
};
const DB = {
  users: () => S.get("ic_users", {}),
  saveUsers: (u)=>S.set("ic_users",u),
  posts: () => S.get("ic_posts", []),
  savePosts: (p)=>S.set("ic_posts",p),
  swaps: () => S.get("ic_swaps", []),
  saveSwaps: (p)=>S.set("ic_swaps",p),
  withdraws: () => S.get("ic_withdraws", []),
  saveWithdraws: (w)=>S.set("ic_withdraws",w),
};

let me = S.get("ic_me", null); // {u, role}
function isADM(){ return me && me.u === "${ADM_LOGIN}" }
function isMod(){ return me && (me.role === "mod" || isADM()) }

/* ====== UI helpers ====== */
const $ = (id)=>document.getElementById(id);
const blueBal = $("blueBal"), who = $("who"), subTitle=$("subTitle");
const mainImg=$("mainImg"), mainV=$("mainV"), camV=$("camV"), thumbRow=$("thumbRow");
const panels = {
  timeline:$("panelTimeline"),
  profile:$("panelProfile"),
  wallet:$("panelWallet"),
  swaps:$("panelSwaps"),
  adm:$("panelAdm")
};
function toast(msg){ alert(msg); }
function setTopMedia({type, src, caption}){
  mainImg.style.display="none"; mainV.style.display="none";
  stopCam();
  if(type==="img"){ mainImg.src=src; mainImg.style.display="block"; }
  if(type==="video"){ mainV.src=src; mainV.style.display="block"; mainV.play().catch(()=>{}); }
  $("hint").querySelector("div").innerHTML = "<b>Dica:</b> "+(caption||"");
}
function renderHeader(){
  const users = DB.users();
  const u = me ? users[me.u] : null;
  const blue = u ? (u.blue||0) : 0;
  blueBal.textContent = blue;
  who.textContent = me ? (me.u + (isADM()?" ★":"") + (me.role==="mod" && !isADM()?" ✦":"")) : "deslogado";
  $("minePill").textContent = "⛏️ Minerar: precisa 10 filhos";
}

/* ====== Tabs ====== */
document.querySelectorAll(".tab").forEach(t=>{
  t.addEventListener("click", ()=>{
    const key = t.dataset.tab;
    document.querySelectorAll(".tab").forEach(x=>x.classList.remove("on"));
    t.classList.add("on");

    Object.values(panels).forEach(p=>p.style.display="none");

    if(key==="timeline"){ panels.timeline.style.display="block"; subTitle.textContent="Timeline • Perfil • Carteira"; renderFeeds(); }
    if(key==="profile"){ panels.profile.style.display="block"; subTitle.textContent="Perfil • Posts • Minerar"; }
    if(key==="wallet"){ panels.wallet.style.display="block"; subTitle.textContent="Carteira • Depósito • Saque"; }
    if(key==="swaps"){ panels.swaps.style.display="block"; subTitle.textContent="Trocas • Publicações"; renderSwaps(); }
    if(key==="adm"){
      if(!isADM()) return toast("Somente ADM.");
      panels.adm.style.display="block"; subTitle.textContent="ADM • Moderadores • Saques";
      renderWithdrawsAdm();
    }
    if(key==="live"){
      subTitle.textContent="LIVE • Câmera";
      startCam();
      // volta visualmente pra timeline mas com câmera ativa no topo
      panels.timeline.style.display="block";
      renderFeeds();
    }
  });
});

/* ====== Auth ====== */
function ensureUserDefaults(u){
  u.blue = u.blue||0;
  u.children = u.children||0;
  u.following = u.following||[];
  u.banned = !!u.banned;
  u.role = u.role||"user";
  return u;
}
$("btnCreate").onclick = ()=>{
  const login = ($("uLogin").value||"").trim();
  const pass  = ($("uPass").value||"").trim();
  if(!login || !pass) return toast("Preencha login e senha.");
  if(login === "${ADM_LOGIN}") return toast("Login reservado.");
  const users =
