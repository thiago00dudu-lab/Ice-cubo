export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" })
  }

  try {
    const token = process.env.MP_ACCESS_TOKEN

    if (!token) {
      return res.status(500).json({ erro: "MP_ACCESS_TOKEN não configurado" })
    }

    const { email, valor } = req.body

    if (!email || !valor) {
      return res.status(400).json({ erro: "Envie email e valor" })
    }

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        transaction_amount: Number(valor),
        description: "Compra ICE BLUE",
        payment_method_id: "pix",
        payer: {
          email: email
        }
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(400).json(data)
    }

    return res.status(200).json({
      ok: true,
      id: data.id,
      qr: data.point_of_interaction.transaction_data.qr_code,
      qr_base64: data.point_of_interaction.transaction_data.qr_code_base64
    })

  } catch (err) {
    return res.status(500).json({ erro: err.message })
  }
}
