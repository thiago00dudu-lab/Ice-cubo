res.send(`<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ice Cubo</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>

body{
margin:0;
font-family:sans-serif;
background:#000;
color:#fff;
display:flex;
flex-direction:column;
height:100vh;
overflow:hidden;
}

/* 🌊 FUNDO OCEANO */
.ocean{
position:fixed;
inset:0;
pointer-events:none;
overflow:hidden;
z-index:0;
}

.bubble{
position:absolute;
bottom:-50px;
width:15px;
height:15px;
background:rgba(56,189,248,.4);
border-radius:50%;
animation:rise 8s infinite ease-in;
}

@keyframes rise{
0%{transform:translateY(0);opacity:0}
50%{opacity:1}
100%{transform:translateY(-110vh);opacity:0}
}

.ocean span{
position:absolute;
font-size:18px;
opacity:.4;
}

/* 🌊 STAGE */
.stage{
height:45vh;
background:#000;
position:relative;
display:flex;
align-items:center;
justify-content:center;
border-radius:0 0 25px 25px;
overflow:hidden;
z-index:1;
}

#viewer{
position:absolute;
width:100%;
height:100%;
object-fit:cover;
display:none;
cursor:grab;
}

.feed{
flex:1;
overflow:auto;
padding:10px;
display:grid;
grid-template-columns:1fr 1fr;
gap:10px;
z-index:1;
}

.card{
background:#1e293b;
border-radius:15px;
overflow:hidden;
cursor:pointer;
transition:.3s;
}

.card:hover{transform:scale(1.05)}

.thumb{
height:100px;
background-size:cover;
background-position:center;
}

.nav{
height:60px;
background:#1e293b;
display:flex;
justify-content:space-around;
align-items:center;
border-top:1px solid #334155;
z-index:1;
}

.nav i{
font-size:22px;
color:#38bdf8;
cursor:pointer;
}

</style>
</head>
<body>

<div class="ocean" id="ocean"></div>

<div class="stage">
<img id="viewer">
</div>

<div class="feed" id="feed"></div>

<div class="nav">
<i class="fas fa-home" onclick="reset()"></i>
<i class="fas fa-random" onclick="randomVideo()"></i>
</div>

<script>

/* 🌊 CRIAR FUNDO OCEANO */
const ocean=document.getElementById("ocean");

for(let i=0;i<20;i++){
let b=document.createElement("div");
b.className="bubble";
b.style.left=Math.random()*100+"vw";
b.style.animationDuration=(5+Math.random()*5)+"s";
ocean.appendChild(b);
}

let emojis=["🐚","🌴","⭐","🐠"];
for(let i=0;i<15;i++){
let s=document.createElement("span");
s.innerText=emojis[Math.floor(Math.random()*emojis.length)];
s.style.left=Math.random()*100+"vw";
s.style.top=Math.random()*100+"vh";
ocean.appendChild(s);
}

/* 🎥 POSTS */
let imagens=[
"https://images.unsplash.com/photo-1503376780353-7e6692767b70",
"https://images.unsplash.com/photo-1518770660439-4636190af475",
"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
"https://images.unsplash.com/photo-1492724441997-5dc865305da7",
"https://images.unsplash.com/photo-1522075469751-3a6694fb2f61"
];

const feed=document.getElementById("feed");
const viewer=document.getElementById("viewer");

function render(){
feed.innerHTML="";
imagens.slice(0,4).forEach((img,i)=>{
let d=document.createElement("div");
d.className="card";
d.innerHTML=\`<div class="thumb" style="background-image:url('\${img}')"></div>\`;
d.onclick=()=>abrir(i);
feed.appendChild(d);
});
}

function abrir(index){
let img=imagens[index];
viewer.src=img;
viewer.style.display="block";

/* remove da lista */
imagens.splice(index,1);

/* adiciona nova aleatória */
let nova="https://picsum.photos/400/300?random="+Math.random();
imagens.push(nova);

render();
}

function randomVideo(){
let i=Math.floor(Math.random()*imagens.length);
abrir(i);
}

/* 🪟 ARRASTAR PRA FECHAR */
let startX=0;

viewer.addEventListener("mousedown",e=>{
startX=e.clientX;
});

viewer.addEventListener("mouseup",e=>{
if(e.clientX-startX>150){
viewer.style.display="none";
}
});

function reset(){
viewer.style.display="none";
}

render();

</script>

</body></html>`);
