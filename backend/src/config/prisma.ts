
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";

// Comprobamos que exista la conexión a PostgreSQL.
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Falta la variable de entorno DATABASE_URL.");
}

// Creamos el adaptador que conecta Prisma con PostgreSQL.
const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

// Creamos una instancia compartida de Prisma Client.
export const prisma = new PrismaClient({
  adapter,
});
