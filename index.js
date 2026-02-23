module.exports = (req, res) => {
  const html = `<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>ICE - OK</title>
<style>
body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto;background:#0f172a;color:#fff}
main{max-width:900px;margin:0 auto;padding:18px}
.card{background:#111c33;border:1px solid #223258;border-radius:16px;padding:14px;margin:12px 0}
.ok{color:#22c55e;font-weight:900}
.muted{opacity:.85}
</style>
</head>
<body>
<main>
  <div class="card"><div class="ok">✅ ONLINE</div><div class="muted">/api funcionando sem crash.</div></div>
  <div class="card"><div class="muted">Agora arruma o / com vercel.json (passo abaixo).</div></div>
</main>
</body></html>`;

  try {
    const host = req.headers.host || "localhost";
    const url = new URL(req.url, `https://${host}`);
    const path = url.pathname || "/";

    if (path === "/" || path === "/api" || path === "/api/") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.end(html);
    }

    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({ ok: false, path, error: "Not found" }));
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({ ok: false, error: String(e) }));
  }
};
