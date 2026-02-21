const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));

let usuarioLogado = null;
let ADM = true; // Se true, mostra estrela dourada no nome

function layout(conteudo){ return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ice-Cubo Premium</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
body{margin:0;font-family:sans-serif;background:#0f172a;color:#fff}
.center{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh}
input{padding:10px;margin:5px;border:none;border-radius:10px;width:200px}
button{padding:10px 20px;border:none;border-radius:20px;background:#38bdf8;color:#000;font-weight:bold;cursor:pointer}
a{color:#38bdf8;text-decoration:none}
.stage{height:45vh;background:#000;display:flex;align-items:center;justify-content:center;position:relative;border-radius:0 0 30px 30px;overflow:hidden}
video,.expand{position:absolute;width:100%;height:100%;object-fit:cover;display:none}
.feed{flex:1;overflow:auto;padding:10px;display:grid;grid-template-columns:1fr 1fr;gap:10px}
.card{background:#1e293b;border-radius:15px;overflow:hidden;cursor:pointer}
.thumb{height:100px;background-size:cover;background-position:center}
.info{padding:5px;font-size:12px;font-weight:bold;color:#38bdf8}
.nav{height:60px;background:#1e293b;display:flex;justify-content:space-around;align-items:center;border-top:1px solid #334155}
.nav i{font-size:22px;color:#38bdf8;cursor:pointer}
.livebtn{position:absolute;bottom:15px;right:15px;background:#ef4444;color:#fff;border:none;padding:8px 15px;border-radius:20px;cursor:pointer}
.searchBox{position:absolute;top:10px;left:50%;transform:translateX(-50%);display:none}
.searchBox input{padding:6px;border-radius:10px;border:none}
</style>
</head>
<body>
${conteudo}
</body>
</html>
`;}

// ================= LOGIN =================
app.get('/',(req,res)=>{ 
if(usuarioLogado) return res.redirect('/app'); 
res.send(layout(`
<div class="center">
<h1>ICE CUBO 🚀</h1>
<form method="POST" action="/login">
<input name="user" placeholder="Usuário" required>
<input name="pass" type="password" placeholder="Senha" required>
<button type="submit">Entrar</button>
</form>
<p>Não tem conta? <a href="/cadastro">Cadastrar</a></p>
</div>`));
});

app.post('/login',(req,res)=>{
usuarioLogado=req.body.user;
res.redirect('/app');
});

app.get('/cadastro',(req,res)=>{
res.send(layout(`
<div class="center">
<h1>Cadastrar</h1>
<form method="POST" action="/cadastro">
<input name="user" placeholder="Usuário" required>
<input name="pass" type="password" placeholder="Senha" required>
<button type="submit">Criar Conta</button>
</form>
<p><a href="/">Voltar</a></p>
</div>`));
});

app.post('/cadastro',(req,res)=>{
usuarioLogado=req.body.user;
res.redirect('/app');
});

// ================= APP =================
app.get('/app',(req,res)=>{
if(!usuarioLogado) return res.redirect('/');
res.send(layout(`
<div class="stage">
<div id="placeholder">Bem vindo ${usuarioLogado} ${ADM?"<i class='fas fa-star' style='color:gold'></i>":""}</div>
<div class="expand" id="expand"></div>
<video id="cam" autoplay playsinline></video>
<button class="livebtn" onclick="live()" id="liveBtn">LIVE</button>
<div class="searchBox" id="searchBox">
<input type="text" placeholder="Buscar..." oninput="buscar(this.value)">
</div>
</div>

<div class="feed" id="feed"></div>

<div class="nav">
<i class="fas fa-home" onclick="home()"></i>
<i class="fas fa-search" onclick="toggleSearch()"></i>
<i class="fas fa-plus-circle" onclick="novoPost()"></i>
<i class="fas fa-video" onclick="live()"></i>
<i class="fas fa-user" onclick="perfil()"></i>
</div>

<script>
let posts=[
{img:"https://images.unsplash.com/photo-1503376780353-7e6692767b70",user:"@neo"},
{img:"https://images.unsplash.com/photo-1518770660439-4636190af475",user:"@tech"},
{img:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",user:"@future"},
{img:"https://images.unsplash.com/photo-1492724441997-5dc865305da7",user:"@cyber"}
];

const feed=document.getElementById("feed");
function render(){
feed.innerHTML="";
posts.forEach(p=>{
let d=document.createElement("div");
d.className="card";
let estrela=(p.user==="@${usuarioLogado}" && ${ADM})?" <i class='fas fa-star' style='color:gold'></i>":"";
d.innerHTML=\`<div class="thumb" style="background-image:url('\${p.img}')"></div><div class="info">\${p.user}\${estrela}</div>\`;
d.ondblclick=()=>show(p.img);
feed.appendChild(d);
});
}
render();

function show(img){stop();placeholder.style.display="none";expand.style.display="block";expand.style.backgroundImage=\`url('\${img}')\`;}
function home(){stop();expand.style.display="none";placeholder.style.display="block";}
function toggleSearch(){searchBox.style.display= searchBox.style.display==="none"?"block":"none";}
function buscar(valor){
let filtrado=posts.filter(p=>p.user.toLowerCase().includes(valor.toLowerCase()));
feed.innerHTML="";
filtrado.forEach(p=>{
let d=document.createElement("div");
d.className="card";
let estrela=(p.user==="@${usuarioLogado}" && ${ADM})?" <i class='fas fa-star' style='color:gold'></i>":"";
d.innerHTML=\`<div class="thumb" style="background-image:url('\${p.img}')"></div><div class="info">\${p.user}\${estrela}</div>\`;
d.ondblclick=()=>show(p.img);
feed.appendChild(d);
});
}
function novoPost(){posts.unshift({img:"https://images.unsplash.com/photo-1522075469751-3a6694fb2f61",user:"@${usuarioLogado}"});render();}
function perfil(){alert("Perfil de ${usuarioLogado} ${ADM?"⭐":" "}\nVocê é ADM master, acesso total ao site!");}

let stream=null;
async function live(){
if(!stream){
try{stream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});cam.srcObject=stream;placeholder.style.display="none";expand.style.display="none";cam.style.display="block";liveBtn.innerText="STOP";}
catch{alert("Permita câmera");}
}else stop();
}
function stop(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;cam.style.display="none";placeholder.style.display="block";liveBtn.innerText="LIVE";}}
</script>
`));
});

// ================= SERVER =================
app.listen(3000,()=>console.log("Ice rodando na 3000"));
