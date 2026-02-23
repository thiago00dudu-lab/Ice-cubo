const MP = "https://api.mercadopago.com";

// ====== CONFIG (simples) ======
const BLUE_PER_BRL = 100;          // 1,00 R$ = 100 BLUE (ajuste como quiser)
const MIN_DEPOSIT_BRL = 0.05;      // teste mínimo (MP pode recusar 0,05; se falhar use 1,00)
const MIN_WITHDRAW_BLUE = 50;      // saque mínimo
const SITE_FEE = 0.10;             // 10%
const REF_FEE = 0.05;              // 5% (se não tiver pai, vira do site)
const USER_SHARE = 0.85;           // 85% pro comprador (em BLUE, no seu "saldo interno")

// ====== "BANCO" em memória (pra teste). Em produção use DB. ======
globalThis.DB ||= {
  users: {},        // username -> { pass, email, parent, blue, posts:[] }
  sessions: {},     // sid -> username
  deposits: {},     // paymentId -> { username, amount, blueToUser, blueToSite, blueToParent, status }
  withdraws: []     // registros de saque
};
const DB = globalThis.DB;

function uid(n = 24){
  const a="abcdefghijklmnopqrstuvwxyz0123456789";
  let s=""; for(let i=0;i<n;i++) s+=a[(Math.random()*a.length)|0];
  return s;
}

