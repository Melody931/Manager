import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function DashboardPage() {
  const { session } = useAuth();

  return (
    <section>
      <p className="text-sm font-medium text-cyan-400">Panel principal</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Hola, {session?.usuario.nombre}</h1>
      <p className="mt-3 max-w-2xl text-slate-400">
        Bienvenido a tu espacio de trabajo. Administra el catálogo y mantén organizada la información de tus clientes desde el menú.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">Cuenta</p>
          <p className="mt-2 break-all text-lg font-semibold text-white">{session?.usuario.email}</p>
          <p className="mt-1 text-sm text-slate-500">Rol: {session?.usuario.rol}</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">Plan</p>
          <p className="mt-2 text-lg font-semibold text-white">{session?.plan}</p>
          <p className="mt-1 text-sm text-slate-500">Plan asociado al negocio</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">Moneda</p>
          <p className="mt-2 text-lg font-semibold text-white">{session?.negocio.moneda}</p>
          <p className="mt-1 text-sm text-slate-500">Zona horaria: {session?.negocio.zonaHoraria}</p>
        </article>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white">Accesos rápidos</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Link to="/articulos" className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-400/60">
            <p className="font-semibold text-white">Administrar artículos <span className="text-cyan-400">→</span></p>
            <p className="mt-2 text-sm text-slate-400">Consulta productos y servicios, actualiza precios y controla existencias.</p>
          </Link>
          <Link to="/clientes" className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-400/60">
            <p className="font-semibold text-white">Administrar clientes <span className="text-cyan-400">→</span></p>
            <p className="mt-2 text-sm text-slate-400">Registra clientes y mantén sus datos de contacto al día.</p>
          </Link>
        </div>
      </div>
    </section>
  );
}
