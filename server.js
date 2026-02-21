const express=require("express");
const app=express();
const http=require("http").createServer(app);
const io=require("socket.io")(http);
app.use(express.urlencoded({extended:true}));

// ================= DADOS =================
let usuarios={},usuarioLogado=null,ADM=true;
let dangerUsers={};

// ================= LAYOUT =================
function layout(c){
return `<!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ice-Cubo Ultra Futurista</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
body{margin:0;font-family:sans-serif;background:#0f172a;color:#fff;overflow:hidden}
.center{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh}
input{padding:8px;margin:5px;border:none;border-radius:10px;width:200px;background:#1e293b;color:#fff}
button{padding:10px 18px;border:none;border-radius:20px;background:#38bdf8;color:#000;font-weight:bold;cursor:pointer;transition:.3s}
button:hover{transform:scale(1.05)}
a{color:#38bdf8;text-decoration:none}
.topbar{height:50px;background:#111827;display:flex;align-items:center;padding:0 15px;position:fixed;top:0;width:100%;z-index:10;box-shadow:0 0 10px #38bdf8}
.topbar h2{margin:0;font-size:16px;display:flex;align-items:center;color:#38bdf8}
.topbar i{margin-left:8px;color:gold;animation:pulse 1s infinite}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}
.stage{margin-top:50px;height:35vh;background:#000;display:flex;align-items:center;justify-content:center;position:relative;border-radius:0 0 30px 30px;overflow:hidden;box-shadow:0 0 15px #38bdf8}
canvas{position:absolute;top:0;left:0;width:100%;height:100%;z-index:0}
video,.expand{position:absolute;width:100%;height:100%;object-fit:cover;display:none;border-radius:0 0 30px 30px}
.feed{flex:1;overflow:auto;padding:10px;display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:15px;position:relative;z-index:1}
.card{background:#1e293b;border-radius:15px;overflow:hidden;cursor:pointer;transition:.3s;position:relative}
.card:hover{transform:scale(1.03);box-shadow:0 0 10px #38bdf8}
.card.adm{border:2px solid gold;box-shadow:0 0 10px gold;}
.thumb{height:100px;background-size:cover;background-position:center}
.info{padding:5px;font-size:12px;font-weight:bold;color:#38bdf8;display:flex;align-items:center}
.nav{height:50px;background:#111827;display:flex;justify-content:space-around;align-items:center;border-top:1px solid #334155;position:fixed;bottom:0;width:100%;z-index:10}
.nav i{font-size:22px;color:#38bdf8;cursor:pointer;transition:.3s}
.nav i:hover{color:#0ea5e9;transform:scale(1.2)}
.livebtn{position:absolute;bottom:15px;right:15px;background:#ef4444;color:#fff;border:none;padding:8px 15px;border-radius:25px;cursor:pointer;box-shadow:0 0 10px #ef4444;font-weight:bold;transition:.3s}
.livebtn:hover{transform:scale(1.1);box-shadow:0 0 15px #f87171}
.danger{color:red;font-weight:bold}
</style>
</head><body>${c}
<script src="/socket.io/socket.io.js"></script>
<script>
const socket=io();
let posts=[
{img:"https://images.unsplash.com/photo-1503376780353-7e6692767b70",user:"@neo"},
{img:"https://images.unsplash.com/photo-1518770660439-4636190af475",user:"@tech"},
{img:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",user:"@future"},
{img:"https://images.unsplash.com/photo-1492724441997-5dc865305da7",user:"@cyber"}
];
const feed=document.getElementById("feed"),placeholder=document.getElementById("placeholder"),expand=document.getElementById("expand"),cam=document.getElementById("cam"),liveBtn=document.getElementById("liveBtn"),searchBox=document.getElementById("searchBox");
let stream=null,historico=[];

// ================= FUNÇÕES FEED =================
function render(){feed.innerHTML="";posts.forEach(p=>{let d=document.createElement("div");d.className="card";if(p.user==="@${usuarioLogado}"&&${ADM})d.classList.add("adm");let estrela=(p.user==="@${usuarioLogado}"&&${ADM})?" <i class='fas fa-star'></i>":"";let filhos=${JSON.stringify(usuarios[usuarioLogado]?.filhos||0)};d.innerHTML=\`<div class="thumb" style="background-image:url('\${p.img}')"></div><div class="info">\${p.user}\${estrela} \${filhos}</div>\`;d.ondblclick=()=>showVideo(p);feed.appendChild(d);});}
render();

function showVideo(p){stop();placeholder.style.display="none";expand.style.display="block";expand.style.backgroundImage=\`url('\${p.img}')\`;expand.ondblclick=()=>nextVideo();}
function nextVideo(){let naoVistos=posts.filter(p=>!historico.includes(p.img));if(naoVistos.length==0){historico=[];naoVistos=posts;}let prox=naoVistos[Math.floor(Math.random()*naoVistos.length)];historico.push(prox.img);showVideo(prox);}
function swipeLeft(){nextVideo();}
function home(){stop();expand.style.display="none";placeholder.style.display="block";}
function toggleSearch(){searchBox.style.display=searchBox.style.display==="none"?"block":"none";}
function buscar(valor){let f=posts.filter(p=>p.user.toLowerCase().includes(valor.toLowerCase()));feed.innerHTML="";f.forEach(p=>{let d=document.createElement("div");d.className="card";if(p.user==="@${usuarioLogado}"&&${ADM})d.classList.add("adm");let estrela=(p.user==="@${usuarioLogado}"&&${ADM})?" <i class='fas fa-star'></i>":"";let filhos=${JSON.stringify(usuarios[usuarioLogado]?.filhos||0)};d.innerHTML=\`<div class="thumb" style="background-image:url('\${p.img}')"></div><div class="info">\${p.user}\${estrela} \${filhos}</div>\`;d.ondblclick=()=>showVideo(p);feed.appendChild(d);});}
function novoPost(){posts.unshift({img:"https://images.unsplash.com/photo-1522075469751-3a6694fb2f61",user:"@${usuarioLogado}"});render();}
function perfil(){alert("Perfil de ${usuarioLogado} ${ADM?"⭐":""}\\nFilhos indicados: "+(usuarios["${usuarioLogado}"].filhos||0));}

// ================= LIVE =================
async function live(){if(!stream){try{stream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});cam.srcObject=stream;placeholder.style.display="none";expand.style.display="none";cam.style.display="block";liveBtn.innerText="STOP";}catch{alert("Permita câmera");}}else stop();}
function stop(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;cam.style.display="none";placeholder.style.display="block";liveBtn.innerText="LIVE";}}

// ================= FUNDO ANIMADO =================
let canvas=document.createElement("canvas"),ctx;document.body.appendChild(canvas);canvas.width=window.innerWidth;canvas.height=window.innerHeight;ctx=canvas.getContext("2d");
let objs=[];for(let i=0;i<50;i++)objs.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:Math.random()*5+2,s:Math.random()*0.5+0.5});
function anim(){ctx.clearRect(0,0,canvas.width,canvas.height);for(let o of objs){ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,2*Math.PI);ctx.fillStyle="rgba(173,216,230,0.6)";ctx.fill();o.y-=o.s;if(o.y<-10)o.y=canvas.height}requestAnimationFrame(anim);}anim();
window.addEventListener("resize",()=>{canvas.width=window.innerWidth;canvas.height=window.innerHeight;});

// ================= BOTÃO PERIGO =================
let danger=false;
function ativarDanger(){if(!danger){danger=true;document.body.style.border="5px solid red";if(navigator.geolocation){navigator.geolocation.getCurrentPosition(p=>{socket.emit("danger-activated",{user:"${usuarioLogado}",lat:p.coords.latitude,lng:p.coords.longitude});});}}else{danger=false;document.body.style.border="none";socket.emit("danger-deactivated",{user:"${usuarioLogado}"});}}
socket.on("danger-update",data=>{console.log("Usuários em perigo:",data);});
document.addEventListener("keydown",e=>{if(e.key==="ArrowLeft")swipeLeft();});
</script></body></html>`;
}

