module.exports = async (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
<title>ICE-CUBO</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
:root{
  --bg1:#f7fbff; --bg2:#dff2ff; --t:#072445; --m:rgba(7,36,69,.7);
  --card:rgba(255,255,255,.55); --b:rgba(7,36,69,.14);
  --shadow:0 16px 60px rgba(2,26,60,.18);
}
*{box-sizing:border-box}
body{
  margin:0; font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;
  color:var(--t); height:100vh; overflow:hidden;
  background: radial-gradient(1100px 700px at 15% 10%, var(--bg1), transparent),
              radial-gradient(900px 600px at 80% 20%, var(--bg2), transparent),
              linear-gradient(180deg,#ffffff,#eaf7ff);
}
a{color:inherit}
#app{height:100vh; display:flex; flex-direction:column}
.top{
  padding:10px 12px 8px; display:flex; align-items:center; justify-content:space-between;
}
.brand{display:flex; align-items:center; gap:10px}
.logo{
  display:flex; align-items:center; gap:10px; padding:10px 12px;
  border-radius:18px; border:1px solid var(--b); background:var(--card);
  backdrop-filter:blur(14px); box-shadow:0 10px 30px rgba(2,26,60,.08);
}
.brandName{font-weight:900; letter-spacing:.6px}
.badgeBlue{
  font-weight:900; padding:6px 10px; border-radius:999px;
  border:1px solid var(--b); background:rgba(255,255,255,.65);
}
.main{
  flex:1; display:flex; flex-direction:column; gap:10px; padding:0 12px 10px;
}
.stage{
  position:relative; flex:0 0 46vh; border-radius:26px;
  border:1px solid var(--b); background:rgba(0,0,0,.88);
  overflow:hidden; box-shadow:var(--shadow);
}
#viewer{
  position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
  color:#fff; font-weight:900; letter-spacing:.5px;
}
#viewer .hint{
  position:absolute; bottom:10px; left:10px; right:10px;
  font-size:12px; font-weight:700; opacity:.85;
  display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap;
}
#ownerCard{
  position:absolute; top:10px; left:10px;
  display:flex; align-items:center; gap:10px;
  padding:10px 12px; border-radius:18px;
  border:1px solid rgba(255,255,255,.18);
  background:rgba(255,255,255,.08);
  backdrop-filter:blur(10px); color:#fff;
  cursor:pointer;
}
.avatar{
  width:34px; height:34px; border-radius:50%;
  display:grid; place-items:center; font-weight:900;
  background:linear-gradient(135deg,#7dd3fc,#60a5fa,#1d4ed8);
  border:1px solid rgba(255,255,255,.25);
}
.ownerMeta{line-height:1.05}
.ownerMeta b{display:block; font-size:13px}
.ownerMeta small{display:block; font-size:11px; opacity:.85}
.pill{
  position:absolute; top:10px; right:10px;
  display:flex; gap:8px; align-items:center;
  padding:10px 12px; border-radius:18px;
  border:1px solid rgba(255,255,255,.18);
  background:rgba(255,255,255,.08);
  backdrop-filter:blur(10px); color:#fff;
}
.pill .coin{font-weight:900}
#thumbs{
  display:flex; gap:10px; overflow-x:auto; padding-bottom:2px;
  scroll-snap-type:x mandatory;
}
.thumb{
  flex:0 0 120px; height:84px; border-radius:20px;
  border:1px solid var(--b); background:var(--card);
  backdrop-filter:blur(14px);
  display:flex; flex-direction:column; justify-content:flex-end;
  padding:10px; box-shadow:0 10px 30px rgba(2,26,60,.08);
  position:relative; overflow:hidden; scroll-snap-align:start;
  cursor:pointer;
}
.thumb .t{font-weight:900; font-size:12px}
.thumb .s{font-size:11px; color:var(--m)}
.thumb::before{
  content:""; position:absolute; inset:-40px -50px auto auto;
  width:140px; height:140px; border-radius:50%;
  background:radial-gradient(circle at 30% 30%, rgba(56,189,248,.55), transparent 55%);
}
.nav{
  flex:0 0 70px; padding:10px 14px 12px;
}
.navbar{
  height:56px; border-radius:22px; border:1px solid var(--b);
  background:rgba(255,255,255,.60); backdrop-filter:blur(16px);
  display:flex; align-items:center; justify-content:space-around;
  box-shadow:0 16px 50px rgba(2,26,60,.14);
}
.nbtn{
  width:48px; height:48px; border-radius:18px;
  display:grid; place-items:center; border:1px solid transparent;
  color:var(--t); background:transparent; cursor:pointer;
  font-size:18px;
}
.nbtn.active{border-color:var(--b); background:rgba(255,255,255,.55)}
.muted{color:var(--m); font-size:12px}
.row{display:flex; gap:10px; align-items:center; flex-wrap:wrap}
.field input, .field textarea{
  width:100%; padding:12px; border-radius:18px;
  border:1px solid var(--b);
  background:rgba(255,255,255,.65);
  outline:none; font-size:14px;
}
.smallBtn, .sbtn{
  padding:10px 12px; border-radius:18px; border:1px solid var(--b);
  background:rgba(255,255,255,.65); color:var(--t); font-weight:900;
  cursor:pointer;
}
.sbtn:disabled{opacity:.5; cursor:not-allowed}
hr{border:none; border-top:1px solid rgba(7,36,69,.10); margin:12px 0}

