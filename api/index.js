export default function handler(req, res) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`<!doctype html><html lang="pt-br"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>ICE-CUBO</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
:root{--bg:#061428;--glass:rgba(255,255,255,.10);--line:rgba(255,255,255,.16);--txt:#eaf2ff;--mut:#b7c7e6;--acc:#38bdf8}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;background:
radial-gradient(1200px 600px at 20% -10%,rgba(56,189,248,.18),transparent 60%),
radial-gradient(900px 600px at 110% 30%,rgba(99,102,241,.14),transparent 55%),
linear-gradient(180deg,#031024,#071b33 60%,#041226);color:var(--txt);height:100vh;overflow:hidden}
#app{height:100vh;display:flex;flex-direction:column}
.top{height:52vh;position:relative;border-radius:0 0 26px 26px;overflow:hidden;background:#000}
.bgSea{position:absolute;inset:0;opacity:.35;background:
radial-gradient(circle at 10% 20%,rgba(56,189,248,.18),transparent 35%),
radial-gradient(circle at 80% 10%,rgba(59,130,246,.16),transparent 35%),
radial-gradient(circle at 30% 80%,rgba(34,211,238,.14),transparent 35%),
linear-gradient(180deg,#021024,#041a35)}
.bubbles:before,.bubbles:after{content:"";position:absolute;inset:-20%;background:
radial-gradient(circle,rgba(255,255,255,.22) 0 2px,transparent 3px) 0 0/120px 120px,
radial-gradient(circle,rgba(255,255,255,.16) 0 1px,transparent 2px) 40px 20px/160px 160px;
animation:float 14s linear infinite;opacity:.55}
.bubbles:after{animation-duration:20s;opacity:.35;transform:scale(1.15)}
@keyframes float{to{transform:translateY(-120px)}}
.brand{position:absolute;top:10px;left:12px;right:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:3}
.logo{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);background:var(--glass);backdrop-filter:blur(10px);border-radius:18px}
.logo b{letter-spacing:1px}
.pill{display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--line);background:var(--glass);backdrop-filter:blur(10px);border-radius:18px}
.pill .coin{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 30% 30%,#0ea5e9,#0b2a6a);border:1px solid rgba(255,215,0,.55)}
.pill .coin span{color:#ffd700;font-weight:900}
.viewer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:2}
#mainV{width:100%;height:100%;object-fit:cover;display:none}
#mainI{width:100%;height:100%;object-fit:cover;display:none}
#hint{position:absolute;inset:auto 12px 72px 12px;padding:10px 12px;border:1px solid var(--line);background:var(--glass);backdrop-filter:blur(12px);border-radius:18px;color:var(--mut);text-align:center}
.stageBar{position:absolute;left:12px;right:12px;bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:4}
.ownerCard{flex:1;display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);background:var(--glass);backdrop-filter:blur(12px);border-radius:18px;min-width:0}
.avatar{width:36px;height:36px;border-radius:14px;background:linear-gradient(135deg,#38bdf8,#1d4ed8);display:grid;place-items:center;font-weight:900}
.ownerCard .meta{min-width:0}
.ownerCard .meta .name{font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ownerCard .meta .sub{font-size:12px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.smallBtn{padding:10px 12px;border-radius:18px;border:1px solid var(--line);background:var(--glass);backdrop-filter:blur(12px);color:var(--txt)}
.bottom{flex:1;display:flex;flex-direction:column;gap:10px;padding:10px 10px 74px;overflow:hidden}
.carousel{display:flex;gap:10px;overflow:auto;scroll-snap-type:x mandatory;padding-bottom:4px}
.item{min-width:190px;max-width:190px;height:120px;border-radius:18px;overflow:hidden;border:1px solid var(--line);background:rgba(255,255,255,.06);scroll-snap-align:center;position:relative}
.item video,.item img{width:100%;height:100%;object-fit:cover;display:block}
.item .tag{position:absolute;left:8px;bottom:8px;padding:6px 10px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.35);backdrop-filter:blur(8px);border-radius:14px;font-size:12px}
.item.active{outline:2px solid rgba(56,189,248,.8)}
.panel{flex:1;overflow:auto;border:1px solid var(--line);background:var(--glass);backdrop-filter:blur(12px);border-radius:22px;padding:12px}
.hrow{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.hrow h3{margin:0;font-size:16px}
.muted{color:var(--mut);font-size:12px}
.gridPosts{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.post{border:1px solid var(--line);background:rgba(255,255,255,.06);border-radius:18px;overflow:hidden}
.post video,.post img{width:100%;height:140px;object-fit:cover;display:block}
.post .pbar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px}
.badge{font-size:12px;color:var(--mut);display:flex;gap:8px;align-items:center}
.badge .mini{width:18px;height:18px;border-radius:7px;display:grid;place-items:center;font-weight:900;background:linear-gradient(135deg,#38bdf8,#1d4ed8);color:#fff}
.iconBtn{border:0;background:transparent;color:#ff6b6b;padding:6px 8px;border-radius:12px}
.nav{position:fixed;left:10px;right:10px;bottom:10px;display:flex;gap:10px;z-index:10}
.nav button{flex:1;padding:12px 10px;border-radius:20px;border:1px solid var(--line);background:rgba(255,255,255,.08);backdrop-filter:blur(14px);color:var(--txt);display:flex;align-items:center;justify-content:center;gap:8px}
.nav button.active{outline:2px solid rgba(56,189,248,.8)}
.modal{position:fixed;inset:0;background:rgba(0,0,0,.55);display:none;align-items:flex-end;justify-content:center;z-index:20}
.sheet{width:min(760px,100%);max-height:86vh;border-radius:26px 26px 0 0;overflow:hidden;border:1px solid var(--line);background:rgba(7,20,38,.9);backdrop-filter:blur(18px)}
.sheetTop{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.12)}
.sheetTop b{font-size:14px}
.sheetBody{padding:12px 12px 14px;overflow:auto;max-height:calc(86vh - 52px)}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.field{flex:1;min-width:180px}
.field input,.field textarea{width:100%;padding:12px;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:var(--txt);outline:none}
hr{border:0;border-top:1px solid rgba(255,255,255,.12);margin:10px 0}
</style></head><body>
<div id="app">
  <div class="top">
    <div class="bgSea bubbles"></div>

    <div class="brand">
      <div class="logo">
        <i class="fa-solid fa-snowflake"></i>
        <b>ICE-CUBO</b>
        <span class="muted">online</span>
      </div>

      <div class="pill" title="BLUE (simulação)">
        <div class="coin"><span>B</span></div>
        <div style="display:flex;flex-direction:column;line-height:1.05">
          <span style="font-weight:800">BLUE</span>
          <span class="muted" id="blueBal">0</span>
        </div>
      </div>
    </div>

    <div class="viewer">
      <div id="hint">Toque em um card abaixo para destacar.</div>
      <video id="mainV playsinline controls"></video>
      <img id="mainI" />
    </div>

    <div class="stageBar">
      <div class="ownerCard" id="ownerCard">
        <div class="avatar" id="ownerAv">I</div>
        <div class="meta">
          <div class="name" id="ownerName">ICE IA</div>
          <div class="sub" id="ownerSub">Toque no card para abrir perfil</div>
        </div>
      </div>

      <button class="smallBtn" id="chatBtn" title="Chat"><i class="fa-solid fa-comments"></i></button>
      <button class="smallBtn" id="buyBtn" title="Comprar BLUE"><i class="fa-solid fa-cart-shopping"></i></button>
    </div>
  </div>

  <div class="bottom">
    <div class="carousel" id="carousel"></div>

    <div class="panel" id="panelFeed">
      <div class="hrow">
        <h3><i class="fa-solid fa-film"></i> Timeline</h3>
        <span class="muted">cards abaixo</span>
      </div>
      <div class="gridPosts" id="feedGrid"></div>
    </div>

    <div class="panel" id="panelHome" style="display:none">
      <div class="hrow">
        <h3><i class="fa-solid fa-user"></i> Seu perfil</h3>
        <span class="muted">demo</span>
      </div>
      <div class="muted">Aqui depois você coloca posts da galeria (continuamos depois sem quebrar).</div>
    </div>
  </div>
</div>

<div class="nav">
  <button id="navFeed" class="active"><i class="fa-solid fa-film"></i><span>Feed</span></button>
  <button id="navHome"><i class="fa-solid fa-user"></i><span>Perfil</span></button>
</div>

<!-- Modal Comprar BLUE -->
<div class="modal" id="modalBuy">
  <div class="sheet">
    <div class="sheetTop">
      <b>Comprar BLUE (Pix)</b>
      <button class="smallBtn" id="closeBuy"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="sheetBody">
      <div class="row">
        <div class="field"><input id="buyEmail" placeholder="Seu email (pagador)"></div>
        <div class="field"><input id="buyAmount" inputmode="decimal" placeholder="Valor em R$ (ex: 1.00)"></div>
      </div>
      <div class="row" style="margin-top:10px">
        <button class="smallBtn" id="createPix"><i class="fa-brands fa-pix"></i> Gerar Pix</button>
      </div>
      <hr>
      <div id="buyOut" class="muted">Digite email e valor e gere o Pix.</div>
    </div>
  </div>
</div>

<!-- Modal Perfil do usuário (simples) -->
<div class="modal" id="modalUser">
  <div class="sheet">
    <div class="sheetTop">
      <b id="userTitle">Perfil</b>
      <button class="smallBtn" id="closeUser"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="sheetBody">
      <div id="userBody"></div>
    </div>
  </div>
</div>

<script>
const me={id:"me",name:"Você",avatar:"V"};
const ai={id:"iceai",name:"ICE IA",avatar:"I"};
const fakes=[{id:"neo",name:"neo",avatar:"N"},{id:"tech",name:"tech",avatar:"T"}];

const st=JSON.parse(localStorage.getItem("ice_state_v1")||"null")||{blue:0};
const save=()=>localStorage.setItem("ice_state_v1",JSON.stringify(st));
const blueBal=document.getElementById("blueBal");
function blueRender(){blueBal.textContent=(st.blue||0).toFixed(6)+" BLUE";}

const posts=[
 {id:"p1",type:"video",url:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",owner:ai,ts:Date.now()-60000},
 {id:"p2",type:"video",url:"https://www.w3schools.com/html/mov_bbb.mp4",owner:fakes[0],ts:Date.now()-120000},
 {id:"p3",type:"image",url:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=60",owner:fakes[1],ts:Date.now()-180000}
];

const carousel=document.getElementById("carousel");
const feedGrid=document.getElementById("feedGrid");
const mainV=document.getElementById("mainV");
const mainI=document.getElementById("mainI");
const hint=document.getElementById("hint");
const ownerCard=document.getElementById("ownerCard");
const ownerAv=document.getElementById("ownerAv");
const ownerName=document.getElementById("ownerName");
const ownerSub=document.getElementById("ownerSub");

let selected=null;

function setOwner(u){
  ownerAv.textContent=u.avatar||"U";
  ownerName.textContent=u.name||"Usuário";
  ownerSub.textContent="Toque no card para abrir perfil";
}

function showMedia(p){
  selected=p;
  hint.style.display="none";
  setOwner(p.owner||ai);

  mainV.pause(); mainV.removeAttribute("src"); mainV.load();
  mainV.style.display="none"; mainI.style.display="none";

  if(p.type==="video"){ mainV.src=p.url; mainV.style.display="block"; mainV.play().catch(()=>{}); }
  else { mainI.src=p.url; mainI.style.display="block"; }

  [...carousel.children].forEach(el=>el.classList.toggle("active", el.dataset.id===p.id));
}

function render(){
  carousel.innerHTML="";
  posts.forEach(p=>{
    const div=document.createElement("div");
    div.className="item"+(selected&&selected.id===p.id?" active":"");
    div.dataset.id=p.id;
    div.innerHTML=(p.type==="video")?`<video muted playsinline src="${p.url}"></video><div class="tag">@${p.owner.name}</div>`
      :`<img src="${p.url}"><div class="tag">@${p.owner.name}</div>`;
    div.onclick=()=>showMedia(p);
    carousel.appendChild(div);
  });

  feedGrid.innerHTML="";
  posts.forEach(p=>{
    const c=document.createElement("div");
    c.className="post";
    c.innerHTML=(p.type==="video")?`<video muted playsinline src="${p.url}"></video>`:`<img src="${p.url}">`;
    const bar=document.createElement("div");
    bar.className="pbar";
    bar.innerHTML=`<span class="badge"><span class="mini">${p.owner.avatar}</span>@${p.owner.name}</span>
      <button class="iconBtn" title="destacar"><i class="fa-solid fa-up-right-and-down-left-from-center"></i></button>`;
    bar.querySelector("button").onclick=()=>showMedia(p);
    c.appendChild(bar);
    feedGrid.appendChild(c);
  });

  if(!selected) showMedia(posts[0]);
}

function openUser(u){
  document.getElementById("userTitle").textContent="Perfil • @"+u.name;
  document.getElementById("userBody").innerHTML=`
    <div style="display:flex;gap:12px;align-items:center">
      <div class="avatar" style="width:56px;height:56px;border-radius:18px">${u.avatar}</div>
      <div>
        <div style="font-weight:900;font-size:16px">@${u.name}</div>
        <div class="muted">ID: ${u.id}</div>
      </div>
    </div>
    <div class="muted" style="margin-top:12px">Aqui depois entra feed do usuário, fotos, vídeos, trocas...</div>
  `;
  document.getElementById("modalUser").style.display="flex";
}
document.getElementById("closeUser").onclick=()=>document.getElementById("modalUser").style.display="none";

// ✅ tocar no card do topo abre perfil
ownerCard.onclick=()=>{ if(selected?.owner) openUser(selected.owner); };

// Navegação básica
const panelFeed=document.getElementById("panelFeed");
const panelHome=document.getElementById("panelHome");
document.getElementById("navFeed").onclick=()=>{panelFeed.style.display="block";panelHome.style.display="none";}
document.getElementById("navHome").onclick=()=>{panelHome.style.display="block";panelFeed.style.display="none";}

// Comprar BLUE (chama /api/mp_create)
const modalBuy=document.getElementById("modalBuy");
document.getElementById("buyBtn").onclick=()=>{modalBuy.style.display="flex";document.getElementById("buyOut").textContent="Digite email e valor e gere o Pix.";};
document.getElementById("closeBuy").onclick=()=>modalBuy.style.display="none";

document.getElementById("createPix").onclick=async()=>{
  const email=(document.getElementById("buyEmail").value||"").trim();
  const amount=Number(String(document.getElementById("buyAmount").value||"").replace(",","."));
  const out=document.getElementById("buyOut");
  if(!email) return out.textContent="Digite seu email.";
  if(!amount || Number.isNaN(amount)) return out.textContent="Digite um valor válido (ex: 1.00).";

  out.textContent="Gerando Pix...";
  try{
    const r=await fetch("/api/mp_create",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ email, amount })
    });
    const data=await r.json();
    if(!data.ok){ out.textContent="Erro: "+JSON.stringify(data.error).slice(0,220); return; }

    // Credita BLUE em modo teste (só pra você ver funcionar)
    // Aqui você troca depois pela regra 85/10/5 + confirmação status.
    st.blue=(st.blue||0)+Number(amount);
    save(); blueRender();

    let txt="Pix gerado ✅\\nID: "+data.paymentId+"\\nStatus: "+data.status+"\\n\\n";
    if(data.qr_code) txt+="COPIA E COLA:\\n"+data.qr_code;
    else txt+="Sem QR code retornado.";
    out.textContent=txt;
  }catch(e){
    out.textContent="Erro: "+e.message;
  }
};

blueRender();
render();
</script>
</body></html>`);
}
