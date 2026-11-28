import { z } from "zod";

const gastoBase = z.object({
  categoria: z.string().trim().min(2, "La categoría debe tener al menos 2 caracteres.").max(80),
  monto: z.coerce.number().finite().positive("El monto debe ser mayor que cero.").max(9999999999.99, "El monto supera el máximo permitido.").refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 0.000001, "El monto admite como máximo dos decimales."),
  fecha: z.coerce.date(),
  nota: z.string().trim().max(500).optional().nullable(),
});

export const crearGastoSchema = gastoBase;
export const actualizarGastoSchema = gastoBase.partial();
export const listarGastosQuerySchema = z.object({
  busqueda: z.string().trim().max(120).optional().default(""),
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(10),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
}).refine((value) => !value.desde || !value.hasta || value.desde <= value.hasta, {
  message: "La fecha inicial no puede ser posterior a la fecha final.",
});

export type CrearGastoInput = z.infer<typeof crearGastoSchema>;
export type ActualizarGastoInput = z.infer<typeof actualizarGastoSchema>;
export type ListarGastosQuery = z.infer<typeof listarGastosQuerySchema>;
