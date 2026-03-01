// Dentro de api/mp_create.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Note que aqui pegamos 'amount' e 'email' (nomes que estão no seu print)
    const { amount, email, cpf, description } = req.body;

    if (!email || !amount) {
      return res.status(400).json({ error: "Dados incompletos: email ou valor faltando" });
    }

    // Configuração da preferência do Mercado Pago
    const preference = {
      items: [{
        title: description || 'Depósito',
        unit_price: Number(amount),
        quantity: 1,
      }],
      payer: { email: email },
      // ... resto do código
    };
    
    // ... comando para criar a preferência
  }
}
