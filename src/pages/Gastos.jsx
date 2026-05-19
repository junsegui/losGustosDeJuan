import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { supabase } from "../lib/supabase";
import { formatPrecio } from "../lib/calculos";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useToast } from "../components/Toast";

// ─── Layout ───────────────────────────────────────────────────────────────────

const PageHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
`;

const PageTitle = styled.h1`
  font-family: ${(p) => p.theme.fonts.serif};
  font-size: 28px;
  color: ${(p) => p.theme.colors.text};
  margin-bottom: 4px;
`;

const PageSub = styled.p`
  color: ${(p) => p.theme.colors.textMuted};
  font-size: 14px;
`;

const BtnPrimary = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: ${(p) => p.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${(p) => p.theme.radii.sm};
  font-family: ${(p) => p.theme.fonts.sans};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;

  &:hover { background: ${(p) => p.theme.colors.primaryHover}; transform: translateY(-1px); }
  &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
`;

// ─── Stats ────────────────────────────────────────────────────────────────────

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 700px) { grid-template-columns: 1fr; }
`;

const TotalCard = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  padding: 20px 24px;
  box-shadow: ${(p) => p.theme.shadows.sm};
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const TotalLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
`;

const TotalValue = styled.div`
  font-family: ${(p) => p.theme.fonts.serif};
  font-size: 36px;
  color: ${(p) => p.theme.colors.danger};
  line-height: 1;
`;

const TotalCount = styled.div`
  font-size: 13px;
  color: ${(p) => p.theme.colors.textMuted};
  margin-top: 6px;
`;

const CategoriaCard = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  padding: 20px 24px;
  box-shadow: ${(p) => p.theme.shadows.sm};
`;

const CatTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 14px;
`;

const CatRow = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr 90px;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
`;

const CatNombre = styled.span`
  font-size: 13px;
  color: ${(p) => p.theme.colors.text};
`;

const BarTrack = styled.div`
  height: 6px;
  background: ${(p) => p.theme.colors.surfaceAlt};
  border-radius: 3px;
  overflow: hidden;
`;

const BarFill = styled.div`
  height: 100%;
  background: ${(p) => p.theme.colors.danger};
  border-radius: 3px;
  width: ${(p) => p.$pct}%;
  transition: width 0.3s;
`;

const CatMonto = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.danger};
  text-align: right;
`;

// ─── Toolbar + Table ──────────────────────────────────────────────────────────

const Toolbar = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.sm};
  color: ${(p) => p.theme.colors.text};
  font-family: ${(p) => p.theme.fonts.sans};
  font-size: 14px;
  padding: 8px 12px;
  outline: none;
  cursor: pointer;

  &:focus { border-color: ${(p) => p.theme.colors.primary}; }
`;

const Counter = styled.span`
  font-size: 13px;
  color: ${(p) => p.theme.colors.textMuted};
  margin-left: auto;
`;

const COLS = "100px 1fr 130px 120px 80px";

const Table = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  overflow: hidden;
`;

const THead = styled.div`
  display: grid;
  grid-template-columns: ${COLS};
  padding: 10px 16px;
  background: ${(p) => p.theme.colors.surfaceAlt};
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
  gap: 12px;
`;

const TH = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TRow = styled.div`
  display: grid;
  grid-template-columns: ${COLS};
  padding: 12px 16px;
  align-items: center;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
  gap: 12px;
  transition: background 0.1s;

  &:last-child { border-bottom: none; }
  &:hover { background: ${(p) => p.theme.colors.surfaceHover}; }
`;

const CellDate = styled.div`
  font-size: 13px;
  color: ${(p) => p.theme.colors.textMuted};
  font-variant-numeric: tabular-nums;
`;

const CellMain = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${(p) => p.theme.colors.text};
`;

const CellSub = styled.div`
  font-size: 12px;
  color: ${(p) => p.theme.colors.textMuted};
  margin-top: 1px;
`;

const Pill = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: ${(p) => p.theme.colors.primaryLight};
  color: ${(p) => p.theme.colors.primary};
`;

const MontoCel = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.danger};
`;

const ActionsCell = styled.div`
  display: flex;
  gap: 4px;
  justify-content: flex-end;
`;

const IconBtn = styled.button`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: ${(p) => p.theme.radii.sm};
  cursor: pointer;
  transition: all 0.15s;
  background: transparent;
  color: ${(p) => p.theme.colors.textMuted};

  &:hover {
    background: ${(p) => p.$danger ? p.theme.colors.dangerLight : p.theme.colors.surfaceAlt};
    color: ${(p) => p.$danger ? p.theme.colors.danger : p.theme.colors.text};
  }
`;

const Empty = styled.div`
  text-align: center;
  padding: 60px 24px;
  color: ${(p) => p.theme.colors.textMuted};
  font-size: 14px;
