import { prisma } from "../../../config/prisma.js";
import type { CrearClienteInput, ActualizarClienteInput, ListarClientesQuery } from "../schemas/cliente.schema.js";

export async function listarClientes(negocioId: number, filtros: ListarClientesQuery) {
  const where = {
    negocioId,
    ...(filtros.busqueda
      ? {
          OR: [
            { nombre: { contains: filtros.busqueda, mode: "insensitive" as const } },
            { telefono: { contains: filtros.busqueda, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({
      where,
      orderBy: { nombre: "asc" },
      skip: (filtros.pagina - 1) * filtros.limite,
      take: filtros.limite,
    }),
    prisma.cliente.count({ where }),
  ]);
  return {
    clientes,
    paginacion: {
      pagina: filtros.pagina,
      limite: filtros.limite,
      total,
      paginas: Math.ceil(total / filtros.limite),
    },
  };
}

export async function obtenerCliente(negocioId: number, id: number) {
  return prisma.cliente.findFirst({ where: { id, negocioId } });
}

export async function crearCliente(negocioId: number, datos: CrearClienteInput) {
  return prisma.cliente.create({
    data: { negocioId, nombre: datos.nombre, telefono: datos.telefono || null },
  });
}

export async function actualizarCliente(negocioId: number, id: number, datos: ActualizarClienteInput) {
  const existente = await prisma.cliente.findFirst({ where: { id, negocioId } });
  if (!existente) return null;
  return prisma.cliente.update({ where: { id }, data: datos });
}

export async function eliminarCliente(negocioId: number, id: number) {
  const existente = await prisma.cliente.findFirst({ where: { id, negocioId } });
  if (!existente) return false;
  await prisma.cliente.delete({ where: { id } });
  return true;
}
