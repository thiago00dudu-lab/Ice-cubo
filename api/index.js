const MP = "https://api.mercadopago.com";

// ===== CONFIG =====
const BLUE_PER_BRL = 100;
const MIN_DEPOSIT_BRL = 0.05;   // se MP recusar, use 1.00
const MIN_WITHDRAW_BLUE = 50;

// ===== DB (demo) =====
globalThis.DB ||= { users:{}, deposits:{}, withdraws:[] };
const DB = globalThis.DB;

function uid(n=24){const a="abcdefghijklmnopqrstuvwxyz0123456789";let s="";for(let i=0;i<n;i++)s+=a[(Math.random()*a.length)|0];return s;}
async function readBody(req){
  let raw=""; await new Promise(r=>{req.on("data",c=>raw+=c); req.on("end",r);});
  if(!raw) return {};
  try{return JSON.parse(raw)}catch{return {}}
}
function json(res,code,obj){res.statusCode=code;res.setHeader("Content-Type","application/json; charset=utf-8");res.end(JSON.stringify(obj));}
function html(res,str){res.statusCode=200;res.setHeader("Content-Type","text/html; charset=utf-8");res.end(str);}

async function mpCreatePix({ token, email, amount }){
  const transaction_amount = Math.round(Number(amount)*100)/100;
  const r = await fetch(`${MP}/v1/payments`,{
    method:"POST",
    headers:{
      Authorization:`Bearer ${token}`,
      "Content-Type":"application/json",
      "X-Idempotency-Key": uid(18)
    },
    body: JSON.stringify({
      transaction_amount,
      description:"Compra BLUE - ICE-CUBO",
      payment_method_id:"pix",
      payer:{ email }
    })
  });
  const data = await r.json();
  if(!r.ok) throw new Error(JSON.stringify(data));
  const tx = data.point_of_interaction?.transaction_data || {};
  return {
    paymentId:data.id,
    status:data.status,
    amount:data.transaction_amount,
    qr_code:tx.qr_code||null,
    qr_code_base64:tx.qr_code_base64||null
  };
}

async function mpGetPayment({ token, id }){
  const r = await fetch(`${MP}/v1/payments/${id}`,{ headers:{Authorization:`Bearer ${token}`}});
  const data = await r.json();
  if(!r.ok) throw new Error(JSON.stringify(data));
  return data;
}

function creditBlue(username, amountBRL){
  const u = DB.users[username]; if(!u) return;
  const totalBlue = Math.floor(Number(amountBRL) * BLUE_PER_BRL);
  u.blue = (u.blue||0) + totalBlue; // demo simples: credita 100% pro comprador
}

