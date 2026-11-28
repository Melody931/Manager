import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./modules/auth/auth.routes.js";
import itemRoutes from "./modules/items/routes/item.routes.js";
import clienteRoutes from "./modules/clientes/routes/cliente.routes.js";
import ventaRoutes from "./modules/ventas/routes/venta.routes.js";
import gastoRoutes from "./modules/gastos/routes/gasto.routes.js";

const app = express();

// Protege las respuestas HTTP con encabezados de seguridad.
app.use(helmet());

// Permite solicitudes desde el frontend.
// Durante desarrollo aceptamos el origen local de Vite.
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Permite recibir y procesar cuerpos JSON.
app.use(express.json());

// Ruta básica para comprobar que la API funciona.
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Manager API funcionando correctamente",
  });
});

// Rutas públicas y protegidas de autenticación.
app.use("/auth", authRoutes);
app.use("/items", itemRoutes);
app.use("/clientes", clienteRoutes);
app.use("/ventas", ventaRoutes);
app.use("/gastos", gastoRoutes);

export default app;
