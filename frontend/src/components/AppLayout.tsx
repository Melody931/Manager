import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const links = [
  { to: "/", label: "Resumen", icon: "▦", end: true },
  { to: "/articulos", label: "Artículos", icon: "□" },
  { to: "/clientes", label: "Clientes", icon: "♙" },
];

export default function AppLayout() {
  const { session, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 md:flex">
      <aside className="flex w-full flex-col border-b border-slate-800 bg-slate-900 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="border-b border-slate-800 px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-400">Manager</p>
          <p className="mt-2 truncate text-lg font-semibold text-white">{session?.negocio.nombre}</p>
          <p className="mt-1 text-xs text-slate-500">Panel de gestión</p>
        </div>

        <nav className="flex gap-2 overflow-x-auto p-3 md:flex-1 md:flex-col md:gap-1 md:p-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${isActive
                  ? "bg-cyan-400/10 text-cyan-300"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"}`
              }
            >
              <span className="w-5 text-center text-base" aria-hidden="true">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden border-t border-slate-800 p-4 md:block">
          <p className="truncate text-sm font-medium text-white">{session?.usuario.nombre}</p>
          <p className="mt-1 truncate text-xs text-slate-500">{session?.usuario.email}</p>
          <button onClick={logout} className="mt-4 w-full rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-rose-400 hover:text-rose-300">
            Cerrar sesión
          </button>
        </div>
        <div className="flex items-center justify-between border-t border-slate-800 px-5 py-3 md:hidden">
          <span className="truncate text-xs text-slate-500">{session?.usuario.email}</span>
          <button onClick={logout} className="ml-3 text-xs font-semibold text-rose-300">Salir</button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}