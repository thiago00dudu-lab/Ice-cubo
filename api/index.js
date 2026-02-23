const MP = "https://api.mercadopago.com";

// ====== CONFIG (mude só aqui) ======
const BLUE_PER_BRL = 100;      // 1,00 R$ = 100 BLUE
const MIN_DEPOSIT_BRL = 1.00;  // MP quase sempre recusa 0,05 no Pix. Use 1,00 pra testar.
const MIN_WITHDRAW_BLUE = 50;  // saque mínimo (pedido)
const USER_SHARE = 0.85;       // 85% pro comprador (em BLUE)
const SITE_SHARE = 0.10;       // 10% pro site (em BLUE)
const REF_SHARE  = 0.05;       // 5% pro "pai" (indicador) ou pro site se não tiver pai

// ====== "DB" em memória (DEMO) ======
globalThis.DB ||= {
  users: {},      // username -> { pass, email, parent, blue, posts:[] }
  sessions: {},   // sid -> username
  deposits: {},   // paymentId -> { username, brl, blueTotal, createdAt, status }
  withdraws: []   // { username, blue, pixKey, createdAt, status }
};
const DB = globalThis.DB;

// ====== helpers ======
function uid(n=24){
  const a="abcdefghijklmnopqrstuvwxyz0123456789";
  let s=""; for(let i=0;i<n;i++) s+=a[(Math.random()*a.length)|0];
  return s;
}
function cookieGet(req,name){
  const c=req.headers.cookie||"";
  const m=c.match(new RegExp("(^|; )"+name+"=([^;]+)"));
  return m?decodeURIComponent(m[2]):"";
}
function cookieSet(res,name,val){
  res.setHeader("Set-Cookie", `${name}=${encodeURIComponent(val)}; Path=/; HttpOnly; SameSite=Lax`);
}
async function readBody(req){
  if (req.body) return req.body;
  let raw="";
  await new Promise(r=>{
    req.on("data",c=>raw+=c);
    req.on("end",r);
  });
  try { return raw?JSON.parse(raw):{}; } catch { return {}; }
}
function me(req){
  const sid=cookieGet(req,"sid");
  const u=DB.sessions[sid];
  return u?{username:u, ...DB.users[u]}:null;
}
function json(res,code,obj){
  res.statusCode=code;
  res.setHeader("Content-Type","application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
}
function html(res,code,str){
  res.statusCode=code;
  res.setHeader("Content-Type","text/html; charset=utf-8");
  res.end(str);
}
function splitCredit(username, blueTotal){
  const buyer = Math.floor(blueTotal*USER_SHARE);
  const site  = Math.floor(blueTotal*SITE_SHARE);
  const ref   = Math.max(0, blueTotal - buyer - site);

  DB.users[username].blue = (DB.users[username].blue||0) + buyer;

  const parent = DB.users[username].parent;
  if (parent && DB.users[parent]) {
    DB.users[parent].blue = (DB.users[parent].blue||0) + ref;
  } else {
    // se não tem pai, vai pro site (admin)
    if (DB.users["admin"]) DB.users["admin"].blue = (DB.users["admin"].blue||0) + ref;
  }
  if (DB.users["admin"]) DB.users["admin"].blue = (DB.users["admin"].blue||0) + site;

  return { buyer, site, refTo: (parent && DB.users[parent]) ? parent : "admin", ref };
}

// ====== UI ======
function page(user){
  const u = user?.username || "";
  const blue = user?.blue || 0;

  const usersList = Object.keys(DB.users)
    .filter(x=>x!=="admin")
    .slice(0,50)
    .map(x=>`<button class="uitem" onclick="openProfile('${x}')">@${x}</button>`)
    .join("") || `<div class="muted">Sem usuários ainda.</div>`;

  return `<!doctype html><html lang="pt-br"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ICE-CUBO • BLUE</title>
<style>
:root{--bg:#071021;--card:#0c1a33;--b:#1b315e;--t:#dbeafe;--mut:#93c5fd;--a:#38bdf8;--g:#FFD700;}
*{box-sizing:border-box} body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto;background:radial-gradient(1200px 800px at 10% 0%,#0b2a55,transparent 60%),var(--bg);color:var(--t)}
.top{padding:14px 14px 10px;display:flex;align-items:center;justify-content:space-between;gap:10px}
.brand{display:flex;align-items:center;gap:10px}
.logo{font-weight:900;letter-spacing:.5px}
.bear{width:44px;height:44px;border-radius:14px;background:linear-gradient(180deg,#0ea5e9,#1d4ed8);
display:grid;place-items:center;position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.12)}
.bear:before{content:"🐻‍❄️";font-size:26px;position:absolute;left:9px;top:8px;animation:bear 1.2s ease-in-out infinite}
.bear:after{content:"🪙";position:absolute;right:8px;bottom:7px;font-size:18px;opacity:.9;animation:coin 1.2s ease-in-out infinite}
@keyframes bear{0%,100%{transform:translateX(0)}50%{transform:translateX(3px)}}
@keyframes coin{0%,100%{transform:translateX(0)}50%{transform:translateX(-3px)}}
.pill{background:rgba(56,189,248,.14);border:1px solid rgba(56,189,248,.25);padding:6px 10px;border-radius:999px;font-size:12px;color:#c7f9ff}
.wrap{padding:12px;display:grid;gap:12px;max-width:980px;margin:0 auto}
.card{background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));
border:1px solid rgba(147,197,253,.16);border-radius:18px;padding:12px}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
input,button{border-radius:14px;border:1px solid rgba(147,197,253,.22);background:#07162f;color:var(--t);padding:12px 12px;font-size:14px}
button{cursor:pointer}
.primary{background:linear-gradient(90deg,#38bdf8,#60a5fa);color:#001018;border:none;font-weight:800}
.bigActions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.bigActions button{padding:14px 10px;font-weight:900}
.badge{font-size:12px;color:#001018;background:var(--g);border-radius:999px;padding:4px 8px;font-weight:900}
.muted{color:var(--mut);font-size:12px}
.hr{height:1px;background:rgba(147,197,253,.12);margin:10px 0}
.uitem{width:100%;text-align:left}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:820px){.grid2{grid-template-columns:1fr}.bigActions{grid-template-columns:1fr}}
.qrimg{max-width:260px;width:100%;border-radius:14px;border:1px solid rgba(147,197,253,.2)}
</style></head><body>
<div class="top">
  <div class="brand">
    <div class="bear" title="O urso tenta tirar a moeda... mas nunca consegue 😅"></div>
    <div>
      <div class="logo">ICE-CUBO <span class="badge">BLUE</span></div>
      <div class="muted">Depósito via Pix (Mercado Pago) • Crédito automático via webhook</div>
    </div>
  </div>
  <div class="pill">${user?`Logado: <b>@${u}</b> • Saldo: <b>${blue} BLUE</b>`:`Você não está logado`}</div>
</div>

<div class="wrap">

  <div class="card">
    ${user ? `
      <div class="row">
        <button onclick="logout()">Sair</button>
        <div class="muted">Indicação: se alguém entrar usando seu link, você vira “pai” e ganha <b>5%</b> dos depósitos do seu “filho”.</div>
      </div>
      <div class="hr"></div>

      <div class="bigActions">
        <button class="primary" onclick="openDeposit()">💳 DEPOSITAR (comprar BLUE)</button>
        <button class="primary" onclick="openWithdraw()">🏦 SACAR (pedido)</button>
        <button class="primary" onclick="mine()">⛏️ MINERAR (bloco)</button>
      </div>

      <div id="panel" class="card" style="margin-top:12px;display:none"></div>
    ` : `
      <div class="grid2">
        <div>
          <div style="font-weight:900;margin-bottom:8px">Entrar</div>
          <div class="row">
            <input id="l_user" placeholder="usuário">
            <input id="l_pass" placeholder="senha" type="password">
            <button class="primary" onclick="login()">Entrar</button>
          </div>
          <div class="muted" style="margin-top:6px">Se estiver entrando por indicação, o link já salva o “pai”.</div>
        </div>
        <div>
          <div style="font-weight:900;margin-bottom:8px">Cadastrar</div>
          <div class="row">
            <input id="r_user" placeholder="usuário">
            <input id="r_email" placeholder="email">
            <input id="r_pass" placeholder="senha" type="password">
            <button class="primary" onclick="register()">Cadastrar</button>
          </div>
          <div class="muted" style="margin-top:6px">Ganhe 5% dos depósitos dos seus indicados: compartilhe seu perfil!</div>
        </div>
      </div>
    `}
  </div>

  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
      <div style="font-weight:900">Perfis (toque para abrir)</div>
      <button onclick="copyMyLink()" ${user?'':'disabled'}>Compartilhar meu link</button>
    </div>
    <div class="hr"></div>
    <div style="display:grid;gap:8px">${usersList}</div>
  </div>

  <div class="card" id="profileBox" style="display:none"></div>

</div>

<script>
const qs=new URLSearchParams(location.search);
const parent=qs.get("ref");
if(parent){ localStorage.setItem("ref_parent", parent); }

function showPanel(html){
  const p=document.getElementById("panel");
  p.style.display="block";
  p.innerHTML=html;
}
function hidePanel(){
  const p=document.getElementById("panel");
  p.style.display="none";
  p.innerHTML="";
}
async function api(path, body){
  const r=await fetch(path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body||{})});
  return r.json();
}
async function register(){
  const u=document.getElementById("r_user").value.trim();
  const e=document.getElementById("r_email").value.trim();
  const p=document.getElementById("r_pass").value;
  const parent=localStorage.getItem("ref_parent")||"";
  const j=await api("/api/register",{username:u,email:e,pass:p,parent});
  alert(j.ok?"Cadastrado! Recarregando...":"Erro: "+j.error);
  if(j.ok) location.href="/";
}
async function login(){
  const u=document.getElementById("l_user").value.trim();
  const p=document.getElementById("l_pass").value;
  const j=await api("/api/login",{username:u,pass:p});
  alert(j.ok?"Logado!":"Erro: "+j.error);
  if(j.ok) location.href="/";
}
async function logout(){
  await api("/api/logout",{});
  location.href="/";
}

function openDeposit(){
  showPanel(\`
    <div style="font-weight:900;margin-bottom:8px">💳 Depositar (Pix Mercado Pago)</div>
    <div class="muted">Teste mínimo: <b>R$ ${MIN_DEPOSIT_BRL.toFixed(2)}</b>. (MP quase sempre recusa R$0,05)</div>
    <div class="row" style="margin-top:10px">
      <input id="dep_amount" type="number" step="0.01" min="${MIN_DEPOSIT_BRL}" value="${MIN_DEPOSIT_BRL}" style="flex:1" placeholder="valor em R$">
      <button class="primary" onclick="createPix()">Gerar QR</button>
      <button onclick="hidePanel()">Fechar</button>
    </div>
    <div id="dep_out" style="margin-top:10px"></div>
    <div class="hr"></div>
    <div class="muted"><b>Indique e ganhe:</b> 5% de cada depósito do seu “filho” é seu. Compartilhe seu perfil!</div>
  \`);
}
async function createPix(){
  const v=Number(document.getElementById("dep_amount").value);
  const out=document.getElementById("dep_out");
  out.innerHTML="Gerando...";
  const j=await api("/api/mp_create",{amount:v});
  if(!j.ok){ out.innerHTML="<b>Erro:</b> "+JSON.stringify(j.error); return; }
  const img=j.qr_code_base64?(\`<img class="qrimg" src="data:image/png;base64,\${j.qr_code_base64}">\`):"";
  out.innerHTML=\`
    <div class="card">
      <div style="font-weight:900">QR gerado ✅</div>
      <div class="muted">Pagamento: <b>#\${j.paymentId}</b> • Status: <b>\${j.status}</b></div>
      <div style="margin-top:10px;display:grid;gap:10px;place-items:start">
        \${img}
        <textarea style="width:100%;min-height:90px" readonly>\${j.qr_code||""}</textarea>
        <button class="primary" onclick="pollPaid('\${j.paymentId}')">Já paguei (verificar)</button>
      </div>
    </div>
  \`;
}
async function pollPaid(id){
  const out=document.getElementById("dep_out");
  out.innerHTML+="<div class='muted'>Consultando pagamento...</div>";
  const r=await fetch("/api/mp_status?id="+encodeURIComponent(id));
  const j=await r.json();
  if(!j.ok){ out.innerHTML+="<div><b>Erro:</b> "+JSON.stringify(j.error)+"</div>"; return; }
  out.innerHTML+=\`<div><b>Status:</b> \${j.status} • <b>Credited:</b> \${j.credited?"SIM":"NÃO"}</div>\`;
  if(j.credited){ out.innerHTML+="<div class='muted'>Se creditou, recarrega a página pra ver saldo.</div>"; }
}

function openWithdraw(){
  showPanel(\`
    <div style="font-weight:900;margin-bottom:8px">🏦 Sacar (pedido)</div>
    <div class="muted">Saque mínimo: <b>${MIN_WITHDRAW_BLUE} BLUE</b>. Aqui é <b>pedido</b> (sem transferência automática ainda).</div>
    <div class="row" style="margin-top:10px">
      <input id="w_blue" type="number" min="${MIN_WITHDRAW_BLUE}" value="${MIN_WITHDRAW_BLUE}" style="flex:1" placeholder="BLUE">
      <input id="w_pix" placeholder="Sua chave Pix" style="flex:2">
      <button class="primary" onclick="withdrawReq()">Pedir saque</button>
      <button onclick="hidePanel()">Fechar</button>
    </div>
    <div id="w_out" style="margin-top:10px"></div>
  \`);
}
async function withdrawReq(){
  const blue=Number(document.getElementById("w_blue").value);
  const pixKey=document.getElementById("w_pix").value.trim();
  const j=await api("/api/withdraw",{blue,pixKey});
  document.getElementById("w_out").innerHTML=j.ok
    ? "<div class='card'><b>Pedido criado ✅</b><div class='muted'>Status: pendente</div></div>"
    : "<b>Erro:</b> "+j.error;
}

let lastMine=Number(localStorage.getItem("lastMine")||0);
function mine(){
  const now=Date.now();
  const cooldown=60*1000; // 1 min por bloco (DEMO)
  if(now-lastMine<cooldown){
    const s=Math.ceil((cooldown-(now-lastMine))/1000);
    alert("Aguarde "+s+"s para minerar outro bloco.");
    return;
  }
  lastMine=now; localStorage.setItem("lastMine", String(now));
  api("/api/mine",{}).then(j=>{
    alert(j.ok ? ("Bloco minerado! +"+j.got+" BLUE (demo)") : ("Erro: "+j.error));
    if(j.ok) location.reload();
  });
}

async function openProfile(u){
  const r=await fetch("/api/profile?u="+encodeURIComponent(u));
  const j=await r.json();
  const box=document.getElementById("profileBox");
  box.style.display="block";
  if(!j.ok){ box.innerHTML="<b>Erro:</b> "+JSON.stringify(j.error); return; }
  box.innerHTML=\`
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
      <div style="font-weight:900">@\${j.username}</div>
      <button onclick="copyLink('@\${j.username}','\${j.username}')">Copiar link</button>
    </div>
    <div class="muted">Saldo: <b>\${j.blue} BLUE</b> • Pai: <b>\${j.parent||"—"}</b></div>
    <div class="hr"></div>
