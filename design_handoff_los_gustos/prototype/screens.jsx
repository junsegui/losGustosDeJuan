// ============================================================
//  Los Gustos de Juan — Screens 1: Login, Resumen, Insumos, Recetas
// ============================================================

const { useState, useMemo, useEffect, useRef } = React;

// ---------- Generic UI helpers ----------
function PageHeader({ title, sub, actions }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {sub && <div className="page-sub">{sub}</div>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

function Modal({ title, sub, onClose, children, footer, wide }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={wide ? { maxWidth: 640 } : null} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="row spread">
            <div>
              <div className="modal-title">{title}</div>
              {sub && <div className="modal-sub">{sub}</div>}
            </div>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><IClose /></button>
          </div>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function Toast({ text, kind = "success" }) {
  return (
    <div className="toast">
      <ICheck style={{ color: "var(--success)" }} /> {text}
    </div>
  );
}

function Kpi({ label, value, delta, deltaKind, icon, prominent }) {
  return (
    <div className={"kpi " + (prominent ? "kpi-prominent" : "")}>
      <div className="kpi-label">{icon}<span>{label}</span></div>
      <div className="kpi-value tnum" style={prominent ? { color: "var(--accent-text)" } : null}>{value}</div>
      {delta && (
        <div className={"kpi-delta " + (deltaKind || "")}>
          {deltaKind === "up" && <IArrowUp />}
          {deltaKind === "down" && <IArrowDown />}
          {delta}
        </div>
      )}
    </div>
  );
}

// CMV color helper: <50 good, 50-70 warn, >70 danger
function cmvKind(c) {
  if (c > 70) return "danger";
  if (c > 50) return "warn";
  return "good";
}
function cmvColor(c) {
  const k = cmvKind(c);
  return k === "danger" ? "var(--danger)" : k === "warn" ? "var(--warning)" : "var(--success)";
}
function cmvPill(c) {
  const k = cmvKind(c);
  return "pill " + (k === "danger" ? "pill-danger" : k === "warn" ? "pill-warn" : "pill-success");
}

// ---------- LOGIN ----------
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("juan@gustosdejuan.com");
  const [pwd, setPwd] = useState("••••••••");
  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-mark">LG</div>
          <div className="login-title">Los Gustos de Juan</div>
          <div className="login-sub">Manager de feria · controlá costos, recetas y ganancias</div>
        </div>
        <form className="login-form" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
          <div className="field">
            <label className="field-label">Correo</label>
            <div className="input-prefix">
              <IMail />
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <div className="row spread">
              <label className="field-label">Contraseña</label>
              <a href="#" className="field-hint" style={{ color: "var(--accent-text)" }}>Olvidé mi contraseña</a>
            </div>
            <div className="input-prefix">
              <ILock />
              <input className="input" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-accent" type="submit" style={{ height: 40, justifyContent: "center" }}>
            Ingresar
          </button>
          <div className="divider">o</div>
          <button className="btn" type="button" style={{ height: 40, justifyContent: "center" }} onClick={onLogin}>
            Continuar con Google
          </button>
        </form>
      </div>
    </div>
  );
}

// ---------- RESUMEN (Dashboard) ----------
function Resumen({ insumos, recetas, carta, ferias, gastos, goto }) {
  const today = new Date("2026-05-18");
  const todayKey = today.toISOString().slice(0, 10);

  const totalGastos = gastos.reduce((a, g) => a + g.monto, 0);
  const margenBajos = carta.filter((c) => c.cmv > 70);
  const margenWarn = carta.filter((c) => c.cmv > 50 && c.cmv <= 70);

  // Eventos próximos
  const upcoming = ferias.filter((f) => f.fecha >= todayKey).sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(0, 4);
  const past = ferias.filter((f) => f.fecha < todayKey).sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 4);
  const gastosRecent = [...gastos].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5);

  // Costo promedio por receta — métrica útil del estado del menú
  const costoPromedio = recetas.length > 0 ? recetas.reduce((a, r) => a + r.costo_por_porcion, 0) / recetas.length : 0;
  const margenPromedio = carta.length > 0 ? carta.reduce((a, c) => a + c.ctm, 0) / carta.length : 0;

  // Gastos por categoría
  const gastosCat = CATEGORIAS_GASTOS.map((cat) => ({
    cat,
    total: gastos.filter((g) => g.categoria === cat).reduce((a, g) => a + g.monto, 0),
  })).filter((x) => x.total > 0).sort((a, b) => b.total - a.total).slice(0, 6);
  const maxCat = Math.max(...gastosCat.map((x) => x.total), 1);

  return (
    <div className="content">
      <PageHeader
        title="Hola, Juan 👋"
        sub={"Un resumen rápido del negocio — " + today.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
        actions={<>
          <button className="btn" onClick={() => goto("gastos")}><IPlus /> Nuevo gasto</button>
          <button className="btn btn-accent" onClick={() => goto("ferias")}><ICalendar /> Nuevo evento</button>
        </>}
      />

      {margenBajos.length > 0 && (
        <div className="alert-danger" style={{ marginBottom: 20 }}>
          <IAlert />
          <div>
            <strong>{margenBajos.length} producto{margenBajos.length > 1 ? "s" : ""} con margen crítico (CMV &gt; 70%).</strong>
            <span style={{ color: "var(--text-muted)" }}> Revisá los precios en la Carta.</span>
          </div>
          <button className="btn btn-sm" style={{ marginLeft: "auto" }} onClick={() => goto("carta")}>Ver carta →</button>
        </div>
      )}

      <div className="kpi-grid">
        <Kpi label="Productos en carta" icon={<IDollar />} value={`${carta.length}`} delta={`${margenBajos.length} con margen bajo`} deltaKind={margenBajos.length > 0 ? "down" : ""} prominent />
        <Kpi label="Margen promedio" icon={<IUp />} value={fmt.pct(margenPromedio)} delta={margenPromedio > 50 ? "saludable" : "ajustar precios"} deltaKind={margenPromedio > 50 ? "up" : "down"} />
        <Kpi label="Próximos eventos" icon={<ICalendar />} value={upcoming.length.toString()} delta={upcoming[0] ? `Próximo: ${fmt.date(upcoming[0].fecha)}` : "ninguno"} />
        <Kpi label="Gastos del mes" icon={<ICart />} value={fmt.money(totalGastos)} delta={`${gastos.length} registros`} />
      </div>

      <div style={{ height: 20 }} />

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">📅 Próximos eventos</div>
              <div className="card-sub">{upcoming.length === 0 ? "Nada en la agenda" : `${upcoming.length} confirmados`}</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => goto("ferias")}>Ver todos →</button>
          </div>
          <div style={{ padding: "4px 0" }}>
            {upcoming.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-faint)", fontSize: 13 }}>
                Sin eventos agendados — <button className="link-btn" onClick={() => goto("ferias")}>agendá uno</button>
              </div>
            )}
            {upcoming.map((f) => {
              const tipo = FERIA_TIPOS.find((t) => t.value === f.tipo);
              const dt = new Date(f.fecha + "T12:00:00");
              return (
                <div key={f.id} style={{ display: "flex", gap: 12, padding: "12px 18px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                  <div style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent-text)",
                    border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
                    borderRadius: 8, padding: "6px 8px", textAlign: "center", minWidth: 50,
                  }}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, letterSpacing: ".05em" }}>
                      {dt.toLocaleDateString("es-AR", { month: "short" }).replace(".", "")}
                    </div>
                    <div className="serif" style={{ fontSize: 18, lineHeight: 1 }}>{dt.getDate()}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{f.nombre}</div>
                    <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 2 }}>
                      {tipo?.icon} {f.lugar || "Sin lugar"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">💸 Gastos por categoría</div>
              <div className="card-sub">{fmt.money(totalGastos)} total</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => goto("gastos")}>Ver →</button>
          </div>
          <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {gastosCat.map((x) => (
              <div key={x.cat}>
                <div className="row spread" style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 13 }}>{x.cat}</span>
                  <span className="mono tnum" style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{fmt.money(x.total)}</span>
                </div>
                <div className="progress-bar"><div style={{ width: `${(x.total / maxCat) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: 20 }} />

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">📋 Productos en carta</div>
              <div className="card-sub">CMV: rojo &gt; 70%, ámbar 50–70%, verde &lt; 50%</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => goto("carta")}>Ver carta →</button>
          </div>
          <div style={{ padding: "4px 0" }}>
            {carta.map((c) => {
              const r = recetas.find((x) => x.id === c.receta_id);
              return (
                <div key={c.id} className="row spread" style={{ padding: "10px 18px", borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{c.nombre_comercial}</div>
                    <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 2 }}>
                      Costo {fmt.money(r?.costo_por_porcion)} · Markup {fmt.number(c.markup)}%
                    </div>
                  </div>
                  <div className="row" style={{ gap: 10 }}>
                    <span className={cmvPill(c.cmv)} style={{ minWidth: 64, justifyContent: "center" }}>CMV {fmt.pct(c.cmv)}</span>
                    <span className="mono tnum" style={{ fontWeight: 600, color: "var(--accent-text)", minWidth: 90, textAlign: "right" }}>{fmt.money(c.precio_venta)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">💸 Últimos gastos</div>
              <div className="card-sub">{gastosRecent.length} registros recientes</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => goto("gastos")}>Ver todos →</button>
          </div>
          <div style={{ padding: "4px 0" }}>
            {gastosRecent.map((g) => (
              <div key={g.id} className="row spread" style={{ padding: "10px 18px", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{g.descripcion}</div>
                  <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 2 }}>
                    <span className="pill">{g.categoria}</span>
                    <span style={{ marginLeft: 6 }}>{fmt.dateFull(g.fecha)}</span>
                  </div>
                </div>
                <div className="mono tnum" style={{ fontWeight: 600, color: "var(--danger)" }}>−{fmt.money(g.monto)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- INSUMOS ----------
function InsumosScreen({ insumos, setInsumos, toast }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("todos");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = insumos.filter((i) =>
    (catFilter === "todos" || i.categoria === catFilter) &&
    i.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const saveInsumo = (i) => {
    const costo_unitario = i.presentacion > 0 ? i.costo_presentacion / i.presentacion : 0;
    if (editing) {
      setInsumos(insumos.map((x) => x.id === editing.id ? { ...i, id: editing.id, costo_unitario } : x));
      toast("Insumo actualizado");
    } else {
      setInsumos([{ ...i, id: "in" + uid(), costo_unitario }, ...insumos]);
      toast("Insumo agregado");
    }
    setAdding(false); setEditing(null);
  };

  const remove = (id) => {
    if (!confirm("¿Eliminar este insumo?")) return;
    setInsumos(insumos.filter((i) => i.id !== id));
    toast("Insumo eliminado");
  };

  return (
    <div className="content">
      <PageHeader
        title="Insumos"
        sub="La materia prima de todo — carnes, verduras, condimentos, servicios."
        actions={<>
          <button className="btn"><IDownload /> Excel</button>
          <button className="btn btn-accent" onClick={() => setAdding(true)}><IPlus /> Nuevo insumo</button>
        </>}
      />

      <div className="toolbar">
        <div className="input-prefix search">
          <ISearch />
          <input className="input" placeholder="Buscar insumo..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="select" style={{ width: "auto" }} value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="todos">Todas las categorías</option>
          {CATEGORIAS_INSUMOS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--text-faint)" }}>
          {filtered.length} de {insumos.length}
        </span>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Insumo</th>
                <th>Categoría</th>
                <th className="cell-right">Presentación</th>
                <th className="cell-right">Costo</th>
                <th className="cell-right">Costo unitario</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr className="row-hover" key={i.id}>
                  <td>
                    <div className="cell-strong">{i.nombre}</div>
                    {i.notas && <div className="cell-faint" style={{ fontSize: 12, marginTop: 2 }}>{i.notas}</div>}
                  </td>
                  <td>
                    <span className="pill">{i.categoria || "—"}</span>
                    {i.subcategoria && <div className="cell-faint" style={{ fontSize: 11, marginTop: 3 }}>{i.subcategoria}</div>}
                  </td>
                  <td className="cell-right mono tnum">{fmt.number(i.presentacion)} {i.unidad_medida}</td>
                  <td className="cell-right mono tnum cell-strong">{fmt.money(i.costo_presentacion)}</td>
                  <td className="cell-right mono tnum" style={{ color: "var(--accent-text)", fontWeight: 600 }}>
                    {fmt.money(i.costo_unitario)} / {i.unidad_medida}
                  </td>
                  <td>
                    <div className="row" style={{ gap: 2, justifyContent: "flex-end" }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setEditing(i)}><IEdit /></button>
                      <button className="btn btn-ghost btn-icon btn-sm btn-danger" onClick={() => remove(i.id)}><ITrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6}>
                  <div className="empty">
                    <div className="empty-title">No hay insumos</div>
                    <div className="empty-sub">Probá con otra búsqueda o agregá uno nuevo</div>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(adding || editing) && (
        <InsumoEditor insumo={editing} onClose={() => { setAdding(false); setEditing(null); }} onSave={saveInsumo} />
      )}
    </div>
  );
}

function InsumoEditor({ insumo, onClose, onSave }) {
  const [f, setF] = useState(insumo || {
    nombre: "", categoria: "", subcategoria: "",
    presentacion: 1000, unidad_medida: "gr",
    costo_presentacion: 0, notas: "",
  });
  const costo_unitario = f.presentacion > 0 ? (f.costo_presentacion / f.presentacion) : 0;
  return (
    <Modal
      title={insumo ? "Editar insumo" : "Nuevo insumo"}
      sub="Cargá presentación y costo. El costo unitario se calcula automáticamente."
      onClose={onClose}
      wide
      footer={<>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn btn-accent" onClick={() => onSave(f)} disabled={!f.nombre}>Guardar</button>
      </>}
    >
      <div className="field">
        <label className="field-label">Nombre</label>
        <input className="input" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} placeholder="Ej: Bondiola cruda" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div className="field">
          <label className="field-label">Categoría</label>
          <select className="select" value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value })}>
            <option value="">Sin categoría</option>
            {CATEGORIAS_INSUMOS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field-label">Subcategoría</label>
          <input className="input" value={f.subcategoria} onChange={(e) => setF({ ...f, subcategoria: e.target.value })} placeholder="Opcional" />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <div className="field">
          <label className="field-label">Presentación</label>
          <input className="input mono" type="number" value={f.presentacion} onChange={(e) => setF({ ...f, presentacion: +e.target.value })} />
        </div>
        <div className="field">
          <label className="field-label">Unidad</label>
          <select className="select" value={f.unidad_medida} onChange={(e) => setF({ ...f, unidad_medida: e.target.value })}>
            {UNIDADES.map((u) => <option key={u}>{u}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field-label">Costo presentación</label>
          <input className="input mono" type="number" value={f.costo_presentacion} onChange={(e) => setF({ ...f, costo_presentacion: +e.target.value })} />
        </div>
      </div>
      <div style={{
        background: "var(--accent-soft)",
        border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
        padding: "12px 16px", borderRadius: 8,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 600 }}>
          Costo unitario
        </div>
        <div className="mono tnum" style={{ fontSize: 20, fontWeight: 700, color: "var(--accent-text)" }}>
          {fmt.money(costo_unitario)} / {f.unidad_medida}
        </div>
      </div>
      <div className="field">
        <label className="field-label">Notas</label>
        <input className="input" value={f.notas || ""} onChange={(e) => setF({ ...f, notas: e.target.value })} placeholder="Opcional" />
      </div>
    </Modal>
  );
}

// ---------- RECETAS ----------
function RecetasScreen({ recetas, insumos, subRecetas, setRecetas, toast }) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  const filtered = recetas.filter((r) => r.nombre.toLowerCase().includes(search.toLowerCase()));

  const remove = (id) => {
    if (!confirm("¿Eliminar esta receta?")) return;
    setRecetas(recetas.filter((r) => r.id !== id));
    toast("Receta eliminada");
  };

  return (
    <div className="content">
      <PageHeader
        title="Recetas"
        sub="El producto final — sandwiches, hamburguesas, todo lo que vendés."
        actions={<>
          <button className="btn"><IDownload /> Excel</button>
          <button className="btn btn-accent" onClick={() => setAdding(true)}><IPlus /> Nueva receta</button>
        </>}
      />

      <div className="toolbar">
        <div className="input-prefix search">
          <ISearch />
          <input className="input" placeholder="Buscar receta..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--text-faint)" }}>
          {filtered.length} de {recetas.length}
        </span>
      </div>

      <div className="receta-grid">
        {filtered.map((r) => (
          <RecetaCard key={r.id} receta={r} insumos={insumos} subRecetas={subRecetas} onEdit={() => setEditing(r)} onDelete={() => remove(r.id)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card">
          <div className="empty">
            <div className="empty-title">No hay recetas</div>
            <div className="empty-sub">Cargá tu primera receta para empezar</div>
          </div>
        </div>
      )}

      {(adding || editing) && (
        <RecetaEditor receta={editing} insumos={insumos} subRecetas={subRecetas} onClose={() => { setAdding(false); setEditing(null); }} onSave={(r) => {
          if (editing) {
            setRecetas(recetas.map((x) => x.id === editing.id ? { ...r, id: editing.id } : x));
            toast("Receta actualizada");
          } else {
            setRecetas([{ ...r, id: "r" + uid() }, ...recetas]);
            toast("Receta creada");
          }
          setAdding(false); setEditing(null);
        }} />
      )}
    </div>
  );
}

function RecetaCard({ receta, insumos, subRecetas, onEdit, onDelete }) {
  return (
    <div className="card receta-card">
      <div className="card-header">
        <div>
          <div className="serif" style={{ fontSize: 18 }}>{receta.nombre}</div>
          <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 2 }}>
            {receta.categoria || "Sin categoría"} · Rinde {receta.rinde} {receta.unidad_rinde}
          </div>
        </div>
        <div className="row" style={{ gap: 2 }}>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onEdit}><IEdit /></button>
          <button className="btn btn-ghost btn-icon btn-sm btn-danger" onClick={onDelete}><ITrash /></button>
        </div>
      </div>
      <div style={{ padding: "12px 18px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>
          Ingredientes
        </div>
        {receta.ingredientes.map((ing, i) => {
          const ref = ing.tipo === "insumo"
            ? insumos.find((x) => x.id === ing.insumo_id)
            : subRecetas.find((x) => x.id === ing.sub_receta_id);
          return (
            <div key={i} className="row spread" style={{ padding: "4px 0", fontSize: 13 }}>
              <span>
                {ing.tipo === "sub-receta" && <span className="pill pill-info" style={{ marginRight: 6 }}>sub</span>}
                {ref?.nombre || "—"}
              </span>
              <span className="mono cell-faint">{fmt.number(ing.cantidad)} {ing.unidad}</span>
            </div>
          );
        })}
      </div>
      <div className="receta-stats">
        <div>
          <div className="stat-lbl">Costo total</div>
          <div className="mono tnum stat-val">{fmt.money(receta.costo_total)}</div>
        </div>
        <div>
          <div className="stat-lbl">Costo / {receta.unidad_rinde}</div>
          <div className="mono tnum stat-val" style={{ color: "var(--accent-text)" }}>{fmt.money(receta.costo_por_porcion)}</div>
        </div>
      </div>
    </div>
  );
}

function RecetaEditor({ receta, insumos, subRecetas, onClose, onSave }) {
  const [f, setF] = useState(receta || {
    nombre: "", categoria: "", rinde: 1, unidad_rinde: "un",
    ingredientes: [], notas: "",
  });

  const calcCosto = (ing) => {
    if (ing.tipo === "insumo") {
      const ins = insumos.find((x) => x.id === ing.insumo_id);
      return ins ? ins.costo_unitario * (ing.cantidad || 0) : 0;
    } else {
      const sr = subRecetas.find((x) => x.id === ing.sub_receta_id);
      return sr ? sr.costo_unitario * (ing.cantidad || 0) : 0;
    }
  };
  const costo_total = f.ingredientes.reduce((a, i) => a + calcCosto(i), 0);
  const costo_por_porcion = f.rinde > 0 ? costo_total / f.rinde : 0;

  const addIng = () => setF({ ...f, ingredientes: [...f.ingredientes, { tipo: "insumo", insumo_id: "", cantidad: 0, unidad: "gr" }] });
  const updateIng = (i, patch) => setF({ ...f, ingredientes: f.ingredientes.map((x, idx) => idx === i ? { ...x, ...patch } : x) });
  const removeIng = (i) => setF({ ...f, ingredientes: f.ingredientes.filter((_, idx) => idx !== i) });

  return (
    <Modal
      title={receta ? "Editar receta" : "Nueva receta"}
      sub="Combiná insumos y sub-recetas para calcular el costo por porción"
      onClose={onClose}
      wide
      footer={<>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn btn-accent" onClick={() => onSave({ ...f, costo_total, costo_por_porcion })} disabled={!f.nombre || f.ingredientes.length === 0}>
          Guardar receta
        </button>
      </>}
    >
      <div className="field">
        <label className="field-label">Nombre</label>
        <input className="input" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} placeholder="Ej: Sándwich de bondiola" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 10 }}>
        <div className="field">
          <label className="field-label">Categoría</label>
          <input className="input" value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value })} placeholder="Sandwiches, etc." />
        </div>
        <div className="field">
          <label className="field-label">Rinde</label>
          <input className="input mono" type="number" value={f.rinde} onChange={(e) => setF({ ...f, rinde: +e.target.value })} />
        </div>
        <div className="field">
          <label className="field-label">Unidad</label>
          <select className="select" value={f.unidad_rinde} onChange={(e) => setF({ ...f, unidad_rinde: e.target.value })}>
            <option value="un">un</option>
            <option value="porcion">porción</option>
            <option value="gr">gr</option>
            <option value="ml">ml</option>
          </select>
        </div>
      </div>

      <div>
        <div className="row spread" style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>
            🧾 Ingredientes
          </div>
          <button className="btn btn-sm" onClick={addIng}><IPlus /> Agregar</button>
        </div>
        {f.ingredientes.length === 0 && (
          <div style={{ padding: 16, textAlign: "center", color: "var(--text-faint)", fontSize: 13, background: "var(--bg-sunk)", borderRadius: 8 }}>
            Sin ingredientes todavía
          </div>
        )}
        {f.ingredientes.map((ing, i) => {
          const list = ing.tipo === "insumo" ? insumos : subRecetas;
          const idKey = ing.tipo === "insumo" ? "insumo_id" : "sub_receta_id";
          return (
            <div key={i} className="row" style={{ gap: 6, marginBottom: 6 }}>
              <select className="select" style={{ flex: "0 0 110px" }} value={ing.tipo} onChange={(e) => updateIng(i, { tipo: e.target.value, insumo_id: "", sub_receta_id: "" })}>
                <option value="insumo">Insumo</option>
                <option value="sub-receta">Sub-receta</option>
              </select>
              <select className="select" style={{ flex: 1 }} value={ing[idKey]} onChange={(e) => updateIng(i, { [idKey]: e.target.value })}>
                <option value="">Seleccionar...</option>
                {list.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.nombre} ({fmt.money(x.costo_unitario)}/{x.unidad_medida || x.unidad_rinde})
                  </option>
                ))}
              </select>
              <input className="input mono" type="number" style={{ flex: "0 0 90px" }} placeholder="Cant." value={ing.cantidad} onChange={(e) => updateIng(i, { cantidad: +e.target.value })} />
              <select className="select" style={{ flex: "0 0 70px" }} value={ing.unidad} onChange={(e) => updateIng(i, { unidad: e.target.value })}>
                {UNIDADES.map((u) => <option key={u}>{u}</option>)}
              </select>
              <button className="btn btn-ghost btn-icon btn-sm btn-danger" onClick={() => removeIng(i)}><IClose /></button>
            </div>
          );
        })}
      </div>

      {f.ingredientes.length > 0 && (
        <div style={{
          background: "var(--accent-soft)",
          border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
          padding: "14px 16px", borderRadius: 10,
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 600 }}>Costo total</div>
            <div className="mono tnum" style={{ fontSize: 18, fontWeight: 700 }}>{fmt.money(costo_total)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 600 }}>Rinde</div>
            <div className="mono tnum" style={{ fontSize: 18, fontWeight: 700 }}>{f.rinde} {f.unidad_rinde}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 600 }}>Costo / {f.unidad_rinde}</div>
            <div className="mono tnum" style={{ fontSize: 18, fontWeight: 700, color: "var(--accent-text)" }}>{fmt.money(costo_por_porcion)}</div>
          </div>
        </div>
      )}

      <div className="field">
        <label className="field-label">Notas</label>
        <input className="input" value={f.notas || ""} onChange={(e) => setF({ ...f, notas: e.target.value })} placeholder="Opcional" />
      </div>
    </Modal>
  );
}

// ---------- CALCULADORA EXPRESS ----------
function CalculadoraExpress({ onClose }) {
  const [form, setForm] = useState({
    kgComprados: "",
    precioKg: "",
    mermaPorcentaje: "",
    insumosExtra: "",
    margenDeseado: "30",
  });

  const kgComprados = parseFloat(form.kgComprados) || 0;
  const precioKg = parseFloat(form.precioKg) || 0;
  const mermaPorcentaje = parseFloat(form.mermaPorcentaje) || 0;
  const insumosExtra = parseFloat(form.insumosExtra) || 0;
  const margenDeseado = parseFloat(form.margenDeseado) || 0;

  const kgFinales = kgComprados * (1 - mermaPorcentaje / 100);
  const costoTotal = kgComprados * precioKg + insumosExtra;
  const costoPorKg = kgFinales > 0 ? costoTotal / kgFinales : 0;
  const precioSugerido = margenDeseado < 100 ? costoPorKg / (1 - margenDeseado / 100) : 0;

  const hayCalculo = kgComprados > 0 && precioKg > 0;

  const limpiar = () => setForm({
    kgComprados: "", precioKg: "", mermaPorcentaje: "",
    insumosExtra: "", margenDeseado: "30",
  });

  return (
    <Modal
      title="Calculadora Express"
      sub="Calculá el costo real por kg con merma al instante"
      onClose={onClose}
      wide
      footer={<>
        <button className="btn" onClick={limpiar}>Limpiar</button>
        <div style={{ flex: 1 }} />
        <button className="btn btn-accent" onClick={onClose}>Cerrar</button>
      </>}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label className="field-label">Kg comprados</label>
          <input
            className="input mono"
            type="number"
            placeholder="Ej: 10"
            value={form.kgComprados}
            onChange={(e) => setForm({ ...form, kgComprados: e.target.value })}
            autoFocus
          />
        </div>
        <div className="field">
          <label className="field-label">Precio por kg ($)</label>
          <input
            className="input mono"
            type="number"
            placeholder="Ej: 6000"
            value={form.precioKg}
            onChange={(e) => setForm({ ...form, precioKg: e.target.value })}
          />
        </div>
        <div className="field">
          <label className="field-label">Merma (%)</label>
          <input
            className="input mono"
            type="number"
            placeholder="Ej: 30"
            value={form.mermaPorcentaje}
            onChange={(e) => setForm({ ...form, mermaPorcentaje: e.target.value })}
          />
        </div>
        <div className="field">
          <label className="field-label">Insumos extra ($)</label>
          <input
            className="input mono"
            type="number"
            placeholder="Especias, leña..."
            value={form.insumosExtra}
            onChange={(e) => setForm({ ...form, insumosExtra: e.target.value })}
          />
        </div>
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label className="field-label">Margen deseado (%)</label>
          <input
            className="input mono"
            type="number"
            placeholder="30"
            value={form.margenDeseado}
            onChange={(e) => setForm({ ...form, margenDeseado: e.target.value })}
          />
        </div>
      </div>

      {hayCalculo && (
        <div style={{
          background: "var(--accent-soft)",
          border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
          borderRadius: 12, padding: 18,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <div className="stat-lbl">Kg finales</div>
              <div className="mono tnum" style={{ fontSize: 17, fontWeight: 700 }}>{kgFinales.toFixed(2)} kg</div>
            </div>
            <div>
              <div className="stat-lbl">Costo total</div>
              <div className="mono tnum" style={{ fontSize: 17, fontWeight: 700 }}>{fmt.money(costoTotal)}</div>
            </div>
            <div>
              <div className="stat-lbl">Costo por kg</div>
              <div className="mono tnum" style={{ fontSize: 17, fontWeight: 700, color: "var(--accent-text)" }}>
                {fmt.money(costoPorKg)}
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)", paddingTop: 14 }}>
            <div className="stat-lbl">💰 Precio sugerido de venta · {margenDeseado}% margen</div>
            <div className="mono tnum" style={{
              fontSize: 28, fontWeight: 700,
              fontFamily: "var(--serif)",
              color: "var(--accent-text)",
              marginTop: 2,
            }}>
              {fmt.money(precioSugerido)} / kg
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

Object.assign(window, {
  PageHeader, Modal, Toast, Kpi, cmvKind, cmvColor, cmvPill,
  LoginScreen, Resumen, InsumosScreen, RecetasScreen, CalculadoraExpress,
});
