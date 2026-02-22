.js

const express = require ( "express" ) , app = express ( ) ;
app.get ( "/" , ( req , res ) = > res.send ( ` < ! DOCTYPE html><html> <head>
<meta name=viewport content="width=device-width,initial-scale=1">
<style>
corpo{margem:0;fundo:#0f172a;cor:#fff;fonte:sans-serif;exibição:flex;direção-flex:coluna;altura:100vh}
.stage{height:45vh;background:#000;display:flex;align-items:center;justify-content:center;position:relative}
vídeo{posição:absoluta;largura:100%;altura:100%;ajuste-objeto:cobrir;exibir:nenhum}
.feed{flex:1;overflow:auto;display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:5px}
.card{background:#1e293b;cursor:pointer}
.card video{height:100px;display:block}
.btn{position:absolute;bottom:10px;right:10px;background:red;color:#fff;border:0;padding:5px 10px}
</style></head><body>

<div class=stage>
<div id=txt>2 toques no vídeo</div>
<video id=main controls></video>
<video id=cam autoplay playsinline></video>
<button class=btn onclick=live() id=live>AO VIVO</button>
</div>

<div class=feed id=feed></div>

<script>
let posts=["https://www.w3schools.com/html/mov_bbb.mp4",
"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"];

let feed=document.getElementById("feed"),
principal=document.getElementById("main"),
cam=document.getElementById("cam"),
txt=document.getElementById("txt"),
liveBtn=document.getElementById("live"),
fluxo=nulo;

função renderizar(){
feed.innerHTML="";
posts.forEach(v=>{
let d=document.createElement("div");
d.className="card";
d.innerHTML="<video src='"+v+"' silenciado></video>";
seja t=0;
d.onclick=()=>{t++;setTimeout(()=>t=0,300);if(t==2)open(v)};
feed.appendChild(d);
});
}
renderizar();

função abrir(v){
parar();
cam.style.display="nenhum";
txt.style.display="nenhum";
main.src=v;
main.style.display="bloco";
principal.reproduzir();
}

função assíncrona ao vivo(){
main.pause();main.style.display="nenhum";
se(!fluxo){
tentar{
stream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
cam.srcObject=stream;
cam.style.display="bloco";
txt.style.display="nenhum";
liveBtn.innerText="PARAR";
}catch{alert("Permitir câmera")}
} senão pare();
}

função parar(){
se(fluxo){
stream.getTracks().forEach(t=>t.stop())
