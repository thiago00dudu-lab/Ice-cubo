export default async function handler(req, res) {
  const MP = "https://api.mercadopago.com";
  const token = process.env.MP_ACCESS_TOKEN;

  // --- helpers server ---
  const send = (code, body, type = "text/html; charset=utf-8") => {
    res.statusCode = code;
    res.setHeader("Content-Type", type);
    res.end(body);
  };

  const readBody = async () => {
    if (req.body) return req.body;
    let raw = "";
    await new Promise((resolve) => {
      req.on("data", (c) => (raw += c));
      req.on("end", resolve);
    });
    if (!raw) return {};
    try { return JSON.parse(raw); } catch { return {}; }
  };

  // =========================
  // API ROUTES (same file)
  // =========================
  const a = (req.query && req.query.a) ? String(req.query.a) : "";

  // --- Create PIX payment (POST) ---
  if (a === "mp_create") {
    try {
      if (!token) return send(500, JSON.stringify({ ok: false, error: "MP_ACCESS_TOKEN não configurado" }), "application/json");
      if (req.method !== "POST") return send(405, JSON.stringify({ ok: false, error: "Use POST" }), "application/json");

      const body = await readBody();
      const email = String(body.email || "").trim();
      const amount = Number(body.amount);
      const ref = String(body.ref || "").trim(); // pai (opcional)
      if (!email || !amount || Number.isNaN(amount)) {
        return send(400, JSON.stringify({ ok: false, error: "Envie { email, amount }" }), "application/json");
      }

      // MercadoPago costuma rejeitar valores muito baixos. Teste 1.00 se 0.05 falhar.
      const transaction_amount = Math.round(amount * 100) / 100;

      // Criando pagamento PIX
      const r = await fetch(`${MP}/v1/payments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": (Date.now().toString(36) + Math.random().toString(16).slice(2)),
        },
        body: JSON.stringify({
          transaction_amount,
          description: "Compra BLUE - ICE-CUBO",
          payment_method_id: "pix",
          payer: { email },
          external_reference: email,
          metadata: { email, ref }
        }),
      });

      const data = await r.json();
      if (!r.ok) return send(400, JSON.stringify({ ok: false, error: data }), "application/json");

      const tx = data.point_of_interaction?.transaction_data || {};
      return send(200, JSON.stringify({
        ok: true,
        paymentId: data.id,
        status: data.status,
        amount: data.transaction_amount,
        qr_code: tx.qr_code || null,
        qr_code_base64: tx.qr_code_base64 || null,
      }), "application/json");
    } catch (e) {
      return send(500, JSON.stringify({ ok: false, error: e.message }), "application/json");
    }
  }

  // --- Check payment status (GET) ---
  if (a === "mp_check") {
    try {
      if (!token) return send(500, JSON.stringify({ ok: false, error: "MP_ACCESS_TOKEN não configurado" }), "application/json");
      const paymentId = String((req.query && req.query.paymentId) || "").trim();
      if (!paymentId) return send(400, JSON.stringify({ ok: false, error: "Envie paymentId" }), "application/json");

      const r = await fetch(`${MP}/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await r.json();
      if (!r.ok) return send(400, JSON.stringify({ ok: false, error: data }), "application/json");

      return send(200, JSON.stringify({
        ok: true,
        id: data.id,
        status: data.status, // approved / pending / rejected
        amount: data.transaction_amount,
        payer_email: data.payer?.email || data.metadata?.email || null,
        ref: data.metadata?.ref || "",
      }), "application/json");
    } catch (e) {
      return send(500, JSON.stringify({ ok: false, error: e.message }), "application/json");
    }
  }

  // --- Webhook (optional) ---
  if (a === "mp_webhook") {
    // Sem banco, a gente só responde 200 para o MP não ficar reenviando.
    // Se depois você quiser "auto-sem-clicar", aí a gente liga um banco (Vercel KV / Upstash / Supabase).
    return send(200, "ok", "text/plain; charset=utf-8");
  }

  // =========================
  // FRONTEND (HTML)
  // =========================
  return send(200, `<!doctype html><html lang="pt-br"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<title>ICE-CUBO</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
<style>
:root{--bg1:#dff3ff;--bg2:#bfe8ff;--bg3:#072445;--g:rgba(255,255,255,.58);--l:rgba(7,36,69,.18);--t:#06223f;--m:#2b587d;--a:#0ea5e9;--ok:#16a34a;--bad:#fb7185}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;color:var(--t);height:100vh;overflow:hidden;
background:radial-gradient(1200px 700px at 15% -10%,rgba(255,255,255,.88),transparent 55%),
radial-gradient(900px 700px at 110% 20%,rgba(56,189,248,.25),transparent 60%),
linear-gradient(180deg,var(--bg1),var(--bg2) 45%,#7dd3fc 70%,#2aa9ff 86%,var(--bg3));
}
body:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.36;mix-blend-mode:multiply;
background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cg fill='none'%3E%3Cpath d='M60 10c6 10 6 20 0 30c-6-10-6-20 0-30Z' fill='%230ea5e9' opacity='.35'/%3E%3Cpath d='M35 35c10 6 20 6 30 0c-10-6-20-6-30 0Z' fill='%230ea5e9' opacity='.25'/%3E%3Cpath d='M85 35c-10 6-20 6-30 0c10-6 20-6 30 0Z' fill='%230ea5e9' opacity='.25'/%3E%3Ccircle cx='22' cy='88' r='3' fill='%23ffffff' opacity='.35'/%3E%3Ccircle cx='35' cy='98' r='2' fill='%23ffffff' opacity='.25'/%3E%3Ccircle cx='48' cy='88' r='2' fill='%23ffffff' opacity='.2'/%3E%3Cpath d='M82 86c8-10 12-18 4-28c-9 6-14 12-4 28Z' fill='%230b5fa5' opacity='.22'/%3E%3Cpath d='M82 86c2-6 8-10 12-12' stroke='%230b5fa5' opacity='.22' stroke-width='2' stroke-linecap='round'/%3E%3Cpath d='M82 86c-2-6-8-10-12-12' stroke='%230b5fa5' opacity='.22' stroke-width='2' stroke-linecap='round'/%3E%3C/g%3E%3C/svg%3E");
background-size:140px 140px;
}
button{cursor:pointer}input,textarea{font:inherit}
.wrap{height:100vh;display:flex;flex-direction:column}
.top{height:50vh;position:relative;border-radius:0 0 26px 26px;overflow:hidden;background:rgba(0,0,0,.06)}
.bub:before,.bub:after{content:"";position:absolute;inset:-20%;background:
radial-gradient(circle,rgba(255,255,255,.38) 0 2px,transparent 3px) 0 0/120px 120px,
radial-gradient(circle,rgba(255,255,255,.24) 0 1px,transparent 2px) 40px 20px/160px 160px;
animation:float 14s linear infinite;opacity:.55}
.bub:after{animation-duration:20s;opacity:.35;transform:scale(1.15)}
@keyframes float{to{transform:translateY(-120px)}}
.brand{position:absolute;top:10px;left:12px;right:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:3}
.logo{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(10px);border-radius:18px;box-shadow:0 10px 30px rgba(0,0,0,.10)}
.brandname{display:flex;flex-direction:column;line-height:1.05}
.brandname b{letter-spacing:1.2px;font-size:15px}
.brandname small{color:var(--m);font-size:11px}
.pill{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(10px);border-radius:18px}
.coin{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 30% 30%,#38bdf8,#0b2a6a);
border:1px solid rgba(255,215,0,.55);box-shadow:0 0 0 2px rgba(255,215,0,.18) inset}
.coin span{color:#ffd700;font-weight:1000}
.viewer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:2}
#mainV,#mainI{width:100%;height:100%;object-fit:cover;display:none}
.hint{position:absolute;inset:auto 12px 72px 12px;padding:10px 12px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(12px);border-radius:18px;color:var(--m);text-align:center}
.stageBar{position:absolute;left:12px;right:12px;bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:4}
.card{flex:1;display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(12px);border-radius:18px;min-width:0}
.av{width:38px;height:38px;border-radius:14px;display:grid;place-items:center;font-weight:1000;background:linear-gradient(135deg,#38bdf8,#1d4ed8);position:relative;color:#fff}
.meta2{min-width:0}
.meta2 .name{font-weight:1000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:8px}
.meta2 .sub{font-size:12px;color:var(--m);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.star{font-size:13px}
.star.gold{color:#ffd700;text-shadow:0 0 10px rgba(255,215,0,.35)}
.star.blue{color:#0ea5e9;text-shadow:0 0 10px rgba(14,165,233,.25)}
.sbtn{padding:10px 12px;border-radius:18px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(12px);color:var(--t)}
.sbtn:active{transform:scale(.98)}
.bottom{flex:1;display:flex;flex-direction:column;gap:10px;padding:10px 10px 74px;overflow:hidden}
.carousel{display:flex;gap:10px;overflow:auto;scroll-snap-type:x mandatory;padding-bottom:4px}
.item{min-width:190px;max-width:190px;height:120px;border-radius:18px;overflow:hidden;border:1px solid var(--l);background:rgba(255,255,255,.35);scroll-snap-align:center;position:relative}
.item video,.item img{width:100%;height:100%;object-fit:cover;display:block}
.tag{position:absolute;left:8px;bottom:8px;padding:6px 10px;border:1px solid rgba(7,36,69,.18);background:rgba(255,255,255,.55);backdrop-filter:blur(8px);border-radius:14px;font-size:12px;display:flex;gap:8px;align-items:center;color:#053055}
.tag .mini{width:18px;height:18px;border-radius:7px;display:grid;place-items:center;font-weight:900;background:linear-gradient(135deg,#38bdf8,#1d4ed8);color:#fff}
.panel{flex:1;overflow:auto;border:1px solid var(--l);background:rgba(255,255,255,.55);backdrop-filter:blur(12px);border-radius:22px;padding:12px}
.hrow{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.hrow h3{margin:0;font-size:16px}
.muted{color:var(--m);font-size:12px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.box{border:1px solid var(--l);background:rgba(255,255,255,.38);border-radius:18px;padding:10px}
.box h4{margin:0 0 8px;font-size:13px}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.field{flex:1;min-width:180px}
.field input,.field textarea{width:100%;padding:12px;border-radius:18px;border:1px solid rgba(7,36,69,.14);background:rgba(255,255,255,.78);color:var(--t);outline:none}
.field textarea{min-height:70px;resize:vertical}
hr{border:0;border-top:1px solid rgba(7,36,69,.12);margin:10px 0}
.nav{position:fixed;left:10px;right:10px;bottom:10px;display:flex;gap:10px;z-index:10}
.nav button{flex:1;padding:12px 10px;border-radius:20px;border:1px solid var(--l);background:rgba(255,255,255,.55);backdrop-filter:blur(14px);color:var(--t);display:flex;align-items:center;justify-content:center;gap:8px}
.nav button.active{outline:2px solid rgba(14,165,233,.9)}
.modal{position:fixed;inset:0;background:rgba(0,0,0,.45);display:none;align-items:flex-end;justify-content:center;z-index:20}
.sheet{width:min(760px,100%);max-height:86vh;border-radius:26px 26px 0 0;overflow:hidden;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.88);backdrop-filter:blur(18px)}
.sheetTop{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid rgba(7,36,69,.12)}
.sheetBody{padding:12px 12px 14px;overflow:auto;max-height:calc(86vh - 52px)}
.center{display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;padding:18px}
.cardLogin{width:min(420px,100%);border:1px solid var(--l);background:rgba(255,255,255,.7);backdrop-filter:blur(12px);border-radius:22px;padding:14px}
.cardLogin h2{margin:0 0 8px}
.cardLogin small{color:var(--m)}
.btnWide{width:100%;padding:12px;border-radius:18px;border:1px solid rgba(14,165,233,.25);background:rgba(14,165,233,.12);font-weight:900}
.bad{color:#b91c1c;font-weight:900}
.ok{color:#166534;font-weight:900}

/* bear anim (CSS) */
.bearWrap{width:44px;height:44px;border-radius:16px;border:1px solid rgba(7,36,69,.14);background:rgba(255,255,255,.66);display:grid;place-items:center;overflow:hidden}
.bearWrap svg{width:44px;height:44px}
@keyframes paw{0%,100%{transform:translate(0,0) rotate(-3deg)}50%{transform:translate(2px,-1px) rotate(6deg)}}
@keyframes coin{0%,100%{transform:translate(0,0)}50%{transform:translate(0,-1px)}}
.paw{transform-origin:24px 24px}.coinAnim{transform-origin:22px 26px}
.bearWrap .paw{animation:paw 1.1s ease-in-out infinite}
.bearWrap .coinAnim{animation:coin 1.1s ease-in-out infinite}
</style></head><body>

<div id="screenLogin" class="center" style="display:none">
  <div class="cardLogin">
    <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px">
      <div class="bearWrap" title="urso tentando pegar BLUE">
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
        <h2 style="margin:0">ICE-CUBO</h2>
        <small>Login + Cadastro • BLUE • Depósito PIX</small>
      </div>
    </div>

    <div class="row">
      <div class="field"><input id="lgUser" placeholder="Usuário (ex: jessica) ou admin"/></div>
      <div class="field"><input id="lgPass" placeholder="Senha" type="password"/></div>
    </div>
    <div class="row" style="margin-top:8px">
      <div class="field"><input id="lgRef" placeholder="(Opcional) Código do pai / indicou"/></div>
    </div>

    <div style="height:10px"></div>
    <button class="btnWide" id="btnLogin"><i class="fa-solid fa-right-to-bracket"></i> Entrar</button>
    <div style="height:10px"></div>
    <button class="btnWide" id="btnGoCad" style="background:rgba(255,255,255,.65)"><i class="fa-solid fa-user-plus"></i> Criar conta</button>
    <div id="lgMsg" style="margin-top:10px"></div>
  </div>
</div>

<div id="screenCad" class="center" style="display:none">
  <div class="cardLogin">
    <h2 style="margin:0 0 6px">Criar conta</h2>
    <small>Qualquer pessoa pode cadastrar</small>
    <div style="height:10px"></div>
    <div class="row">
      <div class="field"><input id="cdUser" placeholder="Novo usuário"/></div>
      <div class="field"><input id="cdPass" placeholder="Senha" type="password"/></div>
    </div>
    <div class="row" style="margin-top:8px">
      <div class="field"><input id="cdRef" placeholder="(Opcional) Código do pai (indicação)"/></div>
    </div>
    <div style="height:10px"></div>
    <button class="btnWide" id="btnCad"><i class="fa-solid fa-check"></i> Cadastrar</button>
    <div style="height:10px"></div>
    <button class="btnWide" id="btnBack" style="background:rgba(255,255,255,.65)"><i class="fa-solid fa-arrow-left"></i> Voltar</button>
    <div id="cdMsg" style="margin-top:10px"></div>
  </div>
</div>

<div id="app" class="wrap" style="display:none">
  <div class="top bub">
    <div class="brand">
      <div class="logo">
        <div class="bearWrap" title="urso tentando pegar BLUE">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="ice2" x1="10" y1="20" x2="50" y2="54">
                <stop stop-color="#9ae6ff" stop-opacity=".9"/><stop offset="1" stop-color="#1f4ed8" stop-opacity=".55"/>
              </linearGradient>
              <radialGradient id="gold2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(34 36) rotate(45) scale(18)">
                <stop stop-color="#ffeaa7"/><stop offset="1" stop-color="#ffb703"/>
              </radialGradient>
            </defs>
            <rect x="10" y="26" width="40" height="28" rx="6" fill="url(#ice2)" stroke="rgba(255,255,255,.35)"/>
            <g class="coinAnim">
              <circle cx="30" cy="40" r="10" fill="url(#gold2)" stroke="rgba(255,215,0,.65)"/>
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
        <div class="brandname">
          <b>ICE-CUBO</b>
          <small id="subline">Feed • Perfil • BLUE • Trocas</small>
        </div>
      </div>

      <div class="pill" title="Saldo BLUE">
        <div class="coin"><span>B</span></div>
        <div>
          <div style="font-weight:1000" id="blueBal">0.000000 BLUE</div>
          <div class="muted" id="whoAmI">—</div>
        </div>
      </div>
    </div>

    <div class="viewer">
      <div class="hint" id="hint">Depósito/Saque/Minerar ficam no Perfil (bem visível). Clique no avatar para abrir o perfil do usuário.</div>
      <video id="mainV" playsinline controls></video>
      <img id="mainI"/>
    </div>

    <div class="stageBar">
      <div class="card" id="ownerCard">
        <div class="av" id="ownerAv">U</div>
        <div class="meta2">
          <div class="name" id="ownerName">Usuário</div>
          <div class="sub" id="ownerSub">Toque para abrir o perfil</div>
        </div>
      </div>
      <button class="sbtn" id="logoutBtn" title="Sair"><i class="fa-solid fa-right-from-bracket"></i></button>
    </div>
  </div>

  <div class="bottom">
    <div class="carousel" id="carousel"></div>

    <div class="panel" id="panelFeed">
      <div class="hrow">
        <h3><i class="fa-solid fa-film"></i> Timeline</h3>
        <span class="muted">toque para destacar</span>
      </div>
      <div class="muted">Toque no card acima para mostrar em tela grande. Toque no cartão do usuário (embaixo) para abrir perfil dele.</div>
      <hr/>
      <div class="grid" id="feedGrid"></div>
    </div>

    <div class="panel" id="panelHome" style="display:none">
      <div class="hrow"><h3><i class="fa-solid fa-user"></i> Seu perfil</h3><span class="muted">depósito • saque • minerar</span></div>

      <!-- BIG ACTIONS -->
      <div class="grid">
        <div class="box">
          <h4><i class="fa-solid fa-money-bill-wave"></i> Depósito PIX (Mercado Pago)</h4>
          <div class="row">
            <div class="field"><input id="depAmount" placeholder="Valor em R$ (ex: 1.00)" /></div>
          </div>
          <div style="height:8px"></div>
          <div class="row">
            <button class="sbtn" id="btnGerarPix"><i class="fa-solid fa-qrcode"></i> Gerar PIX</button>
            <button class="sbtn" id="btnCheckPix"><i class="fa-solid fa-rotate"></i> Verificar pagamento</button>
          </div>
          <div id="pixBox" class="muted" style="margin-top:8px"></div>
          <div class="muted" style="margin-top:6px">
            Regras: 85% BLUE pra você • 10% pro site • 5% pro seu pai (ou pro site se não tiver pai).<br/>
            <b>Compartilhe:</b> “5% de cada depósito do seu filho é seu. Traga filhos pro ICE!”
          </div>
        </div>

        <div class="box">
          <h4><i class="fa-solid fa-hammer"></i> Minerar bloco BLUE (estilo BTC)</h4>
          <div class="muted">Para ganhar, você precisa minerar um bloco (prova simples no celular).</div>
          <div style="height:8px"></div>
          <div class="row">
            <button class="sbtn" id="btnMinerar"><i class="fa-solid fa-cube"></i> Minerar bloco</button>
            <span class="muted" id="mineInfo">Recompensa: 50 BLUE/bloco (simulação)</span>
          </div>
          <div id="mineBox" class="muted" style="margin-top:8px"></div>
        </div>

        <div class="box">
          <h4><i class="fa-solid fa-right-left"></i> Saque (demo)</h4>
          <div class="muted">Aqui é simulação (sem enviar dinheiro ainda).</div>
          <div style="height:8px"></div>
          <div class="row">
            <div class="field"><input id="wdAmount" placeholder="Sacar BLUE (ex: 50)" /></div>
          </div>
          <div style="height:8px"></div>
          <button class="sbtn" id="btnSaque"><i class="fa-solid fa-arrow-up-right-from-square"></i> Solicitar saque</button>
          <div id="wdBox" class="muted" style="margin-top:8px"></div>
        </div>

        <div class="box">
          <h4><i class="fa-solid fa-image"></i> Postar foto/vídeo (local)</h4>
          <div class="row">
            <label class="sbtn" style="display:inline-flex;align-items:center;gap:8px">
              <i class="fa-solid fa-images"></i> Abrir galeria
              <input id="filePick" type="file" accept="image/*,video/*" style="display:none">
            </label>
            <button class="sbtn" id="postBtn"><i class="fa-solid fa-upload"></i> Postar</button>
          </div>
          <div id="pickInfo" class="muted" style="margin-top:8px">Nenhum arquivo selecionado</div>
        </div>
      </div>

      <hr/>
      <div class="muted">Seus posts:</div>
      <div class="grid" id="myPosts"></div>
    </div>
  </div>
</div>

<div class="nav">
  <button id="navFeed" class="active"><i class="fa-solid fa-film"></i><span>Feed</span></button>
  <button id="navHome"><i class="fa-solid fa-user"></i><span>Perfil</span></button>
</div>

<div class="modal" id="modalUser">
  <div class="sheet">
    <div class="sheetTop">
      <b id="userTitle">Perfil</b>
      <button class="sbtn" id="closeUser"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="sheetBody" id="userBody"></div>
  </div>
</div>

<script>
/* ========= Storage ========= */
const LS_USERS="ice_users_v1", LS_SESS="ice_sess_v1", LS_STATE="ice_state_v1", LS_CHAT="ice_chat_v1";
const ROLE={USER:"user",MOD:"mod",ADM:"adm"};
const starHtml=r=>r===ROLE.ADM?'<span class="star gold"><i class="fa-solid fa-star"></i></span>':(r===ROLE.MOD?'<span class="star blue"><i class="fa-solid fa-star"></i></span>':"");
const uid=()=>Date.now().toString(36)+Math.random().toString(16).slice(2);
const esc=s=>(s||"").replace(/[&<>"]/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[m]));
const now=()=>Date.now();

const getUsers=()=>JSON.parse(localStorage.getItem(LS_USERS)||"null")||{};
const setUsers=u=>localStorage.setItem(LS_USERS,JSON.stringify(u));
const getSess=()=>JSON.parse(localStorage.getItem(LS_SESS)||"null");
const setSess=s=>localStorage.setItem(LS_SESS,JSON.stringify(s));
const clearSess=()=>localStorage.removeItem(LS_SESS);

const state=JSON.parse(localStorage.getItem(LS_STATE)||"null")||{
  balances:{}, // username -> BLUE
  siteBlue:0,
  feed:[],
  myPosts:{}, // username -> [{id,type,url,ts}]
  pendingPay:{} // username -> {paymentId, amount, ref}
};
const saveState=()=>localStorage.setItem(LS_STATE,JSON.stringify(state));

/* ========= Defaults / seed ========= */
(function seed(){
  const users=getUsers();
  // Admin fixo
  if(!users.admin) users.admin={pass:"1533",role:ROLE.ADM,ref:""};
  // IA / fake
  if(!users.iceia) users.iceia={pass:"",role:ROLE.MOD,ref:""};
  setUsers(users);

  if(state.feed.length===0){
    state.feed=[
      {id:"f1",type:"video",url:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",owner:"iceia",ts:now()-60000},
      {id:"f2",type:"video",url:"https://www.w3schools.com/html/mov_bbb.mp4",owner:"iceia",ts:now()-120000},
      {id:"f3",type:"image",url:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=60",owner:"iceia",ts:now()-180000},
    ];
  }
  saveState();
})();

/* ========= UI refs ========= */
const $=id=>document.getElementById(id);
const screenLogin=$("screenLogin"), screenCad=$("screenCad"), app=$("app");
const lgUser=$("lgUser"), lgPass=$("lgPass"), lgRef=$("lgRef"), lgMsg=$("lgMsg");
const cdUser=$("cdUser"), cdPass=$("cdPass"), cdRef=$("cdRef"), cdMsg=$("cdMsg");
const btnLogin=$("btnLogin"), btnGoCad=$("btnGoCad"), btnCad=$("btnCad"), btnBack=$("btnBack");

const navFeed=$("navFeed"), navHome=$("navHome"), panelFeed=$("panelFeed"), panelHome=$("panelHome");
const carousel=$("carousel"), feedGrid=$("feedGrid");
const mainV=$("mainV"), mainI=$("mainI"), hint=$("hint");
const ownerCard=$("ownerCard"), ownerAv=$("ownerAv"), ownerName=$("ownerName"), ownerSub=$("ownerSub");
const whoAmI=$("whoAmI"), blueBal=$("blueBal");
const logoutBtn=$("logoutBtn");

const modalUser=$("modalUser"), closeUser=$("closeUser"), userTitle=$("userTitle"), userBody=$("userBody");

const depAmount=$("depAmount"), btnGerarPix=$("btnGerarPix"), btnCheckPix=$("btnCheckPix"), pixBox=$("pixBox");
const btnMinerar=$("btnMinerar"), mineBox=$("mineBox"), mineInfo=$("mineInfo");
const wdAmount=$("wdAmount"), btnSaque=$("btnSaque"), wdBox=$("wdBox");
const filePick=$("filePick"), postBtn=$("postBtn"), pickInfo=$("pickInfo"), myPosts=$("myPosts");

let session=null, selected=null;

/* ========= Screens ========= */
function showLogin(){screenLogin.style.display="flex";screenCad.style.display="none";app.style.display="none";}
function showCad(){screenLogin.style.display="none";screenCad.style.display="flex";app.style.display="none";}
function showApp(){screenLogin.style.display="none";screenCad.style.display="none";app.style.display="flex";}

function msg(el, html, ok=false){
  el.innerHTML = "<div class='"+(ok?"ok":"bad")+"'>"+html+"</div>";
}

/* ========= Auth ========= */
function login(user, pass, ref){
  user=(user||"").trim().toLowerCase();
  pass=String(pass||"");
  const users=getUsers();
  const u=users[user];
  if(!u) return {ok:false,error:"Usuário não existe. Clique em Criar conta."};
  if(user==="admin"){
    if(pass!=="1533") return {ok:false,error:"Senha do admin errada."};
  }else{
    if(u.pass!==pass) return {ok:false,error:"Senha errada."};
  }
  // salva sessão
  session={user,role:u.role||ROLE.USER,ref:(u.ref||ref||"").trim().toLowerCase()};
  setSess(session);
  if(!state.balances[user]) state.balances[user]=0;
  saveState();
  return {ok:true};
}
function signup(user, pass, ref){
  user=(user||"").trim().toLowerCase();
  pass=String(pass||"");
  ref=(ref||"").trim().toLowerCase();
  if(!user || user.length<3) return {ok:false,error:"Usuário muito curto (min 3 letras)."};
  if(user==="admin") return {ok:false,error:"Esse nome é reservado."};
  if(!pass || pass.length<3) return {ok:false,error:"Senha muito curta."};
  const users=getUsers();
  if(users[user]) return {ok:false,error:"Usuário já existe."};
  users[user]={pass,role:ROLE.USER,ref};
  setUsers(users);
  if(!state.balances[user]) state.balances[user]=0;
  saveState();
  return {ok:true};
}

/* ========= Navigation ========= */
function setTab(t){
  navFeed.classList.toggle("active",t==="feed");
  navHome.classList.toggle("active",t==="home");
  panelFeed.style.display=t==="feed"?"block":"none";
  panelHome.style.display=t==="home"?"block":"none";
}
navFeed.onclick=()=>setTab("feed");
navHome.onclick=()=>setTab("home");

/* ========= Feed render ========= */
function getUserObj(username){
  const users=getUsers();
  const u=users[username]||{role:ROLE.USER};
  return {name:username, role:u.role||ROLE.USER};
}
function setOwner(username){
  const u=getUserObj(username);
  ownerAv.textContent=(u.name||"u")[0].toUpperCase();
  ownerName.innerHTML="@"+esc(u.name)+" "+starHtml(u.role);
  ownerSub.textContent="Toque para abrir o perfil";
}
function showMedia(p){
  selected=p; setOwner(p.owner);
  hint.style.display="none";
  mainV.pause(); mainV.removeAttribute("src"); mainV.load(); mainV.style.display="none";
  mainI.style.display="none";
  if(p.type==="video"){ mainV.src=p.url; mainV.style.display="block"; mainV.play().catch(()=>{}); }
  else { mainI.src=p.url; mainI.style.display="block"; }
  [...carousel.children].forEach(el=>el.classList.toggle("active",el.dataset.id===p.id));
}

function render(){
  // header
  whoAmI.textContent = "logado: @"+session.user+" • "+(session.role===ROLE.ADM?"ADM MASTER":"usuário");
  blueBal.textContent = (state.balances[session.user]||0).toFixed(6)+" BLUE";

  // carousel
  const all=[...state.feed].sort((a,b)=>b.ts-a.ts);
  carousel.innerHTML="";
  all.slice(0,25).forEach(p=>{
    const div=document.createElement("div");
    div.className="item"+(selected&&selected.id===p.id?" active":"");
    div.dataset.id=p.id;
    div.innerHTML = p.type==="video"
      ? \`<video muted playsinline src="\${p.url}"></video>\`
      : \`<img src="\${p.url}"/>\`;
    const tag=document.createElement("div");
    tag.className="tag";
    tag.innerHTML=\`<span class="mini">\${(p.owner||"u")[0].toUpperCase()}</span>@\${esc(p.owner)} \${starHtml(getUserObj(p.owner).role)}\`;
    div.appendChild(tag);
    div.onclick=()=>showMedia(p);
    carousel.appendChild(div);
  });

  // grid
  feedGrid.innerHTML="";
  all.slice(0,60).forEach(p=>{
    const c=document.createElement("div"); c.className="box";
    c.innerHTML = p.type==="video"
      ? \`<video muted playsinline style="width:100%;border-radius:14px" src="\${p.url}"></video>\`
      : \`<img style="width:100%;border-radius:14px" src="\${p.url}"/>\`;
    const u=getUserObj(p.owner);
    const bar=document.createElement("div");
    bar.style.display="flex";bar.style.justifyContent="space-between";bar.style.alignItems="center";bar.style.gap="10px";bar.style.marginTop="8px";
    bar.innerHTML=\`<div class="muted" style="display:flex;align-items:center;gap:8px;min-width:0">
        <b style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">@\${esc(u.name)}</b> \${starHtml(u.role)}
      </div>
      <div style="display:flex;gap:8px">
        <button class="sbtn" style="padding:8px 10px" title="perfil"><i class="fa-solid fa-user"></i></button>
        <button class="sbtn" style="padding:8px 10px" title="destacar"><i class="fa-solid fa-up-right-and-down-left-from-center"></i></button>
      </div>\`;
    const btns=bar.querySelectorAll("button");
    btns[0].onclick=()=>openUser(p.owner);
    btns[1].onclick=()=>showMedia(p);
    c.appendChild(bar);
    feedGrid.appendChild(c);
  });

  // meus posts
  const mine=(state.myPosts[session.user]||[]).sort((a,b)=>b.ts-a.ts);
  myPosts.innerHTML = mine.length ? "" : "<div class='muted'>Sem posts ainda.</div>";
  mine.forEach(p=>{
    const c=document.createElement("div"); c.className="box";
    c.innerHTML = p.type==="video"
      ? \`<video muted playsinline style="width:100%;border-radius:14px" src="\${p.url}"></video>\`
      : \`<img style="width:100%;border-radius:14px" src="\${p.url}"/>\`;
    const bar=document.createElement("div");
    bar.style.display="flex";bar.style.justifyContent="space-between";bar.style.alignItems="center";bar.style.gap="10px";bar.style.marginTop="8px";
    bar.innerHTML=\`<div class="muted"><b>Seu post</b></div><button class="sbtn" style="padding:8px 10px"><i class="fa-solid fa-trash"></i></button>\`;
    bar.querySelector("button").onclick=()=>{
      state.myPosts[session.user]=state.myPosts[session.user].filter(x=>x.id!==p.id);
      saveState(); render();
    };
    c.appendChild(bar); myPosts.appendChild(c);
  });

  // default selected
  if(!selected && all[0]) showMedia(all[0]);
}

/* ========= Perfil de usuário (modal) ========= */
function openUser(username){
  const u=getUserObj(username);
  userTitle.textContent="Perfil • @"+u.name;
  const posts=(state.myPosts[username]||[]);
  userBody.innerHTML=\`
    <div style="display:flex;gap:12px;align-items:center;margin-bottom:10px">
      <div class="av" style="width:54px;height:54px;border-radius:18px">\${(username||"u")[0].toUpperCase()}</div>
      <div>
        <div style="font-weight:1000;font-size:16px">@\${esc(u.name)} \${starHtml(u.role)}</div>
        <div class="muted">Posts: \${posts.length}</div>
      </div>
    </div>
    <hr/>
    <div class="grid" id="uPosts"></div>
  \`;
  const grid=userBody.querySelector("#uPosts");
  if(!posts.length) grid.innerHTML="<div class='muted'>Sem posts ainda.</div>";
  posts.slice().sort((a,b)=>b.ts-a.ts).slice(0,20).forEach(p=>{
    const box=document.createElement("div"); box.className="box";
    box.innerHTML = p.type==="video"
      ? \`<video muted playsinline style="width:100%;border-radius:14px" src="\${p.url}"></video>\`
      : \`<img style="width:100%;border-radius:14px" src="\${p.url}"/>\`;
    grid.appendChild(box);
  });
  modalUser.style.display="flex";
}
closeUser.onclick=()=>modalUser.style.display="none";
ownerCard.onclick=()=>{ if(selected) openUser(selected.owner); };

/* ========= Logout ========= */
logoutBtn.onclick=()=>{ clearSess(); location.reload(); };

/* ========= Posts (local) ========= */
let pickedFile=null;
filePick.onchange=e=>{
  pickedFile=e.target.files&&e.target.files[0]?e.target.files[0]:null;
  pickInfo.textContent=pickedFile?(pickedFile.name+" • "+Math.round(pickedFile.size/1024)+"KB"):"Nenhum arquivo selecionado";
};
postBtn.onclick=()=>{
  if(!pickedFile) return pickInfo.innerHTML="<span class='bad'>Selecione um arquivo primeiro.</span>";
  const type=pickedFile.type.startsWith("video")?"video":"image";
  const url=URL.createObjectURL(pickedFile);
  const post={id:"p_"+uid(),type,url,ts:now()};
  state.myPosts[session.user]=state.myPosts[session.user]||[];
  state.myPosts[session.user].unshift(post);
  // também joga no feed
  state.feed.unshift({id:"f_"+uid(),type,url,owner:session.user,ts:post.ts});
  saveState();
  pickedFile=null; filePick.value=""; pickInfo.innerHTML="<span class='ok'>Postado ✅</span>";
  render();
};

/* ========= BLUE Mining: block simulation ========= */
function ensureBal(u){ if(state.balances[u]==null) state.balances[u]=0; }
function addBlue(u,amt){ ensureBal(u); state.balances[u]+=amt; }

const mineState=JSON.parse(localStorage.getItem("ice_mine_v1")||"null")||{
  cap:21000000, minted:0, reward:50, blocks:0, halvEvery:210000, nextHalv:210000
};
const saveMine=()=>localStorage.setItem("ice_mine_v1",JSON.stringify(mineState));

async function mineBlock(){
  // prova leve (não trava tanto no celular)
  // acha nonce onde hash simples termina com "000"
  const base = session.user + "|" + Date.now();
  let nonce=0;
  mineBox.innerHTML="<span class='muted'>Minerando... (pode levar alguns segundos)</span>";
  btnMinerar.disabled=true;

  const target="000";
  let found=false;
  const t0=performance.now();

  while(!found){
    // rodar em "lotes" pra não travar
    for(let i=0;i<4000;i++){
      nonce++;
      const s=base+"|"+nonce;
      // hash simples
      let h=0;
      for(let j=0;j<s.length;j++) h=(h*31 + s.charCodeAt(j))>>>0;
      const hx=h.toString(16);
      if(hx.endsWith(target)){ found=true; break; }
    }
    await new Promise(r=>setTimeout(r,0));
  }

  const dt=Math.round(performance.now()-t0);

  // recompensa btc-like
  if(mineState.minted >= mineState.cap){
    mineBox.innerHTML="<span class='bad'>Cap 21.000.000 atingido.</span>";
    btnMinerar.disabled=false;
    return;
  }

  mineState.blocks++;
  const can = Math.min(mineState.reward, mineState.cap - mineState.minted);
  mineState.minted += can;

  // distribuição da mineração: 100% pro minerador (você)
  addBlue(session.user, can);

  // halving
  if(mineState.blocks >= mineState.nextHalv){
    mineState.reward = Math.max(0.00000001, mineState.reward/2);
    mineState.nextHalv += mineState.halvEvery;
  }

  saveMine(); saveState();
  mineBox.innerHTML="<span class='ok'>Bloco minerado ✅ +" + can + " BLUE (tempo: "+dt+"ms)</span>";
  mineInfo.textContent="Recompensa atual: "+mineState.reward+" BLUE/bloco • Minted: "+Math.floor(mineState.minted).toLocaleString("pt-BR");
  btnMinerar.disabled=false;
  render();
}
btnMinerar.onclick=mineBlock;

/* ========= Mercado Pago PIX deposit ========= */
function apiUrl(a, params={}){
  const u = new URL(location.href);
  u.pathname = "/api/index";
  u.searchParams.set("a", a);
  Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));
  return u.toString();
}
function setPix(html){ pixBox.innerHTML=html; }

let pending=null; // {paymentId, amount, ref}

btnGerarPix.onclick=async()=>{
  const amt=Number(String(depAmount.value||"").replace(",","."));
  if(!amt || Number.isNaN(amt)) return setPix("<span class='bad'>Coloque um valor (ex: 1.00)</span>");

  const email = session.user + "@icecubo.local"; // demo: MP precisa email válido; você pode trocar depois
  const ref = (getUsers()[session.user]?.ref || session.ref || "").trim();

  setPix("Gerando PIX...");
  try{
    const r=await fetch(apiUrl("mp_create"),{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ email, amount: amt, ref })
    });
    const data=await r.json();
    if(!data.ok) return setPix("<span class='bad'>Erro: "+esc(JSON.stringify(data.error))+"</span>");

    pending={paymentId:data.paymentId, amount:data.amount, ref};
    state.pendingPay[session.user]=pending;
    saveState();

    const img = data.qr_code_base64 ? "<img style='width:220px;max-width:100%;border-radius:14px;border:1px solid rgba(7,36,69,.18)' src='data:image/png;base64,"+data.qr_code_base64+"'/>" : "";
    const copia = data.qr_code ? ("<textarea style='width:100%;padding:10px;border-radius:14px;border:1px solid rgba(7,36,69,.18)'>"+data.qr_code+"</textarea>") : "";

    setPix(\`
      <div class="ok">PIX criado ✅ paymentId: \${data.paymentId}</div>
      <div style="height:8px"></div>
      \${img}
      <div style="height:8px"></div>
      <div class="muted">Copia e Cola:</div>
      \${copia || "<div class='muted'>Sem QR (tente de novo).</div>"}
      <div style="height:8px"></div>
      <div class="muted">Depois de pagar, clique em <b>Verificar pagamento</b>.</div>
    \`);
  }catch(e){
    setPix("<span class='bad'>Erro: "+esc(e.message)+"</span>");
  }
};

btnCheckPix.onclick=async()=>{
  pending = state.pendingPay[session.user] || pending;
  if(!pending?.paymentId) return setPix("<span class='bad'>Nenhum PIX pendente. Clique em Gerar PIX.</span>");

  setPix("Verificando pagamento...");
  try{
    const r=await fetch(apiUrl("mp_check",{paymentId: pending.paymentId}));
    const data=await r.json();
    if(!data.ok) return setPix("<span class='bad'>Erro: "+esc(JSON.stringify(data.error))+"</span>");

    if(data.status!=="approved"){
      return setPix("<span class='muted'>Status: <b>"+esc(data.status)+"</b>. Se ainda não pagou, pague e tente de novo.</span>");
    }

    // CREDITAR BLUE (regra 85/10/5)
    // taxa: 1 real = 100 BLUE (ajusta depois)
    const rate = 100;
    const totalBlue = Math.round((Number(data.amount)||0) * rate * 1000000) / 1000000;

    const buyer = session.user;
    const father = (pending.ref || "").trim().toLowerCase();
    const site = "site";

    const toBuyer = totalBlue * 0.85;
    const toSiteBase = totalBlue * 0.10;
    const toFatherOrSite = totalBlue * 0.05;

    addBlue(buyer, toBuyer);
    state.siteBlue = (state.siteBlue||0) + toSiteBase;

    // paga 5% pro pai se existir e estiver cadastrado
    const users=getUsers();
    if(father && users[father]){
      addBlue(father, toFatherOrSite);
    }else{
      state.siteBlue = (state.siteBlue||0) + toFatherOrSite;
    }

    // limpar pendência
    delete state.pendingPay[session.user];
    saveState();

    setPix(\`
      <div class="ok">Pagamento aprovado ✅</div>
      <div class="muted">Total: \${totalBlue.toFixed(6)} BLUE</div>
      <div class="muted">Você: +\${toBuyer.toFixed(6)} • Site: +\${toSiteBase.toFixed(6)} • Pai/Site: +\${toFatherOrSite.toFixed(6)}</div>
    \`);
    render();
  }catch(e){
    setPix("<span class='bad'>Erro: "+esc(e.message)+"</span>");
  }
};

/* ========= Saque (demo) ========= */
btnSaque.onclick=()=>{
  const v=Number(String(wdAmount.value||"").replace(",","."));
  if(!v || Number.isNaN(v)) return wdBox.innerHTML="<span class='bad'>Digite quanto quer sacar (ex: 50)</span>";
  const bal=state.balances[session.user]||0;
  if(v>bal) return wdBox.innerHTML="<span class='bad'>Saldo insuficiente.</span>";
  if(v<50) return wdBox.innerHTML="<span class='bad'>Saque mínimo: 50 BLUE (demo)</span>";
  state.balances[session.user]=bal-v;
  saveState();
  wdBox.innerHTML="<span class='ok'>Saque solicitado ✅ (demo). (-"+v+" BLUE)</span>";
  render();
};

/* ========= Boot ========= */
function boot(){
  const s=getSess();
  if(!s){ showLogin(); return; }
  session=s;
  showApp();
  setTab("feed");
  // info mineração
  mineInfo.textContent="Recompensa atual: "+mineState.reward+" BLUE/bloco • Minted: "+Math.floor(mineState.minted).toLocaleString("pt-BR");
  render();
}
boot();

/* ========= Login events ========= */
btnGoCad.onclick=()=>showCad();
btnBack.onclick=()=>showLogin();

btnLogin.onclick=()=>{
  const r=login(lgUser.value, lgPass.value, lgRef.value);
  if(!r.ok) return msg(lgMsg, r.error);
  location.reload();
};

btnCad.onclick=()=>{
  const r=signup(cdUser.value, cdPass.value, cdRef.value);
  if(!r.ok) return msg(cdMsg, r.error);
  msg(cdMsg, "Conta criada ✅ Agora faça login.", true);
};
</script>
</body></html>`);
}