`;

// ─── Modal ────────────────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 0.15s;

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;

const Modal = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.lg};
  padding: 28px;
  width: 100%;
  max-width: 500px;
  box-shadow: ${(p) => p.theme.shadows.lg};
  animation: slideUp 0.15s;

  @keyframes slideUp {
    from { transform: translateY(12px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const ModalHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
`;

const ModalTitle = styled.h3`
  font-family: ${(p) => p.theme.fonts.serif};
  font-size: 20px;
  color: ${(p) => p.theme.colors.text};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  background: ${(p) => p.theme.colors.background};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.sm};
  color: ${(p) => p.theme.colors.text};
  font-family: ${(p) => p.theme.fonts.sans};
  font-size: 14px;
  padding: 9px 12px;
  outline: none;

  &:focus { border-color: ${(p) => p.theme.colors.primary}; }
  &::placeholder { color: ${(p) => p.theme.colors.textLight}; }
`;

const SelectInput = styled.select`
  background: ${(p) => p.theme.colors.background};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.sm};
  color: ${(p) => p.theme.colors.text};
  font-family: ${(p) => p.theme.fonts.sans};
  font-size: 14px;
  padding: 9px 12px;
  outline: none;
  cursor: pointer;

  &:focus { border-color: ${(p) => p.theme.colors.primary}; }
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 22px;
`;

const BtnGhost = styled.button`
  padding: 9px 16px;
  border-radius: ${(p) => p.theme.radii.sm};
  font-family: ${(p) => p.theme.fonts.sans};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid ${(p) => p.theme.colors.border};
  background: transparent;
  color: ${(p) => p.theme.colors.textMuted};
  transition: all 0.15s;

  &:hover { background: ${(p) => p.theme.colors.surfaceAlt}; color: ${(p) => p.theme.colors.text}; }
`;

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIAS = [
  { value: "Insumos", label: "Insumos / Materia prima" },
  { value: "Transporte", label: "Transporte" },
  { value: "Equipamiento", label: "Equipamiento" },
  { value: "Impuestos", label: "Impuestos / Tasas" },
  { value: "Otro", label: "Otro" },
];

const PERIODOS = [
  { value: "mes", label: "Este mes" },
  { value: "3meses", label: "Últimos 3 meses" },
  { value: "todo", label: "Todo el tiempo" },
];

const FORM_VACIO = {
  descripcion: "",
  monto: "",
  categoria: "Insumos",
  fecha: new Date().toISOString().split("T")[0],
  notas: "",
};

const MESES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

