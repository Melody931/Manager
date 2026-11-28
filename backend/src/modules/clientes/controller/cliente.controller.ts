import type { RequestHandler } from "express";
import { actualizarClienteSchema, crearClienteSchema, listarClientesQuerySchema } from "../schemas/cliente.schema.js";
import * as clienteService from "../service/cliente.service.js";

export const listarClientesController: RequestHandler = async (req, res, next) => {
  const negocioId = req.auth?.negocioId;
  if (!negocioId) { res.status(401).json({ error: { codigo: "UNAUTHENTICATED", mensaje: "Debes iniciar sesión." } }); return; }
  const filtros = listarClientesQuerySchema.safeParse(req.query);
  if (!filtros.success) { res.status(400).json({ error: { codigo: "VALIDATION_ERROR", mensaje: "Los filtros de búsqueda no son válidos." } }); return; }
  try { res.json({ data: await clienteService.listarClientes(negocioId, filtros.data) }); } catch (error) { next(error); }
};

export const obtenerClienteController: RequestHandler = async (req, res, next) => {
  const negocioId = req.auth?.negocioId;
  const id = Number(req.params.id);
  if (!negocioId) { res.status(401).json({ error: { codigo: "UNAUTHENTICATED", mensaje: "Debes iniciar sesión." } }); return; }
  if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ error: { codigo: "INVALID_ID", mensaje: "El identificador no es válido." } }); return; }
  try {
    const cliente = await clienteService.obtenerCliente(negocioId, id);
    if (!cliente) { res.status(404).json({ error: { codigo: "CLIENT_NOT_FOUND", mensaje: "No se encontró el cliente." } }); return; }
    res.json({ data: cliente });
  } catch (error) { next(error); }
};

export const crearClienteController: RequestHandler = async (req, res, next) => {
  const negocioId = req.auth?.negocioId;
  if (!negocioId) { res.status(401).json({ error: { codigo: "UNAUTHENTICATED", mensaje: "Debes iniciar sesión." } }); return; }
  const datos = crearClienteSchema.safeParse(req.body);
  if (!datos.success) { res.status(400).json({ error: { codigo: "VALIDATION_ERROR", mensaje: datos.error.issues.map((i) => i.message).join(" ") } }); return; }
  try { res.status(201).json({ data: await clienteService.crearCliente(negocioId, datos.data) }); } catch (error) { next(error); }
};

export const actualizarClienteController: RequestHandler = async (req, res, next) => {
  const negocioId = req.auth?.negocioId;
  const id = Number(req.params.id);
  if (!negocioId) { res.status(401).json({ error: { codigo: "UNAUTHENTICATED", mensaje: "Debes iniciar sesión." } }); return; }
  if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ error: { codigo: "INVALID_ID", mensaje: "El identificador no es válido." } }); return; }
  const datos = actualizarClienteSchema.safeParse(req.body);
  if (!datos.success || Object.keys(datos.data ?? {}).length === 0) { res.status(400).json({ error: { codigo: "VALIDATION_ERROR", mensaje: "Envía al menos un campo válido para actualizar." } }); return; }
  try {
    const cliente = await clienteService.actualizarCliente(negocioId, id, datos.data);
    if (!cliente) { res.status(404).json({ error: { codigo: "CLIENT_NOT_FOUND", mensaje: "No se encontró el cliente." } }); return; }
    res.json({ data: cliente });
  } catch (error) { next(error); }
};

export const eliminarClienteController: RequestHandler = async (req, res, next) => {
  const negocioId = req.auth?.negocioId;
  const id = Number(req.params.id);
  if (!negocioId) { res.status(401).json({ error: { codigo: "UNAUTHENTICATED", mensaje: "Debes iniciar sesión." } }); return; }
  if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ error: { codigo: "INVALID_ID", mensaje: "El identificador no es válido." } }); return; }
  try {
    const eliminado = await clienteService.eliminarCliente(negocioId, id);
    if (!eliminado) { res.status(404).json({ error: { codigo: "CLIENT_NOT_FOUND", mensaje: "No se encontró el cliente." } }); return; }
    res.json({ data: { mensaje: "Cliente eliminado correctamente." } });
  } catch (error) { next(error); }
};
