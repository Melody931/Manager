import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ApiError } from "../api/client";
import { actualizarCliente, crearCliente, eliminarCliente, listarClientes, type Cliente, type ClienteInput } from "../api/clientes";

const emptyForm: ClienteInput = { nombre: "", telefono: "" };

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pagina, setPagina] = useState(1);
  const [paginas, setPaginas] = useState(1);
  const [total, setTotal] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState<ClienteInput>(emptyForm);
  const [editing, setEditing] = useState<number | null>(null);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadClientes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await listarClientes({ busqueda, pagina, limite: 10 });
      setClientes(response.data.clientes);
      setPaginas(Math.max(1, response.data.paginacion.paginas));
      setTotal(response.data.paginacion.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar los clientes.");
    } finally {
      setLoading(false);
    }
  }, [busqueda, pagina]);

  useEffect(() => { void loadClientes(); }, [loadClientes]);

  const openNew = () => { setEditing(null); setForm(emptyForm); setError(""); setModal(true); };
  const openEdit = (cliente: Cliente) => { setEditing(cliente.id); setForm({ nombre: cliente.nombre, telefono: cliente.telefono ?? "" }); setError(""); setModal(true); };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { nombre: form.nombre.trim(), telefono: form.telefono?.trim() || null };
      if (editing === null) await crearCliente(payload);
      else await actualizarCliente(editing, payload);
      setModal(false);
      await loadClientes();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar el cliente.");
    } finally { setSaving(false); }
  }

  async function handleDelete(cliente: Cliente) {
    if (!window.confirm(\`¿Eliminar a "\${cliente.nombre}"?\`)) return;
    setError("");
    try { await eliminarCliente(cliente.id); await loadClientes(); }
    catch (err) { setError(err instanceof ApiError ? err.message : "No se pudo eliminar el cliente. Puede tener ventas asociadas."); }
  }

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-medium text-cyan-400">Relaciones</p><h1 className="mt-1 text-3xl font-bold text-white">Clientes</h1><p className="mt-2 text-sm text-slate-400">Guarda y mantén actualizada la información de tus clientes.</p></div>
        <button onClick={openNew} className="rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300">+ Nuevo cliente</button>
      </div>

      <div className="mt-7 rounded-xl border border-slate-800 bg-slate-900 p-4"><input value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }} placeholder="Buscar cliente por nombre..." className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400" /></div>
      {error && <p role="alert" className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-slate-800/70 text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-5 py-4">Nombre</th><th className="px-5 py-4">Teléfono</th><th className="px-5 py-4">Fecha de registro</th><th className="px-5 py-4 text-right">Acciones</th></tr></thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-400">Cargando clientes...</td></tr>
              : clientes.length === 0 ? <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-400">No hay clientes que coincidan con la búsqueda.</td></tr>
              : clientes.map((cliente) => <tr key={cliente.id} className="hover:bg-slate-800/30"><td className="px-5 py-4 font-medium text-white">{cliente.nombre}</td><td className="px-5 py-4 text-slate-300">{cliente.telefono || "Sin teléfono"}</td><td className="px-5 py-4 text-slate-400">{new Date(cliente.creadoEn).toLocaleDateString("es-DO")}</td><td className="px-5 py-4 text-right"><button onClick={() => openEdit(cliente)} className="mr-3 text-cyan-300 hover:text-cyan-200">Editar</button><button onClick={() => void handleDelete(cliente)} className="text-rose-300 hover:text-rose-200">Eliminar</button></td></tr>)}
          </tbody>
        </table></div>
        <div className="flex flex-col justify-between gap-3 border-t border-slate-800 px-5 py-4 text-sm text-slate-400 sm:flex-row sm:items-center"><span>{total} registro(s)</span><div className="flex items-center gap-3"><button disabled={pagina <= 1 || loading} onClick={() => setPagina((p) => p - 1)} className="rounded-md border border-slate-700 px-3 py-1.5 disabled:opacity-40">Anterior</button><span>Página {pagina} de {paginas}</span><button disabled={pagina >= paginas || loading} onClick={() => setPagina((p) => p + 1)} className="rounded-md border border-slate-700 px-3 py-1.5 disabled:opacity-40">Siguiente</button></div></div>
      </div>

      {modal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><form onSubmit={handleSubmit} className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between"><div><h2 className="text-xl font-bold text-white">{editing === null ? "Nuevo cliente" : "Editar cliente"}</h2><p className="mt-1 text-sm text-slate-400">Los campos se guardan en el negocio actual.</p></div><button type="button" onClick={() => setModal(false)} className="text-xl text-slate-400 hover:text-white" aria-label="Cerrar">×</button></div>
        <div className="mt-6 space-y-4"><label className="block text-sm text-slate-300">Nombre<input required minLength={2} maxLength={120} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-400" /></label><label className="block text-sm text-slate-300">Teléfono (opcional)<input maxLength={30} value={form.telefono ?? ""} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-400" /></label></div>
        {error && <p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>}
        <div className="mt-7 flex justify-end gap-3"><button type="button" onClick={() => setModal(false)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300">Cancelar</button><button disabled={saving} className="rounded-lg bg-cyan-400 px-5 py-2 text-sm font-bold text-slate-950 disabled:opacity-50">{saving ? "Guardando..." : "Guardar"}</button></div>
      </form></div>}
    </section>
  );
}