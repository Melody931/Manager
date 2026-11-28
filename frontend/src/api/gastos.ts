import { apiRequest } from "./client";

export interface Gasto {
  id: number;
  categoria: string;
  monto: string;
  fecha: string;
  nota: string | null;
}
export interface GastoInput {
  categoria: string;
  monto: number;
  fecha: string;
  nota?: string | null;
}
export async function listarGastos(params: { busqueda?: string; pagina?: number; limite?: number } = {}) {
  const query = new URLSearchParams({ pagina: String(params.pagina ?? 1), limite: String(params.limite ?? 10) });
  if (params.busqueda) query.set("busqueda", params.busqueda);
  return apiRequest<{ data: { gastos: Gasto[]; paginacion: { pagina: number; limite: number; total: number; paginas: number } } }>(`/gastos?${query.toString()}`);
}
export async function crearGasto(input: GastoInput) {
  return apiRequest<{ data: Gasto }>("/gastos", { method: "POST", body: JSON.stringify(input) });
}
export async function actualizarGasto(id: number, input: Partial<GastoInput>) {
  return apiRequest<{ data: Gasto }>(`/gastos/${id}`, { method: "PUT", body: JSON.stringify(input) });
}
export async function eliminarGasto(id: number) {
  return apiRequest<{ data: { mensaje: string } }>(`/gastos/${id}`, { method: "DELETE" });
}
