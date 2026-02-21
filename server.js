const express=require("express");
const app=express();

app.get("/",(req,res)=>{
res.send(`<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ice-Cubo Premium</title>
<style>
body{margin:0;font-family:sans-serif;background:#0f172a;color:#fff;display:flex;flex-direction:column;height:100vh}
.stage{height:45vh;background:#000;display:flex;align-items:center;justify-content:center;position:relative;border-radius:0 0 30px 30px;overflow:hidden}
video{position:absolute;width:100%;height:100%;object-fit:cover;display:none}
.feed{flex:1;overflow:auto;padding:10px;display:grid;grid-template-columns:1fr 1fr;gap:10px}
.card{background:#1e293b;border-radius:15px;overflow:hidden;cursor:pointer}
.thumb{height:100px;width:100%;object-fit:cover}
.info{padding:5px;font-size:12px;font-weight:bold;color:#38bdf8}
.livebtn{position:absolute;bottom:15px;right:15px;background:#ef4444;color:#fff;border:none;padding:8px 15px;border-radius:20px;cursor:pointer}
</style>
</head>
<body>

<div class="stage">
<div id="placeholder">Toque 2x no vídeo</div>
<video id="mainVideo" controls></video>
<video id="cam" autoplay playsinline></video>
<button class="livebtn" onclick="live()" id="liveBtn">LIVE</button>
</div>

<div class="feed" id="feed"></div>

<script>

let posts=[
{vid:"https://www.w3schools.com/html/mov_bbb.mp4"},
{vid:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"},
{vid:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/forest.mp4"},
{vid:"https://www.w3schools.com/html/movie.mp4"}
];

const feed=document.getElementById("feed");
const mainVideo=document.getElementById("mainVideo");
const cam=document.getElementById("cam");
const placeholder=document.getElementById("placeholder");
const liveBtn=document.getElementById("liveBtn");

function render(){
feed.innerHTML="";
posts.forEach(p=>{
let d=document.createElement("div");
d.className="card";
d.innerHTML='<video src="'+p.vid+'" class="thumb" muted></video>';
let toque=0;
d.onclick=()=>{
toque++;
setTimeout(()=>toque=0,300);
if(toque==2) abrir(p.vid);
};
feed.appendChild(d);
});
}
render();

function abrir(src){
pararLive();
cam.style.display="none";
placeholder.style.display="none";
mainVideo.src=src;
mainVideo.style.display="block";
mainVideo.play();
}

let stream=null;
async function live(){
mainVideo.pause();
mainVideo.style.display="none";

if(!stream){
try{
stream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
cam.srcObject=stream;
cam.style.display="block";
placeholder.style.display="none";
liveBtn.innerText="STOP";
}catch{alert("Permita câmera")}
}else pararLive();
}

function pararLive(){
if(stream){
stream.getTracks().forEach(t=>t.stop());
stream=null;
cam.style.display="none";
liveBtn.innerText="LIVE";
placeholder.style.display="block";
}
}

</script>

</body>
</html>`);
});

app.listen(process.env.PORT||3000);