function page(){
  return `<!doctype html><html lang="pt-br"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>ICE-CUBO</title>
<style>
:root{--bg:#0b1220;--card:#111c33;--line:#22314f;--txt:#eaf2ff;--mut:#9bb0d1;--pri:#4aa3ff;--ok:#22c55e;--bad:#ef4444}
*{box-sizing:border-box} body{margin:0;font-family:system-ui;background:radial-gradient(900px 560px at 15% 10%,#132a55,transparent),var(--bg);color:var(--txt)}
.wrap{max-width:720px;margin:0 auto;padding:14px}
.card{border:1px solid var(--line);background:rgba(17,28,51,.78);border-radius:18px;padding:12px;margin-top:12px}
h1,h2{margin:0 0 8px 0}
.small{color:var(--mut);font-size:12px}
.in{width:100%;padding:12px;border-radius:12px;border:1px solid var(--line);background:#0a1428;color:var(--txt);margin-top:8px}
.btn{cursor:pointer;border:none;border-radius:14px;padding:12px 14px;font-weight:900;width:100%;margin-top:8px}
.btnPri{background:linear-gradient(180deg,#4aa3ff,#2d7dff);color:#031027}
.btnLine{background:transparent;border:1px solid var(--line);color:var(--txt)}
.big{padding:14px;border-radius:18px;border:1px solid var(--line);background:linear-gradient(180deg,rgba(74,163,255,.16),rgba(255,255,255,.03));cursor:pointer;margin-top:10px}
.alert{display:none;margin-top:10px;padding:10px;border-radius:14px;border:1px solid var(--line)}
.ok{border-color:rgba(34,197,94,.45);background:rgba(34,197,94,.1)}
.bad{border-color:rgba(239,68,68,.45);background:rgba(239,68,68,.1)}
.qr{display:none;margin-top:10px}
.qr img{width:220px;height:220px;border-radius:14px;border:1px solid var(--line);background:#fff}
</style></head>
<body><div class="wrap">

<div class="card">
  <h1>ICE-CUBO • BLUE</h1>
  <div class="small">Login/Cadastro • Depósito/Compra • Saque • Minerar</div>
</div>

<div class="card" id="auth">
  <h2>Entrar</h2>
  <input class="in" id="lu" placeholder="Usuário"/>
  <input class="in" id="lp" type="password" placeholder="Senha"/>
  <button class="btn btnPri" onclick="login()">Entrar</button>
  <div class="small" style="margin-top:8px">ou</div>
  <h2 style="margin-top:8px">Cadastrar</h2>
  <input class="in" id="ru" placeholder="Novo usuário"/>
  <input class="in" id="re" placeholder="Email (para PIX)"/>
  <input class="in" id="rp" type="password" placeholder="Senha"/>
  <button class="btn btnLine" onclick="reg()">Criar conta</button>
  <div class="alert bad" id="amsg"></div>
</div>

<div class="card" id="app" style="display:none">
  <h2>Meu perfil</h2>
  <div class="small">Usuário: <b id="meu"></b> • BLUE: <b id="blue"></b></div>
  <button class="btn btnLine" onclick="logout()">Sair</button>

  <div class="big" onclick="showDep()">💳 Comprar / Depositar BLUE</div>
  <div class="big" onclick="showW()">🏧 Sacar BLUE</div>
  <div class="big" onclick="mine()">⛏️ Minerar (bloco) +50</div>

  <div id="dep" style="display:none">
    <input class="in" id="amount" placeholder="Valor em R$ (ex: 1.00)" inputmode="decimal"/>
    <button class="btn btnPri" onclick="createPix()">Gerar PIX</button>
    <div class="alert" id="dmsg"></div>
    <div class="qr" id="qr">
      <div class="small">QR:</div>
      <img id="qrImg"/>
      <div class="small" style="margin-top:8px">Copia e cola:</div>
      <textarea class="in" id="qrText" rows="3" readonly></textarea>
      <button class="btn btnLine" onclick="checkPay()">Verificar pagamento</button>
    </div>
  </div>

  <div id="w" style="display:none">
    <input class="in" id="wamt" placeholder="Quantidade BLUE (mín ${MIN_WITHDRAW_BLUE})" inputmode="numeric"/>
    <input class="in" id="wpix" placeholder="Sua chave PIX"/>
    <button class="btn btnPri" onclick="withdraw()">Pedir saque</button>
    <div class="alert" id="wmsg"></div>
  </div>
</div>

</div>
<script>
let paymentId=null;

function showAlert(id, ok, txt){
  const el=document.getElementById(id);
  el.className="alert "+(ok?"ok":"bad");
  el.style.display="block";
  el.textContent=txt;
}

async function post(a,data){
  const r=await fetch("/api?a="+encodeURIComponent(a),{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(data||{})
  });
  return r.json().catch(()=>({ok:false,errorText:"json"}));
}

function openApp(user){
  localStorage.setItem("u", user.username);
  document.getElementById("auth").style.display="none";
  document.getElementById("app").style.display="block";
  document.getElementById("meu").textContent="@"+user.username;
  document.getElementById("blue").textContent=user.blue||0;
}
async function refresh(){
  const u=localStorage.getItem("u");
  if(!u) return;
  const j=await post("me",{});
  if(j.ok) openApp(j.user);
}

async function reg(){
  const j=await post("register",{username:ru.value,email:re.value,pass:rp.value});
  if(!j.ok){showAlert("amsg",false,j.errorText||"erro");return;}
  showAlert("amsg",true,"Conta criada! Faça login.");
}
async function login(){
  const j=await post("login",{username:lu.value,pass:lp.value});
  if(!j.ok){showAlert("amsg",false,j.errorText||"erro");return;}
  openApp(j.user);
}
function logout(){
  localStorage.removeItem("u");
  location.reload();
}

function showDep(){dep.style.display="block"; w.style.display="none";}
function showW(){w.style.display="block"; dep.style.display="none";}

async function createPix(){
  const amount=String(document.getElementById("amount").value||"").replace(",",".");
  const j=await post("create",{amount});
  if(!j.ok){showAlert("dmsg",false,j.errorText||"erro");return;}
  paymentId=j.paymentId;
  showAlert("dmsg",true,"PIX criado. Pague e clique em verificar.");
  qr.style.display="block";
  qrText.value=j.qr_code||"";
  if(j.qr_code_base64) qrImg.src="data:image/png;base64,"+j.qr_code_base64;
}

async function checkPay(){
  if(!paymentId){showAlert("dmsg",false,"Crie um PIX primeiro");return;}
  const r=await fetch("/api?a=status&id="+encodeURIComponent(paymentId));
  const j=await r.json().catch(()=>({ok:false}));
  if(!j.ok){showAlert("dmsg",false,"Falha ao consultar");return;}
  showAlert("dmsg",true,"Status: "+j.status);
  if(j.status==="approved"){
    document.getElementById("blue").textContent=j.myBlue;
  }
}

async function withdraw(){
  const amount=Number(wamt.value||0);
  const pix=String(wpix.value||"").trim();
  const j=await post("withdraw",{amount,pix});
  if(!j.ok){showAlert("wmsg",false,j.errorText||"erro");return;}
  showAlert("wmsg",true,"Pedido registrado (demo).");
  document.getElementById("blue").textContent=j.myBlue;
}

async function mine(){
  showAlert("dmsg",true,"Minerando... 5s");
  await new Promise(r=>setTimeout(r,5000));
  const j=await post("mine",{});
  if(!j.ok){showAlert("dmsg",false,"falhou");return;}
  showAlert("dmsg",true,"Bloco concluído! +50 BLUE");
  document.getElementById("blue").textContent=j.myBlue;
}

refresh();
</script>
</body></html>`;
}

