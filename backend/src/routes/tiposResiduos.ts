import { Router } from "express";
import prisma from "../prisma/client";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// se quiser, pode exigir login:
router.use(authenticateToken);

// GET /api/tipos-residuos
router.get("/", async (req, res) => {
  try {
    const tipos = await prisma.tiposResiduos.findMany();
    res.json(tipos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao listar tipos de resíduos" });
  }
});

export default router;
