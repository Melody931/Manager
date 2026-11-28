import { z } from "zod";

export const crearClienteSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(120),
  telefono: z.string().trim().max(30).optional().nullable(),
});

export const actualizarClienteSchema = crearClienteSchema.partial();

export const listarClientesQuerySchema = z.object({
  busqueda: z.string().trim().max(120).optional().default(""),
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(10),
});

export type CrearClienteInput = z.infer<typeof crearClienteSchema>;
export type ActualizarClienteInput = z.infer<typeof actualizarClienteSchema>;
export type ListarClientesQuery = z.infer<typeof listarClientesQuerySchema>;
