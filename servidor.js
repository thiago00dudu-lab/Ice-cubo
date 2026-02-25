

módulo . exports = ( req , res ) => {    
  res.setHeader ( "Content-Type" , "text/html ; charset=utf-8 " ) ; 
  res.status ( 200 ) .send ( `
    <!doctype html>
    <html lang="pt-br">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>ICE-CUBO</title>
      <style>
        corpo{margem:0;fonte:Arial;fundo:#0b1220;cor:#fff}
        .top{height:45vh;background:#000;display:flex;align-items:center;justify-content:center}
        .bar{position:fixed;bottom:0;left:0;right:0;display:flex;justify-content:space-around;
             padding:12px;background:rgba(15,23,42,.9);border-top:1px solid #1f2a44}
        .btn{padding:10px 14px;border-radius:14px;border:1px solid #1f2a44;background:#0f172a;color:#38bdf8}
        .wrap{padding:14px 14px 90px}
      </style>
    </head>
    <body>
      <div class="top">SEU SITE VAI AQUI (vamos colocar o antigo já já)</div>
      <div class="wrap">
        <h2>Recuperação do ICE-CUBO ✅</h2>
        <p>Seu site não foi perdido. Só estamos recolocando a tela principal.</p>
      </div>
      <div class="bar">
        <button class="btn">Casa</button>
        <button class="btn">Câmera</button>
        <button class="btn">Perigo</button>
      </div>
    </body>
    </html>
  ` ) ;
} ;
