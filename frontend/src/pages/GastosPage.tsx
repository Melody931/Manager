import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ApiError } from "../api/client";
import { actualizarGasto, crearGasto, eliminarGasto, listarGastos, type Gasto, type GastoInput } from "../api/gastos";
import { useAuth } from "../auth/AuthContext";

const hoy = () => new Date().toLocaleDateString("en-CA");
const vacio: GastoInput = { categoria: "", monto: 0, fecha: hoy(), nota: "" };
const money = (value: string, currency: string) => new Intl.NumberFormat("es-DO", { style: "currency", currency }).format(Number(value));

export default function GastosPage() {
  const { session } = useAuth();
  const currency = session?.negocio.moneda || "DOP";
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [form, setForm] = useState<GastoInput>(vacio);
  const [editing, setEditing] = useState<number | null>(null);
  const [modal, setModal] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [paginas, setPaginas] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargar = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await listarGastos({ busqueda, pagina, limite: 10 });
      setGastos(response.data.gastos);
      setPaginas(Math.max(1, response.data.paginacion.paginas));
      setTotal(response.data.paginacion.total);
    } catch (err) { setError(err instanceof ApiError ? err.message : "No se pudieron cargar los gastos."); }
    finally { setLoading(false); }
  }, [busqueda, pagina]);
  useEffect(() => { void cargar(); }, [cargar]);

  const nuevo = () => { setEditing(null); setForm(vacio); setError(""); setMensaje(""); setModal(true); };
  const editar = (gasto: Gasto) => { setEditing(gasto.id); setForm({ categoria: gasto.categoria, monto: Number(gasto.monto), fecha: new Date(gasto.fecha).toLocaleDateString("en-CA"), nota: gasto.nota ?? "" }); setError(""); setMensaje(""); setModal(true); };

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const payload: GastoInput = { categoria: form.categoria.trim(), monto: Number(form.monto), fecha: new Date(`${form.fecha}T12:00:00`).toISOString(), nota: form.nota?.trim() || null };
      if (editing === null) await crearGasto(payload); else await actualizarGasto(editing, payload);
      setModal(false); setMensaje(editing === null ? "Gasto registrado correctamente." : "Gasto actualizado correctamente."); await cargar();
    } catch (err) { setError(err instanceof ApiError ? err.message : "No se pudo guardar el gasto."); }
    finally { setSaving(false); }
  }

  async function borrar(gasto: Gasto) {
    if (!window.confirm(`¿Eliminar el gasto "${gasto.categoria}"?`)) return;
    setError(""); setMensaje("");
    try { await eliminarGasto(gasto.id); setMensaje("Gasto eliminado correctamente."); await cargar(); }
    catch (err) { setError(err instanceof ApiError ? err.message : "No se pudo eliminar el gasto."); }
  }

  return <section>
    <p className="text-sm font-medium text-cyan-400">Operaciones</p><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="mt-1 text-3xl font-bold text-white">Gastos</h1><p className="mt-2 text-sm text-slate-400">Registra y consulta los gastos del negocio.</p></div><button onClick={nuevo} className="rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950">+ Nuevo gasto</button></div>
    {error && <p role="alert" className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}{mensaje && <p role="status" className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{mensaje}</p>}
    <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-4"><input value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }} placeholder="Buscar por categoría o nota..." className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white" /></div>
    <div className="mt-5 overflow-hidden rounded-xl border border-slate-800 bg-slate-900"><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-800/70 text-xs uppercase text-slate-400"><tr><th className="px-5 py-4">Categoría</th><th className="px-5 py-4">Fecha</th><th className="px-5 py-4">Nota</th><th className="px-5 py-4 text-right">Monto</th><th className="px-5 py-4 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-slate-800">{loading ? <tr><td colSpan={5} className="p-8 text-center text-slate-400">Cargando gastos...</td></tr> : gastos.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-slate-400">No hay gastos registrados.</td></tr> : gastos.map((gasto) => <tr key={gasto.id}><td className="px-5 py-4 font-medium text-white">{gasto.categoria}</td><td className="px-5 py-4 text-slate-300">{new Date(gasto.fecha).toLocaleDateString("es-DO")}</td><td className="px-5 py-4 text-slate-400">{gasto.nota || "—"}</td><td className="px-5 py-4 text-right font-semibold text-white">{money(gasto.monto, currency)}</td><td className="px-5 py-4 text-right"><button onClick={() => editar(gasto)} className="mr-3 text-cyan-300">Editar</button><button onClick={() => void borrar(gasto)} className="text-rose-300">Eliminar</button></td></tr>)}</tbody></table></div><div className="flex items-center justify-between border-t border-slate-800 px-5 py-4 text-sm text-slate-400"><span>{total} registro(s) · Página {pagina} de {paginas}</span><div className="flex gap-2"><button disabled={pagina <= 1 || loading} onClick={() => setPagina((p) => p - 1)} className="rounded border border-slate-700 px-3 py-1.5 disabled:opacity-40">Anterior</button><button disabled={pagina >= paginas || loading} onClick={() => setPagina((p) => p + 1)} className="rounded border border-slate-700 px-3 py-1.5 disabled:opacity-40">Siguiente</button></div></div></div>
    {modal && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4"><form onSubmit={guardar} className="my-8 w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-bold text-white">{editing === null ? "Nuevo gasto" : "Editar gasto"}</h2><button type="button" onClick={() => setModal(false)} className="text-xl text-slate-400">×</button></div><div className="mt-5 space-y-4"><label className="block text-sm text-slate-300">Categoría<input required minLength={2} maxLength={80} value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white" /></label><label className="block text-sm text-slate-300">Monto<input required type="number" min="0.01" step="0.01" value={form.monto || ""} onChange={(e) => setForm({ ...form, monto: Number(e.target.value) })} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white" /></label><label className="block text-sm text-slate-300">Fecha<input required type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white" /></label><label className="block text-sm text-slate-300">Nota (opcional)<textarea maxLength={500} value={form.nota ?? ""} onChange={(e) => setForm({ ...form, nota: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white" rows={3} /></label></div>{error && <p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setModal(false)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300">Cancelar</button><button disabled={saving} className="rounded-lg bg-cyan-400 px-5 py-2 text-sm font-bold text-slate-950 disabled:opacity-50">{saving ? "Guardando..." : "Guardar gasto"}</button></div></form></div>}
  </section>;
}
