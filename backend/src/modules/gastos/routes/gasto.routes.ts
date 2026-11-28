import { Router } from "express";
import { autenticar } from "../../../middleware/auth.middleware.js";
import { actualizarGastoController, crearGastoController, eliminarGastoController, listarGastosController, obtenerGastoController } from "../controller/gasto.controller.js";

const router = Router();
router.use(autenticar);
router.get("/", listarGastosController);
router.get("/:id", obtenerGastoController);
router.post("/", crearGastoController);
router.put("/:id", actualizarGastoController);
router.delete("/:id", eliminarGastoController);

export default router;
