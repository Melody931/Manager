import { prisma } from "../../../config/prisma.js";
import type { CrearVentaInput, ListarVentasQuery } from "../schemas/venta.schema.js";

export class VentaServiceError extends Error {
  constructor(message: string, public readonly code: string, public readonly statusCode = 400) {
    super(message);
    this.name = "VentaServiceError";
  }
}

// Convierte un Decimal en centavos usando texto y BigInt, evitando aritmética monetaria con Float.
function aCentavos(value: string): bigint {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) throw new VentaServiceError("El precio de un artículo tiene un formato monetario inválido.", "INVALID_ITEM_PRICE", 500);
  return BigInt(match[1]) * 100n + BigInt((match[2] ?? "").padEnd(2, "0") || "0");
}

function desdeCentavos(value: bigint): string {
  return `${value / 100n}.${String(value % 100n).padStart(2, "0")}`;
}

export async function crearVenta(negocioId: number, usuarioId: number, datos: CrearVentaInput) {
  return prisma.$transaction(async (tx) => {
    if (datos.clienteId != null) {
      const cliente = await tx.cliente.findFirst({ where: { id: datos.clienteId, negocioId } });
      if (!cliente) throw new VentaServiceError("El cliente seleccionado no existe en este negocio.", "CLIENT_NOT_FOUND", 404);
    }

    const ids = datos.detalles.map((detalle) => detalle.itemId);
    const items = await tx.item.findMany({
      where: { id: { in: ids }, negocioId, activo: true },
      select: { id: true, nombre: true, tipo: true, precio: true, costo: true, controlaStock: true, stock: true },
    });
    if (items.length !== ids.length) {
      throw new VentaServiceError("Uno o más artículos no existen o no pertenecen a este negocio.", "ITEM_NOT_FOUND", 404);
    }

    const porId = new Map<number, (typeof items)[number]>(items.map((item) => [item.id, item] as const));
    let totalCentavos = 0n;
    const detalles = datos.detalles.map((linea) => {
      const item = porId.get(linea.itemId)!;
      if (item.tipo === "PRODUCTO" && item.controlaStock && item.stock < linea.cantidad) {
        throw new VentaServiceError(`Stock insuficiente para "${item.nombre}". Disponible: ${item.stock}.`, "INSUFFICIENT_STOCK", 409);
      }
      const precio = aCentavos(item.precio.toString());
      totalCentavos += precio * BigInt(linea.cantidad);
      return {
        itemId: item.id,
        cantidad: linea.cantidad,
        precioUnitario: desdeCentavos(precio),
        costoUnitario: item.costo === null ? null : desdeCentavos(aCentavos(item.costo.toString())),
        controlaStock: item.tipo === "PRODUCTO" && item.controlaStock,
      };
    });

    const venta = await tx.venta.create({
      data: {
        negocioId,
        usuarioId,
        clienteId: datos.clienteId ?? null,
        metodoPago: datos.metodoPago,
        total: desdeCentavos(totalCentavos),
        detalles: {
          create: detalles.map(({ controlaStock: _controlaStock, ...detalle }) => detalle),
        },
      },
      include: {
        cliente: { select: { id: true, nombre: true, telefono: true } },
        detalles: { include: { item: { select: { id: true, nombre: true, tipo: true } } } },
      },
    });

    // updateMany realiza el descuento de forma atómica; si una línea falla, la transacción revierte toda la venta.
    for (let index = 0; index < detalles.length; index += 1) {
      const detalle = detalles[index];
      if (!detalle.controlaStock) continue;
      const actualizado = await tx.item.updateMany({
        where: { id: detalle.itemId, negocioId, activo: true, controlaStock: true, stock: { gte: detalle.cantidad } },
        data: { stock: { decrement: detalle.cantidad } },
      });
      if (actualizado.count !== 1) {
        throw new VentaServiceError("El inventario cambió durante la venta. Actualiza el carrito e inténtalo de nuevo.", "INSUFFICIENT_STOCK", 409);
      }
    }

    return venta;
  });
}

export async function listarVentas(negocioId: number, filtros: ListarVentasQuery) {
  const where = {
    negocioId,
    ...(filtros.desde || filtros.hasta ? {
      fecha: {
        ...(filtros.desde ? { gte: filtros.desde } : {}),
        ...(filtros.hasta ? { lte: filtros.hasta } : {}),
      },
    } : {}),
  };
  const [ventas, total] = await Promise.all([
    prisma.venta.findMany({
      where,
      orderBy: { fecha: "desc" },
      skip: (filtros.pagina - 1) * filtros.limite,
      take: filtros.limite,
      include: {
        cliente: { select: { id: true, nombre: true } },
        detalles: { include: { item: { select: { id: true, nombre: true, tipo: true } } } },
      },
    }),
    prisma.venta.count({ where }),
  ]);
  return { ventas, paginacion: { pagina: filtros.pagina, limite: filtros.limite, total, paginas: Math.ceil(total / filtros.limite) } };
}

export async function obtenerVenta(negocioId: number, id: number) {
  return prisma.venta.findFirst({
    where: { id, negocioId },
    include: {
      cliente: { select: { id: true, nombre: true, telefono: true } },
      usuario: { select: { id: true, nombre: true } },
      detalles: { include: { item: { select: { id: true, nombre: true, tipo: true } } } },
    },
  });
}
