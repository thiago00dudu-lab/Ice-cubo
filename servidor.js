Saída
servidor.js

export default function handler ( req , res ) {    
  res.setHeader ( "Content-Type" , "text/html ; charset=utf-8 " ) ; 
  res.status ( 200 ) .send ( ` < !doctype html><html lang="pt-br" > <head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>ICE-CUBO</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
:root{--bg:#061428;--glass:rgba(255,255,255,.08);--glass2:rgba(255,255,255,.12);--line:rgba(255,255,255,.16);--txt:#eaf2ff;--mut:#b7c7e6;--acc:#38bdf8}
*{box-sizing:border-box} body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;background:radial-gradient(1200px 600px at 20% -10%,rgba(56,189,248,.18),transparent 60%),radial-gradient(900px 600px at 110% 30%,rgba(99,102,241,.14),transparent 55%),linear-gradient(180deg,#031024,#071b33 60%,#041226);color:var(--txt);height:100vh;overflow:hidden}
um botão {color:inherit} {cursor:pointer}
#app{height:100vh;display:flex;flex-direction:column}
.top{height:52vh;position:relative;border-radius:0 0 26px 26px;overflow:hidden;background:#000}
.bgSea{position:absolute;inset:0;opacity:.35;filter:saturate(1.2);background:
gradiente-radial(círculo em 10% 20%,rgba(56,189,248,.18),transparente 35%),
gradiente-radial(círculo a 80% 10%,rgba(59,130,246,.16),transparente 35%),
gradiente-radial(círculo em 30% 80%,rgba(34,211,238,.14),transparente 35%),
gradiente-linear(180 graus,#021024,#041a35)}
.bubbles:before,.bubbles:after{content:"";position:absolute;inset:-20%;background:
gradiente-radial(círculo,rgba(255,255,255,.22) 0 2px,transparente 3px) 0 0/120px 120px,
gradiente-radial(círculo,rgba(255,255,255,.16) 0 1px,transparente 2px) 40px 20px/160px 160px;
animação:float 14s linear infinito;opacidade:.55}
.bubbles:after{animation-duration:20s;opacity:.35;transform:scale(1.15)}
@keyframes float{to{transform:translateY(-120px)}}

.marca{posição:absoluta;topo:10px;esquerda:12px;direita:12px;exibição:flex;alinhamento-itens:centro;justificação-conteúdo:espaço-entre;espaço:10px;z-index:3}
.logo{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);background:var(--glass);backdrop-filter:blur(10px);border-radius:18px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
.logo b{letter-spacing:1px}
.pill{display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--line);background:var(--glass);backdrop-filter:blur(10px);border-radius:18px}
.pill .coin{largura:26px;altura:26px;borda-raio:50%;exibição:grade;itens-localizados:centro;fundo:gradiente-radial(círculo em 30% 30%,#0ea5e9,#0b2a6a);borda:1px sólida rgba(255,215,0,.55);sombra-caixa:0 0 0 2px rgba(255,215,0,.18) inserida}
.pílula .moeda span{color:#ffd700;font-weight:900}

.viewer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:2}
#mainMedia{width:100%;height:100%;object-fit:cover;display:none}
#hint{position:absolute;inset:auto 12px 72px 12px;padding:10px 12px;border:1px solid var(--line);background:var(--glass);backdrop-filter:blur(12px);border-radius:18px;color:var(--mut);text-align:center}
