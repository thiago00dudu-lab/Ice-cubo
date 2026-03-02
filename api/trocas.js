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

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });

  if (req.method === "GET") {
    // mais novo primeiro
    return json(res, 200, STORE.trocas.slice().reverse());
  }

  if (req.method === "POST") {
    try {
      const b = req.body || {};
      if (!b.img) return json(res, 400, { error: "Faltou img" });

      const item = {
        id: "T" + Date.now() + "-" + Math.random().toString(16).slice(2),
        userId: String(b.userId || ""),
        userName: String(b.userName || "Usuário"),
        userPic: String(b.userPic || ""),
        text: String(b.text || "Troca disponível!"),
        img: String(b.img || ""),
        createdAt: Date.now(),
      };

      STORE.trocas.push(item);
      return json(res, 200, { ok: true, item });
    } catch (e) {
      return json(res, 500, { error: e?.message || "Erro" });
    }
  }

  return json(res, 405, { error: "Method not allowed" });
}
