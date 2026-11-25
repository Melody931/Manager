import type { RequestHandler, Response } from "express";

import { prisma } from "../../config/prisma.js";
import { loginSchema, registroSchema } from "./schemas/auth.schema.js";
import {
  AuthServiceError,
  iniciarSesion,
  registrar,
} from "./auth.service.js";

// Devuelve errores con el formato uniforme definido para la API.
function responderError(error: unknown, res: Response): void {
  if (error instanceof AuthServiceError) {
    res.status(error.statusCode).json({
      error: {
        codigo: error.code,
        mensaje: error.message,
      },
    });
    return;
  }

  // No enviamos detalles internos al cliente para evitar filtrar información sensible.
  res.status(500).json({
    error: {
      codigo: "INTERNAL_SERVER_ERROR",
      mensaje: "Ocurrió un error interno. Inténtalo de nuevo más tarde.",
    },
  });
}

// Controlador para registrar un negocio y su primer administrador.
export const registrarController: RequestHandler = async (req, res) => {
  const resultado = registroSchema.safeParse(req.body);

  if (!resultado.success) {
    res.status(400).json({
      error: {
        codigo: "VALIDATION_ERROR",
        mensaje: resultado.error.issues.map((issue) => issue.message).join(" "),
      },
    });
    return;
  }

  try {
    const resultadoRegistro = await registrar(resultado.data);

    res.status(201).json({
      data: resultadoRegistro,
    });
  } catch (error) {
    responderError(error, res);
  }
};

// Controlador para iniciar sesión con correo y contraseña.
export const iniciarSesionController: RequestHandler = async (req, res) => {
  const resultado = loginSchema.safeParse(req.body);

  if (!resultado.success) {
    res.status(400).json({
      error: {
        codigo: "VALIDATION_ERROR",
        mensaje: resultado.error.issues.map((issue) => issue.message).join(" "),
      },
    });
    return;
  }

  try {
    const resultadoLogin = await iniciarSesion(resultado.data);

    res.status(200).json({
      data: resultadoLogin,
    });
  } catch (error) {
    responderError(error, res);
  }
};

// Devuelve la sesión autenticada, incluyendo negocio, plan y configuración.
export const obtenerSesionController: RequestHandler = async (req, res) => {
  if (!req.auth) {
    res.status(401).json({
      error: {
        codigo: "UNAUTHENTICATED",
        mensaje: "Debes iniciar sesión para acceder a este recurso.",
      },
    });
    return;
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.auth.usuarioId },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        negocio: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            moneda: true,
            zonaHoraria: true,
            plan: true,
            configuracion: true,
          },
        },
      },
    });

    if (!usuario) {
      res.status(401).json({
        error: {
          codigo: "INVALID_SESSION",
          mensaje: "La sesión ya no es válida.",
        },
      });
      return;
    }

    res.status(200).json({
      data: {
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        },
        negocio: {
          id: usuario.negocio.id,
          nombre: usuario.negocio.nombre,
          tipo: usuario.negocio.tipo,
          moneda: usuario.negocio.moneda,
          zonaHoraria: usuario.negocio.zonaHoraria,
          configuracion: usuario.negocio.configuracion,
        },
        plan: usuario.negocio.plan,
      },
    });
  } catch (error) {
    responderError(error, res);
  }
};