function formatFecha(str) {
  if (!str) return "—";
  const [, m, d] = str.split("-");
  return `${parseInt(d, 10)} ${MESES[parseInt(m, 10) - 1]}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function Gastos() {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [filtroPeriodo, setFiltroPeriodo] = useState("mes");
  const [modal, setModal] = useState(null); // null | "add" | gasto-obj
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const toast = useToast();

  const fetchGastos = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("gastos")
      .select("*")
      .order("fecha", { ascending: false });
    if (data) setGastos(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchGastos(); }, [fetchGastos]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setModal(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const mesActual = new Date().toISOString().slice(0, 7);
  const hace3m = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().split("T")[0];
  })();

  const filtrados = gastos.filter((g) => {
    if (filtroCategoria !== "todos" && g.categoria !== filtroCategoria) return false;
    if (filtroPeriodo === "mes" && !g.fecha?.startsWith(mesActual)) return false;
    if (filtroPeriodo === "3meses" && g.fecha < hace3m) return false;
    return true;
  });

  const totalFiltrado = filtrados.reduce((s, g) => s + g.monto, 0);

  const porCategoria = CATEGORIAS
    .map((c) => {
      const total = filtrados
        .filter((g) => g.categoria === c.value)
        .reduce((s, g) => s + g.monto, 0);
      const pct = totalFiltrado > 0 ? (total / totalFiltrado) * 100 : 0;
      return { ...c, total, pct };
    })
    .filter((c) => c.total > 0);

  function abrirAdd() {
    setForm(FORM_VACIO);
    setModal("add");
  }

  function abrirEdit(g) {
    setForm({
      descripcion: g.descripcion,
      monto: g.monto,
      categoria: g.categoria,
      fecha: g.fecha,
      notas: g.notas || "",
    });
    setModal(g);
  }

  async function guardar() {
    if (!form.descripcion.trim() || !form.monto) return;
    setGuardando(true);

    const payload = {
      descripcion: form.descripcion.trim(),
      monto: parseFloat(form.monto),
      categoria: form.categoria,
      fecha: form.fecha,
      notas: form.notas.trim() || null,
    };

    if (modal === "add") {
      await supabase.from("gastos").insert(payload);
    } else {
      await supabase.from("gastos").update(payload).eq("id", modal.id);
    }

    setGuardando(false);
    setModal(null);
    toast(modal === "add" ? "Gasto registrado" : "Gasto actualizado");
    fetchGastos();
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar este gasto?")) return;
    await supabase.from("gastos").delete().eq("id", id);
    toast("Gasto eliminado");
    fetchGastos();
  }

  const periodoLabel = PERIODOS.find((p) => p.value === filtroPeriodo)?.label ?? "";

  return (
    <div>
      <PageHead>
        <div>
          <PageTitle>Gastos</PageTitle>
          <PageSub>Costos generales del negocio — transporte, equipamiento, impuestos.</PageSub>
        </div>
        <BtnPrimary onClick={abrirAdd}><Plus size={16} /> Registrar gasto</BtnPrimary>
      </PageHead>

      <StatsGrid>
        <TotalCard>
          <TotalLabel>Total — {periodoLabel}</TotalLabel>
          <TotalValue>{formatPrecio(totalFiltrado)}</TotalValue>
          <TotalCount>{filtrados.length} gasto{filtrados.length !== 1 ? "s" : ""}</TotalCount>
        </TotalCard>

        <CategoriaCard>
          <CatTitle>Por categoría</CatTitle>
          {porCategoria.length === 0 && (
            <div style={{ fontSize: 13, color: "var(--textMuted)" }}>Sin datos para este período.</div>
          )}
          {porCategoria.map((c) => (
            <CatRow key={c.value}>
              <CatNombre>{c.label}</CatNombre>
              <BarTrack><BarFill $pct={c.pct} /></BarTrack>
              <CatMonto>{formatPrecio(c.total)}</CatMonto>
            </CatRow>
          ))}
        </CategoriaCard>
      </StatsGrid>

      <Toolbar>
        <FilterSelect
          value={filtroPeriodo}
          onChange={(e) => setFiltroPeriodo(e.target.value)}
        >
          {PERIODOS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </FilterSelect>
        <FilterSelect
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          <option value="todos">Todas las categorías</option>
          {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </FilterSelect>
        <Counter>{filtrados.length} registro{filtrados.length !== 1 ? "s" : ""}</Counter>
      </Toolbar>

      {loading && <Empty>Cargando...</Empty>}

      {!loading && filtrados.length === 0 && (
        <Empty>
          <div style={{ fontSize: 44, marginBottom: 12 }}>💸</div>
          <p>{gastos.length === 0 ? "No hay gastos registrados." : "No hay gastos para este filtro."}</p>
        </Empty>
      )}

      {!loading && filtrados.length > 0 && (
        <Table>
          <THead>
            <TH>Fecha</TH>
            <TH>Descripción</TH>
            <TH>Categoría</TH>
            <TH>Monto</TH>
            <TH />
          </THead>
          {filtrados.map((g) => (
            <TRow key={g.id}>
              <CellDate>{formatFecha(g.fecha)}</CellDate>
              <div>
                <CellMain>{g.descripcion}</CellMain>
                {g.notas && <CellSub>{g.notas}</CellSub>}
              </div>
              <div><Pill>{g.categoria}</Pill></div>
              <MontoCel>−{formatPrecio(g.monto)}</MontoCel>
              <ActionsCell>
                <IconBtn onClick={() => abrirEdit(g)} title="Editar"><Pencil size={14} /></IconBtn>
                <IconBtn $danger onClick={() => eliminar(g.id)} title="Eliminar"><Trash2 size={14} /></IconBtn>
              </ActionsCell>
            </TRow>
          ))}
        </Table>
      )}

      {modal && (
        <Overlay onClick={() => setModal(null)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHead>
              <ModalTitle>{modal === "add" ? "Registrar gasto" : "Editar gasto"}</ModalTitle>
              <IconBtn onClick={() => setModal(null)}><X size={18} /></IconBtn>
            </ModalHead>

            <FormGrid>
              <FormGroup style={{ gridColumn: "1 / -1" }}>
                <Label>Descripción *</Label>
                <Input
                  placeholder="Ej: Compra de leña"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  autoFocus
                />
              </FormGroup>
              <FormGroup>
                <Label>Monto ($) *</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={form.monto}
                  onChange={(e) => setForm({ ...form, monto: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                />
              </FormGroup>
              <FormGroup style={{ gridColumn: "1 / -1" }}>
                <Label>Categoría</Label>
                <SelectInput
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                >
                  {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </SelectInput>
              </FormGroup>
              <FormGroup style={{ gridColumn: "1 / -1" }}>
                <Label>Notas</Label>
                <Input
                  placeholder="Opcional"
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                />
              </FormGroup>
            </FormGrid>

            <ModalFooter>
              <BtnGhost onClick={() => setModal(null)}>Cancelar</BtnGhost>
              <BtnPrimary
                onClick={guardar}
                disabled={guardando || !form.descripcion.trim() || !form.monto}
              >
                {guardando ? "Guardando..." : modal === "add" ? "Registrar" : "Guardar cambios"}
              </BtnPrimary>
            </ModalFooter>
          </Modal>
        </Overlay>
      )}
    </div>
  );
}

export default Gastos;
