const https = require("https");
const { URL } = require("url");

function sendHTML(res, html) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(html);
}

function sendJSON(res, code, obj) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
}

module.exports = async (req, res) => {
  try {
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host;
    const u = new URL(req.url, `${proto}://${host}`);
    const op = u.searchParams.get("op") || "";

    // Rota de Teste (Health Check)
    if (op === "health") return sendJSON(res, 200, { ok: true, msg: "API ICE-CUBO online" });

    // HTML Principal (O seu site)
    const html = `
    <!doctype html>
    <html lang="pt-br">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>ICE-CUBO</title>
      <style>
        body{margin:0;font-family:Arial;background:#0b1220;color:#fff}
        .top{height:45vh;background:#000;display:flex;align-items:center;justify-content:center}
        .bar{position:fixed;bottom:0;left:0;right:0;display:flex;justify-content:space-around;padding:12px;background:rgba(15,23,42,.9);border-top:1px solid #1f2a44}
        .btn{padding:10px 14px;border-radius:14px;border:1px solid #1f2a44;background:#0f172a;color:#38bdf8}
        .wrap{padding:14px 14px 90px}
      </style>
    </head>
    <body>
      <div class="top">SITE EM RECUPERAÇÃO ✅</div>
      <div class="wrap">
        <h2>Recuperação do ICE-CUBO</h2>
        <p>Seu site foi restaurado com sucesso.</p>
      </div>
      <div class="bar">
        <button class="btn">Casa</button>
        <button class="btn">Câmera</button>
        <button class="btn">Perigo</button>
      </div>
    </body>
    </html>`;

    return sendHTML(res, html);
  } catch (e) {
    return sendJSON(res, 500, { ok: false, error: e.message });
  }
};
