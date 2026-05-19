// ============================================================
//  Los Gustos de Juan — App shell, sidebar, routing
// ============================================================

const { useState, useEffect, useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "density": "comfortable"
}/*EDITMODE-END*/;

const NAV = [
  { id: "resumen", label: "Resumen", icon: IHome },
  { id: "insumos", label: "Insumos", icon: IBox },
  { id: "subrecetas", label: "Sub-recetas", icon: ITag },
  { id: "recetas", label: "Recetas", icon: ISandwich },
  { id: "carta", label: "Carta", icon: IDollar },
  { id: "ferias", label: "Eventos", icon: ICalendar },
  { id: "gastos", label: "Gastos", icon: ICart },
  { id: "reportes", label: "Reportes", icon: IChart },
  { id: "analisis", label: "Análisis por lugar", icon: IPin },
];

function Sidebar({ current, onNav, badges, onOpenCalc }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">LG</div>
        <div>
          <div className="brand-name">Los Gustos<br />de Juan</div>
          <div className="brand-sub">Manager de feria</div>
        </div>
      </div>

      <div className="nav-label">Operación</div>
      {NAV.slice(0, 7).map((n) => {
        const Icon = n.icon;
        const badge = badges[n.id];
        return (
          <button key={n.id} className={"nav-item " + (current === n.id ? "active" : "")} onClick={() => onNav(n.id)}>
            <Icon /> <span>{n.label}</span>
            {badge ? <span className="nav-badge mono tnum">{badge}</span> : null}
          </button>
        );
      })}

      <div className="nav-label">Análisis</div>
      {NAV.slice(7).map((n) => {
        const Icon = n.icon;
        return (
          <button key={n.id} className={"nav-item " + (current === n.id ? "active" : "")} onClick={() => onNav(n.id)}>
            <Icon /> <span>{n.label}</span>
          </button>
        );
      })}

      <div className="sidebar-footer">
        <button className="nav-item" onClick={onOpenCalc}>
          <ISparkle /> <span>Calculadora rápida</span>
        </button>
      </div>
    </aside>
  );
}

function TopBar({ current, onOpenCalc }) {
  const label = NAV.find((n) => n.id === current)?.label || "";
  return (
    <div className="topbar">
      <span className="crumb">Manager</span>
      <span className="crumb cell-faint">/</span>
      <span className="crumb crumb-current">{label}</span>
      <div className="topbar-actions">
        <div className="input-prefix" style={{ width: 240 }}>
          <ISearch />
          <input className="input btn-sm" style={{ height: 32 }} placeholder="Buscar insumos, recetas, ferias..." />
          <span style={{
            position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
            fontSize: 10.5, fontFamily: "var(--mono)",
            background: "var(--bg-sunk)", border: "1px solid var(--border)",
            padding: "1px 5px", borderRadius: 4, color: "var(--text-faint)",
          }}>⌘K</span>
        </div>
        <button className="btn btn-ghost btn-icon" title="Calculadora express" onClick={onOpenCalc}><ISparkle /></button>
      </div>
    </div>
  );
}

function App() {
  const [route, setRoute] = useState("resumen");
  const [calcOpen, setCalcOpen] = useState(false);

  const [insumos, setInsumos] = useState(SEED_INSUMOS);
  const [subRecetas, setSubRecetas] = useState(SEED_SUB_RECETAS);
  const [recetas, setRecetas] = useState(SEED_RECETAS);
  const [carta, setCarta] = useState(SEED_CARTA);
  const [ferias, setFerias] = useState(SEED_FERIAS);
  const [gastos, setGastos] = useState(SEED_GASTOS);
  const [toasts, setToasts] = useState([]);

  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    document.documentElement.dataset.theme = tweaks.theme;
  }, [tweaks.theme]);

  const toast = (text) => {
    const id = Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2400);
  };

  const margenBajos = carta.filter((c) => c.cmv > 70).length;
  const badges = {
    insumos: insumos.length,
    recetas: recetas.length,
    carta: margenBajos > 0 ? margenBajos + "⚠" : carta.length,
    ferias: ferias.length,
  };

  return (
    <div className="app">
      <Sidebar current={route} onNav={setRoute} badges={badges} onOpenCalc={() => setCalcOpen(true)} />
      <div className="main">
        <TopBar current={route} onOpenCalc={() => setCalcOpen(true)} />
        {route === "resumen" && <Resumen insumos={insumos} recetas={recetas} carta={carta} ferias={ferias} gastos={gastos} goto={setRoute} />}
        {route === "insumos" && <InsumosScreen insumos={insumos} setInsumos={setInsumos} toast={toast} />}
        {route === "subrecetas" && <SubRecetasScreen subRecetas={subRecetas} insumos={insumos} setSubRecetas={setSubRecetas} toast={toast} />}
        {route === "recetas" && <RecetasScreen recetas={recetas} insumos={insumos} subRecetas={subRecetas} setRecetas={setRecetas} toast={toast} />}
        {route === "carta" && <CartaScreen carta={carta} recetas={recetas} setCarta={setCarta} toast={toast} />}
        {route === "ferias" && <FeriasScreen ferias={ferias} setFerias={setFerias} toast={toast} />}
        {route === "gastos" && <GastosScreen gastos={gastos} setGastos={setGastos} toast={toast} />}
        {route === "reportes" && <ReportesScreen ferias={ferias} gastos={gastos} carta={carta} recetas={recetas} insumos={insumos} />}
        {route === "analisis" && <AnalisisLugarScreen ferias={ferias} />}
      </div>

      <button
        className="fab"
        onClick={() => setCalcOpen(true)}
        title="Calculadora rápida"
      >
        🧮
      </button>

      {calcOpen && <CalculadoraExpress onClose={() => setCalcOpen(false)} />}

      <div className="toast-wrap">
        {toasts.map((t) => <Toast key={t.id} text={t.text} />)}
      </div>

      <TweaksUI tweaks={tweaks} setTweak={setTweak} />
    </div>
  );
}

function TweaksUI({ tweaks, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Apariencia">
        <TweakRadio
          label="Tema"
          value={tweaks.theme}
          onChange={(v) => setTweak("theme", v)}
          options={[
            { value: "light", label: "Claro" },
            { value: "dark", label: "Oscuro" },
          ]}
        />
        <TweakRadio
          label="Densidad"
          value={tweaks.density}
          onChange={(v) => setTweak("density", v)}
          options={[
            { value: "comfortable", label: "Cómoda" },
            { value: "compact", label: "Compacta" },
          ]}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