/* MODAIS */
.modal{
  position:fixed; inset:0; display:none; align-items:flex-end; justify-content:center;
  background:rgba(0,0,0,.35); padding:12px; z-index:20;
}
.sheet{
  width:min(520px, 100%); border-radius:24px; border:1px solid var(--b);
  background:rgba(255,255,255,.75); backdrop-filter:blur(18px);
  box-shadow:0 24px 80px rgba(2,26,60,.25);
  overflow:hidden;
}
.sheetTop{
  padding:12px 12px; display:flex; align-items:center; justify-content:space-between;
  border-bottom:1px solid rgba(7,36,69,.10);
}
.sheetBody{padding:12px}
.buyQR{
  width:220px; max-width:80vw; border-radius:18px;
  border:1px solid rgba(7,36,69,.14); background:#fff; padding:10px;
}

/* URSO + MOEDA (animação) */
#bearWrap{position:relative; width:42px; height:42px}
#bear{
  position:absolute; inset:0;
  background:radial-gradient(circle at 35% 30%, #fff, #dbeafe 55%, #93c5fd 100%);
  border-radius:50%;
  border:1px solid rgba(255,255,255,.7);
  display:grid; place-items:center;
  box-shadow:0 10px 25px rgba(2,26,60,.18);
  transform-origin:center;
}
#bear i{color:#0b3b7a}
#coin{
  position:absolute; right:-6px; bottom:-6px;
  width:22px; height:22px; border-radius:50%;
  border:1px solid rgba(255,215,0,.6);
  background:radial-gradient(circle at 30% 30%, #ffe9a8, #ffcc33 50%, #c78b00 100%);
  display:grid; place-items:center;
  font-weight:900; font-size:12px; color:#0a2a4f;
}
@keyframes tug{
  0%,100%{transform:translate(0,0) rotate(-2deg)}
  50%{transform:translate(2px,-1px) rotate(4deg)}
}
@keyframes coinwiggle{
  0%,100%{transform:translate(0,0)}
  50%{transform:translate(-2px,2px)}
}
#bearWrap{animation:tug 1.6s ease-in-out infinite}
#coin{animation:coinwiggle 1.2s ease-in-out infinite}
.toast{
  position:fixed; left:50%; bottom:92px; transform:translateX(-50%);
  padding:10px 12px; border-radius:18px;
  background:rgba(7,36,69,.92); color:#fff; font-weight:900; font-size:13px;
  opacity:0; pointer-events:none; transition:.25s; z-index:30;
}
.toast.on{opacity:1; transform:translateX(-50%) translateY(-6px)}
</style>
</head>
<body>
<div id="app">
  <div class="top">
    <div class="brand">
      <div class="logo">
        <div id="bearWrap">
          <div id="bear"><i class="fa-solid fa-snowflake"></i></div>
          <div id="coin">B</div>
        </div>
        <div>
          <div class="brandName">ICE-CUBO</div>
          <div class="muted">BLUE • Feed • Perfil</div>
        </div>
      </div>
    </div>
    <div class="badgeBlue"><i class="fa-solid fa-droplet"></i> BLUE: <span id="blueBal">0.000000</span></div>
  </div>

  <div class="main">
    <div class="stage" id="stage">
      <div id="viewer">
        <div id="ownerCard" title="Abrir perfil">
          <div class="avatar" id="ownerAv">T</div>
          <div class="ownerMeta">
            <b id="ownerName">Thiago</b>
            <small id="ownerRole">USER</small>
          </div>
        </div>

        <div class="pill">
          <i class="fa-solid fa-circle-play"></i>
          <span class="coin" id="videoTitle">Video 1</span>
        </div>

        <div class="hint">
          <span>Duplo toque em um card abaixo → sobe pro player</span>
          <span>Arraste p/ lado → próximo</span>
        </div>
      </div>
    </div>

    <div id="thumbs"></div>
  </div>

  <div class="nav">
    <div class="navbar">
      <button class="nbtn active" id="navHome" title="Home"><i class="fa-solid fa-house"></i></button>
      <button class="nbtn" id="navCam" title="Câmera"><i class="fa-solid fa-camera"></i></button>
      <button class="nbtn" id="navDanger" title="Perfil"><i class="fa-solid fa-user"></i></button>
    </div>
  </div>
