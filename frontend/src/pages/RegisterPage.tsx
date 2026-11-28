import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [negocioNombre, setNegocioNombre] = useState("");
  const [negocioTipo, setNegocioTipo] = useState("COMERCIO");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register({ negocioNombre, negocioTipo, nombre, email, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo conectar con el servidor. Comprueba que la API esté activa.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <section className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">Manager</p>
          <h1 className="mt-3 text-3xl font-bold">Registra tu negocio</h1>
          <p className="mt-2 text-sm text-slate-400">Crea tu espacio de trabajo y tu cuenta de administrador.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-300">
            Nombre del negocio
            <input required value={negocioNombre} onChange={(event) => setNegocioNombre(event.target.value)} className={inputClass} placeholder="Mi negocio" />
          </label>

          <label className="block text-sm font-medium text-slate-300">
            Tipo de negocio
            <select value={negocioTipo} onChange={(event) => setNegocioTipo(event.target.value)} className={inputClass}>
              <option value="COMERCIO">Comercio</option>
              <option value="RESTAURANTE">Restaurante</option>
              <option value="SERVICIOS">Servicios</option>
              <option value="OTRO">Otro</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-300">
            Tu nombre
            <input required value={nombre} onChange={(event) => setNombre(event.target.value)} className={inputClass} placeholder="Nombre del administrador" />
          </label>

          <label className="block text-sm font-medium text-slate-300">
            Correo electrónico
            <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} placeholder="tu@correo.com" />
          </label>

          <label className="block text-sm font-medium text-slate-300">
            Contraseña
            <input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} placeholder="Mínimo 8 caracteres" />
          </label>

          {error && (
            <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login" className="font-semibold text-cyan-400 hover:text-cyan-300">Inicia sesión</Link>
        </p>
      </section>
    </main>
  );
}
