// api/index.js (ou servidor.js)
module.exports = (req, res) => {    
  res.setHeader("Content-Type", "text/html; charset=utf-8"); 
  res.status(200).send(`
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>ICE-CUBO</title>
      <style>
        body { margin:0; font-family:Arial, sans-serif; background:#0b1220; color:#fff; }
        .top { height:45vh; background:#000; display:flex; align-items:center; justify-content:center; text-align:center; padding:20px; }
        .bar { position:fixed; bottom:0; left:0; right:0; display:flex; justify-content:space-around;
             padding:12px; background:rgba(15,23,42,.9); border-top:1px solid #1f2a44; }
        .btn { padding:10px 14px; border-radius:14px; border:1px solid #1f2a44; background:#0f172a; color:#38bdf8; cursor:pointer; }
        .wrap { padding:14px 14px 90px; }
      </style>
    </head>
    <body>
      <div class="top">YOUR SITE GOES HERE<br>(we will restore the old one soon)</div>
      <div class="wrap">
        <h2>ICE-CUBO Recovery ✅</h2>
        <p>Your site was not lost. We are just restoring the main screen.</p>
      </div>
      <div class="bar">
        <button class="btn">Home</button>
        <button class="btn">Camera</button>
        <button class="btn">Danger</button>
      </div>
    </body>
    </html>
  `);
};
