import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      tipoUsuario?: string;
    }
  }
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token missing" });
  try {
    const secret = process.env.JWT_SECRET || "dev_jwt_secret";
    const payload: any = jwt.verify(token, secret);

    // seu token usa "id"
    req.userId = payload.id;

    // e agora também vem "tipoUsuario"
    req.tipoUsuario = payload.tipoUsuario;

    next();
  } catch (err) {
    return res.status(403).json({ message: "Token inválido" });
  }
}
