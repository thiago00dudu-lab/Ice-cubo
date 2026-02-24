export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ erro: "Use POST" });
    }

    const { valor, chavePix, nome } = req.body || {};

    if (!valor || !chavePix || !nome) {
      return res.status(400).json({ erro: "Faltam dados" });
    }

    // Aqui você pode depois integrar banco de dados
    // Por enquanto só confirma o pedido

    return res.status(200).json({
      status: "Solicitação de saque registrada",
      valor: Number(valor),
      chavePix,
      nome
    });

  } catch (error) {
    return res.status(500).json({
      erro: "Erro ao solicitar saque"
    });
  }
}
