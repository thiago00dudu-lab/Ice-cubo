// api/index.js (Vercel) — ICE-CUBO "1 arquivo" (UI + API)
// MVP: Login/Registro + Timeline (post foto/vídeo) + Perfil + Carteira (Depósito/Saque) + ADM/MOD + Ban
// OBS: Dados do APP ficam no localStorage do navegador (protótipo). Em produção real use DB (KV/Postgres).
// Mercado Pago: depósito REAL via Checkout (abre link). Saque REAL automático exige backend + compliance.
// ENV opcional: MP_ACCESS_TOKEN (se tiver, habilita "Depósito Real (MP)").
// ENV opcional: MP_WEBHOOK_SECRET (se quiser validar webhook depois).

const https = require("https");
const { URL } = require("url");

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

const ADM_LOGIN = "ADM";
const ADM_SENHA = "1533";

const MP_ACCESS_TOKEN = (process.env.MP_ACCESS_TOKEN || "").trim();
const MP_WEBHOOK_SECRET = (process.env.MP_WEBHOOK_SECRET || "").trim();

function baseURLFromReq(req) {
  // Não quebra se BASE_URL não existir. Usa o host real da request.
  const proto = (req.headers["x-forwarded-proto"] || "https").toString();
  const host = (req.headers["x-forwarded-host"] || req.headers.host || "").toString();
  return `${proto}://${host}`;
}