</div>

<!-- MODAL PERFIL -->
<div class="modal" id="modalProfile">
  <div class="sheet">
    <div class="sheetTop">
      <b><i class="fa-solid fa-user"></i> Perfil</b>
      <button class="sbtn" id="closeProfile"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="sheetBody">
      <div class="row" style="justify-content:space-between">
        <div>
          <div style="font-weight:900;font-size:16px" id="profName">—</div>
          <div class="muted" id="profMeta">—</div>
        </div>
        <div class="badgeBlue" style="margin:0"><i class="fa-solid fa-droplet"></i> <span id="profBlue">0.000000</span></div>
      </div>

      <hr>

      <div class="row" style="margin:6px 0 12px">
        <button class="smallBtn" id="btnDeposit"><i class="fa-solid fa-arrow-down"></i> Depositar</button>
        <button class="smallBtn" id="btnWithdraw"><i class="fa-solid fa-arrow-up"></i> Sacar</button>
      </div>

      <div class="muted">
        * Depósito gera PIX (Mercado Pago). Depois de pagar, você verifica e o BLUE entra (DEMO).
      </div>
    </div>
  </div>
</div>

<!-- MODAL COMPRAR BLUE -->
<div class="modal" id="modalBuy">
  <div class="sheet">
    <div class="sheetTop">
      <b><i class="fa-solid fa-bag-shopping"></i> Comprar BLUE (PIX)</b>
      <button class="sbtn" id="closeBuy"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="sheetBody">
      <div class="muted" style="margin-bottom:10px">
        Se R$0,05 falhar, use R$1,00 (o MP costuma ter mínimo).
      </div>

      <div class="row">
        <div class="field" style="flex:1"><input id="buyEmail" placeholder="Seu email (pagador)"></div>
        <div class="field" style="width:160px"><input id="buyAmount" placeholder="R$ (ex: 1.00)" inputmode="decimal"></div>
      </div>

      <div class="row" style="margin-top:10px">
        <button class="sbtn" id="buyBtn"><i class="fa-solid fa-qrcode"></i> Gerar PIX</button>
        <button class="sbtn" id="buyCheck" disabled><i class="fa-solid fa-rotate"></i> Verificar pagamento</button>
      </div>

      <hr>
      <div id="buyOut" class="muted">—</div>
    </div>
  </div>
