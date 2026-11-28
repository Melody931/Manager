import { z } from "zod";

export const crearVentaSchema = z.object({
  clienteId: z.number().int().positive().nullable().optional(),
  metodoPago: z.string().trim().min(2).max(40),
  detalles: z.array(z.object({
    itemId: z.number().int().positive(),
    cantidad: z.number().int().positive().max(10000),
  })).min(1).max(100),
}).superRefine((value, ctx) => {
  const ids = value.detalles.map((detalle) => detalle.itemId);
  if (new Set(ids).size !== ids.length) {
    ctx.addIssue({ code: "custom", message: "No repitas artículos en la venta; ajusta su cantidad en una sola línea.", path: ["detalles"] });
  }
});

export const listarVentasQuerySchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(10),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
}).refine((value) => !value.desde || !value.hasta || value.desde <= value.hasta, {
  message: "La fecha inicial no puede ser posterior a la fecha final.",
});

export type CrearVentaInput = z.infer<typeof crearVentaSchema>;
export type ListarVentasQuery = z.infer<typeof listarVentasQuerySchema>;
