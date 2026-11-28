import { Router } from "express";
import { autenticar } from "../../../middleware/auth.middleware.js";
import { crearVentaController, listarVentasController, obtenerVentaController } from "../controller/venta.controller.js";

const router = Router();
router.use(autenticar);
router.get("/", listarVentasController);
router.get("/:id", obtenerVentaController);
router.post("/", crearVentaController);

export default router;
