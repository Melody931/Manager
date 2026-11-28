import type { RequestHandler } from "express";
import { crearVentaSchema, listarVentasQuerySchema } from "../schemas/venta.schema.js";
import * as ventaService from "../service/venta.service.js";

export const crearVentaController: RequestHandler = async (req, res, next) => {
  const auth = req.auth;
  if (!auth) { res.status(401).json({ error: { codigo: "UNAUTHENTICATED", mensaje: "Debes iniciar sesión." } }); return; }
  const parsed = crearVentaSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: { codigo: "VALIDATION_ERROR", mensaje: parsed.error.issues.map((issue) => issue.message).join(" ") } }); return; }
  try {
    const venta = await ventaService.crearVenta(auth.negocioId, auth.usuarioId, parsed.data);
    res.status(201).json({ data: venta });
  } catch (error) {
    if (error instanceof ventaService.VentaServiceError) { res.status(error.statusCode).json({ error: { codigo: error.code, mensaje: error.message } }); return; }
    next(error);
  }
};

export const listarVentasController: RequestHandler = async (req, res, next) => {
  const negocioId = req.auth?.negocioId;
  if (!negocioId) { res.status(401).json({ error: { codigo: "UNAUTHENTICATED", mensaje: "Debes iniciar sesión." } }); return; }
  const parsed = listarVentasQuerySchema.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: { codigo: "VALIDATION_ERROR", mensaje: parsed.error.issues.map((issue) => issue.message).join(" ") } }); return; }
  try { res.json({ data: await ventaService.listarVentas(negocioId, parsed.data) }); } catch (error) { next(error); }
};

export const obtenerVentaController: RequestHandler = async (req, res, next) => {
  const negocioId = req.auth?.negocioId;
  const id = Number(req.params.id);
  if (!negocioId) { res.status(401).json({ error: { codigo: "UNAUTHENTICATED", mensaje: "Debes iniciar sesión." } }); return; }
  if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ error: { codigo: "INVALID_ID", mensaje: "El identificador no es válido." } }); return; }
  try {
    const venta = await ventaService.obtenerVenta(negocioId, id);
    if (!venta) { res.status(404).json({ error: { codigo: "SALE_NOT_FOUND", mensaje: "No se encontró la venta." } }); return; }
    res.json({ data: venta });
  } catch (error) { next(error); }
};
