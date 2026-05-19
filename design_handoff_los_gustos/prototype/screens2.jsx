// ============================================================
//  Los Gustos de Juan — Screens 2: Sub-recetas, Carta, Ferias, Gastos, Reportes, Análisis por Lugar
// ============================================================

const { useState: useS2, useMemo: useM2 } = React;

// ---------- SUB-RECETAS ----------
function SubRecetasScreen({ subRecetas, insumos, setSubRecetas, toast }) {
  const [search, setSearch] = useS2("");
  const [editing, setEditing] = useS2(null);
  const [adding, setAdding] = useS2(false);

  const filtered = subRecetas.filter((r) => r.nombre.toLowerCase().includes(search.toLowerCase()));
  const remove = (id) => {
    if (!confirm("¿Eliminar esta sub-receta?")) return;
    setSubRecetas(subRecetas.filter((r) => r.id !== id));
    toast("Sub-receta eliminada");
  };

  return (
    <div className="content">
      <PageHeader
        title="Sub-recetas"
        sub="Preparaciones intermedias — cebolla caramelizada, salsas, bondiola braseada."
        actions={
          <button className="btn btn-accent" onClick={() => setAdding(true)}><IPlus /> Nueva sub-receta</button>
        }
      />
      <div className="toolbar">
        <div className="input-prefix search">
          <ISearch />
          <input className="input" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--text-faint)" }}>{filtered.length} de {subRecetas.length}</span>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Sub-receta</th>
                <th>Categoría</th>
                <th className="cell-right">Rinde</th>
                <th className="cell-right">Costo total</th>
                <th className="cell-right">Costo unitario</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr className="row-hover" key={s.id}>
                  <td className="cell-strong">{s.nombre}</td>
                  <td><span className="pill">{s.categoria || "—"}</span></td>
                  <td className="cell-right mono tnum">{fmt.number(s.rinde)} {s.unidad_rinde}</td>
                  <td className="cell-right mono tnum">{fmt.money(s.costo_total)}</td>
                  <td className="cell-right mono tnum" style={{ color: "var(--accent-text)", fontWeight: 600 }}>
                    {fmt.money(s.costo_unitario)} / {s.unidad_rinde}
                  </td>
                  <td>
                    <div className="row" style={{ gap: 2, justifyContent: "flex-end" }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setEditing(s)}><IEdit /></button>
                      <button className="btn btn-ghost btn-icon btn-sm btn-danger" onClick={() => remove(s.id)}><ITrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6}><div className="empty"><div className="empty-title">Sin sub-recetas</div></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(adding || editing) && (
        <Modal
          title={editing ? "Sub-receta" : "Nueva sub-receta"}
          sub="Funciona como un insumo compuesto que podés usar en recetas"
          onClose={() => { setAdding(false); setEditing(null); }}
          wide
          footer={<button className="btn btn-accent" onClick={() => { setAdding(false); setEditing(null); }}>Cerrar</button>}
        >
          <div style={{ padding: 16, background: "var(--bg-sunk)", borderRadius: 8, color: "var(--text-muted)", fontSize: 13 }}>
            Editor de sub-receta — mismo flujo que el de recetas (ingredientes → costo total → costo unitario). El editor completo está disponible en la pantalla de Recetas.
          </div>
        </Modal>
      )}
    </div>
  );
}

