import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ApiError } from "../api/client";
import { actualizarItem, crearItem, eliminarItem, listarItems, type Item, type ItemInput, type ItemTipo } from "../api/items";
import { useAuth } from "../auth/AuthContext";

const emptyForm: ItemInput = { tipo: "PRODUCTO", nombre: "", precio: 0, costo: null, controlaStock: false, stock: 0, stockMinimo: 0 };
const money = (value: string, currency: string) => new Intl.NumberFormat("es-DO", { style: "currency", currency }).format(Number(value));

export default function ItemsPage() {
  const { session } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [pagina, setPagina] = useState(1);
  const [paginas, setPaginas] = useState(1);
  const [total, setTotal] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<"" | ItemTipo>("");
  const [form, setForm] = useState<ItemInput>(emptyForm);
  const [editing, setEditing] = useState<number | null>(null);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await listarItems({ busqueda, pagina, limite: 10, tipo: filtro || undefined });
      setItems(response.data.items);
      setPaginas(Math.max(1, response.data.paginacion.paginas));
      setTotal(response.data.paginacion.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar los artículos.");
    } finally {
      setLoading(false);
    }
  }, [busqueda, pagina, filtro]);

  useEffect(() => { void loadItems(); }, [loadItems]);

  const openNew = () => { setEditing(null); setForm(emptyForm); setError(""); setModal(true); };
  const openEdit = (item: Item) => {
    setEditing(item.id);
    setForm({ tipo: item.tipo, nombre: item.nombre, precio: Number(item.precio), costo: item.costo === null ? null : Number(item.costo), controlaStock: item.controlaStock, stock: item.stock, stockMinimo: item.stockMinimo });
    setError("");
    setModal(true);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload: ItemInput = {
        ...form,
        nombre: form.nombre.trim(),
        controlaStock: form.tipo === "PRODUCTO" && form.controlaStock,
        stock: form.tipo === "PRODUCTO" && form.controlaStock ? Number(form.stock) : 0,
        stockMinimo: form.tipo === "PRODUCTO" && form.controlaStock ? Number(form.stockMinimo) : 0,
        precio: Number(form.precio),
        costo: form.costo === null || String(form.costo).trim() === "" ? null : Number(form.costo),
      };
      if (editing === null) await crearItem(payload);
      else await actualizarItem(editing, payload);
      setModal(false);
      await loadItems();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar el artículo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: Item) {
    if (!window.confirm(\`¿Eliminar "\${item.nombre}"? El artículo dejará de aparecer en el catálogo.\`)) return;
    setError("");
    try { await eliminarItem(item.id); await loadItems(); }
    catch (err) { setError(err instanceof ApiError ? err.message : "No se pudo eliminar el artículo."); }
  }

  const isAdmin = session?.usuario.rol === "ADMIN";

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-cyan-400">Catálogo</p>
          <h1 className="mt-1 text-3xl font-bold text-white">Artículos</h1>
          <p className="mt-2 text-sm text-slate-400">Administra los productos y servicios de tu negocio.</p>
        </div>
        {isAdmin && <button onClick={openNew} className="rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300">+ Nuevo artículo</button>}
      </div>

      <div className="mt-7 flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:flex-row">
        <input value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }} placeholder="Buscar por nombre..." className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400" />
        <select value={filtro} onChange={(e) => { setFiltro(e.target.value as "" | ItemTipo); setPagina(1); }} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400">
          <option value="">Todos los tipos</option><option value="PRODUCTO">Productos</option><option value="SERVICIO">Servicios</option>
        </select>
      </div>

      {error && <p role="alert" className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-slate-800/70 text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-5 py-4">Nombre</th><th className="px-5 py-4">Tipo</th><th className="px-5 py-4">Precio</th><th className="px-5 py-4">Existencias</th>{isAdmin && <th className="px-5 py-4 text-right">Acciones</th>}</tr></thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? <tr><td colSpan={isAdmin ? 5 : 4} className="px-5 py-10 text-center text-slate-400">Cargando artículos...</td></tr>
                : items.length === 0 ? <tr><td colSpan={isAdmin ? 5 : 4} className="px-5 py-10 text-center text-slate-400">No hay artículos que coincidan con la búsqueda.</td></tr>
                : items.map((item) => <tr key={item.id} className="hover:bg-slate-800/30"><td className="px-5 py-4 font-medium text-white">{item.nombre}</td><td className="px-5 py-4 text-slate-300">{item.tipo === "PRODUCTO" ? "Producto" : "Servicio"}</td><td className="px-5 py-4 text-slate-300">{money(item.precio, session?.negocio.moneda || "DOP")}</td><td className="px-5 py-4 text-slate-300">{item.tipo === "PRODUCTO" && item.controlaStock ? item.stock : "No aplica"}</td>{isAdmin && <td className="px-5 py-4 text-right"><button onClick={() => openEdit(item)} className="mr-3 text-cyan-300 hover:text-cyan-200">Editar</button><button onClick={() => void handleDelete(item)} className="text-rose-300 hover:text-rose-200">Eliminar</button></td>}</tr>)}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col justify-between gap-3 border-t border-slate-800 px-5 py-4 text-sm text-slate-400 sm:flex-row sm:items-center">
          <span>{total} registro(s)</span>
          <div className="flex items-center gap-3"><button disabled={pagina <= 1 || loading} onClick={() => setPagina((p) => p - 1)} className="rounded-md border border-slate-700 px-3 py-1.5 disabled:opacity-40">Anterior</button><span>Página {pagina} de {paginas}</span><button disabled={pagina >= paginas || loading} onClick={() => setPagina((p) => p + 1)} className="rounded-md border border-slate-700 px-3 py-1.5 disabled:opacity-40">Siguiente</button></div>
        </div>
      </div>

      {modal && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
        <form onSubmit={handleSubmit} className="my-8 w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
          <div className="flex items-start justify-between"><div><h2 className="text-xl font-bold text-white">{editing === null ? "Nuevo artículo" : "Editar artículo"}</h2><p className="mt-1 text-sm text-slate-400">Completa los datos del catálogo.</p></div><button type="button" onClick={() => setModal(false)} className="text-xl text-slate-400 hover:text-white" aria-label="Cerrar">×</button></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-300 sm:col-span-2">Nombre<input required minLength={2} maxLength={120} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-400" /></label>
            <label className="text-sm text-slate-300">Tipo<select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as ItemTipo, controlaStock: false })} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white"><option value="PRODUCTO">Producto</option><option value="SERVICIO">Servicio</option></select></label>
            <label className="text-sm text-slate-300">Precio<input required type="number" min="0.01" step="0.01" value={form.precio || ""} onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white" /></label>
            <label className="text-sm text-slate-300">Costo (opcional)<input type="number" min="0" step="0.01" value={form.costo ?? ""} onChange={(e) => setForm({ ...form, costo: e.target.value === "" ? null : Number(e.target.value) })} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white" /></label>
            {form.tipo === "PRODUCTO" && <div className="sm:col-span-2"><label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.controlaStock} onChange={(e) => setForm({ ...form, controlaStock: e.target.checked })} className="accent-cyan-400" /> Controlar inventario</label>{form.controlaStock && <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm text-slate-300">Existencias<input required type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white" /></label><label className="text-sm text-slate-300">Stock mínimo<input required type="number" min="0" step="1" value={form.stockMinimo} onChange={(e) => setForm({ ...form, stockMinimo: Number(e.target.value) })} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white" /></label></div>}</div>}
          </div>
          {error && <p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>}
          <div className="mt-7 flex justify-end gap-3"><button type="button" onClick={() => setModal(false)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300">Cancelar</button><button disabled={saving} className="rounded-lg bg-cyan-400 px-5 py-2 text-sm font-bold text-slate-950 disabled:opacity-50">{saving ? "Guardando..." : "Guardar"}</button></div>
        </form>
      </div>}
    </section>
  );
}