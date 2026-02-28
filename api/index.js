const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));

let usuarioLogado = null;
let ADM = true; // Mostra a estrela de verificado

function layout(conteudo){ 
return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ice-Cubo Premium</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com">
    <style>
        body{margin:0;font-family:sans-serif;background:#0f172a;color:#fff;height:100vh;display:flex;flex-direction:column}
        .center{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;text-align:center}
        input{padding:12px;margin:8px;border:none;border-radius:10px;width:80%;max-width:300px;background:#1e293b;color:#fff}
        button{padding:12px 25px;border:none;border-radius:20px;background:#38bdf8;color:#000;font-weight:bold;cursor:pointer;margin-top:10px}
        a{color:#38bdf8;text-decoration:none;font-size:14px}
        
        .stage{height:40vh;background:#000;display:flex;align-items:center;justify-content:center;position:relative;border-radius:0 0 30px 30px;overflow:hidden;flex-shrink:0}
        #cam, .expand{position:absolute;width:100%;height:100%;object-fit:cover;display:none;background-size:cover;background-position:center}
        #placeholder{color:var(--mut);font-weight:bold;display:flex;align-items:center;gap:8px}
        
        .feed{flex:1;overflow-y:auto;padding:15px;display:grid;grid-template-columns:1fr 1fr;gap:12px;background:#0f172a}
        .card{background:#1e293b;border-radius:15px;overflow:hidden;cursor:pointer;border:1px solid #334155;height:160px;display:flex;flex-direction:column}
        .thumb{flex:1;background-size:cover;background-position:center}
        .info{padding:8px;font-size:11px;font-weight:bold;color:#38bdf8;display:flex;align-items:center;gap:5px;background:#1e293b}
        
        .nav{height:65px;background:#1e293b;display:flex;justify-content:space-around;align-items:center;border-top:1px solid #334155;flex-shrink:0}
        .nav i{font-size:24px;color:#38bdf8;cursor:pointer;transition:0.2s}
        .nav i:active{transform:scale(0.8)}
        
        .livebtn{position:absolute;bottom:15px;right:15px;background:#ef4444;color:#fff;border:none;padding:8px 15px;border-radius:20px;cursor:pointer;font-size:12px;font-weight:bold;z-index:10}
        .searchBox{position:absolute;top:15px;left:50%;transform:translateX(-50%);z-index:10;width:80%;display:none}
        .searchBox input{width:100%;padding:8px;border-radius:15px;border:1px solid #38bdf8;background:rgba(15,23,42,0.8);backdrop-filter:blur(5px)}
    </style>
</head>
<body>
    ${conteudo}
</body>
</html>
`;}

// ROTA DE LOGIN
app.get('/',(req,res)=>{ 
    if(usuarioLogado) return res.redirect('/app'); 
    res.send(layout(`
        <div class="center">
            <i class="fas fa-cube" style="font-size:50px;color:#38bdf8;margin-bottom:10px"></i>
            <h1>ICE CUBO 🚀</h1>
            <p style="color:#94a3b8">Entre para continuar</p>
            <form method="POST" action="/login">
                <input name="user" placeholder="Usuário" required>
                <input name="pass" type="password" placeholder="Senha" required>
                <button type="submit">ENTRAR</button>
            </form>
            <p>Novo aqui? <a href="/cadastro">Criar conta grátis</a></p>
        </div>
    `));
});

app.post('/login',(req,res)=>{
    usuarioLogado = req.body.user;
    res.redirect('/app');
});

app.get('/cadastro',(req,res)=>{
    res.send(layout(`
        <div class="center">
            <h1>Cadastrar</h1>
            <form method="POST" action="/cadastro">
                <input name="user" placeholder="Escolha um Usuário" required>
                <input name="pass" type="password" placeholder="Crie uma Senha" required>
                <button type="submit">CRIAR CONTA</button>
            </form>
            <p><a href="/">Já tenho conta</a></p>
        </div>
    `));
});

app.post('/cadastro',(req,res)=>{
    usuarioLogado = req.body.user;
    res.redirect('/app');
});

// ROTA PRINCIPAL DO APP
app.get('/app',(req,res)=>{
    if(!usuarioLogado) return res.redirect('/');
    res.send(layout(`
        <div class="stage">
            <div id="placeholder">
                Olá, ${usuarioLogado} ${ADM ? "<i class='fas fa-star' style='color:gold'></i>" : ""}
            </div>
            <div class="expand" id="expand"></div>
            <video id="cam" autoplay playsinline></video>
            <button class="livebtn" onclick="live()" id="liveBtn">AO VIVO</button>
            <div class="searchBox" id="searchBox">
                <input type="text" placeholder="Buscar usuários..." oninput="buscar(this.value)">
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
            let posts = [
                {img:"https://images.unsplash.com", user:"@ice_master"},
                {img:"https://images.unsplash.com", user:"@tech_vibe"},
                {img:"https://images.unsplash.com", user:"@future_dev"},
                {img:"https://images.unsplash.com", user:"@react_king"}
            ];

            const feed = document.getElementById("feed");
            const expand = document.getElementById("expand");
            const placeholder = document.getElementById("placeholder");
            const cam = document.getElementById("cam");
            const liveBtn = document.getElementById("liveBtn");
            const searchBox = document.getElementById("searchBox");

            function render(lista = posts){
                feed.innerHTML = "";
                lista.forEach(p => {
                    let d = document.createElement("div");
                    d.className = "card";
                    let estrela = (p.user.includes("${usuarioLogado}") && ${ADM}) ? " <i class='fas fa-star' style='color:gold'></i>" : "";
                    d.innerHTML = \`<div class="thumb" style="background-image:url('\${p.img}')"></div><div class="info">\${p.user}\${estrela}</div>\`;
                    d.onclick = () => show(p.img);
                    feed.appendChild(d);
                });
            }
            render();

            function show(img){
                stop();
                placeholder.style.display = "none";
                cam.style.display = "none";
                expand.style.display = "block";
                expand.style.backgroundImage = \`url('\${img}')\`;
            }

            function home(){
                stop();
                expand.style.display = "none";
                cam.style.display = "none";
                placeholder.style.display = "flex";
            }

            function toggleSearch(){
                searchBox.style.display = searchBox.style.display === "none" ? "block" : "none";
            }

            function buscar(valor){
                let filtrado = posts.filter(p => p.user.toLowerCase().includes(valor.toLowerCase()));
                render(filtrado);
            }

            function novoPost(){
                posts.unshift({img:"https://picsum.photos" + Math.random(), user:"@${usuarioLogado}"});
                render();
                alert("Post criado com sucesso!");
            }

            function perfil(){
                alert("CONTA PREMIUM ⭐\\nUsuário: ${usuarioLogado}\\nStatus: Administrador Master");
            }

            let stream = null;
            async function live(){
                if(!stream){
                    try{
                        stream = await navigator.mediaDevices.getUserMedia({video:true, audio:false});
                        cam.srcObject = stream;
                        placeholder.style.display = "none";
                        expand.style.display = "none";
                        cam.style.display = "block";
                        liveBtn.innerText = "PARAR";
                        liveBtn.style.background = "#fff";
                        liveBtn.style.color = "#000";
                    } catch(e) {
                        alert("Erro: Permita o acesso à câmera.");
                    }
                } else stop();
            }

            function stop(){
                if(stream){
                    stream.getTracks().forEach(t => t.stop());
                    stream = null;
                    cam.style.display = "none";
                    placeholder.style.display = "flex";
                    liveBtn.innerText = "AO VIVO";
                    liveBtn.style.background = "#ef4444";
                    liveBtn.style.color = "#fff";
                }
            }
        </script>
    `));
});

app.listen(3000, () => console.log("Servidor Ice-Cubo ativo na porta 3000"));
