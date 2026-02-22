export default function handler(req,res){
res.setHeader("Content-Type","text/html; charset=utf-8");
res.status(200).send(`<!doctype html><html lang=pt-br><head>
<meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>ICE-CUBO</title>
<link rel=stylesheet href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
:root{--bg1:#dff3ff;--bg2:#bfe8ff;--bg3:#072445;--g:rgba(255,255,255,.55);--l:rgba(7,36,69,.18);--t:#06223f;--m:#2b587d;--a:#0ea5e9;--ok:#16a34a;--bad:#fb7185}
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
.pill .meta{display:flex;flex-direction:column;line-height:1.05}
.pill .meta b{font-size:12px}
.pill .meta small{font-size:11px;color:var(--m)}
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
.tag{position:absolute;left:8px;bottom:8px;padding:6px 10px;border:1px solid rgba(7,36,69,.18);background:rgba(255,255,255,.55);backdrop-filter:blur(8px);border-radius:14px;font-size:12px;display:flex;gap:8px;align-items:center;color:#053055}
.tag .mini{width:18px;height:18px;border-radius:7px;display:grid;place-items:center;font-weight:900;background:linear-gradient(135deg,#38bdf8,#1d4ed8);color:#fff}
.item.active{outline:2px solid rgba(14,165,233,.9)}
.panel{flex:1;overflow:auto;border:1px solid var(--l);background:rgba(255,255,255,.55);backdrop-filter:blur(12px);border-radius:22px;padding:12px}
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
.nav button{flex:1;padding:12px 10px;border-radius:20px;border:1px solid var(--l);background:rgba(255,255,255,.55);backdrop-filter:blur(14px);color:var(--t);display:flex;align-items:center;justify-content:center;gap:8px}
.nav button.active{outline:2px solid rgba(14,165,233,.9)}
.modal{position:fixed;inset:0;background:rgba(0,0,0,.45);display:none;align-items:flex-end;justify-content:center;z-index:20}
.sheet{width:min(760px,100%);max-height:86vh;border-radius:26px 26px 0 0;overflow:hidden;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.88);backdrop-filter:blur(18px)}
.sheetTop{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid rgba(7,36,69,.12)}
.sheetTop b{font-size:14px}
.sheetBody{padding:12px 12px 14px;overflow:auto;max-height:calc(86vh - 52px)}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.field{flex:1;min-width:180px}
.field input,.field textarea{width:100%;padding:12px;border-radius:18px;border:1px solid rgba(7,36,69,.14);background:rgba(255,255,255,.75);color:var(--t);outline:none}
.field textarea{min-height:74px;resize:vertical}
hr{border:0;border-top:1px solid rgba(7,36,69,.12);margin:10px 0}

/* filtros feed */
.filt{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 10px}
.filt button{padding:8px 10px;border-radius:999px;border:1px solid rgba(7,36,69,.14);background:rgba(255,255,255,.7)}
.filt button.on{outline:2px solid rgba(14,165,233,.9);background:rgba(14,165,233,.12)}

/* activity badge (ADM master) */
.act{position:absolute;right:-3px;top:-3px;width:10px;height:10px;border-radius:50%;border:2px solid rgba(255,255,255,.9);box-shadow:0 4px 10px rgba(0,0,0,.12)}
.act.blue{background:#0ea5e9}
.act.orange{background:#fb923c}
.act.red{background:#ef4444}

/* Bear tiny */
.bearWrap{width:44px;height:44px;border-radius:16px;border:1px solid rgba(7,36,69,.14);background:rgba(255,255,255,.65);display:grid;place-items:center;overflow:hidden}
.bearWrap svg{width:44px;height:44px}
@keyframes paw{0%,100%{transform:translate(0,0) rotate(-3deg)}50%{transform:translate(2px,-1px) rotate(6deg)}}
@keyframes coin{0%,100%{transform:translate(0,0)}50%{transform:translate(0,-1px)}}
.paw{transform-origin:24px 24px}.coinAnim{transform-origin:22px 26px}
.bearStage-grab .paw{animation:paw 1.1s ease-in-out infinite}
.bearStage-grab .coinAnim{animation:coin 1.1s ease-in-out infinite}
.crownBtn{padding:10px 12px;border-radius:18px;border:1px solid var(--l);background:rgba(255,255,255,.55)}
</style></head><body>
<div id=app>
  <div class="top bub">
    <div class=brand>
      <div class=logo>
        <div class="bearWrap bearStage-grab" id=bearWrap title="urso + BLUE">
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
        <div class=brandname>
          <b>ICE-CUBO</b>
          <small id=netNote>feed • trocas • seguidores</small>
        </div>
      </div>

      <div style="display:flex;gap:10px;align-items:center">
        <button class=crownBtn id=adminBtn title="ADM master"><i class="fa-solid fa-crown"></i></button>
        <div class=pill title="BLUE (simulação)">
          <div class=coin><span>B</span></div>
          <div class=meta>
            <b id=blueBal>0.000000 BLUE</b>
            <small id=blueInfo>cap 21.000.000</small>
          </div>
        </div>
      </div>
    </div>

    <div class=viewer>
      <div id=hint>Use filtros no Feed: Seguindo/Filhos, Só Trocas, Todos.</div>
      <video id=mainV playsinline controls></video>
      <img id=mainI>
    </div>

    <div class=stageBar>
      <div class=card id=ownerCard>
        <div class=av id=ownerAv>I</div>
        <div class=meta2>
          <div class=name id=ownerName>ICE IA</div>
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
      <div class=hrow><h3><i class="fa-solid fa-film"></i> Timeline</h3><span class=muted>2 camadas</span></div>

      <div class=filt>
        <button id=fSeg on class=on><i class="fa-solid fa-user-group"></i> Seguindo/Filhos</button>
        <button id=fTro><i class="fa-solid fa-repeat"></i> Só Trocas</button>
        <button id=fAll><i class="fa-solid fa-globe"></i> Todos</button>
      </div>

      <div class=muted id=feedNote>Camada 1: só quem você segue + filhos. (Abaixo) Camada 2: todo mundo.</div>

      <div style="font-weight:900;margin:10px 0 6px">Seguindo/Filhos</div>
      <div class=grid id=feedGridFollow></div>

      <div style="font-weight:900;margin:14px 0 6px">Todos</div>
      <div class=grid id=feedGridAll></div>
    </div>

    <div class=panel id=panelHome style="display:none">
      <div class=hrow><h3><i class="fa-solid fa-user"></i> Seu perfil</h3><span class=muted>poste da galeria</span></div>
      <div class=row style="margin-bottom:10px">
        <label class=sbtn style="display:inline-flex;align-items:center;gap:8px">
          <i class="fa-solid fa-image"></i> Abrir galeria
          <input id=filePick type=file accept="image/*,video/*" style="display:none">
        </label>
        <button class=sbtn id=postBtn><i class="fa-solid fa-upload"></i> Postar</button>
        <span class=muted id=pickInfo>Nenhum arquivo selecionado</span>
      </div>

      <hr>
      <div class=hrow><h3 style="font-size:14px;margin:0"><i class="fa-solid fa-user-plus"></i> Seguindo</h3><span class=muted id=followCount>0</span></div>
      <div class=muted style="margin-bottom:6px">Toque num usuário no Feed e clique “Seguir/Parar”.</div>
      <div id=followList class=muted>—</div>

      <hr>
      <div class=hrow><h3 style="font-size:14px;margin:0"><i class="fa-solid fa-sitemap"></i> Filhos</h3><span class=muted id=childCount>0</span></div>
      <div class=muted style="margin-bottom:6px">Filhos (referral) aparecem no feed “Seguindo/Filhos” mesmo se você não seguir.</div>
      <div id=childList class=muted>—</div>

      <hr>
      <div class=muted style="margin-bottom:8px">Seus posts:</div>
      <div class=grid id=myPosts></div>
    </div>

    <div class=panel id=panelSwap style="display:none">
      <div class=hrow><h3><i class="fa-solid fa-repeat"></i> Trocas</h3><span class=muted>produto + oferta</span></div>
      <div class=muted style="margin-bottom:8px">Publique um produto aqui. Ele aparece na Timeline como <b>TROCA</b>.</div>

      <div class=row>
        <div class=field><input id=swapTitle placeholder="Nome do produto (ex: Tênis X)"></div>
        <div class=field><input id=swapWant placeholder="Quero em troca (ex: Moletom / BLUE)"></div>
      </div>
      <div class=row style="margin-top:8px">
        <div class=field><textarea id=swapDesc placeholder="Descrição rápida..."></textarea></div>
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
      <div class=hrow><h3 style="font-size:14px;margin:0"><i class="fa-solid fa-shop"></i> Ofertas publicadas</h3><span class=muted id=swapCount>0</span></div>
      <div class=grid id=swapGrid></div>
    </div>

    <div class=panel id=panelHelp style="display:none">
      <div class=hrow><h3><i class="fa-solid fa-triangle-exclamation"></i> Perigo</h3><span class=muted>modo futuro</span></div>
      <div class=muted>Aqui depois dá pra ligar alertas (ON/OFF).</div>
    </div>
  </div>
</div>

<!-- Chat -->
<div class=modal id=modalChat>
  <div class=sheet>
    <div class=sheetTop>
      <b id=chatTitle>Chat</b>
      <button class=sbtn id=closeChat><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class=sheetBody>
      <div id=chatBox></div>
      <div class=row style="margin-top:10px">
        <div class=field><input id=chatInput placeholder="Digite sua mensagem..."></div>
        <button class=sbtn id=sendChat><i class="fa-solid fa-paper-plane"></i></button>
      </div>
    </div>
  </div>
</div>

<!-- Detalhe Troca -->
<div class=modal id=modalSwap>
  <div class=sheet>
    <div class=sheetTop>
      <b id=swapTitleModal>Troca</b>
      <button class=sbtn id=closeSwap><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class=sheetBody>
      <div id=swapDetail></div><hr>
      <div id=swapOfferArea></div><hr>
      <div id=swapOffersList></div>
    </div>
  </div>
</div>

<!-- Perfil do usuário (seguir) -->
<div class=modal id=modalUser>
  <div class=sheet>
    <div class=sheetTop>
      <b id=userTitle>Usuário</b>
      <button class=sbtn id=closeUser><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class=sheetBody>
      <div id=userBody></div>
    </div>
  </div>
</div>

<div class=nav>
  <button id=navFeed class=active><i class="fa-solid fa-film"></i><span>Feed</span></button>
  <button id=navHome><i class="fa-solid fa-user"></i><span>Perfil</span></button>
  <button id=navSwap><i class="fa-solid fa-repeat"></i><span>Trocas</span></button>
  <button id=navHelp><i class="fa-solid fa-triangle-exclamation"></i><span>Perigo</span></button>
</div>

<script>
/* ===== IndexedDB ===== */
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

/* ===== Users ===== */
const ROLE={USER:"user",MOD:"mod",ADM:"adm"};
const starHtml=r=>r===ROLE.ADM?'<span class="star gold"><i class="fa-solid fa-star"></i></span>':(r===ROLE.MOD?'<span class="star blue"><i class="fa-solid fa-star"></i></span>':"");
const mkAv=ch=>ch||"U";
const me={id:"me",name:"Você",avatar:"V",role:ROLE.USER};
const ai={id:"iceai",name:"ICE IA",avatar:"I",role:ROLE.MOD};
const fakes=[{id:"maya",name:"maya",avatar:"M",role:ROLE.USER},{id:"kadu",name:"kadu",avatar:"K",role:ROLE.MOD},{id:"adm",name:"ICE ADM",avatar:"A",role:ROLE.ADM}];

/* ===== State ===== */
const LS="icecubo_state_v4";
const uid=()=>Date.now().toString(36)+Math.random().toString(16).slice(2);
const st=JSON.parse(localStorage.getItem(LS)||"null")||{
  my:[],
  feed:[],
  swaps:[],
  offers:[],
  trades:[],
  follow:[ai.id,fakes[0].id],            // seguindo
  children:[fakes[1].id],               // filhos (referral)
  admin:{isMaster:false},               // ADM master toggle
  activity:{},                          // per-user stats local
  blue:{cap:21000000,blocks:0,bal:0,reward:50,halvEvery:210000,nextHalv:210000,minted:0,sub:0}
};
const save=()=>localStorage.setItem(LS,JSON.stringify(st));

/* ===== Activity stats (ADM master feature) ===== */
const now=()=>Date.now();
function ensureAct(u){
  if(!st.activity[u.id]){
    // simulação: cada user tem "avgDaily" diferente
    const base=u.id===me.id?40:(u.role===ROLE.ADM?220:(u.role===ROLE.MOD?120:25));
    st.activity[u.id]={totalSec:0,avgDailyMin:base,levelSince:now()-Math.floor(Math.random()*86400000*4)};
  }
}
[me,ai,...fakes].forEach(ensureAct);
let sessStart=now();
setInterval(()=>{
  // conta tempo real do usuário "Você"
  const t=now();
  const a=st.activity[me.id]; if(a){ a.totalSec+=1; }
  save();
},1000);

function actLevel(u){
  ensureAct(u);
  const a=st.activity[u.id];
  const m=(u.id===me.id?Math.floor(a.totalSec/60):a.avgDailyMin);
  let level="red";
  if(m>=90) level="blue";
  else if(m>=30) level="orange";
  else level="red";
  return {level, mins:m, since:a.levelSince};
}
function actBadge(u){
  if(!st.admin.isMaster) return "";
  const x=actLevel(u);
  const days=Math.max(1,Math.floor((now()-x.since)/86400000));
  const tip=\`Tempo médio: \${x.mins}min • cor há \${days}d\`;
  return \`<span class="act \${x.level}" title="\${tip}"></span>\`;
}

/* ===== Seed ===== */
(function seed(){
  if(!st.feed.length){
    const samples=[
      {src:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",type:"video",owner:ai},
      {src:"https://www.w3schools.com/html/mov_bbb.mp4",type:"video",owner:fakes[1]},
      {src:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=60",type:"image",owner:fakes[0]},
    ];
    st.feed=samples.map((s,i)=>({id:"seed_"+i,type:s.type,url:s.src,owner:s.owner,ts:now()-((i+1)*60000)}));
  }
  if(!st.swaps.length){
    const s0={id:"swap_seed1",title:"Tênis (fictício)",desc:"Pouco usado. Tamanho 41.",want:"Moletom ou BLUE",owner:fakes[0],ts:now()-360000,
      media:{type:"image",url:"https://images.unsplash.com/photo-1528701800489-20be3c8dd6a3?auto=format&fit=crop&w=1200&q=60"}};
    const s1={id:"swap_seed2",title:"Skate (fictício)",desc:"Deck ok, roda boa.",want:"Boné / camisa",owner:ai,ts:now()-240000,
      media:{type:"video",url:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"}};
    st.swaps=[s0,s1];
    st.feed.unshift({id:"feed_"+uid(),type:s0.media.type,url:s0.media.url,owner:s0.owner,ts:s0.ts,swapId:s0.id});
    st.feed.unshift({id:"feed_"+uid(),type:s1.media.type,url:s1.media.url,owner:s1.owner,ts:s1.ts,swapId:s1.id});
  }
  save();
})();

/* ===== Refs ===== */
const $=id=>document.getElementById(id);
const carousel=$("carousel"), mainV=$("mainV"), mainI=$("mainI"), hint=$("hint");
const ownerAv=$("ownerAv"), ownerName=$("ownerName"), ownerSub=$("ownerSub");
const blueBal=$("blueBal"), blueInfo=$("blueInfo"), mineBtn=$("mineBtn");
const panelFeed=$("panelFeed"), panelHome=$("panelHome"), panelSwap=$("panelSwap"), panelHelp=$("panelHelp");
const feedGridFollow=$("feedGridFollow"), feedGridAll=$("feedGridAll"), feedNote=$("feedNote");
const myPosts=$("myPosts");
const navFeed=$("navFeed"), navHome=$("navHome"), navSwap=$("navSwap"), navHelp=$("navHelp");
const filePick=$("filePick"), pickInfo=$("pickInfo"), postBtn=$("postBtn");
const swapTitle=$("swapTitle"), swapWant=$("swapWant"), swapDesc=$("swapDesc"), swapFile=$("swapFile"), swapPickInfo=$("swapPickInfo"), swapPost=$("swapPost");
const swapGrid=$("swapGrid"), swapCount=$("swapCount");
const modalChat=$("modalChat"), chatTitle=$("chatTitle"), closeChat=$("closeChat"), chatBox=$("chatBox"), chatInput=$("chatInput"), sendChat=$("sendChat"), chatBtn=$("chatBtn");
const modalSwap=$("modalSwap"), closeSwap=$("closeSwap"), swapTitleModal=$("swapTitleModal"), swapDetail=$("swapDetail"), swapOfferArea=$("swapOfferArea"), swapOffersList=$("swapOffersList");
const modalUser=$("modalUser"), closeUser=$("closeUser"), userTitle=$("userTitle"), userBody=$("userBody");
const followCount=$("followCount"), followList=$("followList"), childCount=$("childCount"), childList=$("childList");
const adminBtn=$("adminBtn");

const fSeg=$("fSeg"), fTro=$("fTro"), fAll=$("fAll");

let selected=null,pickedFile=null,pickedSwap=null,chatWith=ai,offerPick=null,openSwapId=null;
let feedMode="seg"; // seg | tro | all

/* ===== Helpers ===== */
const fmt=ts=>new Date(ts).toLocaleString().slice(0,16);
const esc=s=>(s||"").replace(/[&<>"]/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[m]));
function toast(msg){hint.textContent=msg;hint.style.display="block";setTimeout(()=>{ if(!selected) hint.style.display="block"; },900);}
function setOwner(u){
  ownerAv.textContent=mkAv(u.avatar);
  ownerName.innerHTML=(u.name||"Usuário")+" "+starHtml(u.role);
  ownerSub.textContent=u.id===ai.id?"Agente IA disponível no chat":"Toque no chat para conversar";
}
function showMedia(p){
  selected=p; hint.style.display="none"; setOwner(p.owner||ai);
  mainV.pause(); mainV.removeAttribute("src"); mainV.load(); mainV.style.display="none"; mainI.style.display="none";
  if(p.type==="video"){ mainV.src=p.url; mainV.style.display="block"; mainV.play().catch(()=>{}); }
  else{ mainI.src=p.url; mainI.style.display="block"; }
  [...carousel.children].forEach(el=>el.classList.toggle("active",el.dataset.id===p.id));
}

/* ===== BLUE sim (cap 21M) ===== */
function blueRender(){
  const b=st.blue, rem=Math.max(0,b.cap-b.minted);
  blueBal.textContent=(b.bal||0).toFixed(6)+" BLUE";
  blueInfo.innerHTML="minted <b>"+Math.floor(b.minted).toLocaleString("pt-BR")+"</b> • faltam <b>"+Math.floor(rem).toLocaleString("pt-BR")+"</b> • reward <b>"+b.reward+"</b>";
}
function blueMineOne(){
  const b=st.blue;
  if(b.minted>=b.cap) return toast("Cap 21.000.000 atingido.");
  b.blocks++;
  const canMint=Math.min(b.reward,b.cap-b.minted);
  b.minted+=canMint; b.bal+=canMint;
  if(b.blocks>=b.nextHalv){ b.reward=Math.max(0.00000001,b.reward/2); b.sub++; b.nextHalv+=b.halvEvery; toast("HALVING! reward agora "+b.reward); }
  else toast("Minerou +"+canMint+" BLUE ✅");
  save(); blueRender();
}
mineBtn.onclick=()=>{blueMineOne(); renderAll();};

/* ===== Tabs ===== */
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

/* ===== Admin master login ===== */
adminBtn.onclick=()=>{
  const pass=prompt("Senha ADM master:");
  if(!pass) return;
  // Troca a senha depois: aqui é demo local
  if(pass==="1234"){
    st.admin.isMaster=true; save();
    toast("ADM master ativo ✅ (agora aparece o indicador de tempo)");
    renderAll();
  }else{
    toast("Senha inválida.");
  }
};

/* ===== Feed filters ===== */
function setFeedMode(m){
  feedMode=m;
  fSeg.classList.toggle("on",m==="seg");
  fTro.classList.toggle("on",m==="tro");
  fAll.classList.toggle("on",m==="all");
  renderAll();
}
fSeg.onclick=()=>setFeedMode("seg");
fTro.onclick=()=>setFeedMode("tro");
fAll.onclick=()=>setFeedMode("all");

/* ===== Posts (galeria) ===== */
filePick.onchange=e=>{
  pickedFile=e.target.files&&e.target.files[0]?e.target.files[0]:null;
  pickInfo.textContent=pickedFile?(pickedFile.name+" • "+Math.round(pickedFile.size/1024)+"KB"):"Nenhum arquivo selecionado";
};
postBtn.onclick=async()=>{
  if(!pickedFile) return toast("Selecione um arquivo na galeria.");
  const type=pickedFile.type.startsWith("video")?"video":"image";
  const fileId="f_"+uid(), postId="p_"+uid();
  await putFile(fileId,pickedFile,pickedFile.type).catch(()=>null);
  st.my.unshift({id:postId,fileId,type,ts:now()}); save();
  pickedFile=null; filePick.value=""; pickInfo.textContent="Postado ✅";
  toast("Post publicado ✅"); renderAll();
};
async function mapMy(){
  const out=[];
  for(const p of st.my){
    const rec=await getFile(p.fileId); if(!rec) continue;
    out.push({id:p.id,type:p.type,url:URL.createObjectURL(rec.blob),owner:me,ts:p.ts,fileId:p.fileId});
  }
  return out.sort((a,b)=>b.ts-a.ts);
}
async function removeMy(id){
  const idx=st.my.findIndex(x=>x.id===id); if(idx<0) return;
  const fileId=st.my[idx].fileId; st.my.splice(idx,1); save();
  await delFile(fileId).catch(()=>{});
  selected=null; toast("Post apagado ✅"); renderAll();
}

/* ===== Trocas ===== */
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
  const swapId="s_"+uid();
  const s={id:swapId,title,desc,want,owner:me,ts:now(),media:{fileId,type}};
  st.swaps.unshift(s);
  const url=URL.createObjectURL(pickedSwap);
  st.feed.unshift({id:"feed_"+uid(),type,url,owner:me,ts:s.ts,swapId:swapId});
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
function openSwapModal(swapId){
  const s=st.swaps.find(x=>x.id===swapId);
  if(!s) return toast("Troca não encontrada.");
  openSwapId=swapId;
  swapTitleModal.textContent="Troca • "+s.title;
  modalSwap.style.display="flex";
  renderSwapModal();
}
closeSwap.onclick=()=>modalSwap.style.display="none";

async function renderSwapModal(){
  const s=st.swaps.find(x=>x.id===openSwapId); if(!s) return;
  const url=await swapMediaUrl(s);
  const isOwner=s.owner.id===me.id;
  swapDetail.innerHTML=`
    <div class=post>
      ${s.media.type==="video"?`<video muted playsinline src="${url}"></video>`:`<img src="${url}">`}
      <div class=pbar>
        <span class=badge><span class=mini>${mkAv(s.owner.avatar)}${actBadge(s.owner)}</span><b>@${esc(s.owner.name)}</b> ${starHtml(s.owner.role)} • ${fmt(s.ts)}</span>
        <span class=chip>TROCA</span>
      </div>
      <div style="padding:10px">
        <div style="font-weight:900;margin-bottom:4px">${esc(s.title)}</div>
        <div class=muted style="margin-bottom:6px">${esc(s.desc)}</div>
        <div class=muted><b>Quer em troca:</b> ${esc(s.want)}</div>
      </div>
    </div>`;

  // oferta simples (demo)
  if(!isOwner){
    swapOfferArea.innerHTML=`
      <div style="font-weight:900;margin-bottom:6px">Sua oferta</div>
      <div class=row>
        <label class=sbtn style="display:inline-flex;align-items:center;gap:8px">
          <i class="fa-solid fa-camera"></i> Foto/Vídeo da sua oferta
          <input id=offerFile type=file accept="image/*,video/*" style="display:none">
        </label>
        <span class=muted id=offerPickInfo>Nenhum arquivo</span>
      </div>
      <div class=row style="margin-top:8px">
        <div class=field><textarea id=offerDesc placeholder="Descreva o que você oferece"></textarea></div>
      </div>
      <div class=row style="margin-top:8px">
        <button class=sbtn id=sendOffer><i class="fa-solid fa-handshake"></i> Enviar oferta</button>
      </div>`;
    offerPick=null;
    const offerFile=$("offerFile"), offerPickInfo=$("offerPickInfo"), offerDesc=$("offerDesc"), sendOffer=$("sendOffer");
    offerFile.onchange=e=>{
      offerPick=e.target.files&&e.target.files[0]?e.target.files[0]:null;
      offerPickInfo.textContent=offerPick?(offerPick.name+" • "+Math.round(offerPick.size/1024)+"KB"):"Nenhum arquivo";
    };
    sendOffer.onclick=async()=>{
      const d=(offerDesc.value||"").trim();
      if(!offerPick) return toast("Adicione foto/vídeo da sua oferta.");
      if(!d) return toast("Descreva sua oferta.");
      const type=offerPick.type.startsWith("video")?"video":"image";
      const fileId="of_"+uid();
      await putFile(fileId,offerPick,offerPick.type).catch(()=>null);
      st.offers.unshift({id:"o_"+uid(),swapId:openSwapId,from:me,desc:d,ts:now(),media:{fileId,type},status:"pending"});
      save(); toast("Oferta enviada ✅");
      renderSwapModal(); renderAll();
    };
  }else{
    swapOfferArea.innerHTML=`<div class=muted>Você é o dono. Abaixo aparecem ofertas pra aceitar/recusar.</div>`;
  }

  const offers=st.offers.filter(o=>o.swapId===openSwapId).sort((a,b)=>b.ts-a.ts);
  if(!offers.length){
    swapOffersList.innerHTML=`<div class=muted>Sem ofertas ainda.</div>`;
  }else{
    let html=`<div style="font-weight:900;margin-bottom:6px">Ofertas (${offers.length})</div>`;
    for(const o of offers){
      const rec=await getFile(o.media.fileId); const u=rec?URL.createObjectURL(rec.blob):"";
      const stt=o.status, isOwner=(s.owner.id===me.id);
      html+=`
      <div class=post style="margin-bottom:10px">
        ${o.media.type==="video"?`<video muted playsinline src="${u}"></video>`:`<img src="${u}">`}
        <div class=pbar>
          <span class=badge><span class=mini>${mkAv(o.from.avatar)}${actBadge(o.from)}</span><b>@${esc(o.from.name)}</b> ${starHtml(o.from.role)} • ${fmt(o.ts)}</span>
          <span class=chip>${stt==="pending"?"PENDENTE":(stt==="accepted"?"ACEITA":"RECUSADA")}</span>
        </div>
        <div style="padding:10px"><div class=muted>${esc(o.desc)}</div></div>
        ${isOwner && stt==="pending"?`
          <div class=row style="padding:0 10px 10px">
            <button class=sbtn data-acc="${o.id}"><i class="fa-solid fa-check"></i> Aceitar</button>
            <button class=sbtn data-rej="${o.id}"><i class="fa-solid fa-xmark"></i> Recusar</button>
          </div>`:""}
      </div>`;
    }
    swapOffersList.innerHTML=html;
    swapOffersList.querySelectorAll("[data-acc]").forEach(b=>b.onclick=()=>acceptOffer(b.dataset.acc));
    swapOffersList.querySelectorAll("[data-rej]").forEach(b=>b.onclick=()=>rejectOffer(b.dataset.rej));
  }
}
function acceptOffer(offerId){
  const o=st.offers.find(x=>x.id===offerId); if(!o) return;
  const s=st.swaps.find(x=>x.id===o.swapId); if(!s) return;
  o.status="accepted";
  st.offers.filter(x=>x.swapId===o.swapId && x.id!==o.id && x.status==="pending").forEach(x=>x.status="rejected");
  st.trades.unshift({id:"t_"+uid(),swapId:o.swapId,from:o.from,to:s.owner,ts:now()});
  save(); toast("Troca aceita ✅");
  renderSwapModal(); renderAll();
}
function rejectOffer(offerId){
  const o=st.offers.find(x=>x.id===offerId); if(!o) return;
  o.status="rejected"; save(); toast("Oferta recusada.");
  renderSwapModal(); renderAll();
}

/* ===== Follow / Children ===== */
function isFollowing(uid){ return st.follow.includes(uid); }
function isChild(uid){ return st.children.includes(uid); }

function openUserModal(u){
  userTitle.textContent="Perfil • @"+u.name;
  const fol=isFollowing(u.id);
  const chi=isChild(u.id);
  userBody.innerHTML=`
    <div style="display:flex;gap:12px;align-items:center;margin-bottom:10px">
      <div class="av" style="width:54px;height:54px;border-radius:18px">${mkAv(u.avatar)}${actBadge(u)}</div>
      <div>
        <div style="font-weight:1000;font-size:16px">@${esc(u.name)} ${starHtml(u.role)}</div>
        <div class=muted>ID: ${u.id}</div>
      </div>
    </div>
    <div class=row>
      <button class=sbtn id=btnFollow><i class="fa-solid ${fol?'fa-user-minus':'fa-user-plus'}"></i> ${fol?'Parar de seguir':'Seguir'}</button>
      <button class=sbtn id=btnChild><i class="fa-solid fa-sitemap"></i> ${chi?'Remover filho':'Marcar como filho'}</button>
    </div>
    <div class=muted style="margin-top:10px">
      Seguindo/Filhos aparecem no feed de cima. Todos aparecem no feed de baixo.
    </div>`;
  $("btnFollow").onclick=()=>{
    if(u.id===me.id) return toast("Você já é você 😄");
    st.follow=fol?st.follow.filter(x=>x!==u.id):[...st.follow,u.id];
    save(); toast(fol?"Parou de seguir.":"Seguindo agora ✅");
    modalUser.style.display="none";
    renderAll();
  };
  $("btnChild").onclick=()=>{
    if(u.id===me.id) return toast("Você não pode ser seu filho 😄");
    st.children=chi?st.children.filter(x=>x!==u.id):[...st.children,u.id];
    save(); toast(chi?"Filho removido.":"Marcado como filho ✅");
    modalUser.style.display="none";
    renderAll();
  };
  modalUser.style.display="flex";
}
closeUser.onclick=()=>modalUser.style.display="none";

/* ===== Feed render ===== */
function allFeed(){ return [...st.feed].sort((a,b)=>b.ts-a.ts); }

async function renderSwaps(){
  swapGrid.innerHTML=""; swapCount.textContent=st.swaps.length+" ofertas";
  for(const s of st.swaps.slice(0,60)){
    const url=await swapMediaUrl(s);
    const c=document.createElement("div"); c.className="post";
    c.innerHTML=(s.media.type==="video")?`<video muted playsinline src="${url}"></video>`:`<img src="${url}">`;
    const bar=document.createElement("div"); bar.className="pbar";
    bar.innerHTML=`<span class=badge><span class=mini>${mkAv(s.owner.avatar)}${actBadge(s.owner)}</span><b>@${s.owner.name}</b> ${starHtml(s.owner.role)} • ${fmt(s.ts)} <span class=chip style="margin-left:6px">TROCA</span></span>
    <button class="sbtn" style="padding:8px 10px"><i class="fa-solid fa-handshake"></i></button>`;
    bar.querySelector("button").onclick=()=>openSwapModal(s.id);
    c.appendChild(bar);
    const info=document.createElement("div"); info.style.padding="10px";
    info.innerHTML=`<div style="font-weight:900;margin-bottom:4px">${esc(s.title)}</div>
    <div class=muted style="margin-bottom:6px">${esc(s.desc)}</div>
    <div class=muted><b>Quer:</b> ${esc(s.want)}</div>`;
    c.appendChild(info);
    swapGrid.appendChild(c);
  }
}

function renderFollowLists(){
  followCount.textContent=st.follow.length;
  childCount.textContent=st.children.length;

  const mapU=id=>[me,ai,...fakes].find(x=>x.id===id)||{id,name:id,avatar:"?",role:ROLE.USER};
  followList.textContent=st.follow.length?st.follow.map(id=>"@"+mapU(id).name).join(", "):"—";
  childList.textContent=st.children.length?st.children.map(id=>"@"+mapU(id).name).join(", "):"—";
}

function renderPostCard(p, parent){
  const c=document.createElement("div"); c.className="post";
  c.innerHTML=(p.type==="video")?`<video muted playsinline src="${p.url}"></video>`:`<img src="${p.url}">`;
  const bar=document.createElement("div"); bar.className="pbar";
  bar.innerHTML=`<span class=badge><span class=mini>${mkAv(p.owner.avatar)}${actBadge(p.owner)}</span><b>@${p.owner.name}</b> ${starHtml(p.owner.role)} • ${fmt(p.ts)} ${p.swapId?'<span class=chip style="margin-left:6px">TROCA</span>':""}</span>
  <div style="display:flex;gap:8px;align-items:center">
    ${p.swapId?`<button class="sbtn" style="padding:8px 10px"><i class="fa-solid fa-handshake"></i></button>`:""}
    <button class="sbtn" style="padding:8px 10px" title="perfil"><i class="fa-solid fa-user"></i></button>
    <button class=icon title="destacar" style="color:#0ea5e9"><i class="fa-solid fa-up-right-and-down-left-from-center"></i></button>
  </div>`;
  const btns=bar.querySelectorAll("button");
  const hi=btns[btns.length-1];
  hi.onclick=()=>showMedia(p);
  const prof=btns[btns.length-2];
  prof.onclick=()=>openUserModal(p.owner);
  const hs=bar.querySelector("button.sbtn i.fa-handshake")?.parentElement;
  if(hs) hs.onclick=()=>openSwapModal(p.swapId);
  c.appendChild(bar);
  parent.appendChild(c);
}

async function renderAll(){
  blueRender();
  renderFollowLists();

  const mine=await mapMy();
  const all=[...allFeed(),...mine].sort((a,b)=>b.ts-a.ts);

  // carousel (mantém rápido)
  carousel.innerHTML="";
  all.slice(0,30).forEach(p=>{
    const div=document.createElement("div");
    div.className="item"+(selected&&selected.id===p.id?" active":"");
    div.dataset.id=p.id;
    div.innerHTML=(p.type==="video")?`<video muted playsinline src="${p.url}"></video>`:`<img src="${p.url}">`;
    const tag=document.createElement("div"); tag.className="tag";
    tag.innerHTML=`<span class=mini>${mkAv(p.owner?.avatar)}</span>@${p.owner?.name||"user"} ${p.owner?.role?starHtml(p.owner.role):""} ${p.swapId?'<span class=chip>TROCA</span>':""}`;
    div.appendChild(tag);
    div.onclick=()=>{ showMedia(p); if(p.swapId && feedMode==="tro") openSwapModal(p.swapId); };
    carousel.appendChild(div);
  });

  // FILTROS: seg / tro / all
  const onlyTrades=(feedMode==="tro");
  const followSet=new Set(st.follow);
  const childSet=new Set(st.children);

  const followLayer = all.filter(p=>{
    if(onlyTrades && !p.swapId) return false;
    // Seguindo/Filhos: quem eu sigo OU é meu filho OU sou eu
    return p.owner?.id===me.id || followSet.has(p.owner?.id) || childSet.has(p.owner?.id);
  });

  const allLayer = all.filter(p=>{
    if(onlyTrades && !p.swapId) return false;
    return true;
  });

  // se modo all: a camada "Seguindo/Filhos" vira a mesma coisa, pra não confundir
  if(feedMode==="all"){
    feedNote.textContent="Modo Todos: as 2 camadas ficam iguais (tudo visível).";
  }else if(feedMode==="tro"){
    feedNote.textContent="Modo Só Trocas: camadas mostram apenas posts marcados como TROCA.";
  }else{
    feedNote.textContent="Camada 1: só Seguindo/Filhos. Camada 2: Todo mundo.";
  }

  feedGridFollow.innerHTML=""; feedGridAll.innerHTML="";
  (feedMode==="all"?allLayer:followLayer).slice(0,60).forEach(p=>renderPostCard(p,feedGridFollow));
  allLayer.slice(0,60).forEach(p=>renderPostCard(p,feedGridAll));

  // meus posts
  myPosts.innerHTML = mine.length? "" : "<div class=muted>Sem posts ainda.</div>";
  mine.forEach(p=>{
    const c=document.createElement("div"); c.className="post";
    c.innerHTML=(p.type==="video")?`<video muted playsinline src="${p.url}"></video>`:`<img src="${p.url}">`;
    const bar=document.createElement("div"); bar.className="pbar";
    bar.innerHTML=`<span class=badge><span class=mini>${mkAv(me.avatar)}${actBadge(me)}</span><b>Seu post</b> • ${fmt(p.ts)}</span>
      <button class=icon title="apagar"><i class="fa-solid fa-trash"></i></button>`;
    bar.querySelector("button").onclick=()=>removeMy(p.id);
    c.appendChild(bar); myPosts.appendChild(c);
  });

  await renderSwaps();

  if(!selected && all[0]) showMedia(all[0]);
}

/* ===== Chat ===== */
const CHATLS="icecubo_chat_v1";
const chats=JSON.parse(localStorage.getItem(CHATLS)||"{}");
const saveChats=()=>localStorage.setItem(CHATLS,JSON.stringify(chats));
function openChat(u){
  chatWith=u;
  if(!chats[u.id]) chats[u.id]=[{by:"them",txt:(u.id===ai.id?"Oi 🙂 Quer ver Seguindo/Filhos, Trocas ou Todos?":"Oi! tudo bem?"),ts:now()}];
  saveChats();
  chatTitle.textContent="Chat • "+u.name;
  modalChat.style.display="flex";
  renderChat();
}
function renderChat(){
  chatBox.innerHTML="";
  (chats[chatWith.id]||[]).slice(-80).forEach(m=>{
    const d=document.createElement("div");
    d.style.maxWidth="86%"; d.style.padding="10px 12px"; d.style.borderRadius="18px";
    d.style.border="1px solid rgba(7,36,69,.12)";
    d.style.background=m.by==="me"?"rgba(14,165,233,.12)":"rgba(255,255,255,.6)";
    d.style.margin=m.by==="me"?"0 0 0 auto":"0 auto 0 0";
    d.textContent=m.txt;
    chatBox.appendChild(d);
  });
  chatBox.scrollTop=chatBox.scrollHeight;
}
function aiReply(t){
  t=t.toLowerCase();
  if(t.includes("seguindo")||t.includes("filho")) return "No Feed tem 2 camadas. A de cima é Seguindo/Filhos. Você pode marcar filho no perfil do usuário.";
  if(t.includes("troca")) return "Clique num post TROCA ou vá em Trocas. Dentro você envia sua oferta com foto/vídeo + descrição.";
  if(t.includes("admin")) return "Ícone da coroa: senha demo 1234. Isso liga o indicador de tempo (bolinha azul/laranja/vermelha).";
  if(t.includes("blue")||t.includes("minerar")) return "A BLUE é simulação BTC-like: cap 21M, reward e halving. Aperta o martelo pra minerar.";
  return "Entendi. Quer ajustar Seguindo/Filhos, Trocas, ou Blue?";
}
chatBtn.onclick=()=>openChat(selected?.owner||ai);
closeChat.onclick=()=>modalChat.style.display="none";
sendChat.onclick=()=>sendMsg();
chatInput.addEventListener("keydown",e=>{if(e.key==="Enter")sendMsg();});
function sendMsg(){
  const txt=(chatInput.value||"").trim(); if(!txt) return;
  chats[chatWith.id]=chats[chatWith.id]||[];
  chats[chatWith.id].push({by:"me",txt,ts:now()});
  chatInput.value="";
  if(chatWith.id===ai.id) chats[chatWith.id].push({by:"them",txt:aiReply(txt),ts:now()+1});
  else chats[chatWith.id].push({by:"them",txt:"Show! 👍",ts:now()+1});
  saveChats(); renderChat();
}

/* ===== Start ===== */
renderAll(); blueRender();
</script></body></html>`);
}
