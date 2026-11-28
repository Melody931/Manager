import { Router } from "express";
import { autenticar } from "../../../middleware/auth.middleware.js";
import { permitirRoles } from "../../../middleware/roles.middleware.js";
import { actualizarClienteController, crearClienteController, eliminarClienteController, listarClientesController, obtenerClienteController } from "../controller/cliente.controller.js";

const router = Router();

router.use(autenticar);
router.get("/", listarClientesController);
router.get("/:id", obtenerClienteController);
router.post("/", crearClienteController);
router.put("/:id", actualizarClienteController);
router.delete("/:id", eliminarClienteController);

export default router;
