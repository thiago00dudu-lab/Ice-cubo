let STORE = globalThis.__ICE_STORE__;
if (!STORE) STORE = globalThis.__ICE_STORE__ = { trocas: [], ofertas: [], chats: {} };

function json(res, code, data) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.end(JSON.stringify(data));
}

function keyOf(a, b) {
  a = String(a || "");
  b = String(b || "");
  return [a, b].sort().join("::");
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });

  if (req.method === "GET") {
    const me = req.query?.me || "";
    const other = req.query?.other || "";
    if (!me || !other) return json(res, 400, { error: "Passe ?me= e ?other=" });

    const k = keyOf(me, other);
    const msgs = STORE.chats[k] || [];
    return json(res, 200, msgs.slice(-100)); // últimas 100
  }

  if (req.method === "POST") {
    try {
      const b = req.body || {};
      if (!b.me || !b.other) return json(res, 400, { error: "Faltou me/other" });
      if (!b.text) return json(res, 400, { error: "Mensagem vazia" });

      const k = keyOf(b.me, b.other);
      if (!STORE.chats[k]) STORE.chats[k] = [];

      const msg = {
        id: "M" + Date.now() + "-" + Math.random().toString(16).slice(2),
        from: String(b.from || b.me),
        text: String(b.text),
        createdAt: Date.now(),
      };

      STORE.chats[k].push(msg);
      return json(res, 200, { ok: true, msg });
    } catch (e) {
      return json(res, 500, { error: e?.message || "Erro" });
    }
  }

  return json(res, 405, { error: "Method not allowed" });
}
