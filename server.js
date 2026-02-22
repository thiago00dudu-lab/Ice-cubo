export default function handler(req, res) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`<!doctype html><html lang="pt-br"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>ICE-CUBO</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
:root{--bg:#061428;--glass:rgba(255,255,255,.08);--glass2:rgba(255,255,255,.12);--line:rgba(255,255,255,.16);--txt:#eaf2ff;--mut:#b7c7e6;--acc:#38bdf8}
*{box-sizing:border-box} body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;background:radial-gradient(1200px 600px at 20% -10%,rgba(56,189,248,.18),transparent 60%),radial-gradient(900px 600px at 110% 30%,rgba(99,102,241,.14),transparent 55%),linear-gradient(180deg,#031024,#071b33 60%,#041226);color:var(--txt);height:100vh;overflow:hidden}
a{color:inherit} button{cursor:pointer}
#app{height:100vh;display:flex;flex-direction:column}
.top{height:52vh;position:relative;border-radius:0 0 26px 26px;overflow:hidden;background:#000}
.bgSea{position:absolute;inset:0;opacity:.35;filter:saturate(1.2);background:
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
.logo{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);background:var(--glass);backdrop-filter:blur(10px);border-radius:18px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
.logo b{letter-spacing:1px}
.pill{display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--line);background:var(--glass);backdrop-filter:blur(10px);border-radius:18px}
.pill .coin{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 30% 30%,#0ea5e9,#0b2a6a);border:1px solid rgba(255,215,0,.55);box-shadow:0 0 0 2px rgba(255,215,0,.18) inset}
.pill .coin span{color:#ffd700;font-weight:900}

.viewer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:2}
#mainMedia{width:100%;height:100%;object-fit:cover;display:none}
#hint{position:absolute;inset:auto 12px 72px 12px;padding:10px 12px;border:1px solid var(--line);background:var(--glass);backdrop-filter:blur(12px);border-radius:18px;color:var(--mut);text-align:center}
.stageBar{position:absolute;left:12px;right:12px;bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:4}
.ownerCard{flex:1;display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);background:var(--glass);backdrop-filter:blur(12px);border-radius:18px;min-width:0}
.avatar{width:36px;height:36px;border-radius:14px;background:linear-gradient(135deg,#38bdf8,#1d4ed8);display:grid;place-items:center;font-weight:900}
.ownerCard .meta{min-width:0}
.ownerCard .meta .name{font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ownerCard .meta .sub{font-size:12px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.smallBtn{padding:10px 12px;border-radius:18px;border:1px solid var(--line);background:var(--glass);backdrop-filter:blur(12px);color:var(--txt)}
.smallBtn:active{transform:scale(.98)}

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
.badge{font-size:12px;color:var(--mut)}
.iconBtn{border:0;background:transparent;color:#ff6b6b;padding:6px 8px;border-radius:12px}
.iconBtn:active{transform:scale(.96)}

.nav{position:fixed;left:10px;right:10px;bottom:10px;display:flex;gap:10px;z-index:10}
.nav button{flex:1;padding:12px 10px;border-radius:20px;border:1px solid var(--line);background:rgba(255,255,255,.08);backdrop-filter:blur(14px);color:var(--txt);display:flex;align-items:center;justify-content:center;gap:8px}
.nav button.active{outline:2px solid rgba(56,189,248,.8)}
.nav i{opacity:.95}

.modal{position:fixed;inset:0;background:rgba(0,0,0,.55);display:none;align-items:flex-end;justify-content:center;z-index:20}
.sheet{width:min(720px,100%);max-height:86vh;border-radius:26px 26px 0 0;overflow:hidden;border:1px solid var(--line);background:rgba(7,20,38,.9);backdrop-filter:blur(18px)}
.sheetTop{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.12)}
.sheetTop b{font-size:14px}
.sheetBody{padding:12px 12px 14px;overflow:auto;max-height:calc(86vh - 52px)}
.chat{display:flex;flex-direction:column;gap:10px}
.bubble{max-width:86%;padding:10px 12px;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06)}
.me{align-self:flex-end;background:rgba(56,189,248,.18);border-color:rgba(56,189,248,.25)}
.them{align-self:flex-start}
.chatBar{display:flex;gap:8px;margin-top:10px}
.chatBar input{flex:1;padding:12px 12px;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:var(--txt);outline:none}
.chatBar button{padding:12px 14px;border-radius:18px;border:1px solid rgba(56,189,248,.35);background:rgba(56,189,248,.2);color:var(--txt)}
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
      <div class="pill" title="Moeda BLUE (simulação)">
        <div class="coin"><span>B</span></div>
        <div style="display:flex;flex-direction:column;line-height:1.05">
          <span style="font-weight:800">BLUE</span>
          <span class="muted" id="blueBal">0</span>
        </div>
      </div>
    </div>

    <div class="viewer">
      <div id="hint">Toque em um card abaixo para destacar. (Swipe na timeline)</div>
      <video id="mainMedia" playsinline controls></video>
      <img id="mainImg" style="width:100%;height:100%;object-fit:cover;display:none" />
    </div>

    <div class="stageBar">
      <div class="ownerCard" id="ownerCard">
        <div class="avatar" id="ownerAv">I</div>
        <div class="meta">
          <div class="name" id="ownerName">ICE IA</div>
          <div class="sub" id="ownerSub">Toque no chat para conversar</div>
        </div>
      </div>
      <button class="smallBtn" id="chatBtn"><i class="fa-solid fa-comments"></i></button>
    </div>
  </div>

  <div class="bottom">
    <div class="carousel" id="carousel"></div>

    <div class="panel" id="panelHome" style="display:none">
      <div class="hrow">
        <h3><i class="fa-solid fa-house"></i> Seu perfil</h3>
        <span class="muted">poste foto/vídeo da galeria</span>
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px">
        <label class="smallBtn" style="display:inline-flex;align-items:center;gap:8px">
          <i class="fa-solid fa-image"></i> Abrir galeria
          <input id="filePick" type="file" accept="image/*,video/*" style="display:none">
        </label>
        <button class="smallBtn" id="postBtn"><i class="fa-solid fa-upload"></i> Postar</button>
        <span class="muted" id="pickInfo" style="align-self:center">Nenhum arquivo selecionado</span>
      </div>

      <div class="muted" style="margin-bottom:8px">Seus posts (aparecem aqui e também na timeline):</div>
      <div class="gridPosts" id="myPosts"></div>
    </div>

    <div class="panel" id="panelFeed">
      <div class="hrow">
        <h3><i class="fa-solid fa-film"></i> Timeline</h3>
        <span class="muted">swipe → para trocar</span>
      </div>
      <div class="muted">Escolha um post na timeline horizontal acima para destacar na tela grande.</div>
      <div style="height:10px"></div>
      <div class="gridPosts" id="feedGrid"></div>
    </div>
  </div>
</div>

<div class="nav">
  <button id="navFeed" class="active"><i class="fa-solid fa-film"></i><span>Feed</span></button>
  <button id="navHome"><i class="fa-solid fa-user"></i><span>Perfil</span></button>
  <button id="navSwap"><i class="fa-solid fa-repeat"></i><span>Trocas</span></button>
  <button id="navHelp"><i class="fa-solid fa-triangle-exclamation"></i><span>Perigo</span></button>
</div>

<div class="modal" id="modal">
  <div class="sheet">
    <div class="sheetTop">
      <b id="chatTitle">Chat</b>
      <button class="smallBtn" id="closeModal"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="sheetBody">
      <div class="chat" id="chatBox"></div>
      <div class="chatBar">
        <input id="chatInput" placeholder="Digite sua mensagem..." />
        <button id="sendChat"><i class="fa-solid fa-paper-plane"></i></button>
      </div>
    </div>
  </div>
</div>

<script>
/* ====== Storage (IndexedDB) ====== */
const DBN="icecubo_db", STORE="files";
function idb(){ return new Promise((ok,err)=>{
  const r=indexedDB.open(DBN,1);
  r.onupgradeneeded=()=>r.result.createObjectStore(STORE,{keyPath:"id"});
  r.onsuccess=()=>ok(r.result); r.onerror=()=>err(r.error);
});}
async function putFile(id,blob,type){
  const db=await idb();
  return new Promise((ok,err)=>{
    const tx=db.transaction(STORE,"readwrite");
    tx.objectStore(STORE).put({id,blob,type,ts:Date.now()});
    tx.oncomplete=()=>ok(true); tx.onerror=()=>err(tx.error);
  });
}
async function getFile(id){
  const db=await idb();
  return new Promise((ok,err)=>{
    const tx=db.transaction(STORE,"readonly");
    const rq=tx.objectStore(STORE).get(id);
    rq.onsuccess=()=>ok(rq.result||null); rq.onerror=()=>err(rq.error);
  });
}
async function delFile(id){
  const db=await idb();
  return new Promise((ok,err)=>{
    const tx=db.transaction(STORE,"readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete=()=>ok(true); tx.onerror=()=>err(tx.error);
  });
}

/* ====== Dados ====== */
const LS="icecubo_state_v1";
const me={id:"me",name:"Você",avatar:"V",blue:0};
const ai={id:"iceai",name:"ICE IA",avatar:"I"};
const state=JSON.parse(localStorage.getItem(LS)||"null")||{
  blue:0,
  my:[], // {id,fileId,type,owner,ts}
  feed:[]
};

function save(){ localStorage.setItem(LS,JSON.stringify(state)); }

function seedAI(){
  if(state.feed.length) return;
  const samples=[
    {src:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",type:"video"},
    {src:"https://www.w3schools.com/html/mov_bbb.mp4",type:"video"},
    {src:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=60",type:"image"}
  ];
  state.feed = samples.map((s,i)=>({
    id:"ai_"+i,
    type:s.type,
    url:s.src,
    owner:ai,
    ts:Date.now()-((i+1)*60000)
  }));
  save();
}
seedAI();

/* ====== UI refs ====== */
const carousel=document.getElementById("carousel");
const mainMedia=document.getElementById("mainMedia");
const mainImg=document.getElementById("mainImg");
const hint=document.getElementById("hint");
const ownerAv=document.getElementById("ownerAv");
const ownerName=document.getElementById("ownerName");
const ownerSub=document.getElementById("ownerSub");
const blueBal=document.getElementById("blueBal");

const panelFeed=document.getElementById("panelFeed");
const panelHome=document.getElementById("panelHome");
const feedGrid=document.getElementById("feedGrid");
const myPosts=document.getElementById("myPosts");

const navFeed=document.getElementById("navFeed");
const navHome=document.getElementById("navHome");
const navSwap=document.getElementById("navSwap");
const navHelp=document.getElementById("navHelp");

const modal=document.getElementById("modal");
const chatBtn=document.getElementById("chatBtn");
const closeModal=document.getElementById("closeModal");
const chatBox=document.getElementById("chatBox");
const chatTitle=document.getElementById("chatTitle");
const chatInput=document.getElementById("chatInput");
const sendChat=document.getElementById("sendChat");

const filePick=document.getElementById("filePick");
const pickInfo=document.getElementById("pickInfo");
const postBtn=document.getElementById("postBtn");

let selected=null; // post object
let pickedFile=null;

/* ====== Helpers ====== */
function fmtTime(ts){ const d=new Date(ts); return d.toLocaleString().slice(0,16); }
function setOwner(o){
  ownerAv.textContent=o.avatar||"U";
  ownerName.textContent=o.name||"Usuário";
  ownerSub.textContent=o.id===ai.id ? "Agente IA disponível no chat" : "Toque no chat para conversar";
}
function showMedia(post){
  selected=post;
  hint.style.display="none";
  setOwner(post.owner||ai);

  // parar ambos
  mainMedia.pause(); mainMedia.removeAttribute("src"); mainMedia.load();
  mainMedia.style.display="none";
  mainImg.style.display="none";

  if(post.type==="video"){
    mainMedia.src=post.url;
    mainMedia.style.display="block";
    mainMedia.play().catch(()=>{});
  }else{
    mainImg.src=post.url;
    mainImg.style.display="block";
  }

  // marcar ativo no carousel
  [...carousel.children].forEach(el=>el.classList.toggle("active", el.dataset.id===post.id));
}
function toast(msg){
  hint.textContent=msg; hint.style.display="block";
  setTimeout(()=>{ if(!selected) hint.style.display="block"; },900);
}

/* ====== Render ====== */
async function renderAll(){
  blueBal.textContent = (state.blue||0) + " BLUE";

  // juntar feed + meus posts
  const all = [...state.feed, ...await mapMyPostsToView()].sort((a,b)=>b.ts-a.ts);

  // carousel
  carousel.innerHTML="";
  all.slice(0,30).forEach(p=>{
    const div=document.createElement("div");
    div.className="item"+(selected&&selected.id===p.id?" active":"");
    div.dataset.id=p.id;
    div.innerHTML = p.type==="video"
      ? \`<video muted playsinline src="\${p.url}"></video><div class="tag">@\${p.owner.name}</div>\`
      : \`<img src="\${p.url}"/><div class="tag">@\${p.owner.name}</div>\`;
    div.onclick=()=>showMedia(p);
    carousel.appendChild(div);
  });

  // feed grid
  feedGrid.innerHTML="";
  all.forEach(p=>{
    const c=document.createElement("div");
    c.className="post";
    c.innerHTML = p.type==="video"
      ? \`<video muted playsinline src="\${p.url}"></video>\`
      : \`<img src="\${p.url}"/>\`;
    const bar=document.createElement("div");
    bar.className="pbar";
    bar.innerHTML=\`<span class="badge">@\${p.owner.name} • \${fmtTime(p.ts)}</span><button class="iconBtn" title="destacar"><i class="fa-solid fa-up-right-and-down-left-from-center"></i></button>\`;
    bar.querySelector("button").onclick=()=>showMedia(p);
    c.appendChild(bar);
    feedGrid.appendChild(c);
  });

  // meus posts
  const mine = await mapMyPostsToView();
  myPosts.innerHTML = mine.length? "" : "<div class='muted'>Sem posts ainda.</div>";
  mine.forEach(p=>{
    const c=document.createElement("div");
    c.className="post";
    c.innerHTML = p.type==="video"
      ? \`<video muted playsinline src="\${p.url}"></video>\`
      : \`<img src="\${p.url}"/>\`;
    const bar=document.createElement("div");
    bar.className="pbar";
    bar.innerHTML=\`<span class="badge">Seu post • \${fmtTime(p.ts)}</span><button class="iconBtn" title="apagar"><i class="fa-solid fa-trash"></i></button>\`;
    bar.querySelector("button").onclick=()=>removeMyPost(p.id);
    c.appendChild(bar);
    myPosts.appendChild(c);
  });

  // se não tem selecionado, seleciona primeiro
  if(!selected && all[0]) showMedia(all[0]);
}

async function mapMyPostsToView(){
  const out=[];
  for(const p of state.my){
    const rec=await getFile(p.fileId);
    if(!rec) continue;
    const url=URL.createObjectURL(rec.blob);
    out.push({id:p.id,type:p.type,url,owner:me,ts:p.ts,fileId:p.fileId});
  }
  return out.sort((a,b)=>b.ts-a.ts);
}

async function removeMyPost(id){
  const idx=state.my.findIndex(x=>x.id===id);
  if(idx<0) return;
  const fileId=state.my[idx].fileId;
  state.my.splice(idx,1);
  save();
  await delFile(fileId).catch(()=>{});
  selected=null;
  toast("Post apagado ✅");
  renderAll();
}

/* ====== Navegação ====== */
function setTab(tab){
  navFeed.classList.toggle("active",tab==="feed");
  navHome.classList.toggle("active",tab==="home");
  navSwap.classList.toggle("active",tab==="swap");
  navHelp.classList.toggle("active",tab==="help");

  panelFeed.style.display = (tab==="feed")?"block":"none";
  panelHome.style.display = (tab==="home")?"block":"none";

  if(tab==="swap") toast("Trocas: (próximo passo) — posso montar a tela depois sem quebrar.");
  if(tab==="help") toast("Perigo: (próximo passo) — posso ligar geolocalização e alertas com botão ON/OFF.");
}
navFeed.onclick=()=>setTab("feed");
navHome.onclick=()=>setTab("home");
navSwap.onclick=()=>setTab("swap");
navHelp.onclick=()=>setTab("help");

/* ====== Upload da galeria ====== */
filePick.onchange=(e)=>{
  pickedFile = e.target.files && e.target.files[0] ? e.target.files[0] : null;
  pickInfo.textContent = pickedFile ? (pickedFile.name + " • " + Math.round(pickedFile.size/1024) + " KB") : "Nenhum arquivo selecionado";
};
postBtn.onclick=async()=>{
  if(!pickedFile){ toast("Selecione um arquivo na galeria primeiro."); return; }
  const type = pickedFile.type.startsWith("video") ? "video" : "image";
  const fileId = "f_"+Date.now()+"_"+Math.random().toString(16).slice(2);
  const postId = "p_"+Date.now()+"_"+Math.random().toString(16).slice(2);

  await putFile(fileId, pickedFile, pickedFile.type).catch(()=>null);
  state.my.unshift({id:postId,fileId,type,ts:Date.now()});
  save();

  pickedFile=null; filePick.value=""; pickInfo.textContent="Postado ✅";
  toast("Post publicado ✅ (aparece no seu perfil e na timeline)");
  renderAll();
};

/* ====== Chat (IA + privado simulado) ====== */
const chats = JSON.parse(localStorage.getItem("icecubo_chats_v1")||"{}");
function saveChats(){ localStorage.setItem("icecubo_chats_v1", JSON.stringify(chats)); }
function openChat(withUser){
  const uid=withUser.id;
  if(!chats[uid]) chats[uid]=[{by:"them",txt: uid===ai.id ? "Oi 🙂 Eu sou a ICE IA. Quer conversar?" : "Oi! tudo bem?", ts:Date.now()}];
  saveChats();
  chatTitle.textContent = "Chat • " + withUser.name;
  modal.style.display="flex";
  renderChat(uid);
  chatInput.focus();
  modal.dataset.uid=uid;
}
function renderChat(uid){
  chatBox.innerHTML="";
  (chats[uid]||[]).forEach(m=>{
    const b=document.createElement("div");
    b.className="bubble "+(m.by==="me"?"me":"them");
    b.textContent=m.txt;
    chatBox.appendChild(b);
  });
  chatBox.scrollTop=chatBox.scrollHeight;
}
function aiReply(text){
  const t=text.toLowerCase();
  if(t.includes("sozinh")) return "Tô aqui com você 🙂 Quer me contar como foi seu dia?";
  if(t.includes("oi")||t.includes("olá")) return "Oii! 😄 Quer ver vídeos, postar algo, ou só conversar?";
  if(t.includes("triste")||t.includes("ansios")) return "Sinto muito… respira comigo 10s. Quer falar do que te deixou assim?";
  if(t.includes("ice")||t.includes("blue")) return "ICE-CUBO tá ficando top. BLUE vai ser sua moeda do app. Quer que eu te ajude a organizar isso?";
  return "Entendi. Me fala mais um pouco 🙂";
}
async function send(){
  const uid=modal.dataset.uid;
  const txt=chatInput.value.trim();
  if(!txt) return;
  chats[uid].push({by:"me",txt,ts:Date.now()});
  chatInput.value="";
  saveChats(); renderChat(uid);

  // resposta automática se for IA
  if(uid===ai.id){
    setTimeout(()=>{
      chats[uid].push({by:"them",txt:aiReply(txt),ts:Date.now()});
      saveChats(); renderChat(uid);
    }, 650);
  }
}
sendChat.onclick=send;
chatInput.addEventListener("keydown",(e)=>{ if(e.key==="Enter") send(); });

chatBtn.onclick=()=>openChat((selected&&selected.owner)?selected.owner:ai);
closeModal.onclick=()=>{ modal.style.display="none"; };
modal.addEventListener("click",(e)=>{ if(e.target===modal) modal.style.display="none"; });

/* ====== Start ====== */
renderAll();
setOwner(ai);
</script>
</body></html>`);
}
