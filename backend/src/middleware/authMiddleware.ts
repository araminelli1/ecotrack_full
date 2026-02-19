import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client";

export const verifyToken = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token ausente" });

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    const user = await prisma.usuarios.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nome: true,
        email: true,
        tipoUsuario: true,
        criadoEm: true,
      },
    });

    if (!user) return res.status(401).json({ error: "Usuário inválido" });

    req.usuario = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};
