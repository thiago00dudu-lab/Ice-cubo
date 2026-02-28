export default async function handler(req, res) {
  try {
    // Mercado Pago precisa receber 200 rápido
    // Aqui você só registra o evento (em banco). Como você não tem banco, vamos só confirmar.
    return res.status(200).send("ok");
  } catch (e) {
    return res.status(200).send("ok"); // não travar webhook
  }
}
