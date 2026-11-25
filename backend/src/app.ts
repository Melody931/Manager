import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./modules/auth/auth.routes.js";

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

export default app;
