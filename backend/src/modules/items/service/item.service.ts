import { prisma } from "../../../config/prisma.js";
import type { CrearItemInput, ActualizarItemInput, ListarItemsQuery } from "../schemas/item.schema.js";

export async function listarItems(negocioId: number, filtros: ListarItemsQuery) {
  const where = {
    negocioId,
    activo: true,
    ...(filtros.tipo ? { tipo: filtros.tipo } : {}),
    ...(filtros.busqueda ? { nombre: { contains: filtros.busqueda, mode: "insensitive" as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: { nombre: "asc" },
      skip: (filtros.pagina - 1) * filtros.limite,
      take: filtros.limite,
    }),
    prisma.item.count({ where }),
  ]);

  return {
    items,
    paginacion: {
      pagina: filtros.pagina,
      limite: filtros.limite,
      total,
      paginas: Math.ceil(total / filtros.limite),
    },
  };
}

export async function obtenerItem(negocioId: number, id: number) {
  return prisma.item.findFirst({ where: { id, negocioId, activo: true } });
}

export async function crearItem(negocioId: number, datos: CrearItemInput) {
  return prisma.item.create({
    data: {
      negocioId,
      tipo: datos.tipo,
      nombre: datos.nombre,
      precio: String(datos.precio),
      costo: datos.costo == null ? null : String(datos.costo),
      controlaStock: datos.tipo === "PRODUCTO" && datos.controlaStock,
      stock: datos.tipo === "PRODUCTO" && datos.controlaStock ? datos.stock : 0,
      stockMinimo: datos.tipo === "PRODUCTO" && datos.controlaStock ? datos.stockMinimo : 0,
    },
  });
}

export async function actualizarItem(negocioId: number, id: number, datos: ActualizarItemInput) {
  const existente = await prisma.item.findFirst({ where: { id, negocioId, activo: true } });
  if (!existente) return null;

  return prisma.item.update({
    where: { id },
    data: {
      ...datos,
      ...(datos.precio !== undefined ? { precio: String(datos.precio) } : {}),
      ...(datos.costo !== undefined ? { costo: datos.costo === null ? null : String(datos.costo) } : {}),
      ...(datos.tipo === "SERVICIO" ? { controlaStock: false, stock: 0, stockMinimo: 0 } : {}),
      ...(datos.controlaStock === false ? { stock: 0, stockMinimo: 0 } : {}),
    },
  });
}

export async function eliminarItem(negocioId: number, id: number) {
  const existente = await prisma.item.findFirst({ where: { id, negocioId, activo: true } });
  if (!existente) return false;

  await prisma.item.update({ where: { id }, data: { activo: false } });
  return true;
}
