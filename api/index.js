const https = require("https");
const { URL } = require("url");

function enviarHTML(res, html) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(html);
}

function enviarJSON(res, codigo, obj) {
  res.statusCode = codigo;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
}

module.exports = async (req, res) => {
  try {
    const host = req.headers.host;
    const proto = req.headers["x-forwarded-proto"] || "https";
    const u = new URL(req.url, `${proto}://${host}`);
    const op = u.searchParams.get("op") || "";

    if (op === "saude") {
      return enviarJSON(res, 200, { status: "OK", online: true });
    }

    const html = `
<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ICE-CUBO</title>
  <style>
    body { margin: 0; font-family: Arial; background: #0b1220; color: #fff; }
    .top { height: 45vh; background: #000; display: flex; align-items: center; justify-content: center; }
    .bar { position: fixed; bottom: 0; left: 0; right: 0; display: flex; justify-content: space-around; padding: 12px; background: rgba(15,23,42,0.9); border-top: 1px solid #172944; }
    .btn { padding: 10px 14px; border-radius: 14px; border: 1px solid #30363d; background: #21262d; color: #fff; }
  </style>
</head>
<body>
  <div class="top">SITE EM RECUPERAÇÃO - ICE CUBO</div>
  <div class="bar">
    <button class="btn">Casa</button>
    <button class="btn">Câmera</button>
    <button class="btn">Perigo</button>
  </div>
</body>
</html>`;

    return enviarHTML(res, html);

  } catch (e) {
    return enviarJSON(res, 500, { erro: e.message });
  }
};
