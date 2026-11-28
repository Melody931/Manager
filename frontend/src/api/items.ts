import { apiRequest } from "./client";

export type ItemTipo = "PRODUCTO" | "SERVICIO";

export interface Item {
  id: number;
  tipo: ItemTipo;
  nombre: string;
  precio: string;
  costo: string | null;
  controlaStock: boolean;
  stock: number;
  stockMinimo: number;
  activo: boolean;
}

export interface ItemInput {
  tipo: ItemTipo;
  nombre: string;
  precio: number;
  costo?: number | null;
  controlaStock: boolean;
  stock: number;
  stockMinimo: number;
}

export interface ItemsResponse {
  data: {
    items: Item[];
    paginacion: { pagina: number; limite: number; total: number; paginas: number };
  };
}

export async function listarItems(params: { busqueda?: string; pagina?: number; limite?: number; tipo?: ItemTipo }) {
  const query = new URLSearchParams();
  if (params.busqueda) query.set("busqueda", params.busqueda);
  query.set("pagina", String(params.pagina ?? 1));
  query.set("limite", String(params.limite ?? 10));
  if (params.tipo) query.set("tipo", params.tipo);
  return apiRequest<ItemsResponse>(\`/items?\${query.toString()}\`);
}

export async function crearItem(input: ItemInput) {
  return apiRequest<{ data: Item }>("/items", { method: "POST", body: JSON.stringify(input) });
}

export async function actualizarItem(id: number, input: Partial<ItemInput>) {
  return apiRequest<{ data: Item }>(\`/items/\${id}\`, { method: "PUT", body: JSON.stringify(input) });
}

export async function eliminarItem(id: number) {
  return apiRequest<{ data: { mensaje: string } }>(\`/items/\${id}\`, { method: "DELETE" });
}