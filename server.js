export default function handler(req,res){
res.setHeader("Content-Type","text/html; charset=utf-8");
res.status(200).send(`<!doctype html><html lang=pt-br><head>
<meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>ICE-CUBO</title>
<link rel=stylesheet href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
:root{--bg:#061428;--g:rgba(255,255,255,.08);--g2:rgba(255,255,255,.12);--l:rgba(255,255,255,.16);--t:#eaf2ff;--m:#b7c7e6;--a:#38bdf8;--ok:#22c55e;--bad:#fb7185}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;background:
radial-gradient(1200px 600px at 20% -10%,rgba(56,189,248,.18),transparent 60%),
radial-gradient(900px 600px at 110% 30%,rgba(99,102,241,.14),transparent 55%),
linear-gradient(180deg,#031024,#071b33 60%,#041226);color:var(--t);height:100vh;overflow:hidden}
a{color:inherit}button{cursor:pointer}input,textarea{font:inherit}
#app{height:100vh;display:flex;flex-direction:column}
.top{height:52vh;position:relative;border-radius:0 0 26px 26px;overflow:hidden;background:#000}
.bgSea{position:absolute;inset:0;opacity:.45;filter:saturate(1.2);background:
radial-gradient(circle at 8% 20%,rgba(56,189,248,.22),transparent 35%),
radial-gradient(circle at 80% 10%,rgba(59,130,246,.18),transparent 35%),
radial-gradient(circle at 30% 80%,rgba(34,211,238,.16),transparent 38%),
linear-gradient(180deg,#021024,#041a35)}
.bub:before,.bub:after{content:"";position:absolute;inset:-20%;background:
radial-gradient(circle,rgba(255,255,255,.22) 0 2px,transparent 3px) 0 0/120px 120px,
radial-gradient(circle,rgba(255,255,255,.14) 0 1px,transparent 2px) 40px 20px/160px 160px;
animation:float 14s linear infinite;opacity:.55}
.bub:after{animation-duration:20s;opacity:.32;transform:scale(1.15)}
@keyframes float{to{transform:translateY(-120px)}}
.brand{position:absolute;top:10px;left:12px;right:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:3}
.logo{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(10px);border-radius:18px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
.brandname{display:flex;flex-direction:column;line-height:1.05}
.brandname b{letter-spacing:1.2px;font-size:15px}
.brandname small{color:var(--m);font-size:11px}
.pill{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(10px);border-radius:18px}
.coin{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;
background:radial-gradient(circle at 30% 30%,#0ea5e9,#0b2a6a);
border:1px solid rgba(255,215,0,.55);box-shadow:0 0 0 2px rgba(255,215,0,.18) inset}
.coin span{color:#ffd700;font-weight:1000}
.pill .meta{display:flex;flex-direction:column;line-height:1.05}
.pill .meta b{font-size:12px}
.pill .meta small{font-size:11px;color:var(--m)}
.viewer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:2}
#mainV{width:100%;height:100%;object-fit:cover;display:none}
#mainI{width:100%;height:100%;object-fit:cover;display:none}
#hint{position:absolute;inset:auto 12px 72px 12px;padding:10px 12px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(12px);border-radius:18px;color:var(--m);text-align:center}
.stageBar{position:absolute;left:12px;right:12px;bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:4}
.card{flex:1;display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(12px);border-radius:18px;min-width:0}
.av{width:38px;height:38px;border-radius:14px;display:grid;place-items:center;font-weight:1000;background:linear-gradient(135deg,#38bdf8,#1d4ed8);position:relative}
.meta{min-width:0}
.meta .name{font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:8px}
.meta .sub{font-size:12px;color:var(--m);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.star{font-size:13px}
.star.gold{color:#ffd700;text-shadow:0 0 10px rgba(255,215,0,.35)}
.star.blue{color:#6ee7ff;text-shadow:0 0 10px rgba(110,231,255,.25)}
.sbtn{padding:10px 12px;border-radius:18px;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(12px);color:var(--t)}
.sbtn:active{transform:scale(.98)}
.bottom{flex:1;display:flex;flex-direction:column;gap:10px;padding:10px 10px 74px;overflow:hidden}
.carousel{display:flex;gap:10px;overflow:auto;scroll-snap-type:x mandatory;padding-bottom:4px}
.item{min-width:190px;max-width:190px;height:120px;border-radius:18px;overflow:hidden;border:1px solid var(--l);background:rgba(255,255,255,.06);scroll-snap-align:center;position:relative}
.item video,.item img{width:100%;height:100%;object-fit:cover;display:block}
.tag{position:absolute;left:8px;bottom:8px;padding:6px 10px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.35);backdrop-filter:blur(8px);border-radius:14px;font-size:12px;display:flex;gap:8px;align-items:center}
.tag .mini{width:18px;height:18px;border-radius:7px;display:grid;place-items:center;font-weight:900;background:linear-gradient(135deg,#38bdf8,#1d4ed8)}
.item.active{outline:2px solid rgba(56,189,248,.85)}
.panel{flex:1;overflow:auto;border:1px solid var(--l);background:var(--g);backdrop-filter:blur(12px);border-radius:22px;padding:12px}
.hrow{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.hrow h3{margin:0;font-size:16px}
.muted{color:var(--m);font-size:12px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.post{border:1px solid var(--l);background:rgba(255,255,255,.06);border-radius:18px;overflow:hidden}
.post video,.post img{width:100%;height:140px;object-fit:cover;display:block}
.pbar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px}
.badge{font-size:12px;color:var(--m);display:flex;align-items:center;gap:8px;min-width:0}
.badge .mini{width:18px;height:18px;border-radius:7px;display:grid;place-items:center;font-weight:900;background:linear-gradient(135deg,#38bdf8,#1d4ed8);flex:0 0 auto}
.badge b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:105px}
.icon{border:0;background:transparent;color:#ff6b6b;padding:6px 8px;border-radius:12px}
.icon:active{transform:scale(.96)}
.nav{position:fixed;left:10px;right:10px;bottom:10px;display:flex;gap:10px;z-index:10}
.nav button{flex:1;padding:12px 10px;border-radius:20px;border:1px solid var(--l);background:rgba(255,255,255,.08);backdrop-filter:blur(14px);color:var(--t);display:flex;align-items:center;justify-content:center;gap:8px}
.nav button.active{outline:2px solid rgba(56,189,248,.85)}
.modal{position:fixed;inset:0;background:rgba(0,0,0,.55);display:none;align-items:flex-end;justify-content:center;z-index:20}
.sheet{width:min(720px,100%);max-height:86vh;border-radius:26px 26px 0 0;overflow:hidden;border:1px solid var(--l);background:rgba(7,20,38,.92);backdrop-filter:blur(18px)}
.sheetTop{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.12)}
.sheetTop b{font-size:14px}
.sheetBody{padding:12px 12px 14px;overflow:auto;max-height:calc(86vh - 52px)}
.chat{display:flex;flex-direction:column;gap:10px}
.bubbl{max-width:86%;padding:10px 12px;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06)}
.me{align-self:flex-end;background:rgba(56,189,248,.18);border-color:rgba(56,189,248,.25)}
.them{align-self:flex-start}
.chatBar{display:flex;gap:8px;margin-top:10px}
.chatBar input{flex:1;padding:12px 12px;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:var(--t);outline:none}
.chatBar button{padding:12px 14px;border-radius:18px;border:1px solid rgba(56,189,248,.35);background:rgba(56,189,248,.2);color:var(--t)}
hr{border:0;border-top:1px solid rgba(255,255,255,.12);margin:10px 0}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.field{flex:1;min-width:180px}
.field input,.field textarea{width:100%;padding:12px;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:var(--t);outline:none}
.field textarea{min-height:74px;resize:vertical}
.good{color:var(--ok)}.warn{color:#fbbf24}.bad{color:var(--bad)}
/* ====== Bear+Blue anim (inline SVG holder) ====== */
.bearWrap{width:44px;height:44px;border-radius:16px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);display:grid;place-items:center;overflow:hidden}
.bearWrap svg{width:44px;height:44px}
@keyframes paw{0%,100%{transform:translate(0,0) rotate(-3deg)}50%{transform:translate(2px,-1px) rotate(6deg)}}
@keyframes coin{0%,100%{transform:translate(0,0)}50%{transform:translate(0,-1px)}}
.paw{transform-origin:24px 24px;animation:paw 1.2s ease-in-out infinite}
.coinAnim{transform-origin:22px 26px;animation:coin 1.2s ease-in-out infinite}
</style></head><body>
<div id=app>
  <div class=top>
    <div class="bgSea bub"></div>

    <div class=brand>
      <div class=logo>
        <div class=bearWrap title="BLUE">
          <!-- Bear trying to grab BLUE (simple cute SVG animation) -->
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="ice" x1="10" y1="20" x2="50" y2="54">
                <stop stop-color="#9ae6ff" stop-opacity=".9"/>
                <stop offset="1" stop-color="#1f4ed8" stop-opacity=".55"/>
              </linearGradient>
              <radialGradient id="gold" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(34 36) rotate(45) scale(18)">
                <stop stop-color="#ffeaa7"/>
                <stop offset="1" stop-color="#ffb703"/>
              </radialGradient>
            </defs>
            <rect x="10" y="26" width="40" height="28" rx="6" fill="url(#ice)" stroke="rgba(255,255,255,.25)"/>
            <g class="coinAnim">
              <circle cx="30" cy="40" r="10" fill="url(#gold)" stroke="rgba(255,215,0,.6)"/>
              <path d="M30 33v14M24 36h10a4 4 0 0 1 0 8H24" stroke="#0b2a6a" stroke-width="3" stroke-linecap="round"/>
            </g>
            <g class="paw">
              <circle cx="50" cy="24" r="10" fill="rgba(255,255,255,.92)"/>
              <circle cx="44" cy="18" r="3" fill="rgba(255,255,255,.92)"/>
              <circle cx="56" cy="18" r="3" fill="rgba(255,255,255,.92)"/>
              <circle cx="50" cy="25" r="2" fill="#0b2a6a"/>
            </g>
          </svg>
        </div>
        <div class=brandname>
          <b>ICE-CUBO</b>
          <small id=netNote>social • trocas • BLUE</small>
        </div>
      </div>

      <div class=pill title="BLUE (simulação estilo BTC)">
        <div class=coin><span>B</span></div>
        <div class=meta>
          <b id=blueBal>0 BLUE</b>
          <small id=blueInfo>cap 21.000.000</small>
        </div>
      </div>
    </div>

    <div class=viewer>
      <div id=hint>Toque num card pra destacar na tela grande. (Swipe na timeline)</div>
      <video id=mainV playsinline controls></video>
      <img id=mainI />
    </div>

    <div class=stageBar>
      <div class=card id=ownerCard>
        <div class=av id=ownerAv>I</div>
        <div class=meta>
          <div class=name id=ownerName>ICE IA <span class="star blue" id=ownerStar style="display:none"><i class="fa-solid fa-star"></i></span></div>
          <div class=sub id=ownerSub>Toque no chat para conversar</div>
        </div>
      </div>
      <button class=sbtn id=chatBtn title=Chat><i class="fa-solid fa-comments"></i></button>
      <button class=sbtn id=mineBtn title="Minerar BLUE (simulação)"><i class="fa-solid fa-hammer"></i></button>
    </div>
  </div>

  <div class=bottom>
    <div class=carousel id=carousel></div>

    <div class=panel id=panelFeed>
      <div class=hrow>
        <h3><i class="fa-solid fa-film"></i> Timeline</h3>
        <span class=muted>swipe → para trocar</span>
      </div>
      <div class=muted>Posts mostram usuário + avatar + estrela (ADM/mod). Escolha um para destacar na tela grande.</div>
      <div style=height:10px></div>
      <div class=grid id=feedGrid></div>
    </div>

    <div class=panel id=panelHome style="display:none">
      <div class=hrow>
        <h3><i class="fa-solid fa-user"></i> Seu perfil</h3>
        <span class=muted>poste da galeria (funcional)</span>
      </div>
      <div class=row style="margin-bottom:10px">
        <label class=sbtn style="display:inline-flex;align-items:center;gap:8px">
          <i class="fa-solid fa-image"></i> Abrir galeria
          <input id=filePick type=file accept="image/*,video/*" style="display:none">
        </label>
        <button class=sbtn id=postBtn><i class="fa-solid fa-upload"></i> Postar</button>
        <span class=muted id=pickInfo>Nenhum arquivo selecionado</span>
      </div>
      <div class=muted style="margin-bottom:8px">Seus posts (aparecem aqui e na timeline):</div>
      <div class=grid id=myPosts></div>
    </div>

    <div class=panel id=panelSwap style="display:none">
      <div class=hrow>
        <h3><i class="fa-solid fa-repeat"></i> Trocas</h3>
        <span class=muted>produto + descrição + o que quer em troca</span>
      </div>

      <div class=muted style="margin-bottom:8px">
        Aqui é <b>Função A</b>: funciona no seu aparelho via localStorage (sem backend). Eu deixei <b>usuários fake + IA</b> pra simular “todos usuários”.
      </div>

      <div class=row>
        <div class=field>
          <input id=swapTitle placeholder="Nome do produto (ex: Tênis X)"/>
        </div>
        <div class=field>
          <input id=swapWant placeholder="Quero em troca (ex: Moletom / BLUE)"/>
        </div>
      </div>
      <div class=row style="margin-top:8px">
        <div class=field>
          <textarea id=swapDesc placeholder="Descrição rápida (tamanho, estado, detalhes...)"></textarea>
        </div>
      </div>
      <div class=row style="margin-top:8px;margin-bottom:10px">
        <label class=sbtn style="display:inline-flex;align-items:center;gap:8px">
          <i class="fa-solid fa-camera"></i> Foto/Vídeo
          <input id=swapFile type=file accept="image/*,video/*" style="display:none">
        </label>
        <button class=sbtn id=swapPost><i class="fa-solid fa-bolt"></i> Publicar troca</button>
        <span class=muted id=swapPickInfo>Nenhum arquivo</span>
      </div>

      <hr>
      <div class=hrow>
        <h3 style="font-size:14px;margin:0"><i class="fa-solid fa-shop"></i> Ofertas</h3>
        <span class=muted id=swapCount>0</span>
      </div>
      <div class=grid id=swapGrid></div>
    </div>

    <div class=panel id=panelHelp style="display:none">
      <div class=hrow>
        <h3><i class="fa-solid fa-triangle-exclamation"></i> Perigo</h3>
        <span class=muted>modo futuro</span>
      </div>
      <div class=muted>
        Aqui dá pra ligar depois geolocalização/alerta (botão ON/OFF). Por enquanto deixei “seguro” pra não quebrar Vercel.
      </div>
    </div>
  </div>
</div>

<div class=nav>
  <button id=navFeed class=active><i class="fa-solid fa-film"></i><span>Feed</span></button>
  <button id=navHome><i class="fa-solid fa-user"></i><span>Perfil</span></button>
  <button id=navSwap><i class="fa-solid fa-repeat"></i><span>Trocas</span></button>
  <button id=navHelp><i class="fa-solid fa-triangle-exclamation"></i><span>Perigo</span></button>
</div>

<div class=modal id=modal>
  <div class=sheet>
    <div class=sheetTop>
      <b id=chatTitle>Chat</b>
      <button class=sbtn id=closeModal><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class=sheetBody>
      <div class=chat id=chatBox></div>
      <div class=chatBar>
        <input id=chatInput placeholder="Digite sua mensagem..." />
        <button id=sendChat><i class="fa-solid fa-paper-plane"></i></button>
      </div>
    </div>
  </div>
</div>

<script>
/* ========= Mini-DB (IndexedDB) ========= */
const DBN="icecubo_db",STORE="files";
const idb=()=>new Promise((ok,er)=>{const r=indexedDB.open(DBN,1);
r.onupgradeneeded=()=>r.result.createObjectStore(STORE,{keyPath:"id"});
r.onsuccess=()=>ok(r.result);r.onerror=()=>er(r.error);});
const putFile=async(id,blob,type)=>new Promise(async(ok,er)=>{const db=await idb();const tx=db.transaction(STORE,"readwrite");
tx.objectStore(STORE).put({id,blob,type,ts:Date.now()});tx.oncomplete=()=>ok(1);tx.onerror=()=>er(tx.error);});
const getFile=async(id)=>new Promise(async(ok,er)=>{const db=await idb();const tx=db.transaction(STORE,"readonly");
const rq=tx.objectStore(STORE).get(id);rq.onsuccess=()=>ok(rq.result||null);rq.onerror=()=>er(rq.error);});
const delFile=async(id)=>new Promise(async(ok,er)=>{const db=await idb();const tx=db.transaction(STORE,"readwrite");
tx.objectStore(STORE).delete(id);tx.oncomplete=()=>ok(1);tx.onerror=()=>er(tx.error);});

/* ========= Usuários (simulação) ========= */
const ROLE={USER:"user",MOD:"mod",ADM:"adm"};
const starHtml=(r)=>r===ROLE.ADM?'<span class="star gold"><i class="fa-solid fa-star"></i></span>':(r===ROLE.MOD?'<span class="star blue"><i class="fa-solid fa-star"></i></span>':"");
const mkAv=(ch)=>ch||"U";
const me={id:"me",name:"Você",avatar:"V",role:ROLE.USER};
const ai={id:"iceai",name:"ICE IA",avatar:"I",role:ROLE.MOD};
const fakes=[
  {id:"maya",name:"maya",avatar:"M",role:ROLE.USER},
  {id:"kadu",name:"kadu",avatar:"K",role:ROLE.MOD},
  {id:"adm",name:"ICE ADM",avatar:"A",role:ROLE.ADM},
];

/* ========= Estado (localStorage) ========= */
const LS="icecubo_state_v2";
const st=JSON.parse(localStorage.getItem(LS)||"null")||{
  my:[],      // {id,fileId,type,ts}
  feed:[],    // {id,type,url,owner,ts}
  swaps:[],   // {id,title,desc,want,media:{type,url}|{fileId,type},owner,ts}
  blue:{cap:21000000,blocks:0,sub:0,bal:0,reward:50,halvEvery:210000,nextHalv:210000, minted:0, price:0.000001, brl:0}
};
const save=()=>localStorage.setItem(LS,JSON.stringify(st));
const uid=()=>Date.now().toString(36)+Math.random().toString(16).slice(2);

/* ========= Seed Feed + Swaps ========= */
(function seed(){
  if(!st.feed.length){
    const samples=[
      {src:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",type:"video",owner:ai},
      {src:"https://www.w3schools.com/html/mov_bbb.mp4",type:"video",owner:fakes[1]},
      {src:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=60",type:"image",owner:fakes[0]},
      {src:"https://images.unsplash.com/photo-1520975958225-8cc7f9f0b3fd?auto=format&fit=crop&w=1200&q=60",type:"image",owner:fakes[2]}
    ];
    st.feed=samples.map((s,i)=>({id:"seed_"+i,type:s.type,url:s.src,owner:s.owner,ts:Date.now()-((i+1)*60000)}));
  }
  if(!st.swaps.length){
    const s0={id:"swap_seed1",title:"Tênis (fictício)",desc:"Pouco usado. Tamanho 41. Foto exemplo.",want:"Moletom ou BLUE",owner:fakes[0],ts:Date.now()-360000,
      media:{type:"image",url:"https://images.unsplash.com/photo-1528701800489-20be3c8dd6a3?auto=format&fit=crop&w=1200&q=60"}};
    const s1={id:"swap_seed2",title:"Skate (fictício)",desc:"Deck ok, roda boa. Vídeo exemplo.",want:"Boné / camisa",owner:ai,ts:Date.now()-240000,
      media:{type:"video",url:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"}};
    st.swaps=[s0,s1];
  }
  save();
})();

/* ========= Refs ========= */
const carousel=byId("carousel"), mainV=byId("mainV"), mainI=byId("mainI"), hint=byId("hint");
const ownerAv=byId("ownerAv"), ownerName=byId("ownerName"), ownerSub=byId("ownerSub"), ownerStar=byId("ownerStar");
const blueBal=byId("blueBal"), blueInfo=byId("blueInfo"), mineBtn=byId("mineBtn");
const panelFeed=byId("panelFeed"), panelHome=byId("panelHome"), panelSwap=byId("panelSwap"), panelHelp=byId("panelHelp");
const feedGrid=byId("feedGrid"), myPosts=byId("myPosts"), swapGrid=byId("swapGrid"), swapCount=byId("swapCount");
const navFeed=byId("navFeed"), navHome=byId("navHome"), navSwap=byId("navSwap"), navHelp=byId("navHelp");
const filePick=byId("filePick"), pickInfo=byId("pickInfo"), postBtn=byId("postBtn");
const swapTitle=byId("swapTitle"), swapWant=byId("swapWant"), swapDesc=byId("swapDesc"), swapFile=byId("swapFile"), swapPickInfo=byId("swapPickInfo"), swapPost=byId("swapPost");
const modal=byId("modal"), chatBtn=byId("chatBtn"), closeModal=byId("closeModal"), chatBox=byId("chatBox"), chatTitle=byId("chatTitle"), chatInput=byId("chatInput"), sendChat=byId("sendChat");
function byId(id){return document.getElementById(id);}
let selected=null, pickedFile=null, pickedSwap=null, chatWith=ai;

/* ========= Helpers ========= */
const fmt=(ts)=>new Date(ts).toLocaleString().slice(0,16);
function toast(msg){hint.textContent=msg;hint.style.display="block";setTimeout(()=>{ if(!selected) hint.style.display="block"; },900);}
function setOwner(u){
  ownerAv.textContent=mkAv(u.avatar);
  ownerName.innerHTML = (u.name||"Usuário")+" "+starHtml(u.role);
  ownerSub.textContent = u.id===ai.id ? "Agente IA disponível no chat" : "Toque no chat para conversar";
  ownerStar.style.display="none";
}
function showMedia(p){
  selected=p; hint.style.display="none"; setOwner(p.owner||ai);
  mainV.pause(); mainV.removeAttribute("src"); mainV.load(); mainV.style.display="none"; mainI.style.display="none";
  if(p.type==="video"){ mainV.src=p.url; mainV.style.display="block"; mainV.play().catch(()=>{}); }
  else{ mainI.src=p.url; mainI.style.display="block"; }
  [...carousel.children].forEach(el=>el.classList.toggle("active",el.dataset.id===p.id));
}
async function mapMy(){
  const out=[];
  for(const p of st.my){
    const rec=await getFile(p.fileId); if(!rec) continue;
    out.push({id:p.id,type:p.type,url:URL.createObjectURL(rec.blob),owner:me,ts:p.ts,fileId:p.fileId});
  }
  return out.sort((a,b)=>b.ts-a.ts);
}
function allFeed(){ return [...st.feed].sort((a,b)=>b.ts-a.ts); }

/* ========= BLUE (simulação BTC-like) ========= */
function blueRender(){
  const b=st.blue;
  const rem=Math.max(0,b.cap-b.minted);
  blueBal.textContent = (b.bal||0).toFixed(6)+" BLUE";
  blueInfo.innerHTML = "minted <b>"+Math.floor(b.minted).toLocaleString("pt-BR")+"</b> • faltam <b>"+Math.floor(rem).toLocaleString("pt-BR")+"</b> • reward <b>"+b.reward+"</b>";
}
function blueMineOneBlock(){
  const b=st.blue;
  if(b.minted>=b.cap){ toast("Cap atingido (21.000.000). Não minera mais."); return; }
  // “bloco” de simulação
  b.blocks++;
  let reward=b.reward;
  const canMint=Math.min(reward, b.cap-b.minted);
  b.minted+=canMint;
  b.bal+=canMint;
  // halving
  if(b.blocks>=b.nextHalv){
    b.reward=Math.max(0.00000001, b.reward/2);
    b.sub++;
    b.nextHalv += b.halvEvery;
    toast("HALVING! Recompensa caiu pra "+b.reward);
  }else{
    toast("Minerou +"+canMint+" BLUE ✅");
  }
  // preço simulado: sobe com atividade + escassez (só pra UI)
  const scarcity=(b.minted/b.cap);
  b.price = Math.max(0.000001, (0.000001 + scarcity*0.01) * (1 + (st.feed.length+st.my.length+st.swaps.length)/200));
  save(); blueRender();
}
mineBtn.onclick=()=>{ blueMineOneBlock(); renderAll(); };

/* ========= Render ========= */
async function renderAll(){
  blueRender();
  const mine = await mapMy();
  const all = [...allFeed(), ...mine].sort((a,b)=>b.ts-a.ts);

  // carousel
  carousel.innerHTML="";
  all.slice(0,30).forEach(p=>{
    const div=document.createElement("div");
    div.className="item"+(selected&&selected.id===p.id?" active":"");
    div.dataset.id=p.id;
    div.innerHTML = p.type==="video"
      ? \`<video muted playsinline src="\${p.url}"></video>\`
      : \`<img src="\${p.url}">\`;
    const tag=document.createElement("div");
    tag.className="tag";
    tag.innerHTML=\`<span class=mini>\${mkAv(p.owner?.avatar)}</span>@\${p.owner?.name||"user"} \${p.owner?.role?starHtml(p.owner.role):""}\`;
    div.appendChild(tag);
    div.onclick=()=>showMedia(p);
    carousel.appendChild(div);
  });

  // feed grid
  feedGrid.innerHTML="";
  all.forEach(p=>{
    const c=document.createElement("div");
    c.className="post";
    c.innerHTML = p.type==="video" ? \`<video muted playsinline src="\${p.url}"></video>\` : \`<img src="\${p.url}">\`;
    const bar=document.createElement("div");
    bar.className="pbar";
    bar.innerHTML=\`<span class=badge><span class=mini>\${mkAv(p.owner.avatar)}</span><b>@\${p.owner.name}</b> \${starHtml(p.owner.role)} • \${fmt(p.ts)}</span>
                   <button class=icon title="destacar"><i class="fa-solid fa-up-right-and-down-left-from-center"></i></button>\`;
    bar.querySelector("button").onclick=()=>showMedia(p);
    c.appendChild(bar);
    feedGrid.appendChild(c);
  });

  // meus posts
  myPosts.innerHTML = mine.length? "" : "<div class=muted>Sem posts ainda.</div>";
  mine.forEach(p=>{
    const c=document.createElement("div");
    c.className="post";
    c.innerHTML = p.type==="video" ? \`<video muted playsinline src="\${p.url}"></video>\` : \`<img src="\${p.url}">\`;
    const bar=document.createElement("div");
    bar.className="pbar";
    bar.innerHTML=\`<span class=badge><span class=mini>\${mkAv(me.avatar)}</span><b>Seu post</b> • \${fmt(p.ts)}</span>
                   <button class=icon title="apagar"><i class="fa-solid fa-trash"></i></button>\`;
    bar.querySelector("button").onclick=()=>removeMy(p.id);
    c.appendChild(bar); myPosts.appendChild(c);
  });

  // swaps
  renderSwaps();

  if(!selected && all[0]) showMedia(all[0]);
}
async function removeMy(id){
  const idx=st.my.findIndex(x=>x.id===id); if(idx<0) return;
  const fileId=st.my[idx].fileId; st.my.splice(idx,1); save();
  await delFile(fileId).catch(()=>{});
  selected=null; toast("Post apagado ✅"); renderAll();
}

/* ========= Tabs ========= */
function setTab(t){
  navFeed.classList.toggle("active",t==="feed");
  navHome.classList.toggle("active",t==="home");
  navSwap.classList.toggle("active",t==="swap");
  navHelp.classList.toggle("active",t==="help");
  panelFeed.style.display=t==="feed"?"block":"none";
  panelHome.style.display=t==="home"?"block":"none";
  panelSwap.style.display=t==="swap"?"block":"none";
  panelHelp.style.display=t==="help"?"block":"none";
}
navFeed.onclick=()=>setTab("feed");
navHome.onclick=()=>setTab("home");
navSwap.onclick=()=>setTab("swap");
navHelp.onclick=()=>setTab("help");

/* ========= Post galeria ========= */
filePick.onchange=e=>{
  pickedFile=e.target.files&&e.target.files[0]?e.target.files[0]:null;
  pickInfo.textContent=pickedFile?(pickedFile.name+" • "+Math.round(pickedFile.size/1024)+"KB"):"Nenhum arquivo selecionado";
};
postBtn.onclick=async()=>{
  if(!pickedFile) return toast("Selecione um arquivo na galeria primeiro.");
  const type=pickedFile.type.startsWith("video")?"video":"image";
  const fileId="f_"+uid(), postId="p_"+uid();
  await putFile(fileId,pickedFile,pickedFile.type).catch(()=>null);
  st.my.unshift({id:postId,fileId,type,ts:Date.now()}); save();
  pickedFile=null; filePick.value=""; pickInfo.textContent="Postado ✅";
  toast("Post publicado ✅"); renderAll();
};

/* ========= Trocas ========= */
swapFile.onchange=e=>{
  pickedSwap=e.target.files&&e.target.files[0]?e.target.files[0]:null;
  swapPickInfo.textContent=pickedSwap?(pickedSwap.name+" • "+Math.round(pickedSwap.size/1024)+"KB"):"Nenhum arquivo";
};
swapPost.onclick=async()=>{
  const title=(swapTitle.value||"").trim(), want=(swapWant.value||"").trim(), desc=(swapDesc.value||"").trim();
  if(!title||!want||!desc) return toast("Preencha nome, descrição e o que quer em troca.");
  if(!pickedSwap) return toast("Adicione uma foto/vídeo do produto.");
  const type=pickedSwap.type.startsWith("video")?"video":"image";
  const fileId="sf_"+uid();
  await putFile(fileId,pickedSwap,pickedSwap.type).catch(()=>null);
  st.swaps.unshift({id:"s_"+uid(),title,desc,want,owner:me,ts:Date.now(),media:{fileId,type}});
  save();
  swapTitle.value="";swapWant.value="";swapDesc.value="";pickedSwap=null;swapFile.value="";swapPickInfo.textContent="Publicado ✅";
  toast("Troca publicada ✅"); renderAll();
};
async function swapMediaUrl(s){
  if(s.media?.url) return s.media.url;
  if(s.media?.fileId){
    const rec=await getFile(s.media.fileId); if(!rec) return "";
    return URL.createObjectURL(rec.blob);
  }
  return "";
}
async function renderSwaps(){
  swapGrid.innerHTML="";
  swapCount.textContent = st.swaps.length+" ofertas";
  for(const s of st.swaps.slice(0,60)){
    const url=await swapMediaUrl(s);
    const c=document.createElement("div");
    c.className="post";
    c.innerHTML = (s.media?.type==="video")
      ? \`<video muted playsinline src="\${url}"></video>\`
      : \`<img src="\${url}">\`;
    const bar=document.createElement("div");
    bar.className="pbar";
    bar.innerHTML=\`<span class=badge><span class=mini>\${mkAv(s.owner.avatar)}</span><b>@\${s.owner.name}</b> \${starHtml(s.owner.role)} • \${fmt(s.ts)}</span>
                   <button class=sbtn style="padding:8px 10px" title="propor troca"><i class="fa-solid fa-handshake"></i></button>\`;
    bar.querySelector("button").onclick=()=>openSwapChat(s);
    c.appendChild(bar);

    const info=document.createElement("div");
    info.style.padding="10px";
    info.innerHTML=\`<div style="font-weight:900;margin-bottom:4px">\${escapeHtml(s.title)}</div>
      <div class=muted style="margin-bottom:6px">\${escapeHtml(s.desc)}</div>
      <div class=muted><b>Quer em troca:</b> \${escapeHtml(s.want)}</div>\`;
    c.appendChild(info);

    // remover somente se for meu
    if(s.owner.id===me.id){
      const del=document.createElement("button");
      del.className="icon"; del.style.margin="0 10px 10px auto"; del.title="remover";
      del.innerHTML='<i class="fa-solid fa-trash"></i>';
      del.onclick=async()=>{
        const idx=st.swaps.findIndex(x=>x.id===s.id); if(idx<0) return;
        if(st.swaps[idx].media?.fileId) await delFile(st.swaps[idx].media.fileId).catch(()=>{});
        st.swaps.splice(idx,1); save(); toast("Oferta removida ✅"); renderAll();
      };
      c.appendChild(del);
    }
    swapGrid.appendChild(c);
  }
}
function openSwapChat(s){
  chatWith=s.owner.id===me.id?ai:s.owner; // se for seu, abre IA, senão abre o dono
  openChat(chatWith, "Troca: "+s.title+" • Quer: "+s.want);
}

/* ========= Chat (IA + usuário fake) ========= */
const CHATLS="icecubo_chats_v2";
const chats=JSON.parse(localStorage.getItem(CHATLS)||"{}");
const saveChats=()=>localStorage.setItem(CHATLS,JSON.stringify(chats));
function openChat(withUser,context){
  chatWith=withUser;
  const uid=withUser.id;
  if(!chats[uid]) chats[uid]=[{by:"them",txt: uid===ai.id ? "Oi 🙂 Sou a ICE IA. Me diga o que você quer fazer agora." : "Oi! tudo bem?",ts:Date.now()}];
  if(context) chats[uid].push({by:"them",txt:"Contexto: "+context,ts:Date.now()});
  saveChats();
  chatTitle.textContent="Chat • "+withUser.name;
  modal.style.display="flex";
  renderChat(uid);
  setOwner(withUser);
}
function renderChat(uid){
  chatBox.innerHTML="";
  (chats[uid]||[]).slice(-80).forEach(m=>{
    const d=document.createElement("div");
    d.className="bubbl "+(m.by==="me"?"me":"them");
    d.textContent=m.txt;
    chatBox.appendChild(d);
  });
  chatBox.scrollTop=chatBox.scrollHeight;
}
function aiReply(userText){
  // IA simples (offline) pra ficar “conversando” de verdade, não só frases prontas
  const t=userText.toLowerCase();
  const tips=[
    "Quer postar vídeo/foto no seu perfil ou ver a timeline?",
    "Se for trocas: diga o produto e o que você quer receber em troca.",
    "Se quiser BLUE: aperta o martelo pra minerar (simulação)."
  ];
  if(t.includes("blue")||t.includes("minerar")||t.includes("bitcoin")) return "BLUE aqui é simulação estilo BTC: cap 21M, halving e blocos. Quer que eu te explique o halving ou quer minerar agora?";
  if(t.includes("troca")||t.includes("tênis")||t.includes("produto")) return "Fechou. Vai em Trocas → preenche nome, descrição, o que quer em troca e coloca foto/vídeo. Depois eu simulo propostas no chat.";
  if(t.includes("erro")||t.includes("vercel")||t.includes("bug")) return "Se der erro, não mexe em /api/index.js. O app roda no server.js via vercel.json. Me diz qual tela que travou e eu ajusto sem quebrar.";
  if(t.includes("oi")||t.includes("olá")) return "Oi! 😄 O que você quer fazer agora: postar, trocar, ou testar a BLUE?";
  return "Entendi. " + (tips[Math.floor(Math.random()*tips.length)]);
}
chatBtn.onclick=()=>openChat(selected?.owner||ai);
closeModal.onclick=()=>modal.style.display="none";
sendChat.onclick=sendMsg;
chatInput.addEventListener("keydown",e=>{if(e.key==="Enter")sendMsg();});
function sendMsg(){
  const txt=(chatInput.value||"").trim(); if(!txt) return;
  const uid=chatWith.id;
  if(!chats[uid]) chats[uid]=[];
  chats[uid].push({by:"me",txt,ts:Date.now()});
  chatInput.value="";
  // resposta
  if(uid===ai.id){
    const rep=aiReply(txt);
    chats[uid].push({by:"them",txt:rep,ts:Date.now()+1});
  }else{
    // usuário fake responde simples
    const reps=["Show!","Entendi.","Bora negociar.","Manda mais detalhes.","Fechado se você me der algo equivalente."];
    chats[uid].push({by:"them",txt:reps[Math.floor(Math.random()*reps.length)],ts:Date.now()+1});
  }
  saveChats(); renderChat(uid);
}

/* ========= Utils ========= */
function escapeHtml(s){return (s||"").replace(/[&<>"]/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[m]));}

/* ========= Start ========= */
renderAll();
</script></body></html>`);
}