// ================= LOGIN/CADASTRO =================
app.get('/',(req,res)=>{if(usuarioLogado)return res.redirect('/app');res.send(layout(`<div class="center"><h1>ICE CUBO 🚀</h1><form method="POST" action="/login"><input name="user" placeholder="Usuário" required><input name="pass" type="password" placeholder="Senha" required><input name="ref" placeholder="ID de referência (opcional)"><button type="submit">Entrar</button></form><p>Não tem conta? <a href="/cadastro">Cadastrar</a></p></div>`));});
app.post('/login',(req,res)=>{usuarioLogado=req.body.user;usuarios[usuarioLogado]={pass:req.body.pass,filhos:usuarios[usuarioLogado]?.filhos||0};if(req.body.ref && usuarios[req.body.ref]) usuarios[req.body.ref].filhos++; res.redirect('/app');});
app.get('/cadastro',(req,res)=>{res.send(layout(`<div class="center"><h1>Cadastrar</h1><form method="POST" action="/cadastro"><input name="user" placeholder="Usuário" required><input name="pass" type="password" placeholder="Senha" required><input name="ref" placeholder="ID de referência (opcional)"><button type="submit">Criar Conta</button></form><p><a href="/">Voltar</a></p></div>`));});
app.post('/cadastro',(req,res)=>{usuarioLogado=req.body.user;usuarios[usuarioLogado]={pass:req.body.pass,filhos:0};if(req.body.ref && usuarios[req.body.ref]) usuarios[req.body.ref].filhos++; res.redirect('/app');});

// ================= APP =================
app.get('/app',(req,res)=>{if(!usuarioLogado)return res.redirect('/');res.send(layout(`<div class="topbar"><h2>${usuarioLogado} ${ADM?"<i class='fas fa-star'></i>":""} ${usuarios[usuarioLogado].filhos||0}</h2></div><div class="stage"><div id="placeholder">Bem vindo ${usuarioLogado} ${ADM?"<i class='fas fa-star'></i>":""}</div><div class="expand" id="expand"></div><video id="cam" autoplay playsinline></video><button class="livebtn" onclick="live()" id="liveBtn">LIVE</button><div class="searchBox" id="searchBox"><input type="text" placeholder="Buscar..." oninput="buscar(this.value)"></div></div><div class="feed" id="feed"></div><div class="nav"><i class="fas fa-home" onclick="home()"></i><i class="fas fa-search" onclick="toggleSearch()"></i><i class="fas fa-plus-circle" onclick="novoPost()"></i><i class="fas fa-video" onclick="live()"></i><i class="fas fa-user" onclick="perfil()"></i><i class="fas fa-exclamation-triangle" onclick="ativarDanger()" style="color:red"></i></div>`));});

// ================= SOCKET.IO =================
io.on("connection",socket=>{
  socket.on("danger-activated",data=>{dangerUsers[data.user]=data;io.emit("danger-update",dangerUsers);});
  socket.on("danger-deactivated",data=>{delete dangerUsers[data.user];io.emit("danger-update",dangerUsers);});
});

// ================= SERVER =================
http.listen(3000,()=>console.log("Ice Ultra Futurista rodando na 3000"));
