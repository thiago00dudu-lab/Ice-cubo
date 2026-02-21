const express = require('express');
const app = express();

app.get('/', (req, res) => {
res.send(`<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ice-Cubo Premium</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
body{margin:0;font-family:sans-serif;background:#0f172a;color:#fff;display:flex;flex-direction:column;height:100vh}
.stage{height:45vh;background:#000;display:flex;align-items:center;justify-content:center;position:relative;border-radius:0 0 25px 25px;overflow:hidden}
#expand,#cam{position:absolute;width:100%;height:100%;object-fit:cover;display:none}
.feed{flex:1;overflow:auto;padding:10px;display:grid;grid-template-columns:1fr 1fr;gap:10px}
.card{background:#1e293b;border-radius:15px;overflow:hidden;cursor:pointer}
.thumb{height:100px;background-size:cover;background-position:center}
.info{padding:5px;font-size:12px;color:#38bdf8;font-weight:bold}
.nav{height:60px;background:#1e293b;display:flex;justify-content:space-around;align-items:center}
.nav i{font-size:22px;color:#38bdf8;cursor:pointer}
button{position:absolute;bottom:15px;right:15px;background:#ef4444;color:#fff;border:none;padding:7px 15px;border-radius:20px}
input{padding:6px;border-radius:10px;border:none}
</style>
</head>
<body>

<div class="stage">
<div id="placeholder">ICE Premium 🚀</div>
<div id="expand"></div>
<video id="cam" autoplay playsinline></video>
<button onclick="live()" id="liveBtn">LIVE</button>
</div>

<div class="feed" id="feed"></div>

<div class="nav">
<i class="fas fa-home" onclick="home()"></i>
<i class="fas fa-search" onclick="buscarPrompt()"></i>
<i class="fas fa-plus-circle" onclick="novoPost()"></i>
<i class="fas fa-video" onclick="live()"></i>
<i class="fas fa-user" onclick="perfil()"></i>
</div>

<script>

var posts=[
{img:"https://images.unsplash.com/photo-1503376780353-7e6692767b70",user:"@neo"},
{img:"https://images.unsplash.com/photo-1518770660439-4636190af475",user:"@tech"},
{img:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",user:"@future"},
{img:"https://images.unsplash.com/photo-1492724441997-5dc865305da7",user:"@cyber"}
];

var feed=document.getElementById("feed");
var expand=document.getElementById("expand");
var placeholder=document.getElementById("placeholder");
var cam=document.getElementById("cam");
var liveBtn=document.getElementById("liveBtn");
var stream=null;

function render(lista){
feed.innerHTML="";
var l=lista||posts;
for(var i=0;i<l.length;i++){
var p=l[i];
var d=document.createElement("div");
d.className="card";
d.innerHTML="<div class='thumb' style='background-image:url("+p.img+")'></div><div class='info'>"+p.user+"</div>";
d.onclick=(function(img){return function(){mostrar(img);}})(p.img);
feed.appendChild(d);
}
}
render();

function mostrar(img){
stop();
placeholder.style.display="none";
expand.style.display="block";
expand.style.backgroundImage="url("+img+")";
}

function home(){
stop();
expand.style.display="none";
placeholder.style.display="block";
render();
}

function buscarPrompt(){
var termo=prompt("Buscar usuário:");
if(!termo)return;
var filtrado=[];
for(var i=0;i<posts.length;i++){
if(posts[i].user.toLowerCase().indexOf(termo.toLowerCase())>-1){
filtrado.push(posts[i]);
}
}
render(filtrado);
}

function novoPost(){
var input=document.createElement("input");
input.type="file";
input.accept="image/*";
input.onchange=function(e){
var file=e.target.files[0];
if(!file)return;
var reader=new FileReader();
reader.onload=function(ev){
posts.unshift({img:ev.target.result,user:"@voce"});
render();
};
reader.readAsDataURL(file);
};
input.click();
}

function perfil(){
stop();
expand.style.display="block";
placeholder.style.display="none";
expand.innerHTML="<div style='padding:20px;text-align:center'><h2>Seu Perfil 👑</h2><p>Total de posts: "+posts.length+"</p></div>";
}

async function live(){
if(!stream){
try{
stream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
cam.srcObject=stream;
cam.style.display="block";
expand.style.display="none";
placeholder.style.display="none";
liveBtn.innerText="STOP";
}catch{
alert("Permita câmera");
}
}else stop();
}

function stop(){
if(stream){
stream.getTracks().forEach(function(t){t.stop();});
stream=null;
cam.style.display="none";
placeholder.style.display="block";
liveBtn.innerText="LIVE";
}
}

</script>

</body></html>`);
});

app.listen(3000,()=>console.log("ICE rodando na porta 3000"));
