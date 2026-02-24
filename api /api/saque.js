export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Use POST" });
  }

  const { valor, tipo, chave } = req.body || {};

  if (!valor || !tipo || !chave) {
    return res.status(400).json({ erro: "Faltou valor, tipo ou chave" });
  }

  // Aqui é SIMULADO: salva/manda para um painel ADM depois.
  // Saque real exige validação de usuário, saldo, antifraude e regras de negócio.

  return res.status(200).json({
    status: "saque_solicitado",
    valor: Number(valor),
    tipo,
    chave,
    mensagem: "Pedido recebido. Aguarde processamento."
  });
}
