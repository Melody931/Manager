import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ApiError } from "../api/client";
import { listarItems, type Item } from "../api/items";
import { listarClientes, type Cliente } from "../api/clientes";
import { crearVenta, listarVentas, type Venta } from "../api/ventas";
import { useAuth } from "../auth/AuthContext";

type Linea = { item: Item; cantidad: number };
const money = (value: string | number, currency: string) => new Intl.NumberFormat("es-DO", { style: "currency", currency }).format(Number(value));

export default function VentasPage() {
  const { session } = useAuth();
  const currency = session?.negocio.moneda || "DOP";
  const [items, setItems] = useState<Item[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [carrito, setCarrito] = useState<Linea[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [paginas, setPaginas] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);

  const cargarCatalogo = useCallback(async () => {
    try {
      const [itemsResponse, clientesResponse] = await Promise.all([
        listarItems({ pagina: 1, limite: 100 }),
        listarClientes({ pagina: 1, limite: 100 }),
      ]);
      setItems(itemsResponse.data.items);
      setClientes(clientesResponse.data.clientes);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar el catálogo.");
    }
  }, []);

  const cargarVentas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listarVentas({ pagina, limite: 10 });
      setVentas(response.data.ventas);
      setPaginas(Math.max(1, response.data.paginacion.paginas));
      setTotal(response.data.paginacion.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar el historial.");
    } finally { setLoading(false); }
  }, [pagina]);

  useEffect(() => { void cargarCatalogo(); void cargarVentas(); }, [cargarCatalogo, cargarVentas]);

  const disponibles = useMemo(() => items.filter((item) => item.nombre.toLowerCase().includes(busqueda.toLowerCase())), [items, busqueda]);
  const totalCarrito = carrito.reduce((sum, linea) => sum + Math.round(Number(linea.item.precio) * 100) * linea.cantidad, 0);
  const agregar = (item: Item) => setCarrito((actual) => {
    const existente = actual.find((linea) => linea.item.id === item.id);
    if (existente) return actual.map((linea) => linea.item.id === item.id ? { ...linea, cantidad: linea.cantidad + 1 } : linea);
    return [...actual, { item, cantidad: 1 }];
  });

  async function confirmarVenta(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!carrito.length) { setError("Agrega al menos un artículo a la venta."); return; }
    setSaving(true); setError(""); setMensaje("");
    try {
      const response = await crearVenta({
        clienteId: clienteId ? Number(clienteId) : null,
        metodoPago,
        detalles: carrito.map((linea) => ({ itemId: linea.item.id, cantidad: linea.cantidad })),
      });
      setMensaje(`Venta #${response.data.id} registrada correctamente por ${money(response.data.total, currency)}.`);
      setCarrito([]); setClienteId("");
      await Promise.all([cargarCatalogo(), cargarVentas()]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo registrar la venta.");
    } finally { setSaving(false); }
  }

  return <section>
    <p className="text-sm font-medium text-cyan-400">Operaciones</p>
    <h1 className="mt-1 text-3xl font-bold text-white">Ventas</h1>
    <p className="mt-2 text-sm text-slate-400">Registra ventas y consulta el historial. Los totales y descuentos de inventario se calculan en el servidor.</p>
    {error && <p role="alert" className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}
    {mensaje && <p role="status" className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{mensaje}</p>}
    <div className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold text-white">Catálogo</h2>
        <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar producto o servicio..." className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white" />
        <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
          {disponibles.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 p-3">
            <div className="min-w-0"><p className="truncate text-sm font-medium text-white">{item.nombre}</p><p className="text-xs text-slate-400">{item.tipo === "PRODUCTO" ? "Producto" : "Servicio"} · {money(item.precio, currency)}{item.controlaStock ? ` · Stock: ${item.stock}` : ""}</p></div>
            <button type="button" disabled={item.tipo === "PRODUCTO" && item.controlaStock && (item.stock <= 0 || (carrito.find((linea) => linea.item.id === item.id)?.cantidad ?? 0) >= item.stock)} onClick={() => agregar(item)} className="shrink-0 rounded-lg bg-cyan-400 px-3 py-2 text-xs font-bold text-slate-950 disabled:opacity-40">Agregar</button>
          </div>)}
          {disponibles.length === 0 && <p className="py-6 text-center text-sm text-slate-500">No hay coincidencias.</p>}
        </div>
      </div>
      <form onSubmit={confirmarVenta} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold text-white">Carrito</h2>
        <div className="mt-4 space-y-3">
          {carrito.map((linea) => <div key={linea.item.id} className="rounded-lg border border-slate-800 p-3">
            <div className="flex items-start justify-between gap-2"><div><p className="text-sm font-medium text-white">{linea.item.nombre}</p><p className="text-xs text-slate-400">{money(linea.item.precio, currency)} c/u</p></div><button type="button" onClick={() => setCarrito((actual) => actual.filter((x) => x.item.id !== linea.item.id))} className="text-xs text-rose-300">Quitar</button></div>
            <div className="mt-2 flex items-center justify-between"><div className="flex items-center gap-2"><button type="button" onClick={() => setCarrito((actual) => actual.map((x) => x.item.id === linea.item.id ? { ...x, cantidad: Math.max(1, x.cantidad - 1) } : x))} className="rounded border border-slate-700 px-2">−</button><span className="min-w-5 text-center text-sm text-white">{linea.cantidad}</span><button type="button" disabled={linea.item.tipo === "PRODUCTO" && linea.item.controlaStock && linea.cantidad >= linea.item.stock} onClick={() => setCarrito((actual) => actual.map((x) => x.item.id === linea.item.id ? { ...x, cantidad: x.cantidad + 1 } : x))} className="rounded border border-slate-700 px-2 disabled:opacity-40">+</button></div><span className="text-sm font-semibold text-white">{money((Math.round(Number(linea.item.precio) * 100) * linea.cantidad / 100).toFixed(2), currency)}</span></div>
          </div>)}
          {carrito.length === 0 && <p className="rounded-lg border border-dashed border-slate-700 py-8 text-center text-sm text-slate-500">El carrito está vacío.</p>}
        </div>
        <label className="mt-5 block text-sm text-slate-300">Cliente (opcional)<select value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white"><option value="">Venta sin cliente</option>{clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>)}</select></label>
        <label className="mt-4 block text-sm text-slate-300">Método de pago<select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white"><option>Efectivo</option><option>Tarjeta</option><option>Transferencia</option><option>Otro</option></select></label>
        <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4"><span className="text-sm text-slate-400">Total estimado</span><strong className="text-xl text-white">{money((totalCarrito / 100).toFixed(2), currency)}</strong></div>
        <button disabled={saving || carrito.length === 0} className="mt-4 w-full rounded-lg bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-50">{saving ? "Registrando..." : "Confirmar venta"}</button>
      </form>
    </div>
    <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 p-5"><h2 className="text-lg font-semibold text-white">Historial de ventas</h2><p className="mt-1 text-sm text-slate-400">{total} venta(s) registradas</p></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-slate-800/70 text-xs uppercase text-slate-400"><tr><th className="px-5 py-3">Venta</th><th className="px-5 py-3">Fecha</th><th className="px-5 py-3">Cliente</th><th className="px-5 py-3">Pago</th><th className="px-5 py-3 text-right">Total</th></tr></thead><tbody className="divide-y divide-slate-800">{loading ? <tr><td colSpan={5} className="p-6 text-center text-slate-400">Cargando...</td></tr> : ventas.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-slate-400">Todavía no hay ventas.</td></tr> : ventas.map((venta) => <tr key={venta.id}><td className="px-5 py-4"><button type="button" onClick={() => setVentaSeleccionada(venta)} className="font-medium text-cyan-300 hover:text-cyan-200">#{venta.id} · Ver detalle</button></td><td className="px-5 py-4 text-slate-300">{new Date(venta.fecha).toLocaleString("es-DO")}</td><td className="px-5 py-4 text-slate-300">{venta.cliente?.nombre || "Sin cliente"}</td><td className="px-5 py-4 text-slate-300">{venta.metodoPago}</td><td className="px-5 py-4 text-right font-semibold text-white">{money(venta.total, currency)}</td></tr>)}</tbody></table></div>
      <div className="flex items-center justify-between border-t border-slate-800 px-5 py-4 text-sm text-slate-400"><span>Página {pagina} de {paginas}</span><div className="flex gap-2"><button disabled={pagina <= 1 || loading} onClick={() => setPagina((p) => p - 1)} className="rounded border border-slate-700 px-3 py-1.5 disabled:opacity-40">Anterior</button><button disabled={pagina >= paginas || loading} onClick={() => setPagina((p) => p + 1)} className="rounded border border-slate-700 px-3 py-1.5 disabled:opacity-40">Siguiente</button></div></div>
    </div>
    {ventaSeleccionada && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
      <div className="my-8 w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between"><div><h2 className="text-xl font-bold text-white">Venta #{ventaSeleccionada.id}</h2><p className="mt-1 text-sm text-slate-400">{new Date(ventaSeleccionada.fecha).toLocaleString("es-DO")}</p></div><button type="button" onClick={() => setVentaSeleccionada(null)} className="text-xl text-slate-400" aria-label="Cerrar">×</button></div>
        <p className="mt-4 text-sm text-slate-300">Cliente: {ventaSeleccionada.cliente?.nombre || "Sin cliente"} · Pago: {ventaSeleccionada.metodoPago}</p>
        <div className="mt-4 divide-y divide-slate-800 rounded-lg border border-slate-800">
          {ventaSeleccionada.detalles.map((detalle) => <div key={detalle.id} className="flex items-center justify-between gap-3 p-3"><div><p className="text-sm font-medium text-white">{detalle.item.nombre}</p><p className="text-xs text-slate-400">{detalle.cantidad} × {money(detalle.precioUnitario, currency)}</p></div><span className="text-sm font-semibold text-white">{money((Math.round(Number(detalle.precioUnitario) * 100) * detalle.cantidad / 100).toFixed(2), currency)}</span></div>)}
        </div>
        <div className="mt-4 flex justify-between border-t border-slate-800 pt-4"><span className="text-slate-400">Total</span><strong className="text-xl text-white">{money(ventaSeleccionada.total, currency)}</strong></div>
      </div>
    </div>}
  </section>;
}
