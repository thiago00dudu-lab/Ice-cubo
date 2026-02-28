// api/mp_status.js
const MP_API_URL = "https://api.mercadopago.com";

export default async function handler(req, res) {
  try {
    const token = process.env.MP_ACCESS_TOKEN;
    
    // 1. Verificações de Segurança
    if (!token) {
      return res.status(500).json({ ok: false, error: "MP_ACCESS_TOKEN not configured" });
    }

    // 2. Captura o ID do pagamento da URL (?paymentId=123)
    const { paymentId } = req.query; 
    
    if (!paymentId) {
      return res.status(400).json({ ok: false, error: "Missing ?paymentId=" });
    }

    // 3. Consulta ao Mercado Pago
    const response = await fetch(`${MP_API_URL}/${paymentId}`, {
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ ok: false, error: data });
    }

    // 4. Retorno simplificado para o App
    return res.status(200).json({
      ok: true,
      id: data.id,
      status: data.status, // 'approved', 'pending', etc.
      amount: data.transaction_amount,
      date_approved: data.date_approved
    });

  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