// ---------- CARTA ----------
function CartaScreen({ carta, recetas, setCarta, toast }) {
  const [search, setSearch] = useS2("");
  const [editing, setEditing] = useS2(null);
  const [adding, setAdding] = useS2(false);

  const filtered = carta.filter((c) => c.nombre_comercial.toLowerCase().includes(search.toLowerCase()));

  const save = (item) => {
    const r = recetas.find((x) => x.id === item.receta_id);
    const cmvVal = cmv(r?.costo_por_porcion || 0, item.precio_venta);
    const newItem = { ...item, cmv: cmvVal, ctm: 100 - cmvVal };
    if (editing) {
      setCarta(carta.map((c) => c.id === editing.id ? { ...newItem, id: editing.id } : c));
      toast("Producto actualizado");
    } else {
      setCarta([{ ...newItem, id: "c" + uid(), activo: true }, ...carta]);
      toast("Producto agregado a la carta");
    }
    setAdding(false); setEditing(null);
  };

  const remove = (id) => {
    if (!confirm("¿Eliminar de la carta?")) return;
    setCarta(carta.filter((c) => c.id !== id));
    toast("Producto eliminado");
  };

  return (
    <div className="content">
      <PageHeader
        title="Carta"
        sub="Definí el precio de venta y controlá el margen de cada producto."
        actions={<>
          <button className="btn"><IDownload /> Excel</button>
          <button className="btn btn-accent" onClick={() => setAdding(true)}><IPlus /> Agregar producto</button>
        </>}
      />
      <div className="toolbar">
        <div className="input-prefix search">
          <ISearch />
          <input className="input" placeholder="Buscar producto..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="row" style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-faint)", gap: 14 }}>
          <span><span className="dot-success" /> CMV &lt; 50%</span>
          <span><span className="dot-warn" /> 50–70%</span>
          <span><span className="dot-danger" /> &gt; 70%</span>
        </div>
      </div>

      <div className="carta-list">
        {filtered.map((c) => {
          const r = recetas.find((x) => x.id === c.receta_id);
          const costo = r?.costo_por_porcion || 0;
          const ganancia = c.precio_venta - costo;
          return (
            <div key={c.id} className="carta-card" style={{ borderLeftColor: cmvColor(c.cmv) }}>
              <div className="row spread" style={{ marginBottom: 12, alignItems: "flex-start" }}>
                <div>
                  <div className="serif" style={{ fontSize: 18 }}>{c.nombre_comercial}</div>
                  <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 2 }}>
                    Basado en: {r?.nombre || "—"} · Markup {fmt.number(c.markup)}%
                  </div>
                </div>
                <div className="row" style={{ gap: 2 }}>
                  <button className="btn btn-sm" onClick={() => setEditing(c)}><IEdit /> Editar</button>
                  <button className="btn btn-ghost btn-icon btn-sm btn-danger" onClick={() => remove(c.id)}><ITrash /></button>
                </div>
              </div>
              <div className="carta-stats">
                <div>
                  <div className="stat-lbl">Costo</div>
                  <div className="mono tnum stat-val">{fmt.money(costo)}</div>
                </div>
                <div>
                  <div className="stat-lbl">Precio venta</div>
                  <div className="mono tnum stat-val" style={{ color: "var(--accent-text)" }}>{fmt.money(c.precio_venta)}</div>
                </div>
                <div>
                  <div className="stat-lbl">Ganancia</div>
                  <div className="mono tnum stat-val" style={{ color: "var(--success)" }}>{fmt.money(ganancia)}</div>
                </div>
                <div>
                  <div className="stat-lbl">CMV</div>
                  <div className="mono tnum stat-val" style={{ color: cmvColor(c.cmv) }}>{fmt.pct(c.cmv)}</div>
                </div>
                <div>
                  <div className="stat-lbl">CTM</div>
                  <div className="mono tnum stat-val" style={{ color: c.ctm > 50 ? "var(--success)" : "var(--text)" }}>{fmt.pct(c.ctm)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(adding || editing) && (
        <CartaEditor item={editing} recetas={recetas} onClose={() => { setAdding(false); setEditing(null); }} onSave={save} />
      )}
    </div>
  );
}

