import { z } from "zod";

const precioSchema = z.coerce.number().finite().positive("El precio debe ser mayor que cero.");
const costoSchema = z.number().finite().nonnegative().nullable().optional();

export const crearItemSchema = z.object({
  tipo: z.enum(["PRODUCTO", "SERVICIO"]),
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(120),
  precio: precioSchema,
  costo: costoSchema,
  controlaStock: z.boolean().default(false),
  stock: z.number().int().nonnegative().default(0),
  stockMinimo: z.number().int().nonnegative().default(0),
});

export const actualizarItemSchema = crearItemSchema.partial();

export const listarItemsQuerySchema = z.object({
  busqueda: z.string().trim().max(120).optional().default(""),
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(10),
  tipo: z.enum(["PRODUCTO", "SERVICIO"]).optional(),
});

export type CrearItemInput = z.infer<typeof crearItemSchema>;
export type ActualizarItemInput = z.infer<typeof actualizarItemSchema>;
export type ListarItemsQuery = z.infer<typeof listarItemsQuerySchema>;
