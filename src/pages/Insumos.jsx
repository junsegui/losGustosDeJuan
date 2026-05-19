import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { supabase } from "../lib/supabase";
import { formatPrecio } from "../lib/calculos";
import { recalcularTodo } from "../lib/recalcular";
import ExportarExcel from "../components/ExportarExcel";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { useToast } from "../components/Toast";

// ─── Table ────────────────────────────────────────────────────────────────────

const COLS = "2fr 1.4fr 100px 130px 140px 80px";

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

  &:hover {
    background: ${(p) => p.theme.colors.primaryHover};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Toolbar = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const SearchWrap = styled.div`
  position: relative;
  flex: 1;
  min-width: 180px;
  max-width: 300px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: ${(p) => p.theme.colors.textMuted};
  display: flex;
`;

const SearchInput = styled.input`
  width: 100%;
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.sm};
  color: ${(p) => p.theme.colors.text};
  font-family: ${(p) => p.theme.fonts.sans};
  font-size: 14px;
  padding: 8px 12px 8px 32px;
  outline: none;
  transition: border-color 0.2s;

  &:focus { border-color: ${(p) => p.theme.colors.primary}; }
  &::placeholder { color: ${(p) => p.theme.colors.textLight}; }
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

const Accent = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.primary};
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
  max-width: 560px;
  box-shadow: ${(p) => p.theme.shadows.lg};
  max-height: 90vh;
  overflow-y: auto;
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
  grid-template-columns: 1fr 1fr 1fr;
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
  transition: border-color 0.2s;

  &:focus { border-color: ${(p) => p.theme.colors.primary}; }
  &::placeholder { color: ${(p) => p.theme.colors.textLight}; }
`;

const Select = styled.select`
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

const InfoBox = styled.div`
  background: ${(p) => p.theme.colors.primaryLight};
  border: 1px solid ${(p) => p.theme.colors.primary}33;
  border-radius: ${(p) => p.theme.radii.md};
  padding: 14px 18px;
  margin-top: 16px;
`;

const InfoLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  font-family: ${(p) => p.theme.fonts.serif};
  font-size: 26px;
  color: ${(p) => p.theme.colors.primary};
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

const CATEGORIAS = ["Carnes", "Verduras", "Panificados", "Lácteos", "Condimentos", "Servicios", "Otros"];
const UNIDADES = ["gr", "kg", "ml", "l", "un"];

const FORM_VACIO = {
  nombre: "",
  categoria: "",
  subcategoria: "",
  presentacion: "",
  unidad_medida: "gr",
  costo_presentacion: "",
  notas: "",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

function Insumos() {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [modal, setModal] = useState(null); // null | "add" | insumo-obj
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const toast = useToast();

  const fetchInsumos = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("insumos")
      .select("*")
      .order("nombre");
    if (data) setInsumos(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchInsumos(); }, [fetchInsumos]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setModal(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const costoUnitarioLive =
    form.presentacion && form.costo_presentacion
      ? parseFloat(form.costo_presentacion) / parseFloat(form.presentacion)
      : 0;

  const filtrados = insumos.filter((i) => {
    if (busqueda && !i.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false;
    if (filtroCategoria !== "todos" && i.categoria !== filtroCategoria) return false;
    return true;
  });

  function abrirAdd() {
    setForm(FORM_VACIO);
    setModal("add");
  }

  function abrirEdit(insumo) {
    setForm({
      nombre: insumo.nombre,
      categoria: insumo.categoria || "",
      subcategoria: insumo.subcategoria || "",
      presentacion: insumo.presentacion ?? "",
      unidad_medida: insumo.unidad_medida || "gr",
      costo_presentacion: insumo.costo_presentacion ?? "",
      notas: insumo.notas || "",
    });
    setModal(insumo);
  }

  async function guardar() {
    if (!form.nombre.trim()) return;
    setGuardando(true);

    const payload = {
      nombre: form.nombre.trim(),
      categoria: form.categoria || null,
      subcategoria: form.subcategoria.trim() || null,
      presentacion: parseFloat(form.presentacion) || null,
      unidad_medida: form.unidad_medida,
      costo_presentacion: parseFloat(form.costo_presentacion) || null,
      costo_unitario: costoUnitarioLive,
      notas: form.notas.trim() || null,
    };

    if (modal === "add") {
      await supabase.from("insumos").insert(payload);
    } else {
      await supabase.from("insumos").update(payload).eq("id", modal.id);
    }

    await recalcularTodo();
    setGuardando(false);
    setModal(null);
    toast(modal === "add" ? "Insumo creado" : "Insumo actualizado");
    fetchInsumos();
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar este insumo?")) return;
    await supabase.from("insumos").delete().eq("id", id);
    toast("Insumo eliminado");
    fetchInsumos();
  }

  return (
    <div>
      <PageHead>
        <div>
          <PageTitle>Insumos</PageTitle>
          <PageSub>La materia prima — carnes, verduras, especias, servicios.</PageSub>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <ExportarExcel datos={insumos} nombreArchivo="Insumos" tipo="insumos" />
          <BtnPrimary onClick={abrirAdd}><Plus size={16} /> Nuevo insumo</BtnPrimary>
        </div>
      </PageHead>

      <Toolbar>
        <SearchWrap>
          <SearchIcon><Search size={14} /></SearchIcon>
          <SearchInput
            placeholder="Buscar insumo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </SearchWrap>
        <FilterSelect
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          <option value="todos">Todas las categorías</option>
          {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
        </FilterSelect>
        <Counter>{filtrados.length} insumo{filtrados.length !== 1 ? "s" : ""}</Counter>
      </Toolbar>

      {loading && <Empty>Cargando...</Empty>}

      {!loading && filtrados.length === 0 && (
        <Empty>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🛒</div>
          <p>{insumos.length === 0 ? "No hay insumos. ¡Agregá el primero!" : "No hay resultados para tu búsqueda."}</p>
        </Empty>
      )}

      {!loading && filtrados.length > 0 && (
        <Table>
          <THead>
            <TH>Insumo</TH>
            <TH>Categoría</TH>
            <TH>Presentación</TH>
            <TH>Costo</TH>
            <TH>Unitario</TH>
            <TH />
          </THead>
          {filtrados.map((i) => (
            <TRow key={i.id}>
              <div>
                <CellMain>{i.nombre}</CellMain>
                {i.notas && <CellSub>{i.notas}</CellSub>}
              </div>
              <div>
                {i.categoria && <Pill>{i.categoria}</Pill>}
                {i.subcategoria && <CellSub style={{ marginTop: 4 }}>{i.subcategoria}</CellSub>}
              </div>
              <CellMain>{i.presentacion ?? "—"} {i.presentacion ? i.unidad_medida : ""}</CellMain>
              <CellMain>{i.costo_presentacion ? formatPrecio(i.costo_presentacion) : "—"}</CellMain>
              <Accent>
                {i.costo_unitario ? `${formatPrecio(i.costo_unitario)}/${i.unidad_medida}` : "—"}
              </Accent>
              <ActionsCell>
                <IconBtn onClick={() => abrirEdit(i)} title="Editar"><Pencil size={14} /></IconBtn>
                <IconBtn $danger onClick={() => eliminar(i.id)} title="Eliminar"><Trash2 size={14} /></IconBtn>
              </ActionsCell>
            </TRow>
          ))}
        </Table>
      )}

      {modal && (
        <Overlay onClick={() => setModal(null)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHead>
              <ModalTitle>{modal === "add" ? "Nuevo insumo" : "Editar insumo"}</ModalTitle>
              <IconBtn onClick={() => setModal(null)}><X size={18} /></IconBtn>
            </ModalHead>

            <FormGrid>
              <FormGroup style={{ gridColumn: "1 / -1" }}>
                <Label>Nombre *</Label>
                <Input
                  placeholder="Ej: Bondiola cruda"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  autoFocus
                />
              </FormGroup>
              <FormGroup>
                <Label>Categoría</Label>
                <Select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                >
                  <option value="">Sin categoría</option>
                  {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </FormGroup>
              <FormGroup style={{ gridColumn: "span 2" }}>
                <Label>Subcategoría</Label>
                <Input
                  placeholder="Opcional"
                  value={form.subcategoria}
                  onChange={(e) => setForm({ ...form, subcategoria: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label>Presentación</Label>
                <Input
                  type="number"
                  placeholder="Ej: 1000"
                  value={form.presentacion}
                  onChange={(e) => setForm({ ...form, presentacion: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label>Unidad</Label>
                <Select
                  value={form.unidad_medida}
                  onChange={(e) => setForm({ ...form, unidad_medida: e.target.value })}
                >
                  {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Costo ($)</Label>
                <Input
                  type="number"
                  placeholder="Ej: 5000"
                  value={form.costo_presentacion}
                  onChange={(e) => setForm({ ...form, costo_presentacion: e.target.value })}
                />
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

            {form.presentacion && form.costo_presentacion && (
              <InfoBox>
                <InfoLabel>Costo unitario calculado</InfoLabel>
                <InfoValue>
                  {formatPrecio(costoUnitarioLive)}/{form.unidad_medida}
                </InfoValue>
              </InfoBox>
            )}

            <ModalFooter>
              <BtnGhost onClick={() => setModal(null)}>Cancelar</BtnGhost>
              <BtnPrimary
                onClick={guardar}
                disabled={guardando || !form.nombre.trim()}
              >
                {guardando ? "Guardando..." : modal === "add" ? "Crear insumo" : "Guardar cambios"}
              </BtnPrimary>
            </ModalFooter>
          </Modal>
        </Overlay>
      )}
    </div>
  );
}

export default Insumos;
