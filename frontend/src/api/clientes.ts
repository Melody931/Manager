import { apiRequest } from "./client";

export interface Cliente {
  id: number;
  nombre: string;
  telefono: string | null;
  creadoEn: string;
}

export interface ClienteInput {
  nombre: string;
  telefono?: string | null;
}

export interface ClientesResponse {
  data: {
    clientes: Cliente[];
    paginacion: { pagina: number; limite: number; total: number; paginas: number };
  };
}

export async function listarClientes(params: { busqueda?: string; pagina?: number; limite?: number }) {
  const query = new URLSearchParams();
  if (params.busqueda) query.set("busqueda", params.busqueda);
  query.set("pagina", String(params.pagina ?? 1));
  query.set("limite", String(params.limite ?? 10));
  return apiRequest<ClientesResponse>(`/clientes?${query.toString()}`);
}

export async function crearCliente(input: ClienteInput) {
  return apiRequest<{ data: Cliente }>("/clientes", { method: "POST", body: JSON.stringify(input) });
}

export async function actualizarCliente(id: number, input: Partial<ClienteInput>) {
  return apiRequest<{ data: Cliente }>(`/clientes/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export async function eliminarCliente(id: number) {
  return apiRequest<{ data: { mensaje: string } }>(`/clientes/${id}`, { method: "DELETE" });
}