
const MP_API_URL = "https://api.mercadopago.com";

export default async function handler(req, res) {
  try {
    const token = process.env.MP_ACCESS_TOKEN;

    // 1. Validações Iniciais
    if (!token) {
      return res.status(500).json({ ok: false, error: "MP_ACCESS_TOKEN is not configured" });
    }

    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method Not Allowed. Use POST" });
    }

    // 2. Processamento do Body (Vercel já costuma parsear o body automaticamente)
    const body = req.body || {};
    const email = String(body.email || "").trim();
    const amount = Number(body.amount);

    if (!email || !amount || isNaN(amount)) {
      return res.status(400).json({ ok: false, error: "Please provide { email, amount }" });
    }

    const transaction_amount = Math.round(amount * 100) / 100;

    // 3. Chamada à API do Mercado Pago usando Fetch
    const response = await fetch(MP_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `${Date.now()}-${Math.random().toString(36).substring(2)}`,
      },
      body: JSON.stringify({
        transaction_amount,
        description: "ICE-CUBO Purchase",
        payment_method_id: "pix",
        payer: {
          email: email,
          first_name: "Customer", // Requisito opcional mas recomendado
          last_name: "IceCubo"
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ ok: false, error: data });
    }

    // 4. Retorno formatado para o seu App
    const tx = data.point_of_interaction?.transaction_data || {};
    
    return res.status(200).json({
      ok: true,
      payment_id: data.id,
      status: data.status,
      amount: data.transaction_amount,
      qr_code: tx.qr_code || null,
      qr_code_base64: tx.qr_code_base64 || null,
      copy_paste: tx.qr_code || null // Facilita o "Copia e Cola" no app
    });

  } catch (error) {
    console.error("Payment Error:", error);
    return res.status(500).json({ ok: false, error: "Internal Server Error", message: error.message });
  }
}
