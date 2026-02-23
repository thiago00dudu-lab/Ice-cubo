module.exports = (req, res) => {
  try {
    const url = new URL(req.url, `https://${req.headers.host || "localhost"}`);
    const path = url.pathname || "/";

    // Se for /api ou /api/
    if (path === "/api" || path === "/api/") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.end(`<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Ice-cubo</title>
<style>
body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto;background:#0f172a;color:#fff}
header{padding:16px;border-bottom:1px solid #223258}
main{max-width:900px;margin:0 auto;padding:16px}
.card{background:#111c33;border:1px solid #223258;border-radius:16px;padding:14px;margin:12px 0}
.ok{color:#22c55e;font-weight:800}
.muted{opacity:.8}
a{color:#38bdf8}
</style>
</head>
<body>
<header>
  <div style="max-width:900px;margin:0 auto;">
    <div style="font-weight:900;font-size:20px">Ice-cubo</div>
    <div class="muted">Servidor no ar (sem crash)</div>
  </div>
</header>
<main>
  <div class="card">
    <div class="ok">✅ OK</div>
    <div class="muted">Se você está vendo isso, a função /api está funcionando.</div>
  </div>

  <div class="card">
    <div style="font-weight:800;margin-bottom:6px">Rotas:</div>
    <div class="muted">/  → redireciona pra /api</div>
    <div class="muted">/api → esta página</div>
  </div>
</main>
</body>
</html>`);
    }

    // Raiz do site: manda para /api
    if (path === "/" || path === "") {
      res.statusCode = 302;
      res.setHeader("Location", "/api");
      return res.end();
    }

    // Qualquer outra rota
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({ ok: false, error: "Not found", path }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({ ok: false, error: String(err && err.message ? err.message : err) }));
  }
};