function cookieGet(req, name){
  const c = req.headers.cookie || "";
  const m = c.match(new RegExp("(^|; )"+name+"=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : "";
}

function cookieSet(res, name, val){
  res.setHeader("Set-Cookie", `${name}=${encodeURIComponent(val)}; Path=/; HttpOnly; SameSite=Lax`);
}

async function readBody(req){
  if (req.body) return req.body;
  let raw = "";
  await new Promise((r)=>{ req.on("data",(c)=>raw+=c); req.on("end",r); });
  if(!raw) return {};
  try { return JSON.parse(raw); } catch { return { raw }; }
}

function json(res, code, obj){
  res.statusCode = code;
  res.setHeader("Content-Type","application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
}

function html(res, str){
  res.statusCode = 200;
  res.setHeader("Content-Type","text/html; charset=utf-8");
  res.end(str);
}

function me(req){
  const sid = cookieGet(req,"sid");
  const u = DB.sessions[sid];
  return u ? { username: u, user: DB.users[u] } : null;
}

// ====== MERCADO PAGO HELPERS ======
async function mpCreatePix({ token, email, amount }){
  const transaction_amount = Math.round(Number(amount) * 100) / 100;

  const r = await fetch(`${MP}/v1/payments`,{
    method:"POST",
    headers:{
      Authorization:`Bearer ${token}`,
      "Content-Type":"application/json",
      "X-Idempotency-Key": uid(18)
    },
    body: JSON.stringify({
      transaction_amount,
      description: "Compra BLUE - ICE-CUBO",
      payment_method_id: "pix",
      payer: { email }
    })
  });

  const data = await r.json();
  if(!r.ok) throw new Error(JSON.stringify(data));
  const tx = data.point_of_interaction?.transaction_data || {};
  return {
    paymentId: data.id,
    status: data.status,
    amount: data.transaction_amount,
    qr_code: tx.qr_code || null,
    qr_code_base64: tx.qr_code_base64 || null
  };
}

async function mpGetPayment({ token, id }){
  const r = await fetch(`${MP}/v1/payments/${id}`,{
    headers:{ Authorization:`Bearer ${token}` }
  });
  const data = await r.json();
  if(!r.ok) throw new Error(JSON.stringify(data));
  return data;
}

// ====== CREDITAR BLUE (quando payment approved) ======
function creditBlue({ username, amountBRL, paymentId }){
  const u = DB.users[username];
  if(!u) return;

  const totalBlue = Math.floor(Number(amountBRL) * BLUE_PER_BRL);

  // distribuição interna do "saldo BLUE"
  const blueUser = Math.floor(totalBlue * USER_SHARE);
  let blueSite = Math.floor(totalBlue * SITE_FEE);
  let blueParent = Math.floor(totalBlue * REF_FEE);

  if(!u.parent || !DB.users[u.parent]){
    // sem pai: os 5% vira do site
    blueSite += blueParent;
    blueParent = 0;
  }

  u.blue = (u.blue||0) + blueUser;

  // "site" como usuário especial
  DB.users.__site ||= { pass:"", email:"", parent:"", blue:0, posts:[] };
  DB.users.__site.blue += blueSite;

  if(blueParent>0){
    DB.users[u.parent].blue = (DB.users[u.parent].blue||0) + blueParent;
  }

  DB.deposits[paymentId] ||= { username, amount: amountBRL };
  DB.deposits[paymentId].blueToUser = blueUser;
  DB.deposits[paymentId].blueToSite = blueSite;
  DB.deposits[paymentId].blueToParent = blueParent;
  DB.deposits[paymentId].status = "approved";
}

// ====== UI ======
function page({ username, user }){
  const blue = user?.blue || 0;
  const parent = user?.parent ? user.parent : "sem pai (5% vai pro site)";
  return `<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>ICE-CUBO</title>
<style>
:root{--bg:#0b1220;--card:#111c33;--line:#22314f;--txt:#eaf2ff;--mut:#9bb0d1;--pri:#4aa3ff;--ok:#22c55e;--bad:#ef4444}
*{box-sizing:border-box} body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto;background:radial-gradient(1200px 700px at 15% 10%,#132a55,transparent),var(--bg);color:var(--txt)}
a{color:var(--pri);text-decoration:none}
.wrap{max-width:980px;margin:0 auto;padding:14px}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 12px;border:1px solid var(--line);background:rgba(17,28,51,.72);border-radius:16px;backdrop-filter: blur(10px)}
.brand{display:flex;align-items:center;gap:10px}
.logo{font-weight:900;letter-spacing:.5px;font-size:16px}
.bear{width:44px;height:44px;border-radius:14px;border:1px solid var(--line);display:grid;place-items:center;background:linear-gradient(180deg,rgba(74,163,255,.18),rgba(255,255,255,.03));position:relative;overflow:hidden}
.bear span{font-size:24px;display:block;animation:shake 1.1s ease-in-out infinite}
.bear i{position:absolute;right:6px;bottom:6px;font-style:normal;font-size:14px;filter:drop-shadow(0 2px 8px rgba(0,0,0,.6));animation:coin 1.1s ease-in-out infinite}
@keyframes shake{0%,100%{transform:translate(0,0) rotate(0)}25%{transform:translate(-2px,1px) rotate(-4deg)}50%{transform:translate(2px,-1px) rotate(4deg)}75%{transform:translate(-1px,-2px) rotate(-2deg)}}
@keyframes coin{0%,100%{transform:translate(0,0)}50%{transform:translate(0,-2px)}}
.grid{display:grid;grid-template-columns:1fr;gap:12px;margin-top:12px}
@media(min-width:860px){.grid{grid-template-columns:1.2fr .8fr}}
.card{border:1px solid var(--line);background:rgba(17,28,51,.72);border-radius:16px;padding:12px}
h2{margin:0 0 10px 0;font-size:15px}
.small{color:var(--mut);font-size:12px}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.in{width:100%;padding:12px;border-radius:12px;border:1px solid var(--line);background:#0a1428;color:var(--txt)}
.btn{cursor:pointer;border:none;border-radius:14px;padding:12px 14px;font-weight:800}
.btnPri{background:linear-gradient(180deg,#4aa3ff,#2d7dff);color:#031027}
.btnLine{background:transparent;border:1px solid var(--line);color:var(--txt)}
.bigActions{display:grid;grid-template-columns:1fr;gap:10px}
@media(min-width:520px){.bigActions{grid-template-columns:1fr 1fr}}
.big{padding:14px;border-radius:18px;border:1px solid var(--line);background:linear-gradient(180deg,rgba(74,163,255,.16),rgba(255,255,255,.03));cursor:pointer}
.big b{display:block;font-size:14px}
.big em{display:block;font-style:normal;color:var(--mut);font-size:12px;margin-top:3px}
.pill{display:inline-flex;gap:8px;align-items:center;padding:10px 12px;border-radius:999px;border:1px solid var(--line);background:rgba(0,0,0,.25)}
.qr{display:none;margin-top:10px}
.qr img{width:220px;height:220px;border-radius:14px;border:1px solid var(--line);background:#fff}
.alert{margin-top:10px;padding:10px;border-radius:14px;border:1px solid var(--line);display:none}
.ok{border-color:rgba(34,197,94,.45);background:rgba(34,197,94,.1)}
.bad{border-color:rgba(239,68,68,.45);background:rgba(239,68,68,.1)}
.userList{display:grid;grid-template-columns:1fr;gap:10px}
.userItem{padding:10px;border-radius:14px;border:1px solid var(--line);background:rgba(0,0,0,.18);cursor:pointer}
.userItem:hover{outline:2px solid rgba(74,163,255,.25)}
.modal{position:fixed;inset:0;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;padding:14px}
.mCard{max-width:720px;width:100%;border:1px solid var(--line);background:rgba(17,28,51,.92);border-radius:18px;padding:12px}
.mTop{display:flex;justify-content:space-between;align-items:center;gap:10px}
</style>
</head>
<body>
<div class="wrap">

  <div class="top">
    <div class="brand">
      <div class="bear" title="Urso tentando tirar a moeda (pra sempre 😅)"><span>🐻‍❄️</span><i>🪙</i></div>
      <div>
        <div class="logo">ICE-CUBO • BLUE</div>
        <div class="small">Saldo: <b id="blue">${blue}</b> BLUE • Pai: <b>${parent}</b></div>
      </div>
    </div>
    <div class="row">
      <div class="pill">👤 <b>@${username}</b></div>
      <button class="btn btnLine" onclick="logout()">Sair</button>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <h2>DEPÓSITO / COMPRA DE BLUE (PIX)</h2>
      <div class="small">Você paga PIX → quando ficar <b>approved</b>, o BLUE cai automático na sua conta. (85% você • 10% site • 5% seu pai)</div>
      <div style="height:10px"></div>

      <div class="bigActions">
        <div class="big" onclick="openDeposit()"><b>💳 Depositar / Comprar BLUE</b><em>gera QR Code do PIX</em></div>
        <div class="big" onclick="openWithdraw()"><b>🏧 Sacar BLUE</b><em>mínimo ${MIN_WITHDRAW_BLUE} BLUE (pedido de saque)</em></div>
        <div class="big" onclick="mine()"><b>⛏️ Minerar (Bloco)</b><em>ganha 50 BLUE ao concluir um bloco (simulação)</em></div>
        <div class="big" onclick="shareAd()"><b>📣 Anúncio p/ compartilhar</b><em>“5% do depósito do seu filho é seu”</em></div>
      </div>

      <div id="depositBox" style="display:none;margin-top:12px">
        <div class="row">
          <input class="in" id="depAmount" inputmode="decimal" placeholder="Valor em R$ (ex: 1.00)"/>
          <button class="btn btnPri" onclick="createPix()">Gerar PIX</button>
        </div>
        <div class="alert" id="msg"></div>
        <div class="qr" id="qr">
          <div class="small">QR Code:</div>
          <img id="qrImg" alt="QR"/>
          <div class="small" style="margin-top:8px">Copia e cola:</div>
          <textarea class="in" id="qrText" rows="3" readonly></textarea>
          <div class="row" style="margin-top:8px">
            <button class="btn btnLine" onclick="copyPix()">Copiar PIX</button>
            <button class="btn btnLine" onclick="checkNow()">Verificar pagamento</button>
          </div>
        </div>
      </div>

      <div id="withdrawBox" style="display:none;margin-top:12px">
        <div class="row">
          <input class="in" id="wAmount" inputmode="numeric" placeholder="Quanto BLUE quer sacar? (mínimo ${MIN_WITHDRAW_BLUE})"/>
          <input class="in" id="wPix" placeholder="Sua chave PIX (pra receber)"/>
          <button class="btn btnPri" onclick="withdraw()">Pedir Saque</button>
        </div>
        <div class="alert" id="wmsg"></div>
      </div>
    </div>

    <div class="card">
      <h2>Perfis (toque para abrir)</h2>
      <div class="small">Clique em um usuário para ver perfil e “posts” (demo).</div>
      <div style="height:10px"></div>
      <div class="userList" id="users"></div>
    </div>
  </div>
</div>

<div class="modal" id="modal">
  <div class="mCard">
    <div class="mTop">
      <div><b id="mTitle"></b><div class="small" id="mSub"></div></div>
      <button class="btn btnLine" onclick="closeModal()">Fechar</button>
    </div>
    <div style="height:10px"></div>
    <div id="mBody"></div>
  </div>
</div>

<script>
let lastPaymentId = null;

function openDeposit(){
  document.getElementById("depositBox").style.display = "block";
  document.getElementById("withdrawBox").style.display = "none";
}
function openWithdraw(){
  document.getElementById("withdrawBox").style.display = "block";
  document.getElementById("depositBox").style.display = "none";
}

function showMsg(id, ok, text){
  const el = document.getElementById(id);
  el.className = "alert " + (ok ? "ok":"bad");
  el.style.display = "block";
  el.textContent = text;
}

async function api(a, data){
  const r = await fetch("/api?a="+encodeURIComponent(a),{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(data||{})
  });
  const j = await r.json().catch(()=>({ok:false,error:"json"}));
  return j;
}

async function createPix(){
  const amount = String(document.getElementById("depAmount").value||"").replace(",",".");
  const j = await api("create",{ amount });
  if(!j.ok){ showMsg("msg",false, j.errorText || "Erro ao criar PIX"); return; }
  lastPaymentId = j.paymentId;
  showMsg("msg",true,"PIX criado. Pague e depois clique em Verificar pagamento.");
  document.getElementById("qr").style.display = "block";
  document.getElementById("qrText").value = j.qr_code || "";
  if(j.qr_code_base64){
    document.getElementById("qrImg").src = "data:image/png;base64,"+j.qr_code_base64;
  }else{
    document.getElementById("qrImg").alt = "Sem base64";
  }
}

function copyPix(){
  const t = document.getElementById("qrText");
  t.select(); t.setSelectionRange(0, 999999);
  document.execCommand("copy");
  showMsg("msg",true,"PIX copiado!");
}

async function checkNow(){
  if(!lastPaymentId){ showMsg("msg",false,"Nenhum pagamento criado ainda."); return; }
  const r = await fetch("/api?a=status&id="+encodeURIComponent(lastPaymentId));
  const j = await r.json().catch(()=>({ok:false}));
  if(!j.ok){ showMsg("msg",false,"Falha ao consultar."); return; }
  showMsg("msg", true, "Status: "+j.status);
  if(j.status==="approved"){
    document.getElementById("blue").textContent = j.myBlue;
  }
}

async function withdraw(){
  const amount = Number(document.getElementById("wAmount").value||0);
  const pix = String(document.getElementById("wPix").value||"").trim();
  const j = await api("withdraw",{ amount, pix });
  if(!j.ok){ showMsg("wmsg",false,j.errorText||"Erro"); return; }
  showMsg("wmsg",true,"Pedido de saque registrado. (Demo: envio manual/adm)");
  document.getElementById("blue").textContent = j.myBlue;
}

async function mine(){
  // Simulação de “bloco”: 6 segundos pra completar
  showMsg("msg", true, "Minerando bloco... aguarde 6s ⛏️");
  await new Promise(r=>setTimeout(r,6000));
  const j = await api("mine",{});
  if(!j.ok){ showMsg("msg",false,"Falhou"); return; }
  showMsg("msg", true, "Bloco concluído! +50 BLUE");
  document.getElementById("blue").textContent = j.myBlue;
}

function shareAd(){
  const text = "ICE-CUBO BLUE 💙\\nDeposite e ganhe BLUE automaticamente!\\n🔥 5% de cada depósito do seu filho é SEU! Então compartilhe seu link de indicação.";
  if(navigator.share){ navigator.share({ text }); }
  else{ alert(text); }
}

async function logout(){
  await api("logout",{});
  location.reload();
}

function closeModal(){ document.getElementById("modal").style.display="none"; }

function openUser(u){
  const m = document.getElementById("modal");
  document.getElementById("mTitle").textContent = "@"+u.username;
  document.getElementById("mSub").textContent = "BLUE: "+u.blue+" • Pai: "+(u.parent||"—");
  const posts = (u.posts||[]).map(p=>"<div class='userItem'>🧊 "+p+"</div>").join("");
  document.getElementById("mBody").innerHTML = posts || "<div class='small'>Sem posts ainda (demo)</div>";
  m.style.display="flex";
}

async function loadUsers(){
  const r = await fetch("/api?a=users");
  const j = await r.json().catch(()=>({ok:false}));
  if(!j.ok) return;
  const box = document.getElementById("users");
  box.innerHTML = j.users.map(u => (
    "<div class='userItem' onclick='openUser("+JSON.stringify(u).replace(/'/g,"\\'")+")'>"+
      "<b>@"+u.username+"</b><div class='small'>BLUE: "+u.blue+"</div>"+
    "</div>"
  )).join("");
}
loadUsers();
</script>
</body></html>`;
}

function authPage(){
  return `<!doctype html><html lang="pt-br"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>ICE-CUBO • Login</title>
<style>
:root{--bg:#0b1220;--card:#111c33;--line:#22314f;--txt:#eaf2ff;--mut:#9bb0d1;--pri:#4aa3ff;--bad:#ef4444}
*{box-sizing:border-box} body{margin:0;font-family:system-ui;background:radial-gradient(900px 560px at 15% 10%,#132a55,transparent),var(--bg);color:var(--txt)}
.wrap{max-width:520px;margin:0 auto;padding:14px}
.card{margin-top:14px;border:1px solid var(--line);background:rgba(17,28,51,.78);border-radius:18px;padding:12px}
h1{margin:10px 0 0 0;font-size:18px}
.small{color:var(--mut);font-size:12px}
.in{width:100%;padding:12px;border-radius:12px;border:1px solid var(--line);background:#0a1428;color:var(--txt);margin-top:10px}
.btn{cursor:pointer;border:none;border-radius:14px;padding:12px 14px;font-weight:800;width:100%;margin-top:10px}
.btnPri{background:linear-gradient(180deg,#4aa3ff,#2d7dff);color:#031027}
.btnLine{background:transparent;border:1px solid var(--line);color:var(--txt)}
.alert{display:none;margin-top:10px;padding:10px;border-radius:14px;border:1px solid rgba(239,68,68,.45);background:rgba(239,68,68,.1)}
.top{display:flex;align-items:center;gap:10px}
.bear{width:44px;height:44px;border-radius:14px;border:1px solid var(--line);display:grid;place-items:center;background:linear-gradient(180deg,rgba(74,163,255,.18),rgba(255,255,255,.03));position:relative;overflow:hidden}
.bear span{font-size:24px;display:block;animation:shake 1.1s ease-in-out infinite}
.bear i{position:absolute;right:6px;bottom:6px;font-style:normal;font-size:14px;animation:coin 1.1s ease-in-out infinite}
@keyframes shake{0%,100%{transform:translate(0,0) rotate(0)}25%{transform:translate(-2px,1px) rotate(-4deg)}50%{transform:translate(2px,-1px) rotate(4deg)}75%{transform:translate(-1px,-2px) rotate(-2deg)}}
@keyframes coin{0%,100%{transform:translate(0,0)}50%{transform:translate(0,-2px)}}
</style></head><body>
<div class="wrap">
  <div class="card">
    <div class="top"><div class="bear"><span>🐻‍❄️</span><i>🪙</i></div>
      <div><b>ICE-CUBO • BLUE</b><div class="small">cadastro + login (sem entrar direto)</div></div>
    </div>
  </div>

  <div class="card">
    <h1>Entrar</h1>
    <div class="small">Use seu usuário e senha.</div>
    <input class="in" id="lu" placeholder="Usuário"/>
    <input class="in" id="lp" type="password" placeholder="Senha"/>
    <button class="btn btnPri" onclick="login()">Entrar</button>
    <div class="alert" id="lmsg"></div>
  </div>

  <div class="card">
    <h1>Cadastrar</h1>
    <div class="small">Você pode colocar um <b>pai</b> (indicação). Se não tiver, os 5% viram do site.</div>
    <input class="in" id="ru" placeholder="Novo usuário"/>
    <input class="in" id="re" placeholder="Email (para PIX)"/>
    <input class="in" id="rp" type="password" placeholder="Senha"/>
    <input class="in" id="rpar" placeholder="Pai (opcional)"/>
    <button class="btn btnLine" onclick="reg()">Criar conta</button>
    <div class="alert" id="rmsg"></div>
  </div>
</div>

<script>
async function api(a, data){
  const r = await fetch("/api?a="+encodeURIComponent(a),{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(data||{})
  });
  return r.json().catch(()=>({ok:false,error:"json"}));
}
function show(id, txt){
  const el = document.getElementById(id);
  el.style.display="block";
  el.textContent=txt;
}
async function login(){
  const j = await api("login",{ username:lu.value, pass:lp.value });
  if(!j.ok){ show("lmsg", j.errorText||"Erro"); return; }
  location.reload();
}
async function reg(){
  const j = await api("register",{ username:ru.value, email:re.value, pass:rp.value, parent:rpar.value });
  if(!j.ok){ show("rmsg", j.errorText||"Erro"); return; }
  show("rmsg","Conta criada! Agora faça login.");
}
</script>
</body></html>`;
}

// ====== HANDLER ÚNICO ======
module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, "https://x.local");
    const a = url.searchParams.get("a") || "";
    const token = process.env.MP_ACCESS_TOKEN || "";

    // ====== rotas JSON ======
    if (a === "register") {
      const b = await readBody(req);
      const username = String(b.username||"").trim().toLowerCase();
      const email = String(b.email||"").trim();
      const pass = String(b.pass||"").trim();
      const parent = String(b.parent||"").trim().toLowerCase();

      if(!username || !pass || !email) return json(res,400,{ok:false,errorText:"Preencha usuário, email e senha"});
      if(DB.users[username]) return json(res,400,{ok:false,errorText:"Usuário já existe"});
      DB.users[username] = { pass, email, parent: parent || "", blue:0, posts:["Meu 1º post 🧊 (demo)"] };
      return json(res,200,{ok:true});
    }

    if (a === "login") {
      const b = await readBody(req);
      const username = String(b.username||"").trim().toLowerCase();
      const pass = String(b.pass||"").trim();
      const u = DB.users[username];
      if(!u || u.pass !== pass) return json(res,401,{ok:false,errorText:"Usuário ou senha inválidos"});
      const sid = uid(26);
      DB.sessions[sid] = username;
      cookieSet(res,"sid",sid);
      return json(res,200,{ok:true});
    }

    if (a === "logout") {
      const sid = cookieGet(req,"sid");
      delete DB.sessions[sid];
      res.setHeader("Set-Cookie","sid=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
      return json(res,200,{ok:true});
    }

    if (a === "users") {
      // lista simples para clicar e abrir perfil (demo)
      const list = Object.keys(DB.users)
        .filter(k=>k!=="__site")
        .slice(0,30)
        .map(k=>({ username:k, blue:DB.users[k].blue||0, parent:DB.users[k].parent||"", posts:DB.users[k].posts||[] }));
      return json(res,200,{ok:true,users:list});
    }

    // precisa logado:
    const auth = me(req);

    if (a === "create") {
      if(!auth) return json(res,401,{ok:false,errorText:"Faça login"});
      if(!token) return json(res,500,{ok:false,errorText:"MP_ACCESS_TOKEN não configurado"});
      const b = await readBody(req);
      const amount = Number(String(b.amount||"").replace(",","."));
      if(Number.isNaN(amount) || amount <= 0) return json(res,400,{ok:false,errorText:"Valor inválido"});
      if(amount < MIN_DEPOSIT_BRL) return json(res,400,{ok:false,errorText:`Depósito mínimo R$ ${MIN_DEPOSIT_BRL}`});

      const email = auth.user.email;
      const created = await mpCreatePix({ token, email, amount });

      DB.deposits[created.paymentId] = {
        username: auth.username,
        amount,
        status: created.status
      };

      return json(res,200,{ok:true,...created});
    }

    if (a === "status") {
      if(!auth) return json(res,401,{ok:false});
      if(!token) return json(res,500,{ok:false});
      const id = url.searchParams.get("id");
      if(!id) return json(res,400,{ok:false});

      const pay = await mpGetPayment({ token, id });
      const status = pay.status || "unknown";

      DB.deposits[id] ||= { username: auth.username, amount: pay.transaction_amount || 0 };
      DB.deposits[id].status = status;

      // creditar ao aprovar (idempotente)
      if(status === "approved" && DB.deposits[id].credited !== true){
        DB.deposits[id].credited = true;
        creditBlue({ username: DB.deposits[id].username, amountBRL: pay.transaction_amount || DB.deposits[id].amount, paymentId: id });
      }

      return json(res,200,{ ok:true, status, myBlue: auth.user.blue||0 });
    }

    if (a === "webhook") {
      // MP manda notificações (não depende de login)
      if(!token) return json(res,200,{ok:true, note:"sem token"});
      const b = await readBody(req);

      // MP pode mandar payment id em formatos diferentes
      const pid = b?.data?.id || b?.id || url.searchParams.get("id") || null;
      if(!pid) return json(res,200,{ok:true, note:"sem payment id"});

      const pay = await mpGetPayment({ token, id: pid });
      const status = pay.status || "unknown";

      // tenta achar dono do depósito
      const dep = DB.deposits[pid];
      if(dep){
        dep.status = status;
        if(status === "approved" && dep.credited !== true){
          dep.credited = true;
          creditBlue({ username: dep.username, amountBRL: pay.transaction_amount || dep.amount, paymentId: pid });
        }
      }
      return json(res,200,{ok:true});
    }

    if (a === "withdraw") {
      if(!auth) return json(res,401,{ok:false,errorText:"Faça login"});
      const b = await readBody(req);
      const amount = Math.floor(Number(b.amount||0));
      const pix = String(b.pix||"").trim();
      if(!pix) return json(res,400,{ok:false,errorText:"Informe sua chave PIX"});
      if(!amount || amount < MIN_WITHDRAW_BLUE) return json(res,400,{ok:false,errorText:`Saque mínimo ${MIN_WITHDRAW_BLUE} BLUE`});
      if((auth.user.blue||0) < amount) return json(res,400,{ok:false,errorText:"Saldo BLUE insuficiente"});

      // demo: apenas registra e desconta do saldo
      auth.user.blue -= amount;
      DB.withdraws.push({ username: auth.username, amount, pix, at: Date.now(), status:"pending" });

      return json(res,200,{ok:true,myBlue:auth.user.blue});
    }

    if (a === "mine") {
      if(!auth) return json(res,401,{ok:false});
      // Simulação de bloco: +50
      auth.user.blue = (auth.user.blue||0) + 50;
      return json(res,200,{ok:true,myBlue:auth.user.blue});
    }

    // ====== páginas ======
    if(!auth) return html(res, authPage());
    return html(res, page({ username: auth.username, user: auth.user }));

  } catch (e) {
    return json(res,500,{ok:false,errorText:e.message});
  }
};
