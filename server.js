const express = require("express");
const app = express();

// evita 500 em favicon
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.get("/favicon.png", (req, res) => res.status(204).end());

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`
<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Ice-Cubo</title>
</head>
<body style="margin:0;font-family:sans-serif;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh">
  <div>
    <h1 style="margin:0;font-size:38px">ICE-CUBO ❄️</h1>
    <p style="opacity:.8;margin-top:10px">Servidor OK na Vercel</p>
    <p style="opacity:.8">Teste API: <b>/api/index</b></p>
  </div>
</body>
</html>
  `);
});

// MUITO IMPORTANTE: não usar app.listen na Vercel
module.exports = app;
