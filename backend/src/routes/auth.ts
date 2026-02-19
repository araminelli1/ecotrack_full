import { Router } from "express";
import { login, register, me } from "../controllers/authController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, me);

export default router;