function CartaEditor({ item, recetas, onClose, onSave }) {
  const [f, setF] = useS2(item || { receta_id: "", nombre_comercial: "", precio_venta: 0, markup: 30 });
  const recetaSel = recetas.find((r) => r.id === f.receta_id);
  const costo = recetaSel?.costo_por_porcion || 0;
  const cmvVal = cmv(costo, f.precio_venta);
  const ctm = 100 - cmvVal;
  const sugerido = costo > 0 && f.markup > 0 ? costo / (1 - f.markup / 100) : 0;

  return (
    <Modal
      title={item ? "Editar producto" : "Agregar a la carta"}
      sub="Mirá el CMV en vivo mientras ajustás el precio"
      onClose={onClose}
      wide
      footer={<>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn btn-accent" onClick={() => onSave(f)} disabled={!f.receta_id || !f.precio_venta}>
          {item ? "Guardar" : "Agregar"}
        </button>
      </>}
    >
      <div className="field">
        <label className="field-label">Receta base</label>
        <select className="select" value={f.receta_id} onChange={(e) => {
          const r = recetas.find((x) => x.id === e.target.value);
          setF({ ...f, receta_id: e.target.value, nombre_comercial: f.nombre_comercial || r?.nombre || "" });
        }}>
          <option value="">Seleccionar receta...</option>
          {recetas.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre} ({fmt.money(r.costo_por_porcion)} costo)
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label className="field-label">Nombre comercial</label>
        <input className="input" value={f.nombre_comercial} onChange={(e) => setF({ ...f, nombre_comercial: e.target.value })} placeholder="Como aparece en la carta" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div className="field">
          <label className="field-label">Precio de venta</label>
          <input className="input mono" type="number" value={f.precio_venta} onChange={(e) => setF({ ...f, precio_venta: +e.target.value })} />
        </div>
        <div className="field">
          <label className="field-label">Markup deseado (%)</label>
          <input className="input mono" type="number" value={f.markup} onChange={(e) => setF({ ...f, markup: +e.target.value })} />
          {sugerido > 0 && Math.abs(sugerido - f.precio_venta) > 1 && (
            <div className="field-hint">
              Sugerido: <button type="button" className="link-btn" onClick={() => setF({ ...f, precio_venta: Math.round(sugerido) })}>{fmt.money(sugerido)}</button>
            </div>
          )}
        </div>
      </div>

      {f.receta_id && f.precio_venta > 0 && (
        <div className="result-grid" style={{ borderColor: cmvColor(cmvVal) }}>
          <div>
            <div className="stat-lbl">Costo</div>
            <div className="mono tnum result-val">{fmt.money(costo)}</div>
          </div>
          <div>
            <div className="stat-lbl">Precio</div>
            <div className="mono tnum result-val" style={{ color: "var(--accent-text)" }}>{fmt.money(f.precio_venta)}</div>
          </div>
          <div>
            <div className="stat-lbl">CMV</div>
            <div className="mono tnum result-val" style={{ color: cmvColor(cmvVal) }}>{fmt.pct(cmvVal)}</div>
          </div>
          <div>
            <div className="stat-lbl">CTM</div>
            <div className="mono tnum result-val" style={{ color: ctm > 50 ? "var(--success)" : "var(--text)" }}>{fmt.pct(ctm)}</div>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ---------- FERIAS / EVENTOS (notas/agenda — sin ventas ni costos) ----------
function FeriasScreen({ ferias, setFerias, toast }) {
  const [tipoFilter, setTipoFilter] = useS2("todos");
  const [lugarFilter, setLugarFilter] = useS2("todos");
  const [adding, setAdding] = useS2(false);
  const [editing, setEditing] = useS2(null);

  const today = new Date("2026-05-18").toISOString().slice(0, 10);
  const lugares = [...new Set(ferias.map((f) => f.lugar).filter(Boolean))];
  const filtered = ferias
    .filter((f) => tipoFilter === "todos" || f.tipo === tipoFilter)
    .filter((f) => lugarFilter === "todos" || f.lugar === lugarFilter)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const upcoming = filtered.filter((f) => f.fecha >= today);
  const past = filtered.filter((f) => f.fecha < today);

  const remove = (id) => {
    if (!confirm("¿Eliminar este evento?")) return;
    setFerias(ferias.filter((f) => f.id !== id));
    toast("Evento eliminado");
  };

  const save = (f) => {
    if (editing) {
      setFerias(ferias.map((x) => x.id === editing.id ? { ...f, id: editing.id } : x));
      toast("Evento actualizado");
    } else {
      setFerias([{ ...f, id: "f" + uid() }, ...ferias]);
      toast("Evento agregado");
    }
    setAdding(false); setEditing(null);
  };

  return (
    <div className="content">
      <PageHeader
        title="Eventos"
        sub="Agenda de ferias y puestos en ruta — anotá fechas, lugares y recordatorios."
        actions={
          <button className="btn btn-accent" onClick={() => setAdding(true)}><IPlus /> Nuevo evento</button>
        }
      />

      <div className="toolbar">
        <select className="select" style={{ width: "auto" }} value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)}>
          <option value="todos">Todos los tipos</option>
          {FERIA_TIPOS.map((t) => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
        </select>
        <select className="select" style={{ width: "auto" }} value={lugarFilter} onChange={(e) => setLugarFilter(e.target.value)}>
          <option value="todos">📍 Todos los lugares</option>
          {lugares.map((l) => <option key={l}>{l}</option>)}
        </select>
        <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--text-faint)" }}>
          {filtered.length} evento{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {upcoming.length > 0 && (
        <>
          <div className="section-label">Próximos · {upcoming.length}</div>
          <div className="evento-grid">
            {upcoming.sort((a, b) => a.fecha.localeCompare(b.fecha)).map((f) => (
              <EventoCard key={f.id} feria={f} upcoming onEdit={() => setEditing(f)} onDelete={() => remove(f.id)} />
            ))}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <div className="section-label" style={{ marginTop: upcoming.length ? 28 : 0 }}>Pasados · {past.length}</div>
          <div className="evento-grid">
            {past.map((f) => (
              <EventoCard key={f.id} feria={f} onEdit={() => setEditing(f)} onDelete={() => remove(f.id)} />
            ))}
          </div>
        </>
      )}

      {filtered.length === 0 && (
        <div className="card"><div className="empty">
          <ICalendar style={{ width: 36, height: 36, color: "var(--text-faint)", marginBottom: 8 }} />
          <div className="empty-title">Sin eventos</div>
          <div className="empty-sub">Agendá tu primera feria o puesto en ruta</div>
        </div></div>
      )}

      {(adding || editing) && (
        <EventoEditor feria={editing} onClose={() => { setAdding(false); setEditing(null); }} onSave={save} />
      )}
    </div>
  );
}

function EventoCard({ feria, upcoming, onEdit, onDelete }) {
  const tipo = FERIA_TIPOS.find((t) => t.value === feria.tipo);
  const dt = new Date(feria.fecha + "T12:00:00");
  return (
    <div className="card evento-card">
      <div style={{ display: "flex", gap: 14, padding: "16px 18px" }}>
        <div className={"evento-date " + (upcoming ? "evento-date-up" : "")}>
          <div className="evento-month">{dt.toLocaleDateString("es-AR", { month: "short" }).replace(".", "")}</div>
          <div className="evento-day">{dt.getDate()}</div>
          <div className="evento-dow">{dt.toLocaleDateString("es-AR", { weekday: "short" }).replace(".", "")}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row spread" style={{ alignItems: "flex-start", marginBottom: 6 }}>
            <div>
              <div className="serif" style={{ fontSize: 17, lineHeight: 1.2 }}>{feria.nombre}</div>
              <div className="row" style={{ gap: 6, marginTop: 4 }}>
                <span className={"pill " + (feria.tipo === "puesto_ruta" ? "pill-success" : "pill-accent")}>
                  {tipo?.icon} {tipo?.label}
                </span>
                {feria.lugar && (
                  <span style={{ fontSize: 12, color: "var(--text-faint)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <IPin style={{ width: 11, height: 11 }} /> {feria.lugar}
                  </span>
                )}
              </div>
            </div>
            <div className="row" style={{ gap: 2 }}>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={onEdit}><IEdit /></button>
              <button className="btn btn-ghost btn-icon btn-sm btn-danger" onClick={onDelete}><ITrash /></button>
            </div>
          </div>
          {feria.notas && (
            <div className="evento-notas">📝 {feria.notas}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function EventoEditor({ feria, onClose, onSave }) {
  const [f, setF] = useS2(feria || {
    nombre: "", tipo: "feria",
    fecha: new Date().toISOString().split("T")[0],
    lugar: "", notas: "",
  });
  return (
    <Modal
      title={feria ? "Editar evento" : "Nuevo evento"}
      sub="Agendá una feria o puesto en ruta"
      onClose={onClose}
      footer={<>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn btn-accent" onClick={() => onSave(f)} disabled={!f.nombre}>
          {feria ? "Guardar cambios" : "Crear evento"}
        </button>
      </>}
    >
      <div className="field">
        <label className="field-label">Nombre</label>
        <input className="input" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} placeholder="Ej: Feria de Palermo" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div className="field">
          <label className="field-label">Tipo</label>
          <select className="select" value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}>
            {FERIA_TIPOS.map((t) => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field-label">Fecha</label>
          <input className="input mono" type="date" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} />
        </div>
      </div>
      <div className="field">
        <label className="field-label">Lugar</label>
        <input className="input" value={f.lugar} onChange={(e) => setF({ ...f, lugar: e.target.value })} placeholder="Plaza Serrano, Ruta 2 km 50..." />
      </div>
      <div className="field">
        <label className="field-label">Notas</label>
        <textarea className="textarea" value={f.notas} onChange={(e) => setF({ ...f, notas: e.target.value })} placeholder="Recordatorios, qué llevar, horarios, etc." rows={3} />
      </div>
    </Modal>
  );
}

// ---------- GASTOS ----------
function GastosScreen({ gastos, setGastos, toast }) {
  const [adding, setAdding] = useS2(false);
  const [editing, setEditing] = useS2(null);
  const [catFilter, setCatFilter] = useS2("todos");

  const filtered = gastos
    .filter((g) => catFilter === "todos" || g.categoria === catFilter)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const total = filtered.reduce((a, g) => a + g.monto, 0);
  const byCat = CATEGORIAS_GASTOS.map((cat) => ({
    cat,
    total: gastos.filter((g) => g.categoria === cat).reduce((a, g) => a + g.monto, 0),
  })).filter((x) => x.total > 0).sort((a, b) => b.total - a.total);
  const maxCat = Math.max(...byCat.map((x) => x.total), 1);

  const save = (g) => {
    if (editing) {
      setGastos(gastos.map((x) => x.id === editing.id ? { ...g, id: editing.id } : x));
      toast("Gasto actualizado");
    } else {
      setGastos([{ ...g, id: "g" + uid() }, ...gastos]);
      toast("Gasto agregado");
    }
    setAdding(false); setEditing(null);
  };
  const remove = (id) => {
    if (!confirm("¿Eliminar este gasto?")) return;
    setGastos(gastos.filter((g) => g.id !== id));
    toast("Gasto eliminado");
  };

  return (
    <div className="content">
      <PageHeader
        title="Gastos"
        sub="Gastos generales del negocio que no van asociados a una feria específica."
        actions={
          <button className="btn btn-accent" onClick={() => setAdding(true)}><IPlus /> Nuevo gasto</button>
        }
      />

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Total filtrado</div>
              <div className="card-sub">{filtered.length} registros</div>
            </div>
          </div>
          <div className="card-pad">
            <div className="mono tnum" style={{ fontSize: 32, fontWeight: 700, fontFamily: "var(--serif)", color: "var(--danger)" }}>
              −{fmt.money(total)}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Por categoría</div>
              <div className="card-sub">Desglose de gastos</div>
            </div>
          </div>
          <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {byCat.map((x) => (
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

      <div className="toolbar" style={{ marginTop: 20 }}>
        <select className="select" style={{ width: "auto" }} value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="todos">Todas las categorías</option>
          {CATEGORIAS_GASTOS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th className="cell-right">Monto</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr key={g.id} className="row-hover">
                  <td className="mono cell-faint">{fmt.dateFull(g.fecha)}</td>
                  <td className="cell-strong">{g.descripcion}</td>
                  <td><span className="pill">{g.categoria}</span></td>
                  <td className="cell-right mono tnum" style={{ color: "var(--danger)", fontWeight: 600 }}>−{fmt.money(g.monto)}</td>
                  <td>
                    <div className="row" style={{ gap: 2, justifyContent: "flex-end" }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setEditing(g)}><IEdit /></button>
                      <button className="btn btn-ghost btn-icon btn-sm btn-danger" onClick={() => remove(g.id)}><ITrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(adding || editing) && (
        <GastoEditor gasto={editing} onClose={() => { setAdding(false); setEditing(null); }} onSave={save} />
      )}
    </div>
  );
}

function GastoEditor({ gasto, onClose, onSave }) {
  const [f, setF] = useS2(gasto || {
    descripcion: "", categoria: "Insumos", monto: 0,
    fecha: new Date().toISOString().split("T")[0],
  });
  return (
    <Modal
      title={gasto ? "Editar gasto" : "Nuevo gasto"}
      onClose={onClose}
      footer={<>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn btn-accent" onClick={() => onSave(f)} disabled={!f.descripcion || !f.monto}>Guardar</button>
      </>}
    >
      <div className="field">
        <label className="field-label">Descripción</label>
        <input className="input" value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} placeholder="Ej: Carnicería San Andrés" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div className="field">
          <label className="field-label">Categoría</label>
          <select className="select" value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value })}>
            {CATEGORIAS_GASTOS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field-label">Fecha</label>
          <input className="input mono" type="date" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} />
        </div>
      </div>
      <div className="field">
        <label className="field-label">Monto</label>
        <input className="input mono" type="number" value={f.monto} onChange={(e) => setF({ ...f, monto: +e.target.value })} />
      </div>
    </Modal>
  );
}

// ---------- REPORTES (basado en carta + gastos, sin ventas) ----------
function ReportesScreen({ ferias, gastos, carta, recetas, insumos }) {
  const [period, setPeriod] = useS2("all");

  const today = new Date("2026-05-18");
  const filterByPeriod = (dateStr) => {
    if (period === "all") return true;
    const days = +period;
    const diff = (today - new Date(dateStr + "T12:00:00")) / 86400000;
    return diff <= days;
  };
  const gas = gastos.filter((g) => filterByPeriod(g.fecha));
  const fer = ferias.filter((f) => filterByPeriod(f.fecha));

  // Gastos totals
  const gastosTotal = gas.reduce((a, g) => a + g.monto, 0);

  // Productos: distribución de margen
  const marginBuckets = { excelente: 0, bueno: 0, ajustado: 0, critico: 0 };
  carta.forEach((c) => {
    if (c.cmv > 70) marginBuckets.critico++;
    else if (c.cmv > 50) marginBuckets.ajustado++;
    else if (c.cmv > 30) marginBuckets.bueno++;
    else marginBuckets.excelente++;
  });

  // Gastos por categoría
  const gastosCat = CATEGORIAS_GASTOS.map((cat) => ({
    cat,
    total: gas.filter((g) => g.categoria === cat).reduce((a, g) => a + g.monto, 0),
    count: gas.filter((g) => g.categoria === cat).length,
  })).filter((x) => x.total > 0).sort((a, b) => b.total - a.total);
  const maxCat = Math.max(...gastosCat.map((x) => x.total), 1);

  // Gastos por día
  const dayMap = {};
  gas.forEach((g) => {
    dayMap[g.fecha] = (dayMap[g.fecha] || 0) + g.monto;
  });
  const days = Object.entries(dayMap).map(([fecha, total]) => ({ fecha, total })).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const maxDay = Math.max(...days.map((d) => d.total), 1);

  // Insumos más caros (ranking)
  const insumosCaros = [...insumos]
    .filter((i) => i.costo_unitario > 0)
    .sort((a, b) => b.costo_unitario - a.costo_unitario)
    .slice(0, 5);

  // Ranking de carta por margen
  const cartaPorMargen = [...carta].sort((a, b) => a.cmv - b.cmv);

  // Eventos por tipo
  const tipoMap = {};
  FERIA_TIPOS.forEach((t) => { tipoMap[t.value] = { count: 0, label: t.label, icon: t.icon }; });
  fer.forEach((f) => { if (tipoMap[f.tipo]) tipoMap[f.tipo].count++; });

  return (
    <div className="content">
      <PageHeader
        title="Reportes"
        sub="Análisis de costos, gastos y rentabilidad del menú."
        actions={<>
          <div className="seg">
            <button className={period === "30" ? "on" : ""} onClick={() => setPeriod("30")}>30d</button>
            <button className={period === "90" ? "on" : ""} onClick={() => setPeriod("90")}>90d</button>
            <button className={period === "all" ? "on" : ""} onClick={() => setPeriod("all")}>Todo</button>
          </div>
          <button className="btn"><IDownload /> CSV</button>
        </>}
      />

      <div className="kpi-grid">
        <Kpi label="Gastos totales" icon={<ICart />} value={fmt.money(gastosTotal)} delta={`${gas.length} registros`} prominent />
        <Kpi label="Productos en carta" icon={<IDollar />} value={carta.length.toString()} delta={`${marginBuckets.critico + marginBuckets.ajustado} con margen ajustado`} deltaKind={marginBuckets.critico > 0 ? "down" : ""} />
        <Kpi label="Insumos cargados" icon={<IBox />} value={insumos.length.toString()} delta={`${recetas.length} recetas usándolos`} />
        <Kpi label="Eventos agendados" icon={<ICalendar />} value={fer.length.toString()} delta={`${tipoMap.feria.count} ferias · ${tipoMap.puesto_ruta.count} puestos`} />
      </div>

      <div style={{ height: 20 }} />

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Gastos por día</div>
            <div className="card-sub">Hover para ver el detalle</div>
          </div>
        </div>
        <div className="card-pad">
          {days.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: "var(--text-faint)" }}>Sin gastos en el período</div>
          ) : (
            <div className="bars" style={{ height: 200 }}>
              {days.map((d, i) => (
                <div className="bar-wrap" key={i}>
                  <div className="bar-col">
                    <div className="bar" style={{ height: `${Math.max(3, (d.total / maxDay) * 100)}%` }}>
                      <div className="bar-tip">{fmt.dateFull(d.fecha)} · {fmt.money(d.total)}</div>
                    </div>
                  </div>
                  <div className="bar-lbl">{fmt.date(d.fecha)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ height: 20 }} />

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Gastos por categoría</div>
              <div className="card-sub">Distribución del gasto total</div>
            </div>
          </div>
          <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {gastosCat.map((x) => {
              const pct = (x.total / gastosTotal) * 100;
              return (
                <div key={x.cat}>
                  <div className="row spread" style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 13 }}>{x.cat} <span style={{ color: "var(--text-faint)", marginLeft: 4 }}>({x.count})</span></span>
                    <span className="mono tnum" style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                      {fmt.money(x.total)} · {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="progress-bar"><div style={{ width: `${(x.total / maxCat) * 100}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Salud del menú</div>
              <div className="card-sub">Distribución de margen por producto</div>
            </div>
          </div>
          <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <MargenBucket label="Excelente" sub="CMV < 30%" count={marginBuckets.excelente} total={carta.length} color="var(--success)" />
            <MargenBucket label="Bueno" sub="CMV 30–50%" count={marginBuckets.bueno} total={carta.length} color="var(--success)" />
            <MargenBucket label="Ajustado" sub="CMV 50–70%" count={marginBuckets.ajustado} total={carta.length} color="var(--warning)" />
            <MargenBucket label="Crítico" sub="CMV > 70%" count={marginBuckets.critico} total={carta.length} color="var(--danger)" />
          </div>
        </div>
      </div>

      <div style={{ height: 20 }} />

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Insumos más caros</div>
              <div className="card-sub">Por costo unitario</div>
            </div>
          </div>
          <div style={{ padding: "4px 0" }}>
            {insumosCaros.map((i, idx) => (
              <div key={i.id} className="row spread" style={{ padding: "10px 18px", borderBottom: "1px solid var(--border)" }}>
                <div className="row" style={{ gap: 10 }}>
                  <span className="mono cell-faint" style={{ fontSize: 11, width: 18 }}>{(idx + 1).toString().padStart(2, "0")}</span>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{i.nombre}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-faint)" }}>{i.categoria || "—"}</div>
                  </div>
                </div>
                <div className="mono tnum" style={{ fontWeight: 600, color: "var(--accent-text)" }}>
                  {fmt.money(i.costo_unitario)} / {i.unidad_medida}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Carta por margen</div>
              <div className="card-sub">Productos a revisar primero arriba</div>
            </div>
          </div>
          <div style={{ padding: "4px 0" }}>
            {cartaPorMargen.slice(0, 6).reverse().map((c) => (
              <div key={c.id} className="row spread" style={{ padding: "10px 18px", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{c.nombre_comercial}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-faint)" }}>{fmt.money(c.precio_venta)}</div>
                </div>
                <span className={cmvPill(c.cmv)} style={{ minWidth: 70, justifyContent: "center" }}>
                  CMV {fmt.pct(c.cmv)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MargenBucket({ label, sub, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="row spread" style={{ marginBottom: 4 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
          <span style={{ fontSize: 11.5, color: "var(--text-faint)", marginLeft: 6 }}>{sub}</span>
        </div>
        <span className="mono tnum" style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
          {count} producto{count !== 1 ? "s" : ""} · {pct.toFixed(0)}%
        </span>
      </div>
      <div className="progress-bar"><div style={{ width: `${pct}%`, background: color }} /></div>
    </div>
  );
}

// ---------- ANÁLISIS POR LUGAR (basado en frecuencia de eventos) ----------
function AnalisisLugarScreen({ ferias }) {
  const today = new Date("2026-05-18").toISOString().slice(0, 10);

  // Group by lugar
  const lugarMap = {};
  ferias.forEach((f) => {
    const key = f.lugar || "(sin lugar)";
    if (!lugarMap[key]) lugarMap[key] = { name: key, count: 0, ferias: 0, puestos: 0, dates: [] };
    lugarMap[key].count += 1;
    if (f.tipo === "feria") lugarMap[key].ferias += 1;
    else lugarMap[key].puestos += 1;
    lugarMap[key].dates.push(f.fecha);
  });
  const lugares = Object.values(lugarMap).sort((a, b) => b.count - a.count);
  const maxCount = Math.max(...lugares.map((l) => l.count), 1);

  return (
    <div className="content">
      <PageHeader
        title="Análisis por lugar"
        sub="Frecuencia y agenda por lugar — qué tan seguido vas a cada sitio."
      />

      {lugares.length === 0 && (
        <div className="card"><div className="empty">
          <IPin style={{ width: 36, height: 36, color: "var(--text-faint)", marginBottom: 8 }} />
          <div className="empty-title">Sin lugares todavía</div>
          <div className="empty-sub">Agendá eventos con lugar para ver el análisis</div>
        </div></div>
      )}

      <div className="col" style={{ gap: 12 }}>
        {lugares.map((l, i) => {
          const upcoming = l.dates.filter((d) => d >= today).sort();
          const past = l.dates.filter((d) => d < today).sort((a, b) => b.localeCompare(a));
          const lastDate = past[0];
          const nextDate = upcoming[0];
          return (
            <div key={l.name} className="card">
              <div className="row spread" style={{ padding: "16px 20px 12px" }}>
                <div className="row" style={{ gap: 12, alignItems: "center" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: i === 0 ? "var(--accent)" : "var(--bg-sunk)",
                    color: i === 0 ? "white" : "var(--text-muted)",
                    display: "grid", placeItems: "center",
                    fontFamily: "var(--serif)", fontSize: 18,
                  }}>
                    {(i + 1).toString().padStart(2, "0")}
                  </div>
                  <div>
                    <div className="serif" style={{ fontSize: 18 }}>{l.name}</div>
                    <div style={{ fontSize: 12.5, color: "var(--text-faint)", marginTop: 2 }}>
                      {l.count} visita{l.count !== 1 ? "s" : ""} · {l.ferias} ferias · {l.puestos} puestos en ruta
                    </div>
                  </div>
                </div>
                <div className="mono tnum" style={{ fontSize: 28, fontWeight: 600, fontFamily: "var(--serif)", color: "var(--accent-text)" }}>
                  {l.count}
                </div>
              </div>
              <div style={{ padding: "0 20px 16px" }}>
                <div className="row" style={{ fontSize: 12.5, gap: 18, marginBottom: 10, color: "var(--text-muted)" }}>
                  {nextDate && (
                    <span>
                      <IClock style={{ width: 12, height: 12, verticalAlign: -1, marginRight: 4 }} />
                      Próxima: <strong style={{ color: "var(--accent-text)" }}>{fmt.dateFull(nextDate)}</strong>
                    </span>
                  )}
                  {lastDate && (
                    <span>
                      Última: <strong style={{ color: "var(--text)" }}>{fmt.dateFull(lastDate)}</strong>
                    </span>
                  )}
                </div>
                <div className="progress-bar">
                  <div style={{ width: `${(l.count / maxCount) * 100}%`, background: "var(--accent)" }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, {
  SubRecetasScreen, CartaScreen, FeriasScreen, GastosScreen, ReportesScreen, AnalisisLugarScreen,
});
