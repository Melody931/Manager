import { apiRequest } from "./client";

export interface VentaDetalle {
  id: number;
  itemId: number;
  cantidad: number;
  precioUnitario: string;
  costoUnitario: string | null;
  item: { id: number; nombre: string; tipo: "PRODUCTO" | "SERVICIO" };
}
export interface Venta {
  id: number;
  fecha: string;
  total: string;
  metodoPago: string;
  cliente: { id: number; nombre: string; telefono?: string | null } | null;
  usuario?: { id: number; nombre: string };
  detalles: VentaDetalle[];
}
export interface CrearVentaInput {
  clienteId?: number | null;
  metodoPago: string;
  detalles: { itemId: number; cantidad: number }[];
}
export async function crearVenta(input: CrearVentaInput) {
  return apiRequest<{ data: Venta }>("/ventas", { method: "POST", body: JSON.stringify(input) });
}
export async function listarVentas(params: { pagina?: number; limite?: number } = {}) {
  const query = new URLSearchParams({ pagina: String(params.pagina ?? 1), limite: String(params.limite ?? 10) });
  return apiRequest<{ data: { ventas: Venta[]; paginacion: { pagina: number; limite: number; total: number; paginas: number } } }>(`/ventas?${query.toString()}`);
}
export async function obtenerVenta(id: number) {
  return apiRequest<{ data: Venta }>(`/ventas/${id}`);
}
