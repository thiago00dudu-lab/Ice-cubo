const MP_API_URL = "https://api.mercadopago.com/v1/payments";

export default async function handler(req, res) {
  try {
    const token = process.env.MP_ACCESS_TOKEN;

    if (!token) {
      return res.status(500).json({
        ok: false,
        error: "MP_ACCESS_TOKEN not configured"
      });
    }

    const { paymentId } = req.query;

    if (!paymentId) {
      return res.status(400).json({
        ok: false,
        error: "Missing paymentId"
      });
    }

    const response = await fetch(`${MP_API_URL}/${paymentId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: data
      });
    }

    return res.status(200).json({
      ok: true,
      id: data.id,
      status: data.status,
      amount: data.transaction_amount,
      approvedAt: data.date_approved
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}
