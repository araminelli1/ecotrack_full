import { Request, Response, NextFunction } from "express";
import prisma from "../prisma/client";

export async function requireFuncionario(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: "Não autenticado" });
  }

  const user = await prisma.usuarios.findUnique({
    where: { id: userId },
  });

  if (!user || user.tipoUsuario !== "funcionario") {
    return res.status(403).json({
      message: "Acesso permitido apenas para funcionários",
    });
  }

  next();
}