</div>

<div class="toast" id="toast">—</div>

<script>
/* ======= Estado DEMO (localStorage) ======= */
const KEY="icecubo_state_v1";
const st = JSON.parse(localStorage.getItem(KEY)||"null") || {
  me:{ id:"me", name:"Thiago", role:"OWNER", ref:null },
  blue:{ bal:0, siteFee:0, refFee:0 }
};
function save(){ localStorage.setItem(KEY, JSON.stringify(st)); }

const $ = (id)=>document.getElementById(id);
const toastEl=$("toast");
function toast(msg){
  toastEl.textContent=msg;
  toastEl.classList.add("on");
  setTimeout(()=>toastEl.classList.remove("on"), 2200);
}
function fmt6(n){ return (Number(n||0)).toFixed(6); }
function blueRender(){ $("blueBal").textContent = fmt6(st.blue.bal); }
blueRender();

/* ======= Feed fake ======= */
const feed=[
  { id:"v1", title:"Video 1", owner:{id:"u1", name:"Thiago", role:"OWNER"} },
  { id:"v2", title:"Video 2", owner:{id:"u2", name:"Jessica", role:"USER"} },
  { id:"v3", title:"Video 3", owner:{id:"u3", name:"Edu", role:"USER"} },
  { id:"v4", title:"Video 4", owner:{id:"u4", name:"Dudu", role:"USER"} }
];
let selected = feed[0];

function renderThumbs(){
  const wrap=$("thumbs");
  wrap.innerHTML="";
  feed.forEach((v,idx)=>{
    const d=document.createElement("div");
    d.className="thumb";
    d.innerHTML = '<div class="t">'+v.title+'</div><div class="s">@'+v.owner.name+'</div>';
    let lastTap=0;
    d.addEventListener("click", ()=>{
      const now=Date.now();
      if(now-lastTap<350){
        selectVideo(idx);
      }
      lastTap=now;
    });
    wrap.appendChild(d);
  });
}

function selectVideo(idx){
  selected = feed[idx];
  $("videoTitle").textContent = selected.title;
  $("ownerName").textContent = selected.owner.name;
  $("ownerRole").textContent = selected.owner.role;
  $("ownerAv").textContent = (selected.owner.name||"U").slice(0,1).toUpperCase();
  toast("Subiu: "+selected.title);
}
renderThumbs();
selectVideo(0);

/* Swipe no stage (próximo/anterior) */
let sx=0, dx=0, touching=false;
$("stage").addEventListener("touchstart",(e)=>{ touching=true; sx=e.touches[0].clientX; dx=0; },{passive:true});
$("stage").addEventListener("touchmove",(e)=>{ if(!touching) return; dx=e.touches[0].clientX - sx; },{passive:true});
$("stage").addEventListener("touchend",()=>{
  touching=false;
  if(Math.abs(dx)>60){
    const cur = feed.findIndex(v=>v.id===selected.id);
    const next = dx<0 ? Math.min(feed.length-1, cur+1) : Math.max(0, cur-1);
    selectVideo(next);
  }
});

/* ======= Perfil (clicar no card do dono) ======= */
const modalProfile=$("modalProfile");
$("ownerCard").onclick = ()=> openProfile(selected.owner);
$("closeProfile").onclick = ()=> modalProfile.style.display="none";

function openProfile(user){
  $("profName").textContent = user.name;
  $("profMeta").textContent = "@" + user.id + " • " + user.role;
  $("profBlue").textContent = fmt6(st.blue.bal);
  modalProfile.style.display="flex";
}

/* ======= Comprar BLUE (PIX) ======= */
const modalBuy=$("modalBuy");
$("closeBuy").onclick = ()=> modalBuy.style.display="none";

$("btnDeposit").onclick = ()=>{
  modalBuy.style.display="flex";
  $("buyOut").textContent="—";
  $("buyCheck").disabled=true;
  lastPaymentId=null;
};

