export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const token = process.env.MP_ACCESS_TOKEN;

  if (!token) {
    return res.status(500).json({ error: "Token não encontrado" });
  }

  try {
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        items: [
          {
            title: "Ice Blue Acesso",
            quantity: 1,
            unit_price: 10
          }
        ]
      })
    });

    const data = await response.json();

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar pagamento" });
  }
}
