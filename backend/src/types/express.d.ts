import type { Rol } from "../../generated/prisma/enums.js";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        usuarioId: number;
        negocioId: number;
        rol: Rol;
      };
    }
  }
}

export {};
