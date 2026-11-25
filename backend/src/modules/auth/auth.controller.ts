import type { RequestHandler, Response } from "express";

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
