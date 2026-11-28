import { useAuth } from "../auth/AuthContext";

export default function DashboardPage() {
  const { session, logout } = useAuth();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">Manager</p>
            <h1 className="mt-1 text-xl font-bold">{session?.negocio.nombre}</h1>
          </div>
          <button onClick={logout} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-rose-400 hover:text-rose-300">
            Cerrar sesión
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-sm font-medium text-cyan-400">Panel principal</p>
        <h2 className="mt-2 text-3xl font-bold">Hola, {session?.usuario.nombre}</h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          Tu espacio de trabajo está preparado. Desde aquí construiremos los módulos de gestión definidos para Manager.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Cuenta</p>
            <p className="mt-2 text-lg font-semibold">{session?.usuario.email}</p>
            <p className="mt-1 text-sm text-slate-500">Rol: {session?.usuario.rol}</p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Plan</p>
            <p className="mt-2 text-lg font-semibold">{session?.plan}</p>
            <p className="mt-1 text-sm text-slate-500">Plan asociado al negocio</p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Moneda</p>
            <p className="mt-2 text-lg font-semibold">{session?.negocio.moneda}</p>
            <p className="mt-1 text-sm text-slate-500">Zona horaria: {session?.negocio.zonaHoraria}</p>
          </article>
        </div>
      </section>
    </main>
  );
}
