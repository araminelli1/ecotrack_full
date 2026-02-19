import { Router } from "express";
import prisma from "../prisma/client";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.get("/", async (req, res) => {
  const recompensas = await prisma.recompensas.findMany();
  res.json(recompensas);
});

router.post("/:id/resgatar", authenticateToken, async (req, res) => {
  const usuarioId = req.userId!;
  const recompensaId = Number(req.params.id);
  try {
    const recompensa = await prisma.recompensas.findUnique({
      where: { id: recompensaId },
    });
    if (!recompensa)
      return res.status(404).json({ message: "Recompensa não encontrada" });

    // checar pontos
    const pontuacao = await prisma.pontuacaoUsuario.findUnique({
      where: { usuarioId },
    });
    if (
      !pontuacao ||
      pontuacao.pontosAcumulados < recompensa.pontosNecessarios
    ) {
      return res.status(400).json({ message: "Pontos insuficientes" });
    }

    // subtrai pontos e registra histórico
    await prisma.$transaction([
      prisma.pontuacaoUsuario.update({
        where: { usuarioId },
        data: {
          pontosAcumulados: { decrement: recompensa.pontosNecessarios } as any,
        },
      }),
      prisma.historicoRecompensa.create({
        data: { usuarioId, recompensaId },
      }),
    ]);

    res.json({ message: "Recompensa resgatada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao resgatar recompensa" });
  }
});

export default router;
