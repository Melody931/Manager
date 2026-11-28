import type { RequestHandler } from "express";
import { actualizarGastoSchema, crearGastoSchema, listarGastosQuerySchema } from "../schemas/gasto.schema.js";
import * as gastoService from "../service/gasto.service.js";

export const listarGastosController: RequestHandler = async (req, res, next) => {
  const negocioId = req.auth?.negocioId;
  if (!negocioId) { res.status(401).json({ error: { codigo: "UNAUTHENTICATED", mensaje: "Debes iniciar sesión." } }); return; }
  const parsed = listarGastosQuerySchema.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: { codigo: "VALIDATION_ERROR", mensaje: parsed.error.issues.map((issue) => issue.message).join(" ") } }); return; }
  try { res.json({ data: await gastoService.listarGastos(negocioId, parsed.data) }); } catch (error) { next(error); }
};

export const obtenerGastoController: RequestHandler = async (req, res, next) => {
  const negocioId = req.auth?.negocioId;
  const id = Number(req.params.id);
  if (!negocioId) { res.status(401).json({ error: { codigo: "UNAUTHENTICATED", mensaje: "Debes iniciar sesión." } }); return; }
  if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ error: { codigo: "INVALID_ID", mensaje: "El identificador no es válido." } }); return; }
  try {
    const gasto = await gastoService.obtenerGasto(negocioId, id);
    if (!gasto) { res.status(404).json({ error: { codigo: "EXPENSE_NOT_FOUND", mensaje: "No se encontró el gasto." } }); return; }
    res.json({ data: gasto });
  } catch (error) { next(error); }
};

export const crearGastoController: RequestHandler = async (req, res, next) => {
  const negocioId = req.auth?.negocioId;
  if (!negocioId) { res.status(401).json({ error: { codigo: "UNAUTHENTICATED", mensaje: "Debes iniciar sesión." } }); return; }
  const parsed = crearGastoSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: { codigo: "VALIDATION_ERROR", mensaje: parsed.error.issues.map((issue) => issue.message).join(" ") } }); return; }
  try { res.status(201).json({ data: await gastoService.crearGasto(negocioId, parsed.data) }); } catch (error) { next(error); }
};

export const actualizarGastoController: RequestHandler = async (req, res, next) => {
  const negocioId = req.auth?.negocioId;
  const id = Number(req.params.id);
  if (!negocioId) { res.status(401).json({ error: { codigo: "UNAUTHENTICATED", mensaje: "Debes iniciar sesión." } }); return; }
  if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ error: { codigo: "INVALID_ID", mensaje: "El identificador no es válido." } }); return; }
  const parsed = actualizarGastoSchema.safeParse(req.body);
  if (!parsed.success || Object.keys(parsed.data ?? {}).length === 0) { res.status(400).json({ error: { codigo: "VALIDATION_ERROR", mensaje: "Envía al menos un campo válido para actualizar." } }); return; }
  try {
    const gasto = await gastoService.actualizarGasto(negocioId, id, parsed.data);
    if (!gasto) { res.status(404).json({ error: { codigo: "EXPENSE_NOT_FOUND", mensaje: "No se encontró el gasto." } }); return; }
    res.json({ data: gasto });
  } catch (error) { next(error); }
};

export const eliminarGastoController: RequestHandler = async (req, res, next) => {
  const negocioId = req.auth?.negocioId;
  const id = Number(req.params.id);
  if (!negocioId) { res.status(401).json({ error: { codigo: "UNAUTHENTICATED", mensaje: "Debes iniciar sesión." } }); return; }
  if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ error: { codigo: "INVALID_ID", mensaje: "El identificador no es válido." } }); return; }
  try {
    const eliminado = await gastoService.eliminarGasto(negocioId, id);
    if (!eliminado) { res.status(404).json({ error: { codigo: "EXPENSE_NOT_FOUND", mensaje: "No se encontró el gasto." } }); return; }
    res.json({ data: { mensaje: "Gasto eliminado correctamente." } });
  } catch (error) { next(error); }
};
