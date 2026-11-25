import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { prisma } from "../config/prisma.js";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Falta la variable de entorno JWT_SECRET.");
  }

  return secret;
}

// Verifica el JWT y confirma que el usuario siga activo en la base de datos.
export const autenticar: RequestHandler = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      error: {
        codigo: "TOKEN_REQUIRED",
        mensaje: "Debes iniciar sesión para acceder a este recurso.",
      },
    });
    return;
  }

  const token = authorization.slice("Bearer ".length);

  try {
    const decoded = jwt.verify(token, getJwtSecret());

    if (
      typeof decoded === "string" ||
      typeof decoded.sub !== "string" ||
      typeof decoded.negocioId !== "number"
    ) {
      res.status(401).json({
        error: {
          codigo: "INVALID_TOKEN",
          mensaje: "El token no es válido.",
        },
      });
      return;
    }

    const usuarioId = Number(decoded.sub);

    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
      res.status(401).json({
        error: {
          codigo: "INVALID_TOKEN",
          mensaje: "El token no es válido.",
        },
      });
      return;
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        negocioId: true,
        rol: true,
        activo: true,
      },
    });

    if (
      !usuario ||
      !usuario.activo ||
      usuario.negocioId !== decoded.negocioId
    ) {
      res.status(401).json({
        error: {
          codigo: "INVALID_SESSION",
          mensaje: "La sesión no es válida o la cuenta está desactivada.",
        },
      });
      return;
    }

    // El negocio y el rol confiables se toman de la base de datos, no del cuerpo HTTP.
    req.auth = {
      usuarioId: usuario.id,
      negocioId: usuario.negocioId,
      rol: usuario.rol,
    };

    next();
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      res.status(401).json({
        error: {
          codigo: "INVALID_TOKEN",
          mensaje: "El token no es válido o ha expirado.",
        },
      });
      return;
    }

    next(error);
  }
};
