import { prisma } from "../../../config/prisma.js";
import type { ActualizarGastoInput, CrearGastoInput, ListarGastosQuery } from "../schemas/gasto.schema.js";

export async function listarGastos(negocioId: number, filtros: ListarGastosQuery) {
  const where = {
    negocioId,
    ...(filtros.busqueda ? {
      OR: [
        { categoria: { contains: filtros.busqueda, mode: "insensitive" as const } },
        { nota: { contains: filtros.busqueda, mode: "insensitive" as const } },
      ],
    } : {}),
    ...(filtros.desde || filtros.hasta ? {
      fecha: {
        ...(filtros.desde ? { gte: filtros.desde } : {}),
        ...(filtros.hasta ? { lte: filtros.hasta } : {}),
      },
    } : {}),
  };
  const [gastos, total] = await Promise.all([
    prisma.gasto.findMany({ where, orderBy: [{ fecha: "desc" }, { id: "desc" }], skip: (filtros.pagina - 1) * filtros.limite, take: filtros.limite }),
    prisma.gasto.count({ where }),
  ]);
  return { gastos, paginacion: { pagina: filtros.pagina, limite: filtros.limite, total, paginas: Math.ceil(total / filtros.limite) } };
}

export async function obtenerGasto(negocioId: number, id: number) {
  return prisma.gasto.findFirst({ where: { id, negocioId } });
}

export async function crearGasto(negocioId: number, datos: CrearGastoInput) {
  return prisma.gasto.create({ data: { negocioId, categoria: datos.categoria, monto: datos.monto.toFixed(2), fecha: datos.fecha, nota: datos.nota?.trim() || null } });
}

export async function actualizarGasto(negocioId: number, id: number, datos: ActualizarGastoInput) {
  const existente = await prisma.gasto.findFirst({ where: { id, negocioId } });
  if (!existente) return null;
  return prisma.gasto.update({ where: { id }, data: {
    ...(datos.categoria !== undefined ? { categoria: datos.categoria } : {}),
    ...(datos.monto !== undefined ? { monto: datos.monto.toFixed(2) } : {}),
    ...(datos.fecha !== undefined ? { fecha: datos.fecha } : {}),
    ...(datos.nota !== undefined ? { nota: datos.nota?.trim() || null } : {}),
  } });
}

export async function eliminarGasto(negocioId: number, id: number) {
  const existente = await prisma.gasto.findFirst({ where: { id, negocioId } });
  if (!existente) return false;
  await prisma.gasto.delete({ where: { id } });
  return true;
}
