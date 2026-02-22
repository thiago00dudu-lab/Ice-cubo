const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body{margin:0;background:#0f172a;color:#fff;font-family:sans-serif;display:flex;flex-direction:column;height:100vh}
      .stage{height:45vh;background:#000;display:flex;align-items:center;justify-content:center;position:relative}
      video{position:absolute;width:100%;height:100%;object-fit:cover;display:none}
      .feed{flex:1;overflow:auto;display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:5px}
      .card{background:#1e293b;cursor:pointer}
      .card video{height:100px;display:block}
      .btn{position:absolute;bottom:10px;right:10px;background:red;color:#fff;border:0;padding:5px 10px}
    </style>
  </head>
  <body>

  <div class="stage">
    <div id="txt">2 toques no vídeo</div>
    <video id="main" controls></video>
    <video id="cam" autoplay playsinline></video>
    <button class="btn" onclick="live()" id="live">AO VIVO</button>
  </div>

  <div class="feed" id="feed"></div>

  <script>
    let posts=[
      "https://www.w3schools.com/html/mov_bbb.mp4",
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    ];

    let feed=document.getElementById("feed"),
        main=document.getElementById("main"),
        cam=document.getElementById("cam"),
        txt=document.getElementById("txt"),
        liveBtn=document.getElementById("live"),
        stream=null;

    function render(){
      feed.innerHTML="";
      posts.forEach(v=>{
        let d=document.createElement("div");
        d.className="card";
        d.innerHTML="<video src='"+v+"' muted></video>";
        let t=0;
        d.onclick=()=>{
          t++;
          setTimeout(()=>t=0,300);
          if(t==2) openVideo(v);
        };
        feed.appendChild(d);
      });
    }
    render();

    function openVideo(v){
      stop();
      cam.style.display="none";
      txt.style.display="none";
      main.src=v;
      main.style.display="block";
      main.play();
    }

    async function live(){
      main.pause();
      main.style.display="none";
      if(!stream){
        try{
          stream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
          cam.srcObject=stream;
          cam.style.display="block";
          txt.style.display="none";
          liveBtn.innerText="PARAR";
        }catch{
          alert("Permitir câmera");
        }
      } else stop();
    }

    function stop(){
      if(stream){
        stream.getTracks().forEach(t=>t.stop());
        stream=null;
        cam.style.display="none";
        txt.style.display="block";
        liveBtn.innerText="AO VIVO";
      }
    }
  </script>

  </body>
  </html>
  `);
});

module.exports = app;
