import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  iniciarSesionController,
  registrarController,
  obtenerSesionController,
} from "./auth.controller.js";
import { autenticar } from "../../middleware/auth.middleware.js";

const router = Router();

// Limita intentos de acceso para reducir ataques de fuerza bruta.
const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: {
      codigo: "TOO_MANY_REQUESTS",
      mensaje: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
    },
  },
});

router.post("/registro", registrarController);
router.post("/login", limiteLogin, iniciarSesionController);
router.get("/me", autenticar, obtenerSesionController);

export default router;
