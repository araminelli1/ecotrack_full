import { Router } from "express";
import prisma from "../prisma/client";

const router = Router();

router.get("/", async (req, res) => {
  const top = await prisma.pontuacaoUsuario.findMany({
    orderBy: { pontosAcumulados: "desc" },
    take: 20,
    include: { usuario: true },
  });
  res.json(top);
});

export default router;
