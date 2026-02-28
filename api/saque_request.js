export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Use POST" });

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { userId, amount, pixKey } = body || {};

  if (!userId || !pixKey || !amount) {
    return res.status(400).json({ ok: false, error: "Campos: userId, amount, pixKey" });
  }

  // Aqui o certo é salvar num banco e você pagar manualmente depois.
  return res.status(200).json({
    ok: true,
    message: "Pedido de saque registrado (pagar manualmente).",
    request: { userId, amount: Number(amount), pixKey }
  });
}
