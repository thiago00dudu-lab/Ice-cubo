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
    return json(res, 200, STORE.ofertas.slice().reverse());
  }

  if (req.method === "POST") {
    try {
      const b = req.body || {};
      if (!b.targetImg || !b.offerImg) return json(res, 400, { error: "Faltou imagem" });
      if (!b.offerText) return json(res, 400, { error: "Faltou descrição da oferta" });

      const offer = {
        id: "O" + Date.now() + "-" + Math.random().toString(16).slice(2),
        fromUserId: String(b.fromUserId || ""),
        fromUserName: String(b.fromUserName || "Usuário"),
        fromUserPic: String(b.fromUserPic || ""),
        targetText: String(b.targetText || ""),
        targetImg: String(b.targetImg || ""),
        offerText: String(b.offerText || ""),
        offerImg: String(b.offerImg || ""),
        createdAt: Date.now(),
      };

      STORE.ofertas.push(offer);
      return json(res, 200, { ok: true, offer });
    } catch (e) {
      return json(res, 500, { error: e?.message || "Erro" });
    }
  }

  return json(res, 405, { error: "Method not allowed" });
}