$("btnWithdraw").onclick = ()=> toast("Saque: vamos ativar depois com regras ✅");

let lastPaymentId=null;
let lastAmount=0;

function reaisParaBlue(reais){
  // Exemplo (você muda depois): 1 real = 0.79 BLUE
  return reais * 0.79;
}
function creditarCompra(reais){
  const total = reaisParaBlue(reais);
  const comprador = total * 0.85;
  const site = total * 0.10;
  const indicado = total * 0.05;

  st.blue.bal = (st.blue.bal||0) + comprador;
  st.blue.siteFee = (st.blue.siteFee||0) + site;
  st.blue.refFee = (st.blue.refFee||0) + indicado;

  save();
  blueRender();
  $("profBlue").textContent = fmt6(st.blue.bal);
  toast("Aprovado ✅ +"+comprador.toFixed(6)+" BLUE");
}

$("buyBtn").onclick = async ()=>{
  const email = ($("buyEmail").value||"").trim();
  const amount = Number(($("buyAmount").value||"").replace(",", "."));
  if(!email) return toast("Digite seu email.");
  if(!amount || Number.isNaN(amount)) return toast("Digite um valor válido.");

  $("buyOut").textContent="Gerando PIX...";
  try{
    const r = await fetch("/api/mp_create",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ email, amount })
    });
    const data = await r.json();
    if(!data.ok){
      $("buyOut").textContent="Erro: "+JSON.stringify(data.error);
      $("buyCheck").disabled=true;
      return;
    }
    lastPaymentId=data.paymentId;
    lastAmount=data.amount||amount;
    $("buyCheck").disabled=false;

    const img = data.qr_code_base64 ? '<img class="buyQR" alt="QR PIX" src="data:image/png;base64,'+data.qr_code_base64+'">' : "";
    const code = data.qr_code ? '<textarea style="width:100%;padding:12px;border-radius:18px;border:1px solid rgba(7,36,69,.14)" readonly>'+data.qr_code+'</textarea>' : "";
    $("buyOut").innerHTML =
      '<div style="font-weight:900;margin-bottom:8px">PIX gerado ✅</div>'+
      img+
      '<div style="margin-top:10px">'+code+'</div>'+
      '<div class="muted" style="margin-top:8px">Depois de pagar, clique em “Verificar pagamento”.</div>';
  }catch(e){
    $("buyOut").textContent="Erro: "+e.message;
    $("buyCheck").disabled=true;
  }
};

$("buyCheck").onclick = async ()=>{
  if(!lastPaymentId) return;
  $("buyOut").innerHTML += '<div class="muted" style="margin-top:8px">Verificando...</div>';
  try{
    const r = await fetch("/api/mp_status?paymentId="+encodeURIComponent(lastPaymentId));
    const data = await r.json();
    if(!data.ok){
      $("buyOut").innerHTML += '<div class="muted">Erro: '+JSON.stringify(data.error)+'</div>';
      return;
    }
    if(data.status==="approved"){
      creditarCompra(Number(data.amount||lastAmount));
      $("buyOut").innerHTML += '<div style="margin-top:8px;font-weight:900">Aprovado ✅ BLUE creditado!</div>';
    }else{
      $("buyOut").innerHTML += '<div class="muted" style="margin-top:8px">Status: '+data.status+' (ainda não aprovado)</div>';
    }
  }catch(e){
    $("buyOut").innerHTML += '<div class="muted">Erro: '+e.message+'</div>';
  }
};

/* ======= Nav (Home/Cam/Perfil) ======= */
function setNav(active){
  ["navHome","navCam","navDanger"].forEach(id=>$(id).classList.remove("active"));
  $(active).classList.add("active");
}
$("navHome").onclick = ()=>{ setNav("navHome"); toast("Home"); };
$("navCam").onclick = ()=>{ setNav("navCam"); toast("Câmera (demo)"); };
$("navDanger").onclick = ()=>{ setNav("navDanger"); openProfile(st.me); };
</script>
</body>
</html>`);
};