module.exports = async (req, res) => {
  try {
    const u = new URL(req.url, baseURLFromReq(req));
    const op = u.searchParams.get("op") || "";

    // ---------- API ----------
    if (op === "health") return sendJSON(res, 200, { ok: true, msg: "API ICE-CUBO online" });

    if (op === "mp_create") {
      if (!MP_ACCESS_TOKEN) return sendJSON(res, 400, { ok:false, error:"MP_ACCESS_TOKEN não configurado no Vercel." });

      const raw = await readBody(req);
      let body = {};
      try { body = raw ? JSON.parse(raw) : {}; } catch { body = {}; }

      const amount = Number(body.amount || 0);
      const user = String(body.user || "usuario");

      if (!amount || amount < 1) return sendJSON(res, 400, { ok:false, error:"Valor inválido." });

      const base = baseURLFromReq(req);
      const notification_url = `${base}/api?op=mp_webhook${MP_WEBHOOK_SECRET ? `&secret=${encodeURIComponent(MP_WEBHOOK_SECRET)}` : ""}`;

      // Checkout Pro (link) — mais simples/estável pra começar.
      const pref = {
        items: [
          {
            title: `Depósito ICE-CUBO (${user})`,
            quantity: 1,
            unit_price: Number(amount.toFixed(2)),
            currency_id: "BRL",
          },
        ],
        external_reference: `icecubo:${user}:${Date.now()}`,
        notification_url,
        back_urls: { success: `${base}/api?paid=1`, failure: `${base}/api?paid=0`, pending: `${base}/api?paid=pending` },
        auto_return: "approved",
      };

      const r = await httpJSON(
        "POST",
        "https://api.mercadopago.com/checkout/preferences",
        { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
        pref
      );

      if (r.status < 200 || r.status >= 300) {
        return sendJSON(res, 500, { ok:false, error:"Falha ao criar checkout MP", details: r.json || r.text });
      }

      return sendJSON(res, 200, {
        ok: true,
        init_point: r.json.init_point || r.json.sandbox_init_point,
        id: r.json.id,
      });
    }

    if (op === "mp_webhook") {
      // Webhook básico: não quebra seu deploy.
      // (Validação real depende do fluxo oficial do Mercado Pago e do tipo de notificação.)
      const secret = u.searchParams.get("secret") || "";
      if (MP_WEBHOOK_SECRET && secret !== MP_WEBHOOK_SECRET) return sendJSON(res, 401, { ok:false });

      // Consome body só pra não dar erro
      await readBody(req);
      return sendJSON(res, 200, { ok:true });
    }

    // ---------- UI ----------
    return sendHTML(res, `<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<title>ICE-CUBO</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
:root{
  --bg:#071a2f; --card:#0b2645; --card2:#0d315a; --line:rgba(255,255,255,.10);
  --txt:#e9f5ff; --mut:#9cc9ea; --a:#38bdf8; --good:#16a34a; --warn:#f59e0b; --bad:#ef4444;
  --gold:#ffd700; --blue:#60a5fa;
}
*{box-sizing:border-box}
body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;background:radial-gradient(900px 700px at 20% -10%,rgba(56,189,248,.18),transparent 60%),
linear-gradient(180deg,#061427,var(--bg));color:var(--txt);height:100vh;overflow:hidden}
a{color:inherit}
#app{height:100vh;display:flex;flex-direction:column}
.topbar{
  height:64px; display:flex; align-items:center; justify-content:space-between;
  padding:10px 12px; gap:10px; border-bottom:1px solid var(--line);
  background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));
}
.brand{display:flex;align-items:center;gap:10px;min-width:0}
.badge{
  width:42px;height:42px;border-radius:14px;display:grid;place-items:center;
  background:linear-gradient(145deg,rgba(56,189,248,.30),rgba(56,189,248,.10));
  border:1px solid rgba(56,189,248,.25);
}
.brand b{display:block;letter-spacing:1px}
.brand small{display:block;color:var(--mut);font-size:12px}
.rightpill{
  display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:16px;
  background:rgba(255,255,255,.06);border:1px solid var(--line);
}
.coin{
  width:26px;height:26px;border-radius:50%;display:grid;place-items:center;
  background:radial-gradient(circle at 30% 30%,#38bdf8,#0b2a6a);
  border:1px solid rgba(255,215,0,.55);
  box-shadow:0 0 0 2px rgba(255,215,0,.16) inset;
}
.coin span{color:var(--gold);font-weight:1000}
.main{flex:1;overflow:auto;padding:12px 12px 92px}
.card{
  background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.03));
  border:1px solid var(--line);
  border-radius:18px; padding:14px; box-shadow:0 18px 45px rgba(0,0,0,.25);
}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.btn{
  border:0;border-radius:14px;padding:12px 12px;font-weight:900;
  background:rgba(56,189,248,.18);color:var(--txt);border:1px solid rgba(56,189,248,.25);
}
.btn:active{transform:translateY(1px)}
.btn.good{background:rgba(22,163,74,.20);border-color:rgba(22,163,74,.35)}
.btn.warn{background:rgba(245,158,11,.18);border-color:rgba(245,158,11,.35)}
.btn.bad{background:rgba(239,68,68,.18);border-color:rgba(239,68,68,.35)}
.inp,textarea{
  width:100%;background:rgba(255,255,255,.06);border:1px solid var(--line);color:var(--txt);
  border-radius:14px;padding:12px 12px;outline:none
}
textarea{min-height:84px;resize:none}
.row{display:flex;gap:10px;align-items:center}
.muted{color:var(--mut);font-size:12px}
.hr{height:1px;background:var(--line);margin:12px 0}
.hrow{display:flex;justify-content:space-between;align-items:center;gap:10px}
.tag{font-size:12px;color:var(--mut)}
.pill{
  display:inline-flex;gap:8px;align-items:center;
  padding:6px 10px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.05);
}
.star-gold{color:var(--gold);filter:drop-shadow(0 0 6px rgba(255,215,0,.35))}
.star-blue{color:var(--blue);filter:drop-shadow(0 0 6px rgba(96,165,250,.35))}
.hide{display:none}

.nav{
  position:fixed;left:10px;right:10px;bottom:10px;
  height:72px;border-radius:22px;border:1px solid var(--line);
  background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.03));
  display:flex;align-items:center;justify-content:space-around;
  box-shadow:0 18px 45px rgba(0,0,0,.35);
}
.nav button{
  width:20%;height:60px;background:transparent;border:0;color:var(--mut);
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
  font-weight:900
}
.nav button i{font-size:18px}
.nav button.active{color:var(--a)}
.media{width:100%;border-radius:16px;overflow:hidden;border:1px solid var(--line);background:rgba(0,0,0,.25)}
.media video,.media img{display:block;width:100%;height:180px;object-fit:cover}
.smallcards{display:flex;gap:10px;overflow:auto;padding-bottom:4px}
.small{min-width:190px}
.small .media video,.small .media img{height:120px}

.stage{
  height:220px;border-radius:18px;border:1px solid var(--line);
  background:radial-gradient(700px 280px at 30% -20%,rgba(56,189,248,.22),transparent 60%),
  linear-gradient(180deg,rgba(0,0,0,.25),rgba(0,0,0,.05));
  position:relative;overflow:hidden
}
.bubbles:before,.bubbles:after{
  content:"";position:absolute;inset:-40%;
  background:
    radial-gradient(circle,rgba(255,255,255,.20) 0 2px,transparent 3px) 0 0/120px 120px,
    radial-gradient(circle,rgba(255,255,255,.12) 0 1px,transparent 2px) 40px 20px/160px 160px;
  animation:float 16s linear infinite;opacity:.6
}
.bubbles:after{animation-duration:22s;opacity:.35;transform:scale(1.2)}
@keyframes float{to{transform:translateY(-140px)}}
.stageInner{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:12px}
#stageMain{width:100%;height:100%;object-fit:cover;border-radius:16px;display:none}
#stageHint{color:rgba(255,255,255,.85);text-align:center}
#stageHint b{display:block;font-size:18px;letter-spacing:1px}
#stageHint small{color:rgba(255,255,255,.65)}
.stageBar{
  position:absolute;left:12px;right:12px;bottom:12px;
  display:flex;gap:8px;justify-content:space-between;align-items:center
}
.stageBar .pill{background:rgba(0,0,0,.25)}
.bigBtn{padding:12px 14px;border-radius:14px;border:1px solid var(--line);background:rgba(0,0,0,.25);color:var(--txt);font-weight:1000}
.bigBtn i{color:var(--a)}

.notice{padding:10px 12px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.05)}
.kpi{display:flex;gap:10px;flex-wrap:wrap}
.kpi .pill{background:rgba(56,189,248,.10);border-color:rgba(56,189,248,.22)}

.bearWrap{display:flex;gap:10px;align-items:center}
.bear{
  width:44px;height:44px;border-radius:14px;border:1px solid rgba(255,255,255,.14);
  background:linear-gradient(145deg,rgba(255,255,255,.10),rgba(255,255,255,.03));
  display:grid;place-items:center;font-size:22px;
}
.ice{
  flex:1;height:44px;border-radius:14px;border:1px solid rgba(56,189,248,.30);
  background:linear-gradient(180deg,rgba(56,189,248,.18),rgba(56,189,248,.06));
  position:relative;overflow:hidden
}
.iceFill{
  position:absolute;left:0;top:0;bottom:0;width:100%;
  background:linear-gradient(90deg,rgba(255,255,255,.08),rgba(255,255,255,0));
}
.iceText{position:absolute;inset:0;display:grid;place-items:center;font-weight:1000;color:rgba(255,255,255,.85)}
</style>
</head>
<body>
<div id="app">
  <div class="topbar">
    <div class="brand">
      <div class="badge"><b>IC</b></div>
      <div style="min-width:0">
        <b>ICE-CUBO</b>
        <small id="subtitle">Timeline • Perfil • Carteira</small>
      </div>
    </div>
    <div class="rightpill">
      <div class="coin"><span>B</span></div>
      <div style="display:flex;flex-direction:column;line-height:1.05">
        <b><span id="blueBal">0</span> BLUE</b>
        <small class="tag" id="who">deslogado</small>
      </div>
    </div>
  </div>

  <div class="main">
    <!-- HOME / TIMELINE -->
    <div class="card" id="panelTimeline">
      <div class="stage bubbles">
        <div class="stageInner">
          <video id="stageMain" playsinline controls></video>
          <div id="stageHint">
            <b>Toque 2x em um vídeo</b>
            <small>ele sobe aqui pra tela grande</small>
          </div>
        </div>
        <div class="stageBar">
          <div class="pill"><i class="fa-solid fa-wand-magic-sparkles" style="color:var(--a)"></i><span class="tag">Reels/Tinder: arrasta pro lado</span></div>
          <button class="bigBtn" id="camBtn"><i class="fa-solid fa-camera"></i> Câmera</button>
        </div>
      </div>

      <div class="hr"></div>

      <div class="hrow">
        <b><i class="fa-solid fa-timeline" style="color:var(--a)"></i> Timeline</b>
        <span class="muted" id="feedNote">Camada 1: seguindo/filhos • Camada 2: todos</span>
      </div>

      <div class="smallcards" id="reelRow"></div>

      <div class="hr"></div>
      <div class="hrow"><b>Todos</b><span class="muted" id="postCount">0</span></div>
      <div class="grid" id="feed"></div>
    </div>

    <!-- PERFIL -->
    <div class="card hide" id="panelPerfil">
      <div class="hrow">
        <b><i class="fa-solid fa-user" style="color:var(--a)"></i> Seu perfil</b>
        <span class="muted">poste foto/vídeo</span>
      </div>

      <div class="notice" id="loginBox">
        <div class="hrow"><b>Entrar / Criar conta</b><span class="muted">ADM é intocável</span></div>
        <div class="row" style="margin-top:10px">
          <input class="inp" id="lgUser" placeholder="Usuário" />
          <input class="inp" id="lgPass" placeholder="Senha" type="password"/>
        </div>
        <div class="row" style="margin-top:10px">
          <button class="btn" id="btnLogin"><i class="fa-solid fa-right-to-bracket"></i> Entrar</button>
          <button class="btn good" id="btnReg"><i class="fa-solid fa-user-plus"></i> Criar</button>
          <button class="btn bad hide" id="btnLogout"><i class="fa-solid fa-power-off"></i> Sair</button>
        </div>
        <div class="muted" style="margin-top:8px">
          Login ADM: <b>${ADM_LOGIN}</b> • Senha: <b>${ADM_SENHA}</b>
        </div>
      </div>

      <div class="hr"></div>

      <div class="row" style="margin-bottom:10px">
        <label class="btn" style="display:inline-flex;align-items:center;gap:8px">
          <i class="fa-solid fa-image"></i> Abrir galeria
          <input id="filePick" type="file" accept="image/*,video/*" style="display:none">
        </label>
        <button class="btn good" id="postBtn"><i class="fa-solid fa-upload"></i> Postar</button>
      </div>
      <div class="muted" id="pickInfo">Nenhum arquivo</div>

      <div class="hr"></div>
      <div class="hrow"><b><i class="fa-solid fa-users" style="color:var(--a)"></i> Seguindo</b><span class="muted" id="followCount">0</span></div>
      <div class="muted" id="followList">—</div>

      <div class="hr"></div>
      <div class="hrow"><b><i class="fa-solid fa-sitemap" style="color:var(--a)"></i> Filhos</b><span class="muted" id="childCount">0</span></div>
      <div class="muted" id="childList">—</div>

      <div class="hr"></div>
      <div class="hrow"><b>Seus posts</b><span class="muted" id="myCount">0</span></div>
      <div class="grid" id="myPosts"></div>
    </div>

    <!-- CARTEIRA -->
    <div class="card hide" id="panelCarteira">
      <div class="hrow">
        <b><i class="fa-solid fa-wallet" style="color:var(--a)"></i> Carteira</b>
        <span class="muted">Depósito / Saque</span>
      </div>

      <div class="hr"></div>

      <div class="notice">
        <div class="hrow"><b>⚠️ Importante</b><span class="muted">protótipo</span></div>
        <div class="muted">
          • Depósito: se você configurar <b>MP_ACCESS_TOKEN</b>, abre pagamento real no Mercado Pago (link).<br>
          • Saque automático real exige sistema/validação (compliance). Aqui vira <b>pedido de saque</b> pro ADM aprovar.
        </div>
      </div>

      <div class="hr"></div>

      <div class="card" style="background:rgba(0,0,0,.18)">
        <div class="hrow"><b style="font-size:18px">💰 Depósito</b><span class="pill"><span class="tag">BRL → BLUE</span></span></div>
        <div class="muted" style="margin-top:6px">1 BRL = 1 BLUE (ajuste depois)</div>
        <div class="row" style="margin-top:10px">
          <input class="inp" id="depVal" placeholder="Valor (ex: 10)" inputmode="decimal"/>
          <button class="btn good" id="depMock"><i class="fa-solid fa-bolt"></i> Depósito rápido (teste)</button>
        </div>
        <div class="row" style="margin-top:10px">
          <button class="btn" id="depMP"><i class="fa-brands fa-pix"></i> Depósito real (Mercado Pago)</button>
        </div>
        <div class="muted" id="depMsg" style="margin-top:10px">—</div>
      </div>

      <div class="hr"></div>

      <div class="card" style="background:rgba(0,0,0,.18)">
        <div class="hrow"><b style="font-size:18px">🏦 Saque</b><span class="pill"><span class="tag">BLUE → Pedido</span></span></div>
        <div class="row" style="margin-top:10px">
          <input class="inp" id="saqVal" placeholder="Valor para sacar" inputmode="decimal"/>
          <button class="btn warn" id="saqReq"><i class="fa-solid fa-paper-plane"></i> Solicitar saque</button>
        </div>
        <div class="muted" id="saqMsg" style="margin-top:10px">—</div>
      </div>

      <div class="hr"></div>
      <div class="hrow"><b>Histórico</b><span class="muted" id="histCount">0</span></div>
      <div id="hist" style="display:flex;flex-direction:column;gap:10px;margin-top:10px"></div>
    </div>

    <!-- TROCAS (TIMELINE EXTRA) -->
    <div class="card hide" id="panelTrocas">
      <div class="hrow"><b><i class="fa-solid fa-repeat" style="color:var(--a)"></i> Trocas</b><span class="muted">produto + oferta</span></div>
      <div class="row" style="margin-top:10px">
        <input class="inp" id="swapTitle" placeholder="Nome do produto (ex: Tênis X)"/>
        <input class="inp" id="swapWant" placeholder="Quero em troca (ex: Moletom / BLUE)"/>
      </div>
      <div style="margin-top:10px">
        <textarea id="swapDesc" placeholder="Descrição rápida..."></textarea>
      </div>
      <div class="row" style="margin-top:10px">
        <label class="btn" style="display:inline-flex;align-items:center;gap:8px">
          <i class="fa-solid fa-camera"></i> Foto/Vídeo
          <input id="swapFile" type="file" accept="image/*,video/*" style="display:none">
        </label>
        <button class="btn good" id="swapPost"><i class="fa-solid fa-bolt"></i> Publicar troca</button>
      </div>
      <div class="muted" id="swapPickInfo" style="margin-top:8px">Nenhum arquivo</div>

      <div class="hr"></div>
      <div class="hrow"><b>Trocas publicadas</b><span class="muted" id="swapCount">0</span></div>
      <div class="grid" id="swapGrid" style="margin-top:10px"></div>
    </div>

    <!-- ADM -->
    <div class="card hide" id="panelADM">
      <div class="hrow"><b><i class="fa-solid fa-shield-halved" style="color:var(--a)"></i> Painel ADM</b><span class="muted">somente ADM</span></div>

      <div class="hr"></div>
      <div class="notice">
        <div class="hrow"><b>🎮 “Minerar” BLUE (jogo)</b><span class="muted">local</span></div>
        <div class="muted">Clique para o urso quebrar o gelo e ganhar BLUE (só protótipo, não é BTC real).</div>
        <div class="bearWrap" style="margin-top:10px">
          <div class="bear">🐻‍❄️</div>
          <div class="ice" id="iceBar">
            <div class="iceFill" id="iceFill"></div>
            <div class="iceText" id="iceText">Gelo 100%</div>
          </div>
          <button class="btn good" id="mineBtn"><i class="fa-solid fa-hammer"></i></button>
        </div>
        <div class="muted" id="mineMsg" style="margin-top:8px">—</div>
      </div>

      <div class="hr"></div>
      <div class="hrow"><b>Usuários</b><span class="muted" id="uCount">0</span></div>
      <div id="uList" style="display:flex;flex-direction:column;gap:10px;margin-top:10px"></div>

      <div class="hr"></div>
      <div class="hrow"><b>Pedidos de Saque</b><span class="muted" id="wCount">0</span></div>
      <div id="wList" style="display:flex;flex-direction:column;gap:10px;margin-top:10px"></div>
    </div>

  </div>

  <div class="nav">
    <button data-tab="timeline" class="active"><i class="fa-solid fa-house"></i><div>HOME</div></button>
    <button data-tab="perfil"><i class="fa-solid fa-user"></i><div>PERFIL</div></button>
    <button data-tab="carteira"><i class="fa-solid fa-wallet"></i><div>CARTEIRA</div></button>
    <button data-tab="trocas"><i class="fa-solid fa-layer-group"></i><div>TROCAS</div></button>
    <button data-tab="adm"><i class="fa-solid fa-star"></i><div>ADM</div></button>
  </div>
</div>

<script>
/* ----------------- STORAGE ----------------- */
const LS = {
  get(k, d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d }catch{ return d } },
  set(k,v){ localStorage.setItem(k, JSON.stringify(v)) }
};
const state = {
  users: LS.get("ice_users", null),
  session: LS.get("ice_session", null),
  posts: LS.get("ice_posts", []),
  swaps: LS.get("ice_swaps", []),
  hist: LS.get("ice_hist", []),
  withdrawals: LS.get("ice_withdrawals", []),
};

function bootDefaults(){
  if(!state.users){
    state.users = [
      {user:"${ADM_LOGIN}", pass:"${ADM_SENHA}", role:"adm", banned:false, follows:[], childs:[]},
    ];
  }
  if(!state.posts.length){
    // 3 posts de exemplo
    state.posts = [
      {id:uid(), by:"${ADM_LOGIN}", type:"img", data:sampleImg(), text:"Bem-vinda ao ICE-CUBO!", ts:Date.now()-600000},
      {id:uid(), by:"${ADM_LOGIN}", type:"img", data:sampleImg2(), text:"Toque 2x nos vídeos pra subir.", ts:Date.now()-300000},
    ];
  }
  persist();
}
function persist(){
  LS.set("ice_users", state.users);
  LS.set("ice_session", state.session);
  LS.set("ice_posts", state.posts);
  LS.set("ice_swaps", state.swaps);
  LS.set("ice_hist", state.hist);
  LS.set("ice_withdrawals", state.withdrawals);
}
function uid(){ return Math.random().toString(16).slice(2)+Date.now().toString(16) }
function now(){ return new Date().toLocaleString() }

/* ----------------- AUTH / ROLES ----------------- */
function me(){
  if(!state.session) return null;
  return state.users.find(u=>u.user===state.session.user) || null;
}
function isADM(){ const u=me(); return u && u.role==="adm" }
function isMOD(){ const u=me(); return u && u.role==="mod" }
function canModerate(targetUser){
  const u=me();
  if(!u) return false;
  if(targetUser=== "${ADM_LOGIN}") return false; // ADM intocável
  return u.role==="adm" || u.role==="mod";
}

/* ----------------- UI NAV ----------------- */
const panels = {
  timeline: document.getElementById("panelTimeline"),
  perfil: document.getElementById("panelPerfil"),
  carteira: document.getElementById("panelCarteira"),
  trocas: document.getElementById("panelTrocas"),
  adm: document.getElementById("panelADM"),
};
document.querySelectorAll(".nav button").forEach(b=>{
  b.onclick = ()=> setTab(b.dataset.tab);
});
function setTab(tab){
  Object.keys(panels).forEach(k=> panels[k].classList.toggle("hide", k!==tab));
  document.querySelectorAll(".nav button").forEach(b=> b.classList.toggle("active", b.dataset.tab===tab));
  // ADM panel bloqueado
  if(tab==="adm" && !isADM()){
    alert("Somente ADM.");
    return setTab("perfil");
  }
  renderAll();
}

/* ----------------- RENDER ----------------- */
const blueBal = document.getElementById("blueBal");
const who = document.getElementById("who");
const subtitle = document.getElementById("subtitle");

function badgeName(u){
  if(!u) return "deslogado";
  const icon = u.role==="adm" ? "⭐" : (u.role==="mod" ? "🔹" : "");
  return icon ? (u.user+" "+icon) : u.user;
}
function getBlue(){
  return Number(LS.get("ice_blue", 0))||0;
}
function setBlue(v){
  LS.set("ice_blue", Number(v)||0);
  blueBal.textContent = getBlue();
}
function pushHist(type, msg){
  state.hist.unshift({id:uid(), ts:Date.now(), type, msg});
  if(state.hist.length>80) state.hist.pop();
  persist();
}

function renderTop(){
  const u = me();
  blueBal.textContent = getBlue();
  who.textContent = u ? badgeName(u) : "deslogado";
  subtitle.textContent = u ? (u.role==="adm" ? "ADM Master • intocável" : u.role==="mod" ? "Moderador • ações limitadas" : "Usuário • timeline") : "Timeline • Perfil • Carteira";
}

function mediaEl(p, small=false){
  const wrap = document.createElement("div");
  wrap.className = "card " + (small ? "small" : "");
  wrap.style.padding = "10px";
  wrap.style.background = "rgba(0,0,0,.18)";

  const head = document.createElement("div");
  head.className="hrow";
  head.innerHTML = \`<span class="pill">\${roleIcon(p.by)} <b>\${escapeHtml(p.by)}</b></span><span class="muted">\${new Date(p.ts).toLocaleString()}</span>\`;
  wrap.appendChild(head);

  const m = document.createElement("div");
  m.className="media";
  if(p.type==="video"){
    const v=document.createElement("video");
    v.src=p.data; v.playsInline=true; v.muted=true; v.loop=true; v.controls=false;
    v.addEventListener("click", ()=>{ try{ v.play(); }catch{} });
    // double tap -> stage
    let t=0;
    v.addEventListener("touchend", (e)=>{
      const now=Date.now(); if(now-t<280){ stageVideo(p.data); } t=now;
    }, {passive:true});
    v.addEventListener("dblclick", ()=> stageVideo(p.data));
    m.appendChild(v);
  } else {
    const img=document.createElement("img");
    img.src=p.data;
    m.appendChild(img);
  }
  wrap.appendChild(m);

  const tx = document.createElement("div");
  tx.className="muted";
  tx.style.marginTop="8px";
  tx.textContent = p.text || "";
  wrap.appendChild(tx);

  // ações
  const u = me();
  const act = document.createElement("div");
  act.className="row";
  act.style.marginTop="10px";
  act.style.justifyContent="space-between";
  const left=document.createElement("div");
  left.className="row";

  const followBtn=document.createElement("button");
  followBtn.className="btn";
  followBtn.style.padding="10px 10px";
  followBtn.innerHTML='<i class="fa-solid fa-user-plus"></i> Seguir';
  followBtn.onclick=()=>{
    if(!u) return alert("Entre primeiro.");
    if(u.user===p.by) return;
    if(!u.follows.includes(p.by)) u.follows.push(p.by);
    persist(); renderAll();
  };
  left.appendChild(followBtn);

  const childBtn=document.createElement("button");
  childBtn.className="btn";
  childBtn.style.padding="10px 10px";
  childBtn.innerHTML='<i class="fa-solid fa-link"></i> Filho';
  childBtn.onclick=()=>{
    if(!u) return alert("Entre primeiro.");
    // "ganhar como filho" — simples (demo)
    if(!u.childs.includes(p.by) && p.by!==u.user) u.childs.push(p.by);
    persist(); renderAll();
  };
  left.appendChild(childBtn);

  const right=document.createElement("div");
  right.className="row";
  const banBtn=document.createElement("button");
  banBtn.className="btn bad";
  banBtn.style.padding="10px 10px";
  banBtn.innerHTML='<i class="fa-solid fa-ban"></i>';
  banBtn.title="Banir usuário (ADM/MOD)";
  banBtn.onclick=()=>{
    if(!canModerate(p.by)) return alert("Sem permissão.");
    const target = state.users.find(x=>x.user===p.by);
    if(!target) return;
    target.banned = true;
    pushHist("mod", \`Usuário \${p.by} banido.\`);
    persist(); renderAll();
  };
  right.appendChild(banBtn);

  act.appendChild(left);
  act.appendChild(right);
  wrap.appendChild(act);

  return wrap;
}
function roleIcon(username){
  const u = state.users.find(x=>x.user===username);
  if(!u) return "";
  if(u.role==="adm") return '<i class="fa-solid fa-star star-gold"></i>';
  if(u.role==="mod") return '<i class="fa-solid fa-star star-blue"></i>';
  return '<i class="fa-solid fa-user" style="color:var(--mut)"></i>';
}
function escapeHtml(s){ return String(s||"").replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m])) }

function renderTimeline(){
  const feed = document.getElementById("feed");
  const reelRow = document.getElementById("reelRow");
  const postCount = document.getElementById("postCount");
  feed.innerHTML=""; reelRow.innerHTML="";

  const u = me();
  // Camada 1: seguindo/filhos
  const layer1 = u ? state.posts.filter(p => u.follows.includes(p.by) || u.childs.includes(p.by) || p.by===u.user) : [];
  // Camada 2: todos
  const all = state.posts.slice().sort((a,b)=>b.ts-a.ts);

  const show = (layer1.length ? layer1.concat(all) : all).filter((p,idx,arr)=>{
    // remove duplicados por id mantendo ordem
    return idx===arr.findIndex(x=>x.id===p.id);
  });

  postCount.textContent = String(show.length);

  // Reels row: só vídeos
  const vids = show.filter(p=>p.type==="video").slice(0,8);
  vids.forEach(p=> reelRow.appendChild(mediaEl(p,true)));

  show.forEach(p=> feed.appendChild(mediaEl(p,false)));
}

function renderPerfil(){
  const u = me();
  const btnLogout = document.getElementById("btnLogout");
  btnLogout.classList.toggle("hide", !u);
  document.getElementById("followCount").textContent = u ? String(u.follows.length) : "0";
  document.getElementById("childCount").textContent = u ? String(u.childs.length) : "0";
  document.getElementById("followList").textContent = u && u.follows.length ? u.follows.join(", ") : "—";
  document.getElementById("childList").textContent = u && u.childs.length ? u.childs.join(", ") : "—";

  const my = u ? state.posts.filter(p=>p.by===u.user).sort((a,b)=>b.ts-a.ts) : [];
  document.getElementById("myCount").textContent = String(my.length);
  const grid = document.getElementById("myPosts");
  grid.innerHTML="";
  my.forEach(p=> grid.appendChild(mediaEl(p,true)));
}

function renderCarteira(){
  const hist = document.getElementById("hist");
  const histCount = document.getElementById("histCount");
  hist.innerHTML="";
  histCount.textContent = String(state.hist.length);
  state.hist.slice(0,30).forEach(h=>{
    const d=document.createElement("div");
    d.className="notice";
    d.innerHTML = \`<div class="hrow"><b>\${escapeHtml(h.type.toUpperCase())}</b><span class="muted">\${new Date(h.ts).toLocaleString()}</span></div><div class="muted" style="margin-top:6px">\${escapeHtml(h.msg)}</div>\`;
    hist.appendChild(d);
  });
}

function renderTrocas(){
  const swapCount = document.getElementById("swapCount");
  const swapGrid = document.getElementById("swapGrid");
  swapGrid.innerHTML="";
  swapCount.textContent = String(state.swaps.length);
  state.swaps.slice().sort((a,b)=>b.ts-a.ts).forEach(s=>{
    const c=document.createElement("div");
    c.className="card";
    c.style.padding="10px";
    c.style.background="rgba(0,0,0,.18)";
    c.innerHTML = \`
      <div class="hrow">
        <span class="pill">\${roleIcon(s.by)} <b>\${escapeHtml(s.by)}</b></span>
        <span class="muted">\${new Date(s.ts).toLocaleString()}</span>
      </div>
      <div class="muted" style="margin-top:8px"><b>\${escapeHtml(s.title)}</b> • quero: \${escapeHtml(s.want)}</div>
      <div class="muted" style="margin-top:6px">\${escapeHtml(s.desc||"")}</div>
    \`;
    if(s.data){
      const m=document.createElement("div");
      m.className="media";
      m.style.marginTop="8px";
      if(s.type==="video"){
        const v=document.createElement("video");
        v.src=s.data; v.playsInline=true; v.controls=true;
        m.appendChild(v);
      }else{
        const img=document.createElement("img");
        img.src=s.data;
        m.appendChild(img);
      }
      c.appendChild(m);
    }
    swapGrid.appendChild(c);
  });
}

function renderADM(){
  if(!isADM()) return;
  const uList = document.getElementById("uList");
  const uCount = document.getElementById("uCount");
  uList.innerHTML="";
  uCount.textContent = String(state.users.length);

  state.users.slice().sort((a,b)=>a.user.localeCompare(b.user)).forEach(u=>{
    const box=document.createElement("div");
    box.className="notice";
    const roleTxt = u.role==="adm" ? "ADM" : (u.role==="mod" ? "MOD" : "USER");
    box.innerHTML = \`
      <div class="hrow">
        <b>\${roleIcon(u.user)} \${escapeHtml(u.user)} <span class="muted">(\${roleTxt})</span></b>
        <span class="muted">\${u.banned ? "BANIDO" : "OK"}</span>
      </div>
      <div class="row" style="margin-top:10px;justify-content:space-between">
        <button class="btn" data-act="mod">\${u.role==="mod" ? "Rebaixar" : "Virar MOD"}</button>
        <button class="btn bad" data-act="ban">\${u.banned ? "Desbanir" : "Banir"}</button>
      </div>
    \`;
    const [bMod,bBan] = box.querySelectorAll("button");
    bMod.onclick=()=>{
      if(u.user==="${ADM_LOGIN}") return alert("ADM é intocável.");
      u.role = (u.role==="mod") ? "user" : "mod";
      pushHist("adm", \`Role de \${u.user} -> \${u.role}\`);
      persist(); renderAll();
    };
    bBan.onclick=()=>{
      if(u.user==="${ADM_LOGIN}") return alert("ADM é intocável.");
      u.banned = !u.banned;
      pushHist("adm", \`\${u.banned ? "Banido" : "Desbanido"}: \${u.user}\`);
      persist(); renderAll();
    };
    uList.appendChild(box);
  });

  const wList = document.getElementById("wList");
  const wCount = document.getElementById("wCount");
  wList.innerHTML="";
  wCount.textContent = String(state.withdrawals.length);

  state.withdrawals.slice().sort((a,b)=>b.ts-a.ts).forEach(w=>{
    const box=document.createElement("div");
    box.className="notice";
    box.innerHTML = \`
      <div class="hrow"><b>\${escapeHtml(w.user)}</b><span class="muted">\${new Date(w.ts).toLocaleString()}</span></div>
      <div class="muted" style="margin-top:6px">Valor: <b>\${w.amount}</b> BLUE • Status: <b>\${escapeHtml(w.status)}</b></div>
      <div class="row" style="margin-top:10px;justify-content:space-between">
        <button class="btn good">Aprovar</button>
        <button class="btn bad">Recusar</button>
      </div>
    \`;
    const [ap,re] = box.querySelectorAll("button");
    ap.onclick=()=>{
      if(w.status!=="pendente") return;
      w.status="aprovado";
      pushHist("saque", \`Saque aprovado para \${w.user}: \${w.amount} BLUE\`);
      persist(); renderAll();
    };
    re.onclick=()=>{
      if(w.status!=="pendente") return;
      w.status="recusado";
      // devolve saldo
      setBlue(getBlue()+Number(w.amount||0));
      pushHist("saque", \`Saque recusado. Devolvido: \${w.amount} BLUE\`);
      persist(); renderAll();
    };
    wList.appendChild(box);
  });
}

function renderAll(){
  renderTop();
  renderTimeline();
  renderPerfil();
  renderCarteira();
  renderTrocas();
  renderADM();
}

/* ----------------- STAGE / CAMERA ----------------- */
const stageMain = document.getElementById("stageMain");
const stageHint = document.getElementById("stageHint");
function stageVideo(src){
  stageHint.style.display="none";
  stageMain.style.display="block";
  stageMain.src = src;
  stageMain.currentTime = 0;
  stageMain.muted = false;
  stageMain.play().catch(()=>{});
}

// câmera (mostra preview local, sem subir pra servidor)
document.getElementById("camBtn").onclick = async ()=>{
  try{
    const stream = await navigator.mediaDevices.getUserMedia({video:true,audio:false});
    stageHint.style.display="none";
    stageMain.style.display="block";
    stageMain.srcObject = stream;
    stageMain.controls = false;
    stageMain.muted = true;
    stageMain.play().catch(()=>{});
  }catch(e){
    alert("Não deu permissão da câmera.");
  }
};

/* ----------------- LOGIN / REGISTER ----------------- */
document.getElementById("btnLogin").onclick = ()=>{
  const user = (document.getElementById("lgUser").value||"").trim();
  const pass = (document.getElementById("lgPass").value||"").trim();
  const u = state.users.find(x=>x.user===user);
  if(!u || u.pass!==pass) return alert("Login ou senha errados.");
  if(u.banned) return alert("Você está banido.");
  state.session = { user, ts: Date.now() };
  persist(); renderAll(); alert("Logado!");
};
document.getElementById("btnReg").onclick = ()=>{
  const user = (document.getElementById("lgUser").value||"").trim();
  const pass = (document.getElementById("lgPass").value||"").trim();
  if(user.length<3 || pass.length<3) return alert("Usuário e senha mínimo 3 letras.");
  if(state.users.some(x=>x.user===user)) return alert("Já existe.");
  state.users.push({user, pass, role:"user", banned:false, follows:[], childs:[]});
  state.session = { user, ts: Date.now() };
  persist(); renderAll(); alert("Conta criada!");
};
document.getElementById("btnLogout").onclick = ()=>{
  state.session=null; persist(); renderAll(); alert("Saiu.");
};

/* ----------------- POST (FOTO/VÍDEO) ----------------- */
let picked = null;
document.getElementById("filePick").onchange = async (e)=>{
  const f = e.target.files && e.target.files[0];
  if(!f) return;
  picked = await fileToDataURL(f);
  document.getElementById("pickInfo").textContent = \`\${f.type} • \${Math.round(f.size/1024)}KB\`;
};
document.getElementById("postBtn").onclick = ()=>{
  const u = me();
  if(!u) return alert("Entre primeiro.");
  if(u.banned) return alert("Banido.");
  if(!picked) return alert("Escolha um arquivo.");
  const isVideo = picked.startsWith("data:video");
  state.posts.unshift({id:uid(), by:u.user, type:isVideo?"video":"img", data:picked, text:"", ts:Date.now()});
  picked=null;
  document.getElementById("pickInfo").textContent="Postado!";
  persist(); renderAll();
};

function fileToDataURL(file){
  return new Promise((resolve,reject)=>{
    const fr=new FileReader();
    fr.onload=()=> resolve(fr.result);
    fr.onerror=reject;
    fr.readAsDataURL(file);
  });
}

/* ----------------- TROCAS ----------------- */
let swapPicked=null;
document.getElementById("swapFile").onchange = async (e)=>{
  const f = e.target.files && e.target.files[0];
  if(!f) return;
  swapPicked = await fileToDataURL(f);
  document.getElementById("swapPickInfo").textContent = \`\${f.type} • \${Math.round(f.size/1024)}KB\`;
};
document.getElementById("swapPost").onclick = ()=>{
  const u = me();
  if(!u) return alert("Entre primeiro.");
  const title = (document.getElementById("swapTitle").value||"").trim();
  const want = (document.getElementById("swapWant").value||"").trim();
  const desc = (document.getElementById("swapDesc").value||"").trim();
  if(!title || !want) return alert("Preencha nome e o que quer em troca.");
  let type="", data="";
  if(swapPicked){
    data=swapPicked;
    type = swapPicked.startsWith("data:video") ? "video" : "img";
  }
  state.swaps.unshift({id:uid(), by:u.user, title, want, desc, type, data, ts:Date.now()});
  document.getElementById("swapTitle").value="";
  document.getElementById("swapWant").value="";
  document.getElementById("swapDesc").value="";
  swapPicked=null;
  document.getElementById("swapPickInfo").textContent="Publicado!";
  persist(); renderAll();
};

/* ----------------- CARTEIRA (DEP/SAC) ----------------- */
document.getElementById("depMock").onclick = ()=>{
  const u = me(); if(!u) return alert("Entre primeiro.");
  const v = Number((document.getElementById("depVal").value||"").replace(",","."));
  if(!v || v<1) return alert("Valor inválido.");
  setBlue(getBlue()+v);
  pushHist("deposito", \`Depósito teste: +\${v} BLUE\`);
  document.getElementById("depMsg").textContent = "Depósito teste aplicado.";
  persist(); renderAll();
};

document.getElementById("depMP").onclick = async ()=>{
  const u = me(); if(!u) return alert("Entre primeiro.");
  const v = Number((document.getElementById("depVal").value||"").replace(",","."));
  if(!v || v<1) return alert("Valor inválido.");

  document.getElementById("depMsg").textContent = "Criando pagamento no Mercado Pago...";
  try{
    const r = await fetch("/api?op=mp_create", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ amount: v, user: u.user })
    });
    const j = await r.json();
    if(!j.ok) throw new Error(j.error || "Falha");
    document.getElementById("depMsg").textContent = "Abrindo pagamento...";
    window.open(j.init_point, "_blank");
    pushHist("deposito", \`Link MP gerado: R$\${v} (usuário \${u.user})\`);
    persist(); renderAll();
  }catch(e){
    document.getElementById("depMsg").textContent = "Erro: " + (e.message||e);
    alert("Depósito real não habilitado. Configure MP_ACCESS_TOKEN no Vercel.");
  }
};

document.getElementById("saqReq").onclick = ()=>{
  const u = me(); if(!u) return alert("Entre primeiro.");
  const v = Number((document.getElementById("saqVal").value||"").replace(",","."));
  if(!v || v<1) return alert("Valor inválido.");
  if(getBlue() < v) return alert("Sem saldo.");
  setBlue(getBlue()-v);
  state.withdrawals.unshift({id:uid(), user:u.user, amount:v, status:"pendente", ts:Date.now()});
  pushHist("saque", \`Pedido de saque: -\${v} BLUE (pendente)\`);
  document.getElementById("saqMsg").textContent = "Pedido enviado. ADM vai aprovar/recusar.";
  persist(); renderAll();
};

/* ----------------- MINER (JOGO) ----------------- */
let ice = Number(LS.get("ice_ice", 100));
function setIce(v){
  ice = Math.max(0, Math.min(100, v));
  LS.set("ice_ice", ice);
  document.getElementById("iceFill").style.width = ice + "%";
  document.getElementById("iceText").textContent = "Gelo " + ice + "%";
}
setIce(ice);

document.getElementById("mineBtn").onclick = ()=>{
  const u = me(); if(!u) return alert("Entre primeiro.");
  if(!isADM()) return alert("Somente ADM pode iniciar o modo mineração.");
  const hit = 8 + Math.floor(Math.random()*12);
  setIce(ice - hit);
  const gain = 1 + Math.floor(Math.random()*3);
  setBlue(getBlue()+gain);
  pushHist("mining", \`Urso quebrou \${hit}% do gelo • +\${gain} BLUE\`);
  document.getElementById("mineMsg").textContent = \`+ \${gain} BLUE • gelo agora \${ice}%\`;
  if(ice<=0){
    const bonus = 20;
    setBlue(getBlue()+bonus);
    pushHist("mining", \`Bloco quebrado! Bônus: +\${bonus} BLUE\`);
    setIce(100);
    document.getElementById("mineMsg").textContent = "BLOCO QUEBRADO! +"+bonus+" BLUE (novo gelo 100%).";
  }
  persist(); renderAll();
};

/* ----------------- HELPERS / SAMPLE IMG ----------------- */
function sampleImg(){
  // florzinha simples (dataURL pequeno)
  return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='%2338bdf8'/><stop offset='1' stop-color='%230b2a6a'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g)'/><circle cx='140' cy='120' r='80' fill='rgba(255,255,255,.18)'/><circle cx='680' cy='90' r='120' fill='rgba(255,255,255,.10)'/><text x='40' y='280' fill='white' font-family='Arial' font-size='56' font-weight='900'>ICE-CUBO</text><text x='40' y='340' fill='rgba(255,255,255,.8)' font-family='Arial' font-size='26'>timeline • perfil • carteira</text></svg>"
  );
}
function sampleImg2(){
  return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'><rect width='100%' height='100%' fill='%23061727'/><circle cx='520' cy='230' r='160' fill='rgba(56,189,248,.18)'/><text x='50' y='250' fill='%23e9f5ff' font-family='Arial' font-size='48' font-weight='900'>Arrasta pro lado</text><text x='50' y='310' fill='%239cc9ea' font-family='Arial' font-size='26'>e dá 2 toques no vídeo</text></svg>"
  );
}

/* ----------------- START ----------------- */
bootDefaults();
renderAll();
</script>
</body>
</html>`);
  } catch (e) {
    return sendJSON(res, 500, { ok: false, error: String(e && e.message ? e.message : e) });
  }
};
