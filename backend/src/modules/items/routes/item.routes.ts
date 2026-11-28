import { Router } from "express";
import { autenticar } from "../../../middleware/auth.middleware.js";
import { permitirRoles } from "../../../middleware/roles.middleware.js";
import { actualizarItemController, crearItemController, eliminarItemController, listarItemsController, obtenerItemController } from "../controller/item.controller.js";

const router = Router();

router.use(autenticar);
router.get("/", listarItemsController);
router.get("/:id", obtenerItemController);
router.post("/", permitirRoles("ADMIN"), crearItemController);
router.put("/:id", permitirRoles("ADMIN"), actualizarItemController);
router.delete("/:id", permitirRoles("ADMIN"), eliminarItemController);

export default router;
