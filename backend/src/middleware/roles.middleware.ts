import type { RequestHandler } from "express";
import type { Rol } from "../../generated/prisma/enums.js";

// Permite restringir rutas a uno o varios roles.
export function permitirRoles(...rolesPermitidos: Rol[]): RequestHandler {
  return (req, res, next) => {
    if (!req.auth) {
      res.status(401).json({
        error: {
          codigo: "UNAUTHENTICATED",
          mensaje: "Debes iniciar sesión para acceder a este recurso.",
        },
      });
      return;
    }

    if (!rolesPermitidos.includes(req.auth.rol)) {
      res.status(403).json({
        error: {
          codigo: "FORBIDDEN",
          mensaje: "No tienes permisos para realizar esta acción.",
        },
      });
      return;
    }

    next();
  };
}
