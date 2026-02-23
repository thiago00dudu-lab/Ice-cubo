// /api/index.js  (UM ARQUIVO SÓ)
// Vercel Serverless Function: serve o app + endpoints via ?a=...

const MP = "https://api.mercadopago.com";

function json(res, code, obj) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
}
function html(res, code, s) {
  res.statusCode = code;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(s);
}
async function readBody(req) {
  if (req.body) return req.body;
  let raw = "";
  await new Promise((resolve) => {
    req.on("data", (c) => (raw += c));
    req.on("end", resolve);
  });
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, "https://x.local");
    const a = url.searchParams.get("a") || "";

    // ====== API: criar pagamento PIX ======
    if (a === "mp_create") {
      if (req.method !== "POST") return json(res, 405, { ok: false, error: "Use POST" });
      const token = process.env.MP_ACCESS_TOKEN;
      if (!token) return json(res, 500, { ok: false, error: "MP_ACCESS_TOKEN não configurado na Vercel" });

      const body = await readBody(req);
      const email = String(body.email || "").trim();
      const amount = Number(body.amount);

      if (!email || !amount || Number.isNaN(amount)) {
        return json(res, 400, { ok: false, error: "Envie { email, amount }" });
      }

      // OBS: MP tem valor mínimo. Se 0,05 falhar, use 1,00 no teste.
      const transaction_amount = Math.round(amount * 100) / 100;

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
        }),
      });

      const data = await r.json();
      if (!r.ok) return json(res, 400, { ok: false, error: data });

      const tx = data.point_of_interaction?.transaction_data || {};
      return json(res, 200, {
        ok: true,
        paymentId: data.id,
        status: data.status,
        amount: data.transaction_amount,
        qr_code: tx.qr_code || null,
        qr_code_base64: tx.qr_code_base64 || null,
      });
    }

    // ====== API: checar pagamento ======
    if (a === "mp_check") {
      const token = process.env.MP_ACCESS_TOKEN;
      if (!token) return json(res, 500, { ok: false, error: "MP_ACCESS_TOKEN não configurado na Vercel" });

      const id = url.searchParams.get("id");
      if (!id) return json(res, 400, { ok: false, error: "Envie ?a=mp_check&id=PAYMENT_ID" });

      const r = await fetch(`${MP}/v1/payments/${encodeURIComponent(id)}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      if (!r.ok) return json(res, 400, { ok: false, error: data });

      return json(res, 200, {
        ok: true,
        id: data.id,
        status: data.status,
        status_detail: data.status_detail,
        transaction_amount: data.transaction_amount,
        payer_email: data.payer?.email || null,
      });
    }

    // ====== (opcional) webhook: só confirma recebimento ======
    // IMPORTANTE: sem banco (KV/Supabase) não dá pra "depositar automático" de verdade.
    // Aqui apenas responde 200 pro Mercado Pago.
    if (a === "mp_webhook") {
      return json(res, 200, { ok: true });
    }

    // ====== APP (HTML) ======
    return html(res, 200, `<!doctype html><html lang="pt-br"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>ICE-CUBO</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
:root{--bg1:#dff3ff;--bg2:#bfe8ff;--bg3:#072445;--g:rgba(255,255,255,.60);--l:rgba(7,36,69,.18);--t:#06223f;--m:#2b587d;--a:#0ea5e9;--ok:#16a34a;--bad:#ef4444}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;color:var(--t);height:100vh;overflow:hidden;
background:radial-gradient(1200px 700px at 15% -10%,rgba(255,255,255,.85),transparent 55%),
radial-gradient(900px 700px at 110% 20%,rgba(56,189,248,.25),transparent 60%),
linear-gradient(180deg,var(--bg1),var(--bg2) 45%,#7dd3fc 70%,#2aa9ff 86%,var(--bg3));
}
body:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.35;mix-blend-mode:multiply;
background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cg fill='none'%3E%3Cpath d='M60 10c6 10 6 20 0 30c-6-10-6-20 0-30Z' fill='%230ea5e9' opacity='.35'/%3E%3Cpath d='M35 35c10 6 20 6 30 0c-10-6-20-6-30 0Z' fill='%230ea5e9' opacity='.25'/%3E%3Cpath d='M85 35c-10 6-20 6-30 0c10-6 20-6 30 0Z' fill='%230ea5e9' opacity='.25'/%3E%3Ccircle cx='22' cy='88' r='3' fill='%23ffffff' opacity='.35'/%3E%3Ccircle cx='35' cy='98' r='2' fill='%23ffffff' opacity='.25'/%3E%3Ccircle cx='48' cy='88' r='2' fill='%23ffffff' opacity='.2'/%3E%3Cpath d='M82 86c8-10 12-18 4-28c-9 6-14 12-4 28Z' fill='%230b5fa5' opacity='.22'/%3E%3Cpath d='M82 86c2-6 8-10 12-12' stroke='%230b5fa5' opacity='.22' stroke-width='2' stroke-linecap='round'/%3E%3Cpath d='M82 86c-2-6-8-10-12-12' stroke='%230b5fa5' opacity='.22' stroke-width='2' stroke-linecap='round'/%3E%3C/g%3E%3C/svg%3E");
background-size:140px 140px;
}
a{color:inherit}button{cursor:pointer}input,textarea{font:inherit}
#app{height:100vh;display:flex;flex-direction:column}
.top{height:52vh;position:relative;border-radius:0 0 26px 26px;overflow:hidden;background:rgba(0,0,0,.08)}
.bub:before,.bub:after{content:"";position:absolute;inset:-20%;background:
radial-gradient(circle,rgba(255,255,255,.35) 0 2px,transparent 3px) 0 0/120px 120px,
radial-gradient(circle,rgba(255,255,255,.22) 0 1px,transparent 2px) 40px 20px/160px 160px;
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
#mainV{width:100%;height:100%;object-fit:cover;display:none}
#mainI{width:100%;height:100%;object-fit:cover;display:none}
#hint{position:absolute;inset:auto 12px 72px 12px;padding:10px 12px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(12px);border-radius:18px;color:var(--m);text-align:center}
.stageBar{position:absolute;left:12px;right:12px;bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:4}
.card{flex:1;display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(12px);border-radius:18px;min-width:0}
.av{width:38px;height:38px;border-radius:14px;display:grid;place-items:center;font-weight:1000;background:linear-gradient(135deg,#38bdf8,#1d4ed8);position:relative;color:#fff}
.meta2{min-width:0}
.meta2 .name{font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:8px}
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
.tag{position:absolute;left:8px;bottom:8px;padding:6px 10px;border:1px solid rgba(7,36,69,.18);background:rgba(255,255,255,.60);backdrop-filter:blur(8px);border-radius:14px;font-size:12px;display:flex;gap:8px;align-items:center;color:#053055}
.tag .mini{width:18px;height:18px;border-radius:7px;display:grid;place-items:center;font-weight:900;background:linear-gradient(135deg,#38bdf8,#1d4ed8);color:#fff}
.item.active{outline:2px solid rgba(14,165,233,.9)}
.panel{flex:1;overflow:auto;border:1px solid var(--l);background:rgba(255,255,255,.60);backdrop-filter:blur(12px);border-radius:22px;padding:12px}
.hrow{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.hrow h3{margin:0;font-size:16px}
.muted{color:var(--m);font-size:12px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.post{border:1px solid var(--l);background:rgba(255,255,255,.35);border-radius:18px;overflow:hidden}
.post video,.post img{width:100%;height:140px;object-fit:cover;display:block}
.pbar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px}
.badge{font-size:12px;color:var(--m);display:flex;align-items:center;gap:8px;min-width:0}
.badge .mini{width:18px;height:18px;border-radius:7px;display:grid;place-items:center;font-weight:900;background:linear-gradient(135deg,#38bdf8,#1d4ed8);color:#fff;flex:0 0 auto;position:relative}
.badge b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:105px}
.chip{font-size:11px;padding:4px 8px;border-radius:999px;border:1px solid rgba(14,165,233,.25);background:rgba(14,165,233,.10);color:#075985}
.icon{border:0;background:transparent;color:#ef4444;padding:6px 8px;border-radius:12px}
.icon:active{transform:scale(.96)}
.nav{position:fixed;left:10px;right:10px;bottom:10px;display:flex;gap:10px;z-index:10}
.nav button{flex:1;padding:12px 10px;border-radius:20px;border:1px solid var(--l);background:rgba(255,255,255,.60);backdrop-filter:blur(14px);color:var(--t);display:flex;align-items:center;justify-content:center;gap:8px}
.nav button.active{outline:2px solid rgba(14,165,233,.9)}
.modal{position:fixed;inset:0;background:rgba(0,0,0,.45);display:none;align-items:flex-end;justify-content:center;z-index:20}
.sheet{width:min(760px,100%);max-height:86vh;border-radius:26px 26px 0 0;overflow:hidden;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.90);backdrop-filter:blur(18px)}
.sheetTop{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid rgba(7,36,69,.12)}
.sheetTop b{font-size:14px}
.sheetBody{padding:12px 12px 14px;overflow:auto;max-height:calc(86vh - 52px)}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.field{flex:1;min-width:180px}
.field input,.field textarea{width:100%;padding:12px;border-radius:18px;border:1px solid rgba(7,36,69,.14);background:rgba(255,255,255,.75);color:var(--t);outline:none}
.field textarea{min-height:74px;resize:vertical}
hr{border:0;border-top:1px solid rgba(7,36,69,.12);margin:10px 0}
.center{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:18px}
.cardAuth{width:min(420px,100%);border:1px solid var(--l);background:rgba(255,255,255,.75);backdrop-filter:blur(12px);border-radius:22px;padding:14px}
.cardAuth h1{margin:0 0 10px}
.cardAuth .muted{margin:6px 0 10px}
.bigBtn{width:100%;padding:12px;border-radius:18px;border:1px solid rgba(14,165,233,.35);background:rgba(14,165,233,.18)}
.small{font-size:12px;color:var(--m)}
/* Bear tiny */
.bearWrap{width:44px;height:44px;border-radius:16px;border:1px solid rgba(7,36,69,.14);background:rgba(255,255,255,.65);display:grid;place-items:center;overflow:hidden}
.bearWrap svg{width:44px;height:44px}
@keyframes paw{0%,100%{transform:translate(0,0) rotate(-3deg)}50%{transform:translate(2px,-1px) rotate(6deg)}}
@keyframes coin{0%,100%{transform:translate(0,0)}50%{transform:translate(0,-1px)}}
.paw{transform-origin:24px 24px}.coinAnim{transform-origin:22px 26px}
.bearStage-grab .paw{animation:paw 1.1s ease-in-out infinite}
.bearStage-grab .coinAnim{animation:coin 1.1s ease-in-out infinite}
</style></head><body>

<div id="root"></div>

<script>
/* ========= AUTH + STATE (local) =========
   OBS: Sem banco real, tudo fica no navegador (localStorage).
   Pra ficar 100% automático com webhook e saldo real, precisa KV/Supabase.
*/
const LS_AUTH="ice_auth_v1";
const LS_DB="ice_db_v1";

const ROLE={USER:"user",MOD:"mod",ADM:"adm"};
const starHtml=r=>r===ROLE.ADM?'<span class="star gold"><i class="fa-solid fa-star"></i></span>':(r===ROLE.MOD?'<span class="star blue"><i class="fa-solid fa-star"></i></span>':"");
const uid=()=>Date.now().toString(36)+Math.random().toString(16).slice(2);
const esc=s=>(s||"").replace(/[&<>"]/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[m]));
const fmt=ts=>new Date(ts).toLocaleString().slice(0,16);

const adminCred={user:"admin",pass:"1533"}; // ADM master
const db=JSON.parse(localStorage.getItem(LS_DB)||"null")||{
  users:{
    // admin já existe
    "admin":{id:"u_admin",user:"admin",pass:"1533",name:"ICE ADM",email:"admin@ice.local",role:ROLE.ADM,avatar:"A",blue:0,ref:null},
  },
  // pagamentos criados (client-side)
  payments:{}, // paymentId -> {amount, email, status, createdAt, credited:false, refUser:null}
  // posts do feed (demo)
  feed:[],
};
function saveDB(){ localStorage.setItem(LS_DB, JSON.stringify(db)); }

function seedFeed(){
  if(db.feed.length) return;
  const ai={id:"u_ai",user:"iceai",pass:"",name:"ICE IA",email:"iceai@ice.local",role:ROLE.MOD,avatar:"I",blue:0,ref:null};
  db.users[ai.user]=ai;
  db.feed=[
    {id:"p1",type:"video",url:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",owner:"iceai",ts:Date.now()-60000},
    {id:"p2",type:"video",url:"https://www.w3schools.com/html/mov_bbb.mp4",owner:"iceai",ts:Date.now()-120000},
    {id:"p3",type:"image",url:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=60",owner:"iceai",ts:Date.now()-180000},
  ];
  saveDB();
}
seedFeed();

const auth=JSON.parse(localStorage.getItem(LS_AUTH)||"null"); // {user}
function setAuth(user){ localStorage.setItem(LS_AUTH, JSON.stringify({user})); location.reload(); }
function logout(){ localStorage.removeItem(LS_AUTH); location.reload(); }
function getMe(){ return auth?.user ? db.users[auth.user] : null; }

function getRefFromUrl(){
  const u=new URL(location.href);
  return (u.searchParams.get("ref")||"").trim() || null;
}

/* ========= BLUE (sim BTC-like) ========= */
const LS_BLUE="ice_blue_v1";
const blue=JSON.parse(localStorage.getItem(LS_BLUE)||"null")||{
  cap:21000000, minted:0, blocks:0, reward:50, halvEvery:210000, nextHalv:210000, halvCount:0
};
function saveBlue(){ localStorage.setItem(LS_BLUE, JSON.stringify(blue)); }
function mineBlock(me){
  // bloco: recompensa atual (começa 50). halving por blocos (simulação)
  if(blue.minted>=blue.cap) return {ok:false,msg:"Cap 21.000.000 atingido."};
  blue.blocks++;
  const can=Math.min(blue.reward, blue.cap-blue.minted);
  blue.minted += can;
  me.blue = (me.blue||0) + can;
  if(blue.blocks>=blue.nextHalv){
    blue.reward = Math.max(0.00000001, blue.reward/2);
    blue.halvCount++;
    blue.nextHalv += blue.halvEvery;
  }
  saveBlue(); saveDB();
  return {ok:true, gained:can};
}

/* ========= Render AUTH ========= */
function renderAuth(){
  const root=document.getElementById("root");
  root.innerHTML=\`
  <div class="center">
    <div class="cardAuth">
      <h1><i class="fa-solid fa-snowflake"></i> ICE-CUBO</h1>
      <div class="muted">Login e cadastro (funcional). Admin: <b>admin</b> / <b>1533</b></div>
      <div class="row">
        <div class="field"><input id="user" placeholder="Usuário"></div>
      </div>
      <div class="row" style="margin-top:8px">
        <div class="field"><input id="pass" type="password" placeholder="Senha"></div>
      </div>
      <div class="row" style="margin-top:8px">
        <div class="field"><input id="email" placeholder="Email (pra PIX)" /></div>
      </div>
      <div class="row" style="margin-top:8px">
        <button class="bigBtn" id="btnLogin"><i class="fa-solid fa-right-to-bracket"></i> Entrar</button>
      </div>
      <div class="row" style="margin-top:8px">
        <button class="bigBtn" id="btnCad"><i class="fa-solid fa-user-plus"></i> Criar conta</button>
      </div>
      <div class="small" style="margin-top:10px">
        Indicação: compartilhe seu link <b>?ref=SEUUSUARIO</b>.
        <br>Promo: <b>5%</b> de cada depósito do seu filho é seu — compartilhe!
      </div>
    </div>
  </div>\`;

  const ref=getRefFromUrl();

  function common(){
    const user=(document.getElementById("user").value||"").trim().toLowerCase();
    const pass=(document.getElementById("pass").value||"").trim();
    const email=(document.getElementById("email").value||"").trim();
    return {user,pass,email,ref};
  }

  document.getElementById("btnLogin").onclick=()=>{
    const {user,pass}=common();
    const u=db.users[user];
    if(!u || u.pass!==pass) return alert("Login inválido.");
    setAuth(user);
  };

  document.getElementById("btnCad").onclick=()=>{
    const {user,pass,email,ref}=common();
    if(!user||!pass||!email) return alert("Preencha usuário, senha e email.");
    if(db.users[user]) return alert("Usuário já existe.");
    db.users[user]={id:"u_"+uid(),user,pass,name:user,email,role:ROLE.USER,avatar:user[0]?.toUpperCase()||"U",blue:0,ref:(ref && ref!==user ? ref : null)};
    saveDB();
    setAuth(user);
  };
}

/* ========= App ========= */
function renderApp(){
  const me=getMe();
  if(!me) return renderAuth();

  const root=document.getElementById("root");
  root.innerHTML=\`
  <div id="app">
    <div class="top bub">
      <div class="brand">
        <div class="logo">
          <div class="bearWrap bearStage-grab" title="urso + BLUE">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="ice" x1="10" y1="20" x2="50" y2="54">
                  <stop stop-color="#9ae6ff" stop-opacity=".9"/>
                  <stop offset="1" stop-color="#1f4ed8" stop-opacity=".55"/>
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
          <div class="brandname">
            <b>ICE-CUBO</b>
            <small>feed • perfil • depósitos • saques</small>
          </div>
        </div>

        <div class="pill" title="BLUE + cap 21M">
          <div class="coin"><span>B</span></div>
          <div>
            <div style="font-weight:900" id="blueBal">0.000000 BLUE</div>
            <div class="small" id="blueInfo">cap 21.000.000</div>
          </div>
        </div>
      </div>

      <div class="viewer">
        <div id="hint">Toque num card abaixo para destacar. (Perfil abre tocando no nome/foto)</div>
        <video id="mainV" playsinline controls></video>
        <img id="mainI"/>
      </div>

      <div class="stageBar">
        <div class="card" id="ownerCard">
          <div class="av" id="ownerAv">U</div>
          <div class="meta2">
            <div class="name" id="ownerName">@user</div>
            <div class="sub" id="ownerSub">Toque no perfil pra abrir</div>
          </div>
        </div>
        <button class="sbtn" id="btnLogout" title="Sair"><i class="fa-solid fa-right-from-bracket"></i></button>
      </div>
    </div>

    <div class="bottom">
      <div class="carousel" id="carousel"></div>

      <div class="panel" id="panelFeed">
        <div class="hrow"><h3><i class="fa-solid fa-film"></i> Timeline</h3><span class="muted">todos veem</span></div>
        <div class="grid" id="feedGrid"></div>
      </div>

      <div class="panel" id="panelHome" style="display:none">
        <div class="hrow"><h3><i class="fa-solid fa-user"></i> Seu perfil</h3><span class="muted">@\${esc(me.user)} \${me.role===ROLE.ADM?starHtml(ROLE.ADM):(me.role===ROLE.MOD?starHtml(ROLE.MOD):"")}</span></div>

        <div class="row" style="margin-bottom:8px">
          <div class="chip"><b>Saldo:</b> <span id="saldoTxt">0</span> BLUE</div>
          <div class="chip"><b>Seu link:</b> <span id="refLink"></span></div>
        </div>

        <hr>

        <div style="font-weight:900;margin:0 0 8px">Depósito (PIX Mercado Pago)</div>
        <div class="row">
          <div class="field"><input id="depAmount" type="number" step="0.01" placeholder="Valor (ex: 1.00)"></div>
          <button class="sbtn" id="btnDep"><i class="fa-solid fa-qrcode"></i> Gerar QR</button>
        </div>
        <div class="muted" style="margin-top:6px">Dica: se R$0,05 falhar, testa R$1,00.</div>
        <div id="depBox" style="display:none;margin-top:10px"></div>

        <hr>

        <div style="font-weight:900;margin:0 0 8px">Saque (pedido)</div>
        <div class="row">
          <div class="field"><input id="saqBlue" type="number" step="0.000001" placeholder="Quanto BLUE sacar"></div>
          <button class="sbtn" id="btnSaq"><i class="fa-solid fa-hand-holding-dollar"></i> Pedir saque</button>
        </div>
        <div class="muted" style="margin-top:6px">Aqui é pedido local (demo). Saque real precisa integração/payout.</div>

        <hr>

        <div style="font-weight:900;margin:0 0 8px">Mineração (bloco)</div>
        <div class="row">
          <button class="sbtn" id="btnMine"><i class="fa-solid fa-hammer"></i> Minerar 1 bloco</button>
          <span class="muted" id="mineInfo">Recompensa atual: 50 BLUE (cap 21M)</span>
        </div>

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
  \`;

  // refs
  const $=id=>document.getElementById(id);
  const navFeed=$("navFeed"), navHome=$("navHome");
  const panelFeed=$("panelFeed"), panelHome=$("panelHome");
  const mainV=$("mainV"), mainI=$("mainI"), hint=$("hint");
  const carousel=$("carousel"), feedGrid=$("feedGrid");
  const ownerAv=$("ownerAv"), ownerName=$("ownerName"), ownerSub=$("ownerSub"), ownerCard=$("ownerCard");
  const blueBal=$("blueBal"), blueInfo=$("blueInfo");
  const btnLogout=$("btnLogout");
  const saldoTxt=$("saldoTxt"), refLink=$("refLink");
  const depAmount=$("depAmount"), btnDep=$("btnDep"), depBox=$("depBox");
  const saqBlue=$("saqBlue"), btnSaq=$("btnSaq");
  const btnMine=$("btnMine"), mineInfo=$("mineInfo");
  const modalUser=$("modalUser"), closeUser=$("closeUser"), userTitle=$("userTitle"), userBody=$("userBody");

  function setTab(t){
    navFeed.classList.toggle("active", t==="feed");
    navHome.classList.toggle("active", t==="home");
    panelFeed.style.display = t==="feed" ? "block" : "none";
    panelHome.style.display = t==="home" ? "block" : "none";
  }
  navFeed.onclick=()=>setTab("feed");
  navHome.onclick=()=>setTab("home");

  btnLogout.onclick=()=>logout();

  function getUser(user){ return db.users[user]; }

  function blueRender(){
    blueBal.textContent=(me.blue||0).toFixed(6)+" BLUE";
    blueInfo.innerHTML="minted <b>"+Math.floor(blue.minted).toLocaleString("pt-BR")+"</b> • reward <b>"+blue.reward+"</b> • cap 21.000.000";
    saldoTxt.textContent=(me.blue||0).toFixed(6);
    mineInfo.textContent="Recompensa atual: "+blue.reward+" BLUE • Halving a cada "+blue.halvEvery+" blocos • Cap 21M";
  }

  function showOwner(u){
    ownerAv.textContent=(u.avatar||"U");
    ownerName.innerHTML="@"+esc(u.user)+" "+starHtml(u.role);
    ownerSub.textContent="Toque para abrir o perfil";
    ownerCard.onclick=()=>openUser(u);
  }

  function showMedia(p){
    hint.style.display="none";
    const u=getUser(p.owner);
    showOwner(u||me);

    mainV.pause(); mainV.removeAttribute("src"); mainV.load();
    mainV.style.display="none";
    mainI.style.display="none";

    if(p.type==="video"){
      mainV.src=p.url;
      mainV.style.display="block";
      mainV.play().catch(()=>{});
    }else{
      mainI.src=p.url;
      mainI.style.display="block";
    }
    [...carousel.children].forEach(el=>el.classList.toggle("active", el.dataset.id===p.id));
  }

  function openUser(u){
    userTitle.textContent="Perfil • @"+u.user;
    userBody.innerHTML=\`
      <div style="display:flex;gap:12px;align-items:center;margin-bottom:10px">
        <div class="av" style="width:54px;height:54px;border-radius:18px">\${esc(u.avatar||"U")}</div>
        <div>
          <div style="font-weight:1000;font-size:16px">@\${esc(u.user)} \${starHtml(u.role)}</div>
          <div class="muted">Email: \${esc(u.email||"-")}</div>
          <div class="muted">BLUE: <b>\${Number(u.blue||0).toFixed(6)}</b></div>
        </div>
      </div>
      <div class="muted">Posts abaixo (demo do feed):</div>
      <div class="grid" style="margin-top:10px">\${db.feed.filter(x=>x.owner===u.user).map(p=>\`
        <div class="post">
          \${p.type==="video"?\`<video muted playsinline src="\${p.url}"></video>\`:\`<img src="\${p.url}">\`}
          <div class="pbar"><span class="badge"><b>@\${esc(u.user)}</b> • \${fmt(p.ts)}</span></div>
        </div>\`).join("") || "<div class='muted'>Sem posts.</div>"}
      </div>\`;
    modalUser.style.display="flex";
  }
  closeUser.onclick=()=>modalUser.style.display="none";

  // Feed render
  function renderAll(){
    blueRender();
    refLink.textContent = location.origin + location.pathname + "?ref=" + me.user;

    // carousel
    const all=[...db.feed].sort((a,b)=>b.ts-a.ts);
    carousel.innerHTML="";
    all.slice(0,30).forEach(p=>{
      const u=getUser(p.owner)||me;
      const div=document.createElement("div");
      div.className="item";
      div.dataset.id=p.id;
      div.innerHTML = (p.type==="video")
        ? \`<video muted playsinline src="\${p.url}"></video>\`
        : \`<img src="\${p.url}"/>\`;
      const tag=document.createElement("div");
      tag.className="tag";
      tag.innerHTML=\`<span class="mini">\${esc(u.avatar||"U")}</span>@\${esc(u.user)} \${starHtml(u.role)}\`;
      div.appendChild(tag);
      div.onclick=()=>showMedia(p);
      carousel.appendChild(div);
    });

    // grid
    feedGrid.innerHTML="";
    all.slice(0,80).forEach(p=>{
      const u=getUser(p.owner)||me;
      const c=document.createElement("div");
      c.className="post";
      c.innerHTML=(p.type==="video")? \`<video muted playsinline src="\${p.url}"></video>\` : \`<img src="\${p.url}">\`;
      const bar=document.createElement("div");
      bar.className="pbar";
      bar.innerHTML=\`
        <span class="badge"><span class="mini">\${esc(u.avatar||"U")}</span><b>@\${esc(u.user)}</b> \${starHtml(u.role)} • \${fmt(p.ts)}</span>
        <div style="display:flex;gap:8px">
          <button class="sbtn" style="padding:8px 10px" title="perfil"><i class="fa-solid fa-user"></i></button>
          <button class="sbtn" style="padding:8px 10px" title="destacar"><i class="fa-solid fa-up-right-and-down-left-from-center"></i></button>
        </div>\`;
      const btns=bar.querySelectorAll("button");
      btns[0].onclick=()=>openUser(u);
      btns[1].onclick=()=>showMedia(p);
      c.appendChild(bar);
      feedGrid.appendChild(c);
    });

    if(all[0]) showMedia(all[0]);
  }

  // ===== Depósito Mercado Pago (gera QR) =====
  async function apiCreatePayment(amount){
    const r=await fetch(location.pathname+"?a=mp_create",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ email: me.email, amount })
    });
    const data=await r.json();
    if(!data.ok) throw new Error(JSON.stringify(data.error||data));
    return data;
  }
  async function apiCheckPayment(id){
    const r=await fetch(location.pathname+"?a=mp_check&id="+encodeURIComponent(id));
    const data=await r.json();
    if(!data.ok) throw new Error(JSON.stringify(data.error||data));
    return data;
  }

  function creditBlueAfterPaid(paymentId){
    const p=db.payments[paymentId];
    if(!p || p.credited) return;

    // regra: 85% comprador, 10% site, 5% indicado (se tiver) senão vai pro site
    const totalBlue = Number(p.amount); // 1 real = 1 BLUE (demo). Ajusta depois!
    const buyer = db.users[me.user];
    const site = db.users["admin"]; // site wallet: admin (demo)
    const parentUser = p.refUser && db.users[p.refUser] ? db.users[p.refUser] : null;

    const b85 = totalBlue * 0.85;
    const s10 = totalBlue * 0.10;
    const r05 = totalBlue * 0.05;

    buyer.blue = (buyer.blue||0) + b85;
    if(parentUser) parentUser.blue = (parentUser.blue||0) + r05;
    else site.blue = (site.blue||0) + r05;
    site.blue = (site.blue||0) + s10;

    p.credited = true;
    saveDB();
  }

  btnDep.onclick=async()=>{
    const val=Number(depAmount.value);
    if(!val || Number.isNaN(val) || val<=0) return alert("Digite um valor válido. Ex: 1.00");
    depBox.style.display="block";
    depBox.innerHTML="<div class='muted'>Gerando PIX...</div>";
    try{
      const data=await apiCreatePayment(val);
      // guarda localmente o pagamento criado
      db.payments[data.paymentId]={
        amount:data.amount,
        email:me.email,
        status:data.status,
        createdAt:Date.now(),
        credited:false,
        refUser:(me.ref && db.users[me.ref] ? me.ref : null)
      };
      saveDB();

      const qrImg = data.qr_code_base64 ? \`<img style="width:220px;border-radius:16px;border:1px solid rgba(7,36,69,.14)" src="data:image/png;base64,\${data.qr_code_base64}"/>\` : "";
      const qrTxt = data.qr_code ? \`<textarea readonly style="width:100%;padding:12px;border-radius:18px;border:1px solid rgba(7,36,69,.14);background:rgba(255,255,255,.75)">\${data.qr_code}</textarea>\` : "";

      depBox.innerHTML=\`
        <div class="chip"><b>PIX gerado</b> • PaymentId: <b>\${data.paymentId}</b></div>
        <div class="row" style="margin-top:10px">
          \${qrImg}
          <div style="flex:1;min-width:180px">
            <div class="muted">Pague no seu banco usando QR/PIX copia e cola.</div>
            \${qrTxt}
            <div class="row" style="margin-top:8px">
              <button class="sbtn" id="btnCheck"><i class="fa-solid fa-rotate"></i> Verificar pagamento</button>
              <span class="muted" id="chkStatus">status: \${data.status}</span>
            </div>
            <div class="small" style="margin-top:8px">
              Crédito automático por webhook de verdade precisa banco/KV.
              Aqui você toca em <b>Verificar</b> pra creditar assim que ficar <b>approved</b>.
            </div>
          </div>
        </div>\`;

      document.getElementById("btnCheck").onclick=async()=>{
        const stt=document.getElementById("chkStatus");
        stt.textContent="checando...";
        try{
          const ck=await apiCheckPayment(data.paymentId);
          db.payments[data.paymentId].status = ck.status;
          saveDB();
          stt.textContent="status: "+ck.status+" ("+(ck.status_detail||"")+")";

          if(ck.status==="approved"){
            creditBlueAfterPaid(data.paymentId);
            alert("Pagamento aprovado ✅ BLUE creditado no saldo!");
            blueRender();
          }else{
            alert("Ainda não aprovado. Status: "+ck.status);
          }
        }catch(e){
          alert("Erro ao checar: "+e.message);
        }
      };

    }catch(e){
      depBox.innerHTML="<div style='color:var(--bad);font-weight:900'>Erro: "+esc(e.message)+"</div>";
    }
  };

  // ===== Saque (pedido) =====
  btnSaq.onclick=()=>{
    const v=Number(saqBlue.value);
    if(!v || Number.isNaN(v) || v<=0) return alert("Digite um valor.");
    if((me.blue||0) < v) return alert("Saldo insuficiente.");
    // demo: só registra e desconta local
    me.blue -= v;
    saveDB();
    alert("Pedido de saque registrado ✅ (demo).");
    blueRender();
  };

  // ===== Mineração (bloco) =====
  let mining=false;
  btnMine.onclick=()=>{
    if(mining) return;
    mining=true;
    btnMine.innerHTML='<i class="fa-solid fa-hammer"></i> Minerando...';
    // simula trabalho de bloco (3s)
    setTimeout(()=>{
      const r=mineBlock(me);
      mining=false;
      btnMine.innerHTML='<i class="fa-solid fa-hammer"></i> Minerar 1 bloco';
      if(!r.ok) return alert(r.msg);
      alert("Bloco minerado ✅ +" + r.gained + " BLUE");
      blueRender();
    },3000);
  };

  // Start
  renderAll();
  showOwner(me);
  blueRender();
}

// boot
(function(){
  if(!auth || !db.users[auth.user]) renderAuth();
  else renderApp();
})();
</script></body></html>`);
  } catch (e) {
    return html(res, 500, "<pre>Erro: " + (e && e.message ? e.message : String(e)) + "</pre>");
  }
};
