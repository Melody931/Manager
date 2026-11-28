import type { RequestHandler } from "express";
import { prisma } from "../../../config/prisma.js";
import { actualizarItemSchema, crearItemSchema, listarItemsQuerySchema } from "../schemas/item.schema.js";
import * as itemService from "../service/item.service.js";

function negocioId(req: Parameters<RequestHandler>[0]): number | null {
  return req.auth?.negocioId ?? null;
}

export const listarItemsController: RequestHandler = async (req, res, next) => {
  const tenantId = negocioId(req);
  if (!tenantId) { res.status(401).json({ error: { codigo: "UNAUTHENTICATED", mensaje: "Debes iniciar sesión." } }); return; }
  const filtros = listarItemsQuerySchema.safeParse(req.query);
  if (!filtros.success) { res.status(400).json({ error: { codigo: "VALIDATION_ERROR", mensaje: "Los filtros de búsqueda no son válidos." } }); return; }
  try { res.json({ data: await itemService.listarItems(tenantId, filtros.data) }); } catch (error) { next(error); }
};

export const obtenerItemController: RequestHandler = async (req, res, next) => {
  const tenantId = negocioId(req);
  const id = Number(req.params.id);
  if (!tenantId) { res.status(401).json({ error: { codigo: "UNAUTHENTICATED", mensaje: "Debes iniciar sesión." } }); return; }
  if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ error: { codigo: "INVALID_ID", mensaje: "El identificador no es válido." } }); return; }
  try {
    const item = await itemService.obtenerItem(tenantId, id);
    if (!item) { res.status(404).json({ error: { codigo: "ITEM_NOT_FOUND", mensaje: "No se encontró el artículo." } }); return; }
    res.json({ data: item });
  } catch (error) { next(error); }
};

export const crearItemController: RequestHandler = async (req, res, next) => {
  const tenantId = negocioId(req);
  if (!tenantId) { res.status(401).json({ error: { codigo: "UNAUTHENTICATED", mensaje: "Debes iniciar sesión." } }); return; }
  const datos = crearItemSchema.safeParse(req.body);
  if (!datos.success) { res.status(400).json({ error: { codigo: "VALIDATION_ERROR", mensaje: datos.error.issues.map((i) => i.message).join(" ") } }); return; }
  try { res.status(201).json({ data: await itemService.crearItem(tenantId, datos.data) }); } catch (error) { next(error); }
};

export const actualizarItemController: RequestHandler = async (req, res, next) => {
  const tenantId = negocioId(req);
  const id = Number(req.params.id);
  if (!tenantId) { res.status(401).json({ error: { codigo: "UNAUTHENTICATED", mensaje: "Debes iniciar sesión." } }); return; }
  if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ error: { codigo: "INVALID_ID", mensaje: "El identificador no es válido." } }); return; }
  const datos = actualizarItemSchema.safeParse(req.body);
  if (!datos.success || Object.keys(datos.data ?? {}).length === 0) { res.status(400).json({ error: { codigo: "VALIDATION_ERROR", mensaje: "Envía al menos un campo válido para actualizar." } }); return; }
  try {
    const item = await itemService.actualizarItem(tenantId, id, datos.data);
    if (!item) { res.status(404).json({ error: { codigo: "ITEM_NOT_FOUND", mensaje: "No se encontró el artículo." } }); return; }
    res.json({ data: item });
  } catch (error) { next(error); }
};

export const eliminarItemController: RequestHandler = async (req, res, next) => {
  const tenantId = negocioId(req);
  const id = Number(req.params.id);
  if (!tenantId) { res.status(401).json({ error: { codigo: "UNAUTHENTICATED", mensaje: "Debes iniciar sesión." } }); return; }
  if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ error: { codigo: "INVALID_ID", mensaje: "El identificador no es válido." } }); return; }
  try {
    const eliminado = await itemService.eliminarItem(tenantId, id);
    if (!eliminado) { res.status(404).json({ error: { codigo: "ITEM_NOT_FOUND", mensaje: "No se encontró el artículo." } }); return; }
    res.status(200).json({ data: { mensaje: "Artículo eliminado correctamente." } });
  } catch (error) { next(error); }
};
