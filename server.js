<script>

// ===== BUSCAR POSTS =====
fetch('/api/posts')
.then(res => res.json())
.then(posts => {
const feed=document.getElementById("feed");

posts.forEach(p=>{
let d=document.createElement("div");
d.className="card";
d.innerHTML=`
<div class="thumb" style="background-image:url('${p.img}')"></div>
<div class="info">${p.user}</div>
`;

d.ondblclick=()=>show(p.img); // 🔥 DUPLO CLIQUE
feed.appendChild(d);
});
});

// ===== MOSTRAR NO STAGE =====
function show(img){
stop();
placeholder.style.display="none";
cam.style.display="none";
expand.style.display="block";
expand.style.backgroundImage=`url('${img}')`;
}

// ===== BOTÕES INFERIORES FUNCIONAIS =====
document.querySelector(".fa-home").onclick=()=>{
expand.style.display="none";
cam.style.display="none";
placeholder.style.display="block";
};

document.querySelector(".fa-search").onclick=()=>{
alert("Função de busca em construção 🔎");
};

document.querySelector(".fa-plus-circle").onclick=()=>{
alert("Upload de conteúdo em breve 📤");
};

document.querySelector(".fa-video").onclick=()=>{
live(); // abre câmera
};

document.querySelector(".fa-user").onclick=()=>{
alert("Perfil do usuário 👤");
};

// ===== LIVE =====
let stream=null;
async function live(){
if(!stream){
try{
stream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
cam.srcObject=stream;
placeholder.style.display="none";
expand.style.display="none";
cam.style.display="block";
liveBtn.innerText="STOP";
}catch{
alert("Permita câmera no navegador");
}
}else stop();
}

function stop(){
if(stream){
stream.getTracks().forEach(t=>t.stop());
stream=null;
cam.style.display="none";
placeholder.style.display="block";
liveBtn.innerText="LIVE";
}
}

</script>
