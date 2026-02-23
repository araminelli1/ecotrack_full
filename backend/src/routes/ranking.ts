import { Router } from "express";
import prisma from "../prisma/client";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.use(authenticateToken);

/* ============================
   RANKING GERAL
============================ */
router.get("/geral", async (req, res) => {
  try {
    const ranking = await prisma.pontuacaoUsuario.findMany({
      orderBy: { pontosAcumulados: "desc" },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            cursoId: true,
            campusId: true,
          },
        },
      },
    });

    res.json(ranking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar ranking geral" });
  }
});

/* ============================
   RANKING POR CURSO
============================ */
router.get("/curso/:cursoId", async (req, res) => {
  const cursoId = Number(req.params.cursoId);

  try {
    const ranking = await prisma.pontuacaoUsuario.findMany({
      where: {
        usuario: {
          cursoId,
        },
      },
      orderBy: { pontosAcumulados: "desc" },
      include: {
        usuario: true,
      },
    });

    res.json(ranking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar ranking por curso" });
  }
});

/* ============================
   RANKING POR CAMPUS
============================ */
router.get("/campus/:campusId", async (req, res) => {
  const campusId = Number(req.params.campusId);

  try {
    const ranking = await prisma.pontuacaoUsuario.findMany({
      where: {
        usuario: {
          campusId,
        },
      },
      orderBy: { pontosAcumulados: "desc" },
      include: {
        usuario: true,
      },
    });

    res.json(ranking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar ranking por campus" });
  }
});

export default router;