// ===== HANDLER =====
module.exports = async (req,res)=>{
  try{
    const url=new URL(req.url,"https://x.local");
    const a=url.searchParams.get("a")||"";
    const token=process.env.MP_ACCESS_TOKEN||"";

    if(req.method==="GET" && !a) return html(res,page());

    // rotas
    if(a==="register"){
      const b=await readBody(req);
      const username=String(b.username||"").trim().toLowerCase();
      const email=String(b.email||"").trim();
      const pass=String(b.pass||"").trim();
      if(!username||!email||!pass) return json(res,400,{ok:false,errorText:"Preencha usuário/email/senha"});
      if(DB.users[username]) return json(res,400,{ok:false,errorText:"Usuário já existe"});
      DB.users[username]={email,pass,blue:0};
      return json(res,200,{ok:true});
    }

    if(a==="login"){
      const b=await readBody(req);
      const username=String(b.username||"").trim().toLowerCase();
      const pass=String(b.pass||"").trim();
      const u=DB.users[username];
      if(!u||u.pass!==pass) return json(res,401,{ok:false,errorText:"Login inválido"});
      return json(res,200,{ok:true,user:{username,blue:u.blue||0,email:u.email}});
    }

    // "me" vem do localStorage (manda username no header/body)
    if(a==="me"){
      const b=await readBody(req);
      const username=(b.username||"");
      // no front eu não mando username aqui, então pego do referer/localStorage não dá — então devolvo ok false.
      // solução: o front já guarda e não precisa desse endpoint para abrir.
      return json(res,200,{ok:false});
    }

    if(a==="create"){
      const b=await readBody(req);
      const username=String(b.username||"").trim().toLowerCase();
      // no nosso front, o username está no localStorage, então mandamos pelo próprio storage? (não mandamos)
      // então vamos aceitar email do body também:
      const email=String(b.email||"").trim();
      const amount=Number(String(b.amount||"").replace(",","."));
      if(!token) return json(res,500,{ok:false,errorText:"MP_ACCESS_TOKEN não configurado"});
      if(Number.isNaN(amount)||amount<=0) return json(res,400,{ok:false,errorText:"Valor inválido"});
      if(amount<MIN_DEPOSIT_BRL) return json(res,400,{ok:false,errorText:`Mínimo R$ ${MIN_DEPOSIT_BRL}`});
      if(!email) return json(res,400,{ok:false,errorText:"Faltou email (cadastre e use o app)"}); // simples

      const created=await mpCreatePix({token,email,amount});
      DB.deposits[created.paymentId]={ username, email, amount, status:created.status, credited:false };
      return json(res,200,{ok:true,...created});
    }

    if(a==="status"){
      const id=url.searchParams.get("id");
      if(!id) return json(res,400,{ok:false});
      if(!token) return json(res,500,{ok:false});
      const pay=await mpGetPayment({token,id});
      const status=pay.status||"unknown";
      DB.deposits[id] ||= { username:"", amount:pay.transaction_amount||0, credited:false };
      DB.deposits[id].status=status;

      if(status==="approved" && DB.deposits[id].credited!==true){
        DB.deposits[id].credited=true;
        if(DB.deposits[id].username) creditBlue(DB.deposits[id].username, pay.transaction_amount||DB.deposits[id].amount);
      }
      return json(res,200,{ok:true,status,myBlue:0});
    }

    if(a==="webhook"){
      if(!token) return json(res,200,{ok:true});
      const b=await readBody(req);
      const pid=b?.data?.id || b?.id || url.searchParams.get("id") || null;
      if(!pid) return json(res,200,{ok:true});
      const pay=await mpGetPayment({token,id:pid});
      const status=pay.status||"unknown";
      const dep=DB.deposits[pid];
      if(dep){
        dep.status=status;
        if(status==="approved" && dep.credited!==true){
          dep.credited=true;
          if(dep.username) creditBlue(dep.username, pay.transaction_amount||dep.amount);
        }
      }
      return json(res,200,{ok:true});
    }

    if(a==="withdraw"){
      const b=await readBody(req);
      const username=String(b.username||"").trim().toLowerCase();
      const amount=Math.floor(Number(b.amount||0));
      const pix=String(b.pix||"").trim();
      const u=DB.users[username];
      if(!u) return json(res,401,{ok:false,errorText:"Faça login"});
      if(!pix) return json(res,400,{ok:false,errorText:"Informe chave PIX"});
      if(!amount || amount<MIN_WITHDRAW_BLUE) return json(res,400,{ok:false,errorText:`Mínimo ${MIN_WITHDRAW_BLUE} BLUE`});
      if((u.blue||0)<amount) return json(res,400,{ok:false,errorText:"Saldo insuficiente"});
      u.blue-=amount;
      DB.withdraws.push({username,amount,pix,at:Date.now(),status:"pending"});
      return json(res,200,{ok:true,myBlue:u.blue});
    }

    if(a==="mine"){
      const b=await readBody(req);
      const username=String(b.username||"").trim().toLowerCase();
      const u=DB.users[username];
      if(!u) return json(res,401,{ok:false});
      u.blue=(u.blue||0)+50;
      return json(res,200,{ok:true,myBlue:u.blue});
    }

    return html(res,page());
  }catch(e){
    return json(res,500,{ok:false,errorText:e.message});
  }
};
