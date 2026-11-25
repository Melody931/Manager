import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";

import { prisma } from "../../config/prisma.js";
import type { LoginInput, RegistroInput } from "./schemas/auth.schema.js";

// Error controlado para que el controlador pueda responder con el estado HTTP correcto.
export class AuthServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "AuthServiceError";
  }
}

// Obtiene el secreto necesario para firmar los JWT.
// La aplicación falla explícitamente si falta esta variable, en lugar de emitir tokens inseguros.
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Falta la variable de entorno JWT_SECRET.");
  }

  return secret;
}

// Genera el token que identifica al usuario y su negocio.
// El negocioId se incluye desde los datos guardados en la base de datos, nunca desde la petición.
function createAccessToken(usuario: {
  id: number;
  negocioId: number;
  rol: "ADMIN" | "CAJERO";
}): string {
  const expiresIn = (process.env.JWT_EXPIRES_IN || "15m") as SignOptions["expiresIn"];

  return jwt.sign(
    {
      negocioId: usuario.negocioId,
      rol: usuario.rol,
    },
    getJwtSecret(),
    {
      subject: String(usuario.id),
      expiresIn,
    },
  );
}

// Registra un negocio y su primer usuario administrador.
// La transacción garantiza que no quede creado el negocio si falla la creación del usuario.
export async function registrar(datos: RegistroInput) {
  // Comprobamos la configuración JWT antes de crear registros en la base de datos.
  getJwtSecret();

  const emailExistente = await prisma.usuario.findUnique({
    where: { email: datos.email },
    select: { id: true },
  });

  if (emailExistente) {
    throw new AuthServiceError(
      "Ya existe una cuenta registrada con ese correo electrónico.",
      409,
      "EMAIL_ALREADY_EXISTS",
    );
  }

  const passwordHash = await bcrypt.hash(datos.password, 12);

  try {
    const usuario = await prisma.$transaction(async (tx) => {
      const negocio = await tx.negocio.create({
        data: {
          nombre: datos.negocioNombre,
          tipo: datos.negocioTipo,
        },
      });

      return tx.usuario.create({
        data: {
          negocioId: negocio.id,
          nombre: datos.nombre,
          email: datos.email,
          passwordHash,
          rol: "ADMIN",
        },
        select: {
          id: true,
          negocioId: true,
          nombre: true,
          email: true,
          rol: true,
        },
      });
    });

    const token = createAccessToken(usuario);

    return { usuario, token };
  } catch (error) {
    // La restricción UNIQUE de la base de datos también protege ante registros simultáneos.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new AuthServiceError(
        "Ya existe una cuenta registrada con ese correo electrónico.",
        409,
        "EMAIL_ALREADY_EXISTS",
      );
    }

    throw error;
  }
}

// Verifica las credenciales y devuelve un JWT si son correctas.
export async function iniciarSesion(datos: LoginInput) {
  const usuario = await prisma.usuario.findUnique({
    where: { email: datos.email },
  });

  if (!usuario) {
    throw new AuthServiceError(
      "Correo electrónico o contraseña incorrectos.",
      401,
      "INVALID_CREDENTIALS",
    );
  }

  const passwordValida = await bcrypt.compare(
    datos.password,
    usuario.passwordHash,
  );

  if (!passwordValida) {
    throw new AuthServiceError(
      "Correo electrónico o contraseña incorrectos.",
      401,
      "INVALID_CREDENTIALS",
    );
  }

  if (!usuario.activo) {
    throw new AuthServiceError(
      "Esta cuenta está desactivada.",
      403,
      "ACCOUNT_DISABLED",
    );
  }

  const usuarioSeguro = {
    id: usuario.id,
    negocioId: usuario.negocioId,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
  };

  const token = createAccessToken(usuarioSeguro);

  return {
    usuario: usuarioSeguro,
    token,
  };
}
